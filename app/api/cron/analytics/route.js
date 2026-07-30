import { NextResponse } from "next/server";
import { syncAllAnalytics } from "../../../../lib/analytics/sync.js";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request) {
  return Boolean(process.env.CRON_SECRET)
    && request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request) {
  if (!authorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  const results = await syncAllAnalytics({ days: 90 });
  const success = results.some((result) => result.status !== "failed");
  return NextResponse.json({ ok: success, results }, { status: success ? 200 : 502 });
}
