import { createAiDraft } from "./ai.js";
import { getBrand } from "./brand.js";
import { createInquiry, supabaseRequest } from "./supabase.js";

export function clean(value, max = 1000) {
  return String(value ?? "").replace(/\0/g, "").trim().slice(0, max);
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
    first_visit_time: input.first_visit_time || input.firstVisitTime || null,
    device: clean(input.device, 80) || null,
    attribution_country: clean(input.attribution_country, 120) || null,
  };
}

export async function saveWebsiteInquiry(site, raw, uploadedFiles = []) {
  const brand = getBrand(site);
  const input = {
    site,
    brand: brand.brand,
    source_channel: "website",
    name: clean(raw.name, 120),
    company: clean(raw.company, 180) || null,
    email: clean(raw.email, 180).toLowerCase(),
    phone: clean(raw.phone, 80) || null,
    whatsapp: clean(raw.whatsapp || raw.phone, 80) || null,
    country: clean(raw.country, 120) || null,
    language: clean(raw.language || raw.locale || "en", 20),
    product: clean(raw.product || raw.product_needed || raw.productType, 240) || null,
    product_category: clean(raw.product_category || raw.product_needed || raw.productType, 180) || "Other",
    quantity: clean(raw.quantity || raw.estimatedQuantity, 120) || null,
    material: clean(raw.material || raw.preferredMaterial, 240) || null,
    logo_method: clean(raw.logo_method, 240) || null,
    target_price: clean(raw.target_price || raw.targetRetailPrice, 120) || null,
    target_delivery_date: clean(raw.target_delivery_date || raw.requiredDeliveryDate, 120) || null,
    message: clean(raw.message, 4000) || null,
    uploaded_files: uploadedFiles,
    ...attributionFrom(raw),
  };
  const draft = await createAiDraft(input);
  const stored = await createInquiry({
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
  await supabaseRequest("ai_reply_logs", {
    method: "POST",
    body: {
      inquiry_id: stored.inquiry.id,
      site,
      brand: brand.brand,
      mode: process.env[site === "cappuccinobag" ? "CAP_INQUIRY_REPLY_MODE" : "NOV_INQUIRY_REPLY_MODE"] || "safe_auto",
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
        site,
        source: "website",
        owner: stored.inquiry.owner || stored.inquiry.assigned_owner || "unassigned",
        activity_type: "website_inquiry",
        title: `${brand.brand} 网站收到新询盘`,
        body: input.message,
        metadata: { inquiry_number: stored.inquiry.inquiry_number, product_category: input.product_category },
      },
    }),
    supabaseRequest("email_drafts", {
      method: "POST",
      body: {
        customer_id: stored.customer.id,
        inquiry_id: stored.inquiry.id,
        site,
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
  return { ...stored, draft };
}
