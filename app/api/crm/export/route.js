import { supabaseRequest } from "../../../../lib/crm/supabase";

const columns = [
  "inquiry_number", "site", "brand", "source_channel", "name", "company", "email", "phone", "whatsapp",
  "country", "language", "product", "product_category", "quantity", "material", "logo_method", "target_price",
  "target_delivery_date", "message", "uploaded_files", "lead_score", "intent", "risk_level", "assigned_owner",
  "stage", "next_follow_up", "human_takeover", "auto_reply_enabled", "first_landing_page", "current_page_url",
  "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "msclkid",
  "first_visit_time", "submit_time", "device", "attribution_country", "ai_customer_summary",
  "ai_recommended_action", "ai_reply_draft", "reply_status", "created_at", "updated_at",
];

function value(row, column) {
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
  const rows = await supabaseRequest("inquiries?select=*&order=created_at.desc&limit=10000");
  const format = new URL(request.url).searchParams.get("format") || "csv";
  if (format === "xls") {
    const table = [
      `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${xml(column)}</Data></Cell>`).join("")}</Row>`,
      ...rows.map((row) => `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${xml(value(row, column))}</Data></Cell>`).join("")}</Row>`),
    ].join("");
    const body = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="CRM"><Table>${table}</Table></Worksheet></Workbook>`;
    return new Response(body, { headers: { "Content-Type": "application/vnd.ms-excel; charset=utf-8", "Content-Disposition": 'attachment; filename="unified-crm.xls"' } });
  }
  const body = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(value(row, column))).join(","))].join("\n");
  return new Response(`\uFEFF${body}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="unified-crm.csv"' } });
}

