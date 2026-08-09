import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { createAiDraft } from "./ai.js";
import { getBrand } from "./brand.js";
import {
  createInquiryIdempotent,
  findInquiryBySubmissionId,
  supabaseRequest,
} from "./supabase.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SITE_CONFIG = {
  cappuccino: { crmSite: "cappuccinobag", brand: "Cappuccino Bag", code: "CAP" },
  novlane: { crmSite: "novlane", brand: "Novlane", code: "NOV" },
};
const EMAIL_STATUSES = new Set(["pending", "sent", "skipped", "failed"]);

export class SharedIngestError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.name = "SharedIngestError";
    this.status = status;
  }
}

export function clean(value, max = 1000) {
  return String(value ?? "").replace(/\0/g, "").trim().slice(0, max);
}

export function validateSiteSource(value) {
  const siteSource = clean(value, 40).toLowerCase();
  if (!SITE_CONFIG[siteSource]) throw new SharedIngestError("Unsupported site_source.");
  return siteSource;
}

export function submissionId(value) {
  if (value === undefined || value === null || value === "") return randomUUID();
  const normalized = clean(value, 80).toLowerCase();
  if (!UUID.test(normalized)) throw new SharedIngestError("submission_id must be a valid UUID.");
  return normalized;
}

export function generateDedupeKey(siteSource, id) {
  const validatedSite = validateSiteSource(siteSource);
  const validatedId = submissionId(id);
  return createHash("sha256").update(`${validatedSite}:${validatedId}`).digest("hex");
}

export function validateEmailStatus(value) {
  if (!EMAIL_STATUSES.has(value)) throw new SharedIngestError("Unsupported email_status.");
  return value;
}

export function validSharedSecret(provided, expected = process.env.SHARED_CRM_INGEST_SECRET) {
  if (!provided || !expected) return false;
  const supplied = Buffer.from(String(provided));
  const configured = Buffer.from(String(expected));
  return supplied.length === configured.length && timingSafeEqual(supplied, configured);
}

function validTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function normalizeAttachments(files) {
  if (!Array.isArray(files)) return [];
  return files.slice(0, 5).map((file) => ({
    name: clean(file?.name, 180),
    type: clean(file?.type, 120),
    size: Number.isFinite(Number(file?.size)) ? Number(file.size) : 0,
    path: clean(file?.path, 800),
    scan_status: clean(file?.scan_status || "pending", 40),
  }));
}

export function attributionFrom(input = {}) {
  return {
    first_landing_page: clean(input.first_landing_page || input.firstLandingPage, 1200) || null,
    current_page_url: clean(input.current_page_url || input.pageUrl, 1200) || null,
    referrer: clean(input.referrer, 1200) || null,
    utm_source: clean(input.utm_source || input.utmSource, 200) || null,
    utm_medium: clean(input.utm_medium || input.utmMedium, 200) || null,
    utm_campaign: clean(input.utm_campaign || input.utmCampaign, 240) || null,
    utm_content: clean(input.utm_content || input.utmContent, 240) || null,
    utm_term: clean(input.utm_term || input.utmTerm, 240) || null,
    gclid: clean(input.gclid, 240) || null,
    msclkid: clean(input.msclkid, 240) || null,
    current_referrer: clean(input.current_referrer, 1200) || null,
    current_utm_source: clean(input.current_utm_source, 200) || null,
    current_utm_medium: clean(input.current_utm_medium, 200) || null,
    current_utm_campaign: clean(input.current_utm_campaign, 240) || null,
    current_utm_content: clean(input.current_utm_content, 240) || null,
    current_utm_term: clean(input.current_utm_term, 240) || null,
    current_gclid: clean(input.current_gclid, 240) || null,
    current_msclkid: clean(input.current_msclkid, 240) || null,
    first_visit_time: validTimestamp(input.first_visit_time || input.firstVisitTime),
    device: clean(input.device, 80) || null,
    attribution_country: clean(input.attribution_country, 120) || null,
  };
}

export function mapSharedInquiryPayload(siteSource, raw = {}, uploadedFiles = []) {
  const source = validateSiteSource(siteSource);
  const config = SITE_CONFIG[source];
  const id = submissionId(raw.submission_id || raw.submissionId);
  const name = clean(raw.name || raw.customer_name || raw.contact_name, 120);
  const email = clean(raw.email || raw.contact_email, 180).toLowerCase();
  if (!name || !EMAIL.test(email)) {
    throw new SharedIngestError("Name and a valid email are required.");
  }
  const projectDetails = [
    ["Target dimensions", raw.target_dimensions],
    ["Intended pet size", raw.intended_pet_size],
    ["Color", raw.color],
    ["Packaging", raw.packaging],
    ["Target market", raw.target_market],
  ].filter(([, value]) => clean(value, 400))
    .map(([label, value]) => `${label}: ${clean(value, 400)}`).join("\n");
  const attachments = uploadedFiles.length ? uploadedFiles : raw.attachments || raw.uploaded_files;
  const emailStatus = validateEmailStatus("pending");

  return {
    submission_id: id,
    site_source: source,
    dedupe_key: generateDedupeKey(source, id),
    email_status: emailStatus,
    site: config.crmSite,
    brand: config.brand,
    source_channel: "website",
    name,
    company: clean(raw.company || raw.company_name, 180) || null,
    email,
    phone: clean(raw.phone || raw.telephone, 80) || null,
    whatsapp: clean(raw.whatsapp || raw.whats_app || raw.phone, 80) || null,
    country: clean(raw.country, 120) || null,
    language: clean(raw.language || raw.locale || "en", 20),
    product: clean(raw.product || raw.product_needed || raw.productType, 240) || null,
    product_category: clean(
      raw.product_category || raw.product_needed || raw.product || raw.productType,
      180,
    ) || "Other",
    quantity: clean(raw.quantity || raw.estimatedQuantity, 120) || null,
    material: clean(raw.material || raw.preferredMaterial, 240) || null,
    customization: clean(raw.customization || raw.function_requirement, 1000) || null,
    logo_method: clean(raw.logo_method || raw.logoMethod, 240) || null,
    target_price: clean(raw.target_price || raw.targetRetailPrice, 120) || null,
    target_delivery_date: clean(raw.target_delivery_date || raw.requiredDeliveryDate, 120) || null,
    message: clean([raw.message, projectDetails].filter(Boolean).join("\n\n"), 4000) || null,
    uploaded_files: normalizeAttachments(attachments),
    submit_time: validTimestamp(raw.submit_time || raw.submitted_at) || new Date().toISOString(),
    ...attributionFrom(raw),
  };
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.RESEND_API_KEY || !process.env.INQUIRY_FROM_EMAIL) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  return response.ok;
}

export async function deliverInquiryEmails(input, inquiry, draft, send = sendEmail, raw = {}) {
  const reference = inquiry.inquiry_number;
  const details = [
    ["Reference", reference], ["Brand", input.brand], ["Name", input.name],
    ["Company", input.company], ["Email", input.email], ["WhatsApp", input.whatsapp],
    ["Country", input.country], ["Product", input.product_category],
    ["Quantity", input.quantity], ["Material", input.material], ["Logo", input.logo_method],
    ["Target dimensions", raw.target_dimensions], ["Intended pet size", raw.intended_pet_size],
    ["Color", raw.color], ["Packaging", raw.packaging], ["Target market", raw.target_market],
    ["Target delivery date", input.target_delivery_date],
    ["Customization", input.customization], ["Message", raw.message || input.message],
    ["Landing page", input.first_landing_page], ["Submit page", input.current_page_url],
    ["First UTM source", input.utm_source], ["First UTM campaign", input.utm_campaign],
    ["Current UTM source", input.current_utm_source],
    ["Current UTM campaign", input.current_utm_campaign],
  ].map(([key, value]) => `<tr><th align="left">${key}</th><td>${escapeHtml(value || "—")}</td></tr>`).join("");
  const prefix = SITE_CONFIG[input.site_source].code;
  const subjectBrand = input.site_source === "cappuccino" ? "Cappuccino" : input.brand;
  const primarySent = await send({
    to: process.env.INQUIRY_TO_EMAIL || "info@cappuccinobag.net",
    subject: `[${subjectBrand} RFQ] ${reference} | ${input.product_category || "Product to confirm"}`,
    html: `<h2>New ${input.brand} inquiry</h2><table>${details}</table>`,
    replyTo: input.email,
  });
  const enabled = process.env[`${prefix}_INQUIRY_AUTO_REPLY_ENABLED`] !== "false";
  const safeAuto = (process.env[`${prefix}_INQUIRY_REPLY_MODE`] || "safe_auto") === "safe_auto";
  if (enabled && safeAuto && !draft.human_review_required) {
    await send({
      to: input.email,
      subject: `We received your ${input.brand} inquiry — ${reference}`,
      html: `<p>${escapeHtml(draft.reply_body).replace(/\n/g, "<br>")}</p>`,
    });
  }
  return primarySent ? "sent" : "skipped";
}

async function persistWorkflowRecords(input, stored, draft) {
  const brand = getBrand(input.site);
  await supabaseRequest("ai_reply_logs", {
    method: "POST",
    body: {
      inquiry_id: stored.inquiry.id,
      site: input.site,
      brand: brand.brand,
      mode: process.env[input.site === "cappuccinobag" ? "CAP_INQUIRY_REPLY_MODE" : "NOV_INQUIRY_REPLY_MODE"] || "safe_auto",
      model: draft.model,
      input_summary: draft.customer_summary,
      result: draft,
      status: draft.human_review_required ? "needs_review" : "draft",
    },
  });
  await Promise.allSettled([
    supabaseRequest("activities", {
      method: "POST",
      body: {
        customer_id: stored.customer.id,
        inquiry_id: stored.inquiry.id,
        site: input.site,
        source: "website",
        owner: stored.inquiry.owner || stored.inquiry.assigned_owner || "unassigned",
        activity_type: "website_inquiry",
        title: `${brand.brand} 网站收到新询盘`,
        body: input.message,
        metadata: {
          inquiry_number: stored.inquiry.inquiry_number,
          product_category: input.product_category,
        },
      },
    }),
    supabaseRequest("email_drafts", {
      method: "POST",
      body: {
        customer_id: stored.customer.id,
        inquiry_id: stored.inquiry.id,
        site: input.site,
        source: "website",
        owner: stored.inquiry.owner || stored.inquiry.assigned_owner || "unassigned",
        recipient: input.email,
        subject: `${brand.brand} inquiry ${stored.inquiry.inquiry_number}`,
        body: draft.reply_body,
        status: "draft",
        requires_human_review: true,
      },
    }),
  ]);
}

async function updateEmailStatus(inquiryId, emailStatus) {
  await supabaseRequest(`inquiries?id=eq.${encodeURIComponent(inquiryId)}`, {
    method: "PATCH",
    body: { email_status: validateEmailStatus(emailStatus) },
  });
}

export async function ingestSharedInquiry(
  { siteSource, raw = {}, uploadedFiles = [], pendingFiles = [], uploadFiles },
  dependencies = {},
) {
  const source = validateSiteSource(siteSource);
  const id = submissionId(raw.submission_id || raw.submissionId);
  const findExisting = dependencies.findExisting || findInquiryBySubmissionId;
  const existing = await findExisting(id);
  if (existing) {
    return {
      customer: null,
      inquiry: existing,
      draft: null,
      idempotent: true,
      emailStatus: existing.email_status || "pending",
    };
  }

  if (pendingFiles.length && typeof uploadFiles !== "function") {
    throw new SharedIngestError("Attachment upload is not configured.", 500);
  }
  const resolvedFiles = pendingFiles.length ? await uploadFiles(pendingFiles) : uploadedFiles;
  const input = mapSharedInquiryPayload(source, { ...raw, submission_id: id }, resolvedFiles);

  const createDraft = dependencies.createDraft || createAiDraft;
  const createStored = dependencies.createStored || createInquiryIdempotent;
  const persist = dependencies.persistWorkflow || persistWorkflowRecords;
  const deliver = dependencies.deliverEmails;
  const setEmailStatus = dependencies.setEmailStatus || updateEmailStatus;
  const draft = await createDraft(input);
  const stored = await createStored({
    ...input,
    lead_score: draft.lead_score,
    intent: draft.intent,
    risk_level: draft.risk_level,
    human_takeover: draft.human_review_required,
    auto_reply_enabled: !draft.human_review_required,
    ai_customer_summary: draft.customer_summary,
    ai_recommended_action: draft.recommended_action,
    ai_reply_draft: draft.reply_body,
    ai_result: draft,
  });
  if (stored.idempotent) {
    return {
      ...stored,
      draft: null,
      emailStatus: stored.inquiry.email_status || "pending",
    };
  }

  await persist(input, stored, draft);
  let emailStatus = "failed";
  try {
    emailStatus = validateEmailStatus(await (deliver
      ? deliver(input, stored.inquiry, draft, raw)
      : deliverInquiryEmails(input, stored.inquiry, draft, sendEmail, raw)));
  } catch {
    emailStatus = "failed";
  }
  await setEmailStatus(stored.inquiry.id, emailStatus);
  stored.inquiry.email_status = emailStatus;
  return { ...stored, draft, idempotent: false, emailStatus };
}
