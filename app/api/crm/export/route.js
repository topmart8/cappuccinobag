import { supabaseRequest } from "../../../../lib/crm/supabase";
import { applyOwnerScope, getCrmActor } from "../../../../lib/crm/auth";

const inquiryColumns = [
  "customer_number", "inquiry_number", "site", "brand", "source_channel", "name", "company", "email", "phone", "whatsapp",
  "country", "language", "product", "product_category", "quantity", "material", "logo_method", "target_price",
  "target_delivery_date", "message", "uploaded_files", "lead_score", "intent", "risk_level", "assigned_owner",
  "stage", "next_follow_up", "human_takeover", "auto_reply_enabled", "first_landing_page", "current_page_url",
  "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "msclkid",
  "first_visit_time", "submit_time", "device", "attribution_country", "ai_customer_summary",
  "ai_recommended_action", "ai_reply_draft", "reply_status", "created_at", "updated_at",
];

const leadColumns = [
  "customer_number", "site", "brand", "company", "name", "country", "industry", "website", "domain",
  "email", "phone", "whatsapp_phone", "facebook_url", "instagram_url", "linkedin_url",
  "product_keywords", "source", "source_url", "owner", "stage", "score", "score_override",
  "tags", "notes", "next_follow_up", "created_at", "updated_at",
];

function value(row, column) {
  if (column === "customer_number") return String(row.customers?.customer_number ?? "");
  const item = row[column];
  return typeof item === "object" && item !== null ? JSON.stringify(item) : String(item ?? "");
}

function csvCell(item) {
  return `"${String(item).replace(/"/g, '""')}"`;
}

function xml(item) {
  return String(item).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[character]);
}

export async function GET(request) {
  const actor = await getCrmActor();
  const url = new URL(request.url);
  const entity = url.searchParams.get("entity") === "leads" ? "leads" : "inquiries";
  const columns = entity === "leads" ? leadColumns : inquiryColumns;
  let query = entity === "leads"
    ? "customers?select=*&order=created_at.desc&limit=10000"
    : "inquiries?select=*,customers(customer_number)&order=created_at.desc&limit=10000";
  const site = url.searchParams.get("site");
  const stage = url.searchParams.get("stage");
  if (site === "cappuccinobag" || site === "novlane") query += `&site=eq.${site}`;
  if (["new","qualified","contacted","replied","quoted","sample","negotiation","won","lost"].includes(stage)) query += `&stage=eq.${stage}`;
  const rows = await supabaseRequest(applyOwnerScope(query, actor));
  const format = url.searchParams.get("format") || "csv";
  if (format === "xls") {
    const table = [
      `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${xml(column)}</Data></Cell>`).join("")}</Row>`,
      ...rows.map((row) => `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${xml(value(row, column))}</Data></Cell>`).join("")}</Row>`),
    ].join("");
    const body = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="CRM"><Table>${table}</Table></Worksheet></Workbook>`;
    return new Response(body, { headers: { "Content-Type": "application/vnd.ms-excel; charset=utf-8", "Content-Disposition": `attachment; filename="${entity}-export.xls"` } });
  }
  const body = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(value(row, column))).join(","))].join("\n");
  return new Response(`\uFEFF${body}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${entity}-export.csv"` } });
}
