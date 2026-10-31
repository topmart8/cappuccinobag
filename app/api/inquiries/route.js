import { uploadInquiryAttachments, validateInquiryAttachments } from "../../../lib/inquiry/attachments.js";
import { NextResponse } from "next/server.js";
import { ingestSharedInquiry, SharedIngestError } from "../../../lib/crm/shared-ingest.js";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = globalThis.__capInquiryRateLimit || (globalThis.__capInquiryRateLimit = new Map());

function rateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 8;
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
    validateInquiryAttachments(files);
    const saved = await ingestSharedInquiry({
      siteSource: "cappuccino",
      raw: data,
      pendingFiles: files,
      uploadFiles: uploadInquiryAttachments,
    });
    const reference = saved.inquiry.inquiry_number;
    return NextResponse.json({
      ok: true,
      saved: true,
      notification: { status: saved.emailStatus === "sent" ? "accepted" : saved.emailStatus || "pending", statusRecorded: saved.emailStatusPersisted ?? true, receiptVerified: false },
      followUpRequired: saved.emailStatus !== "sent" || saved.emailStatusPersisted === false || Boolean(saved.postSaveFailures?.length) || Boolean(saved.idempotent),
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
