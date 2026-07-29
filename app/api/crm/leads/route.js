import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../lib/crm/auth";
import { normalizeImportRow } from "../../../../lib/crm/importer";
import { supabaseRequest } from "../../../../lib/crm/supabase";

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
    const created = await supabaseRequest("customers", {
      method: "POST",
      body: normalized,
      prefer: "return=representation",
    });
    await supabaseRequest("activities", {
      method: "POST",
      body: {
        customer_id: created[0].id,
        site: normalized.site,
        source: "crm",
        owner: normalized.owner,
        activity_type: "lead_created",
        title: "手工创建企业线索",
        body: normalized.company || normalized.name,
      },
    });
    return NextResponse.json({ ok: true, id: created[0].id });
  } catch (error) {
    const duplicate = /duplicate|unique/i.test(error.message || "");
    return NextResponse.json(
      { message: duplicate ? "检测到重复联系方式，请先搜索并更新已有企业。" : error.message || "创建失败。" },
      { status: duplicate ? 409 : 502 },
    );
  }
}
