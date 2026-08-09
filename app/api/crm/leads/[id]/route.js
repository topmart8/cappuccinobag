import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../../lib/crm/auth";
import { createAiDraft } from "../../../../../lib/crm/ai";
import { scoreLead } from "../../../../../lib/crm/scoring";
import { supabaseRequest } from "../../../../../lib/crm/supabase";

const STAGES = new Set(["new", "qualified", "contacted", "replied", "quoted", "sample", "negotiation", "won", "lost"]);
const RELATIONSHIP_STATUSES = new Set([
  "new_lead", "existing_lead", "existing_customer", "old_customer", "blocked", "supplier_non_buyer",
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function checked(value) {
  return value === true || value === "true" || value === "1" || value === "on";
}

export async function PATCH(request, { params }) {
  try {
    const actor = await getCrmActor();
    const { id } = await params;
    const input = await request.json();
    const rows = await supabaseRequest(`customers?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
    const lead = rows[0];
    if (!lead) return NextResponse.json({ message: "企业线索不存在。" }, { status: 404 });
    if (actor.role !== "admin" && lead.owner && lead.owner !== actor.user) {
      return NextResponse.json({ message: "只能修改分配给自己的线索。" }, { status: 403 });
    }

    if (input.action === "update") {
      const scoreOverride = input.score_override === "" || input.score_override == null
        ? null : Math.max(0, Math.min(100, Number(input.score_override)));
      const update = {
        stage: STAGES.has(input.stage) ? input.stage : lead.stage,
        next_follow_up: input.next_follow_up || null,
        last_contacted_at: input.last_contacted_at || lead.last_contacted_at || null,
        score_override: Number.isFinite(scoreOverride) ? scoreOverride : null,
        owner: actor.role === "admin" ? String(input.owner || "").slice(0, 180) || null : actor.user,
        assigned_owner: actor.role === "admin" ? String(input.owner || "").slice(0, 180) || null : actor.user,
      };
      if (actor.role === "admin") {
        const duplicateOf = String(input.duplicate_of || "").trim();
        if (duplicateOf && (!UUID.test(duplicateOf) || duplicateOf === id)) {
          return NextResponse.json({ message: "重复客户 ID 无效。" }, { status: 422 });
        }
        update.is_existing_customer = checked(input.is_existing_customer);
        update.do_not_prospect = checked(input.do_not_prospect);
        update.blocked_reason = String(input.blocked_reason || "").trim().slice(0, 1000) || null;
        update.duplicate_review = checked(input.duplicate_review);
        update.duplicate_of = duplicateOf || null;
        const requestedRelationship = String(input.relationship_status || "");
        update.relationship_status = update.do_not_prospect
          ? "blocked"
          : RELATIONSHIP_STATUSES.has(requestedRelationship)
            ? requestedRelationship
            : lead.relationship_status;
        update.is_existing_customer = ["existing_customer", "old_customer"].includes(update.relationship_status);
      }
      const score = scoreLead({ ...lead, ...update });
      update.score = score.automatic;
      await supabaseRequest(`customers?id=eq.${id}`, { method: "PATCH", body: update });
      await supabaseRequest("activities", {
        method: "POST",
        body: { customer_id: id, site: lead.site, source: "crm", owner: actor.user, activity_type: "lead_updated", title: "更新线索阶段与负责人", metadata: update },
      });
      return NextResponse.json({ message: "线索已更新。" });
    }

    if (input.action === "note") {
      const body = String(input.body || "").trim().slice(0, 5000);
      if (!body) return NextResponse.json({ message: "备注不能为空。" }, { status: 422 });
      await supabaseRequest("activities", {
        method: "POST",
        body: { customer_id: id, site: lead.site, source: "crm", owner: actor.user, activity_type: "note", title: "添加备注", body },
      });
      return NextResponse.json({ message: "备注已添加。" });
    }

    if (input.action === "task") {
      const title = String(input.title || "").trim().slice(0, 240);
      if (!title) return NextResponse.json({ message: "任务标题不能为空。" }, { status: 422 });
      await supabaseRequest("tasks", {
        method: "POST",
        body: { customer_id: id, site: lead.site, source: "crm", owner: actor.user, title, due_at: input.due_at || null, priority: input.priority === "high" ? "high" : "normal" },
      });
      return NextResponse.json({ message: "任务已创建。" });
    }

    if (input.action === "draft_email" || input.action === "draft_whatsapp") {
      if (
        lead.do_not_prospect || lead.is_existing_customer || lead.duplicate_review
        || lead.duplicate_of || ["blocked", "existing_customer", "old_customer", "supplier_non_buyer"].includes(lead.relationship_status)
      ) {
        return NextResponse.json({ message: "该客户已被老客户、屏蔽或重复规则排除，不能生成开发信草稿。" }, { status: 409 });
      }
      const product = (lead.product_keywords || []).join(", ") || "custom bag project";
      const draft = await createAiDraft({
        site: lead.site, company: lead.company, name: lead.name, country: lead.country,
        product_category: product, message: lead.notes || "Prepare a concise first outreach follow-up.",
      });
      const shared = { customer_id: id, site: lead.site, source: "crm", owner: actor.user, body: draft.reply_body };
      if (input.action === "draft_email") {
        await supabaseRequest("email_drafts", {
          method: "POST",
          body: { ...shared, recipient: lead.email, subject: `${lead.site === "novlane" ? "Novlane" : "Cappuccino Bag"} — custom project follow-up`, requires_human_review: true },
        });
      } else {
        await supabaseRequest("whatsapp_drafts", {
          method: "POST",
          body: { ...shared, recipient: lead.whatsapp_phone || lead.phone, source_page: lead.source_url, product_category: product, mode: "draft_only" },
        });
      }
      return NextResponse.json({ message: input.action === "draft_email" ? "英文邮件草稿已生成，发送前必须人工审核。" : "WhatsApp 草稿已生成，当前模式不会自动发送。" });
    }
    return NextResponse.json({ message: "不支持的操作。" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "操作失败。" }, { status: 502 });
  }
}
