import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ingestSharedInquiry } from "../../../lib/crm/shared-ingest";
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

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  try {
    const { data, files } = await parseRequest(request);
    data.product_category = data.product_category || data.product_needed || data.product || "";
    data.attribution_country ||= request.headers.get("x-vercel-ip-country") || "";
    if (data.website) return NextResponse.json({ ok: true });
    if (!data.name || !EMAIL.test(String(data.email || ""))) {
      return NextResponse.json({ message: "Name and a valid email are required." }, { status: 422 });
    }
    const uploadedFiles = await upload(files);
    const saved = await ingestSharedInquiry({
      siteSource: "cappuccino",
      raw: data,
      uploadedFiles,
    });
    const reference = saved.inquiry.inquiry_number;
    return NextResponse.json({
      ok: true,
      inquiryNumber: reference,
      submissionId: saved.inquiry.submission_id,
      idempotent: saved.idempotent,
      humanReviewRequired: saved.draft?.human_review_required ?? saved.inquiry.human_takeover ?? false,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Inquiry could not be saved. Please email info@cappuccinobag.net." },
      { status: error.status || 502 },
    );
  }
}
