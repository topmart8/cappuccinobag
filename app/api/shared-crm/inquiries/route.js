import { NextResponse } from "next/server.js";
import {
  ingestSharedInquiry,
  validSharedSecret,
} from "../../../../lib/crm/shared-ingest.js";

export const runtime = "nodejs";

const attempts = globalThis.__sharedCrmRateLimit
  || (globalThis.__sharedCrmRateLimit = new Map());

function rateLimited(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 30;
}

function bearerSecret(request) {
  const authorization = request.headers.get("authorization") || "";
  if (authorization.startsWith("Bearer ")) return authorization.slice(7);
  return request.headers.get("x-shared-crm-secret") || "";
}

export async function POST(request) {
  if (rateLimited(request)) {
    return NextResponse.json({ message: "Too many attempts." }, { status: 429 });
  }
  if (!validSharedSecret(bearerSecret(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (data.website) return NextResponse.json({ ok: true });
    const saved = await ingestSharedInquiry({ siteSource: data.site_source, raw: data });
    return NextResponse.json({
      ok: true,
      inquiryNumber: saved.inquiry.inquiry_number,
      submissionId: saved.inquiry.submission_id,
      idempotent: saved.idempotent,
      identityStatus: saved.identityStatus,
      humanReviewRequired: saved.draft?.human_review_required ?? saved.inquiry.human_takeover ?? false,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Inquiry could not be saved." },
      { status: error.status || 502 },
    );
  }
}
