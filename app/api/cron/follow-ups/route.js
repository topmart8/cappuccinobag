import { NextResponse } from "next/server";
import { getBrand } from "../../../../lib/crm/brand";
import { supabaseRequest } from "../../../../lib/crm/supabase";

function authorized(request) {
  return Boolean(process.env.CRON_SECRET) &&
    request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

function draft(inquiry, sequence) {
  const brand = getBrand(inquiry.site);
  const lead = inquiry.name ? `Hello ${inquiry.name},` : "Hello,";
  const question = sequence === 1
    ? `We are following up on your ${inquiry.product || inquiry.product_category || "custom product"} inquiry. Would you like to share any updated quantity, material, logo or timing requirements?`
    : `This is our final follow-up on your ${inquiry.product || inquiry.product_category || "custom product"} project. If the project is still active, please send the latest brief or reference images and our team will review them.`;
  return `${lead}\n\n${question}\n\n${brand.signature}`;
}

export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const now = Date.now();
  const rows = await supabaseRequest(
    "inquiries?reply_status=eq.unreplied&human_takeover=eq.false&stage=not.in.(rejected,opted_out,closed)&select=*&order=created_at.asc&limit=1000",
  );
  let created = 0;
  for (const inquiry of rows) {
    const ageHours = (now - new Date(inquiry.created_at).getTime()) / 3600000;
    const tasks = [];
    if (ageHours >= 24) tasks.push({ sequence_number: 0, due_at: new Date(new Date(inquiry.created_at).getTime() + 24 * 3600000).toISOString(), draft_body: "Internal reminder: inquiry has not been handled within 24 hours.", channel: "internal" });
    if (ageHours >= 72) tasks.push({ sequence_number: 1, due_at: new Date(new Date(inquiry.created_at).getTime() + 72 * 3600000).toISOString(), draft_body: draft(inquiry, 1), channel: "whatsapp" });
    if (ageHours >= 168) tasks.push({ sequence_number: 2, due_at: new Date(new Date(inquiry.created_at).getTime() + 168 * 3600000).toISOString(), draft_body: draft(inquiry, 2), channel: "whatsapp" });
    for (const task of tasks) {
      await supabaseRequest("follow_up_tasks?on_conflict=inquiry_id,sequence_number", {
        method: "POST",
        body: {
          customer_id: inquiry.customer_id,
          inquiry_id: inquiry.id,
          site: inquiry.site,
          brand: inquiry.brand,
          ...task,
        },
        prefer: "resolution=ignore-duplicates",
      });
      created += 1;
    }
  }
  return NextResponse.json({ ok: true, examined: rows.length, eligibleTasks: created, mode: "draft_only" });
}

