import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../../lib/crm/auth.js";
import { syncAllAnalytics, syncSiteAnalytics } from "../../../../../lib/analytics/sync.js";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  const actor = await getCrmActor();
  if (actor.role !== "admin") {
    return NextResponse.json({ message: "Only admins can synchronize Google analytics." }, { status: 403 });
  }
  try {
    const form = await request.formData().catch(() => null);
    const site = form?.get("site") || "all";
    const results = site === "all"
      ? await syncAllAnalytics({ days: 90 })
      : [await syncSiteAnalytics(String(site), { days: 90 })];
    const failed = results.every((result) => result.status === "failed");
    const url = new URL("/crm/analytics", request.url);
    url.searchParams.set("sync", failed ? "failed" : "completed");
    return NextResponse.redirect(url, 303);
  } catch (error) {
    const url = new URL("/crm/analytics", request.url);
    url.searchParams.set("sync", "failed");
    url.searchParams.set("reason", String(error.message || "Sync failed.").slice(0, 180));
    return NextResponse.redirect(url, 303);
  }
}
