import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../../lib/crm/auth";
import { createAiDraft } from "../../../../../lib/crm/ai";
import { scoreLead } from "../../../../../lib/crm/scoring";
import {
  buildRequirementConfirmationActivity,
  validateRequirementConfirmationGate,
} from "../../../../../lib/crm/sales-policy";
import { supabaseRequest } from "../../../../../lib/crm/supabase";

const STAGES = new Set(["new", "qualified", "contacted", "replied", "quoted", "sample", "negotiation", "won", "lost"]);

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

    if (input.action === "confirm_requirements") {
      const activity = buildRequirementConfirmationActivity({
        customer_id: id,
        site: lead.site,
        owner: lead.owner || actor.user,
        requirement_version: input.requirement_version,
        confirmed_by: actor.user,
      });
      await supabaseRequest("activities", { method: "POST", body: activity });
      return NextResponse.json({ message: "客户需求版本已人工确认。", requirement_confirmation: activity.metadata });
    }

    if (input.action === "update") {
      const scoreOverride = input.score_override === "" || input.score_override == null
        ? null : Math.max(0, Math.min(100, Number(input.score_override)));
      const requestedStage = STAGES.has(input.stage) ? input.stage : lead.stage;
      if (requestedStage === "quoted" && lead.stage !== "quoted") {
        const confirmations = await supabaseRequest(
          `activities?customer_id=eq.${encodeURIComponent(id)}&activity_type=eq.requirement_confirmed&select=id,activity_type,metadata,created_at&order=created_at.desc&limit=1`,
        );
        const gate = validateRequirementConfirmationGate({
          current_stage: lead.stage,
          target_stage: requestedStage,
          confirmation: confirmations?.[0],
        });
        if (!gate.allowed) {
          return NextResponse.json({ message: gate.reason, code: gate.code }, { status: 409 });
        }
      }
      const update = {
        stage: requestedStage,
        next_follow_up: input.next_follow_up || null,
        score_override: Number.isFinite(scoreOverride) ? scoreOverride : null,
        owner: actor.role === "admin" ? String(input.owner || "").slice(0, 180) || null : actor.user,
        assigned_owner: actor.role === "admin" ? String(input.owner || "").slice(0, 180) || null : actor.user,
      };
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
