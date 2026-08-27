import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../lib/crm/auth";
import { normalizeImportRow } from "../../../../lib/crm/importer";
import { resolveOrCreateCustomer, supabaseRequest } from "../../../../lib/crm/supabase";

export async function POST(request) {
  try {
    const actor = await getCrmActor();
    const input = await request.json();
    const { normalized, errors } = normalizeImportRow(input, {
      site: input.site,
      source: "manual",
      owner: actor.role === "admin" ? input.owner || actor.user : actor.user,
    });
    if (errors.length) return NextResponse.json({ message: errors.join("；") }, { status: 422 });
    const resolved = await resolveOrCreateCustomer(normalized);
    const customer = resolved.customer;
    await supabaseRequest("activities", {
      method: "POST",
      body: {
        customer_id: customer.id,
        site: normalized.site,
        source: "crm",
        owner: normalized.owner,
        activity_type: resolved.created ? "lead_created" : "lead_identity_matched",
        title: resolved.created ? "手工创建企业线索" : "手工线索归入已有客户",
        body: normalized.company || normalized.name,
        metadata: { identity_match_method: resolved.matchMethod },
      },
    });
    return NextResponse.json({
      ok: true,
      id: customer.id,
      duplicate: !resolved.created,
      duplicateReview: resolved.matchMethod === "company_review",
    });
  } catch (error) {
    const duplicate = /duplicate|unique/i.test(error.message || "");
    return NextResponse.json(
      { message: duplicate ? "检测到重复联系方式，请先搜索并更新已有企业。" : error.message || "创建失败。" },
      { status: duplicate ? 409 : 502 },
    );
  }
}
