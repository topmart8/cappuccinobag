import { NextResponse } from "next/server";
import {
  ingestSharedInquiry,
  validSharedSecret,
} from "../../../../lib/crm/shared-ingest";

export const runtime = "nodejs";

function bearerSecret(request) {
  const authorization = request.headers.get("authorization") || "";
  if (authorization.startsWith("Bearer ")) return authorization.slice(7);
  return request.headers.get("x-shared-crm-secret") || "";
}

export async function POST(request) {
  if (!validSharedSecret(bearerSecret(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (data.website) return NextResponse.json({ ok: true });
    if (data.site_source !== "novlane") {
      return NextResponse.json({ message: "site_source must be novlane." }, { status: 422 });
    }
    const saved = await ingestSharedInquiry({ siteSource: data.site_source, raw: data });
    return NextResponse.json({
      ok: true,
      inquiryNumber: saved.inquiry.inquiry_number,
      submissionId: saved.inquiry.submission_id,
      idempotent: saved.idempotent,
      humanReviewRequired: saved.draft?.human_review_required ?? saved.inquiry.human_takeover ?? false,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Inquiry could not be saved." },
      { status: error.status || 502 },
    );
  }
}
