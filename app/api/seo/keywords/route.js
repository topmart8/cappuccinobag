import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../lib/crm/auth";
import { parseKeywordCsv, processKeywords, toSeoKeywordRow } from "../../../../automation/keywords/pipeline";
import { saveSeoRows, seoSupabaseRequest } from "../../../../automation/lib/supabase";

function deny(actor) {
  return actor.role !== "admin"
    ? NextResponse.json({ message: "SEO operations require an administrator." }, { status: 403 })
    : null;
}

export async function GET() {
  const actor = await getCrmActor();
  const denied = deny(actor);
  if (denied) return denied;
  const rows = await seoSupabaseRequest("seo_keywords?site=eq.cappuccinobag&select=*&order=opportunity_score.desc&limit=500");
  return NextResponse.json({ rows: Array.isArray(rows) ? rows : [], storage: rows?.skipped ? "not_configured" : "supabase" });
}

export async function POST(request) {
  const actor = await getCrmActor();
  const denied = deny(actor);
  if (denied) return denied;
  try {
    const contentType = request.headers.get("content-type") || "";
    let rows;
    if (contentType.includes("json")) {
      const input = await request.json();
      const values = input.keywords || input.rows || [input];
      rows = values.map((value) => typeof value === "string" ? { keyword: value, source: input.source || "manual" } : value);
    } else {
      rows = parseKeywordCsv(await request.text(), "csv");
    }
    const records = processKeywords(rows);
    const saved = await saveSeoRows("seo_keywords", records.map(toSeoKeywordRow));
    return NextResponse.json({
      ok: true, imported: records.length, rows: records,
      storage: saved?.skipped ? "not_configured" : "supabase", mode: "draft_only",
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Keyword import failed." }, { status: 422 });
  }
}
