import { NextResponse } from "next/server.js";
import { identityCandidates } from "../../../../lib/crm/identity.js";
import { validSharedSecret } from "../../../../lib/crm/shared-ingest.js";
import { evaluateOutboundEligibility } from "../../../../lib/crm/supabase.js";

export const runtime = "nodejs";

const attempts = globalThis.__crmProspectCheckRateLimit
  || (globalThis.__crmProspectCheckRateLimit = new Map());

function rateLimited(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 60;
}

function bearerSecret(request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

export async function POST(request) {
  if (rateLimited(request)) {
    return NextResponse.json({ message: "Too many attempts." }, { status: 429 });
  }
  const expected = process.env.CRM_PROSPECT_CHECK_SECRET || process.env.SHARED_CRM_INGEST_SECRET;
  if (!validSharedSecret(bearerSecret(request), expected)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ message: "Invalid prospect." }, { status: 422 });
  }
  const candidates = identityCandidates(input);
  if (!Object.values(candidates).some(Boolean)) {
    return NextResponse.json({ message: "At least one identity field is required." }, { status: 422 });
  }
  try {
    const result = await evaluateOutboundEligibility(input);
    return NextResponse.json({
      allowed: result.allowed,
      reason: result.reason,
      customerId: result.customer?.id || null,
      customerNumber: result.customer?.customer_number || null,
    }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ message: "Prospect eligibility could not be checked." }, { status: 502 });
  }
}
