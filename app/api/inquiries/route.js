import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { saveWebsiteInquiry } from "../../../lib/crm/inquiry";
import { storageUpload } from "../../../lib/crm/supabase";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED = new Set([
  "application/pdf", "image/jpeg", "image/png", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "application/x-zip-compressed",
]);
const attempts = globalThis.__capInquiryRateLimit || (globalThis.__capInquiryRateLimit = new Map());

function rateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 8;
}

function safeName(name = "file") {
  const extension = name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "file";
  return `${randomBytes(12).toString("hex")}.${extension}`;
}

async function parseRequest(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("multipart/form-data")) {
    const form = await request.formData();
    const data = Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string"));
    const files = [...form.values()].filter((value) => typeof value === "object" && value.size > 0);
    return { data, files };
  }
  return { data: await request.json(), files: [] };
}

async function upload(files) {
  if (files.length > 5) throw new Error("Upload no more than 5 files.");
  const uploaded = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type) || file.size > 8 * 1024 * 1024) {
      throw new Error("Unsupported or oversized attachment.");
    }
    const path = `cappuccinobag/${new Date().toISOString().slice(0, 10)}/${safeName(file.name)}`;
    await storageUpload(process.env.SUPABASE_STORAGE_BUCKET || "crm-attachments", path, file);
    uploaded.push({ name: file.name.slice(0, 180), type: file.type, size: file.size, path, scan_status: "pending" });
  }
  return uploaded;
}

async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.RESEND_API_KEY || !process.env.INQUIRY_FROM_EMAIL) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.INQUIRY_FROM_EMAIL, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  return response.ok;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  try {
    const { data, files } = await parseRequest(request);
    data.attribution_country ||= request.headers.get("x-vercel-ip-country") || "";
    if (data.website) return NextResponse.json({ ok: true });
    if (!data.name || !EMAIL.test(String(data.email || ""))) {
      return NextResponse.json({ message: "Name and a valid email are required." }, { status: 422 });
    }
    const uploadedFiles = await upload(files);
    const saved = await saveWebsiteInquiry("cappuccinobag", data, uploadedFiles);
    const reference = saved.inquiry.inquiry_number;
    const details = [
      ["Reference", reference], ["Brand", "Cappuccino Bag"], ["Name", data.name],
      ["Company", data.company], ["Email", data.email], ["WhatsApp", data.phone],
      ["Country", data.country], ["Product", data.product_needed || data.product],
      ["Quantity", data.quantity], ["Material", data.material], ["Logo", data.logo_method],
      ["Message", data.message], ["Landing page", data.first_landing_page],
      ["Submit page", data.current_page_url || data.pageUrl], ["First UTM source", data.utm_source],
      ["First UTM campaign", data.utm_campaign], ["Current UTM source", data.current_utm_source],
      ["Current UTM campaign", data.current_utm_campaign],
    ].map(([key, value]) => `<tr><th align="left">${key}</th><td>${escapeHtml(value || "—")}</td></tr>`).join("");
    await sendEmail({
      to: process.env.INQUIRY_TO_EMAIL || "info@cappuccinobag.net",
      subject: `[Cappuccino RFQ] ${reference} | ${data.product_needed || "Product to confirm"}`,
      html: `<h2>New Cappuccino Bag inquiry</h2><table>${details}</table>`,
      replyTo: data.email,
    });
    const enabled = process.env.CAP_INQUIRY_AUTO_REPLY_ENABLED !== "false";
    const safeAuto = (process.env.CAP_INQUIRY_REPLY_MODE || "safe_auto") === "safe_auto";
    if (enabled && safeAuto && !saved.draft.human_review_required) {
      await sendEmail({
        to: data.email,
        subject: `We received your Cappuccino Bag inquiry — ${reference}`,
        html: `<p>${escapeHtml(saved.draft.reply_body).replace(/\n/g, "<br>")}</p>`,
      });
    }
    return NextResponse.json({ ok: true, inquiryNumber: reference, humanReviewRequired: saved.draft.human_review_required });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Inquiry could not be saved. Please email info@cappuccinobag.net." }, { status: 502 });
  }
}
