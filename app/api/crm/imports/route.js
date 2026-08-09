import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../lib/crm/auth";
import { mapImportRow, normalizeImportRow } from "../../../../lib/crm/importer";
import {
  resolveCustomerIdentity,
  resolveOrCreateCustomer,
  supabaseRequest,
} from "../../../../lib/crm/supabase";

async function previewRows(rows, mapping, context) {
  const previews = [];
  for (let index = 0; index < rows.length; index += 1) {
    const mapped = mapImportRow(rows[index], mapping);
    const result = normalizeImportRow(mapped, context);
    let duplicate = null;
    if (!result.errors.length) {
      const identity = await resolveCustomerIdentity(result.normalized);
      duplicate = identity.customer
        ? { ...identity.customer, match_method: identity.matchMethod }
        : identity.suppression ? { suppression: true } : null;
    }
    previews.push({
      row_number: index + 2,
      raw: rows[index],
      normalized: result.normalized,
      errors: result.errors,
      duplicate,
      score_reasons: result.score_reasons,
    });
  }
  return previews;
}

export async function POST(request) {
  try {
    const actor = await getCrmActor();
    const input = await request.json();
    const rows = Array.isArray(input.rows) ? input.rows.slice(0, 5000) : [];
    if (!rows.length) return NextResponse.json({ message: "CSV 没有可导入的数据行。" }, { status: 422 });
    const site = input.site === "novlane" ? "novlane" : "cappuccinobag";
    const owner = actor.role === "admin" ? String(input.owner || actor.user).slice(0, 180) : actor.user;
    const context = { site, owner, source: "csv" };
    const previews = await previewRows(rows, input.mapping || {}, context);
    if (input.mode !== "commit") return NextResponse.json({ ok: true, previews });

    const history = await supabaseRequest("imports", {
      method: "POST",
      body: {
        site, source: "csv", owner, filename: String(input.filename || "import.csv").slice(0, 240),
        status: "processing", mapping: input.mapping || {}, total_rows: previews.length,
      },
      prefer: "return=representation",
    });
    const importId = history[0].id;
    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    for (const preview of previews) {
      let status = "pending";
      let customerId = null;
      let message = null;
      if (preview.errors.length) {
        status = "error";
        errors += 1;
        message = preview.errors.join("；");
      } else if (preview.duplicate) {
        status = "duplicate";
        duplicates += 1;
        customerId = preview.duplicate.id;
        message = "与现有企业联系方式或域名重复";
      } else {
        try {
          const resolved = await resolveOrCreateCustomer(preview.normalized);
          customerId = resolved.customer.id;
          if (!resolved.created) {
            duplicates += 1;
            status = "duplicate";
            message = `归入已有客户（${resolved.matchMethod}）`;
          } else {
            imported += 1;
            status = "imported";
            message = resolved.matchMethod === "company_review" ? "公司名称相似，等待重复复核" : null;
          }
          await supabaseRequest("activities", {
            method: "POST",
            body: {
              customer_id: customerId, site, source: "csv", owner,
              activity_type: resolved.created ? "lead_imported" : "lead_identity_matched",
              title: resolved.created ? "CSV 导入企业线索" : "CSV 线索归入已有客户",
              body: preview.normalized.company || preview.normalized.name,
              metadata: { identity_match_method: resolved.matchMethod },
            },
          });
        } catch (error) {
          status = "error";
          errors += 1;
          message = error.message;
        }
      }
      await supabaseRequest("import_rows", {
        method: "POST",
        body: {
          import_id: importId, site, source: "csv", owner, row_number: preview.row_number,
          raw_data: preview.raw, normalized_data: preview.normalized, status,
          error_message: message, customer_id: customerId,
        },
      });
    }
    await supabaseRequest(`imports?id=eq.${importId}`, {
      method: "PATCH",
      body: {
        status: errors && !imported ? "failed" : "completed",
        imported_rows: imported, duplicate_rows: duplicates, error_rows: errors,
      },
    });
    return NextResponse.json({ ok: true, import_id: importId, imported, duplicates, errors });
  } catch (error) {
    return NextResponse.json({ message: error.message || "导入失败。" }, { status: 502 });
  }
}
