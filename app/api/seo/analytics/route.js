import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../lib/crm/auth";
import { detectLowPerformers } from "../../../../automation/analytics/performance";
import { saveSeoRows } from "../../../../automation/lib/supabase";

export async function POST(request) {
  const actor = await getCrmActor();
  if (actor.role !== "admin") return NextResponse.json({ message: "Administrator access required." }, { status: 403 });
  try {
    const input = await request.json();
    const rows = Array.isArray(input.rows) ? input.rows : [];
    const analyzed = detectLowPerformers(rows).map((row) => ({
      site: "cappuccinobag", url: row.url || row.keys?.[0], date: row.date || new Date().toISOString().slice(0, 10),
      clicks: Number(row.clicks) || 0, impressions: Number(row.impressions) || 0,
      ctr: row.ctr, average_position: Number(row.average_position) || null,
      sessions: Number(row.sessions) || null, inquiries: Number(row.inquiries) || null,
      conversion_rate: Number(row.conversion_rate) || null, content_decay_score: row.content_decay_score,
    }));
    const saved = await saveSeoRows("analytics_page_performance", analyzed);
    return NextResponse.json({ ok: true, low_performers: analyzed, storage: saved?.skipped ? "not_configured" : "supabase" });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Analytics import failed." }, { status: 422 });
  }
}
