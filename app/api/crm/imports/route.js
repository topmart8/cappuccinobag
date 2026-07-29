import { NextResponse } from "next/server";
import { getCrmActor } from "../../../../lib/crm/auth";
import { mapImportRow, normalizeImportRow } from "../../../../lib/crm/importer";
import { supabaseRequest } from "../../../../lib/crm/supabase";

function duplicateFilter(identifiers) {
  const clauses = [];
  if (identifiers.email) clauses.push(`email_normalized.eq.${encodeURIComponent(identifiers.email)}`);
  if (identifiers.phone) clauses.push(`phone.eq.${encodeURIComponent(`+${identifiers.phone}`)}`);
  if (identifiers.whatsapp) clauses.push(`whatsapp_phone.eq.${encodeURIComponent(`+${identifiers.whatsapp}`)}`);
  if (identifiers.domain) clauses.push(`domain.eq.${encodeURIComponent(identifiers.domain)}`);
  return clauses.length ? `or=(${clauses.join(",")})` : "";
}

async function previewRows(rows, mapping, context) {
  const previews = [];
  for (let index = 0; index < rows.length; index += 1) {
    const mapped = mapImportRow(rows[index], mapping);
    const result = normalizeImportRow(mapped, context);
    let duplicate = null;
    if (!result.errors.length) {
      const filter = duplicateFilter(result.identifiers);
      if (filter) {
        const existing = await supabaseRequest(`customers?select=id,customer_number,company,email,phone,whatsapp_phone,domain&${filter}&limit=1`);
        duplicate = existing[0] || null;
      }
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
          const created = await supabaseRequest("customers", {
            method: "POST", body: preview.normalized, prefer: "return=representation",
          });
          customerId = created[0].id;
          imported += 1;
          status = "imported";
          await supabaseRequest("activities", {
            method: "POST",
            body: {
              customer_id: customerId, site, source: "csv", owner,
              activity_type: "lead_imported", title: "CSV 导入企业线索",
              body: preview.normalized.company || preview.normalized.name,
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
