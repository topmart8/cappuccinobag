import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../../lib/crm/auth";
import { seoSupabaseRequest } from "../../../../../automation/lib/supabase";

const actions = {
  approve: "approved",
  reject: "rejected",
  revise: "manual_review",
};

export async function PATCH(request, { params }) {
  const actor = await getCrmActor();
  if (actor.role !== "admin") return NextResponse.json({ message: "Administrator access required." }, { status: 403 });
  const { id } = await params;
  const input = await request.json();
  const reviewStatus = actions[input.action];
  if (!reviewStatus) return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  if (input.action === "approve" && input.publish === true) {
    return NextResponse.json({ message: "Approval does not publish in draft_only mode." }, { status: 409 });
  }
  const result = await seoSupabaseRequest(`content_tasks?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", body: { review_status: reviewStatus }, prefer: "return=representation",
  });
  return NextResponse.json({ ok: true, status: reviewStatus, rows: Array.isArray(result) ? result : [], mode: "draft_only" });
}
