const headers = [
  "company", "name", "country", "industry", "website", "email", "phone", "whatsapp",
  "facebook_url", "instagram_url", "linkedin_url", "product_keywords", "source_url",
  "stage", "tags", "notes", "next_follow_up",
];

export function GET() {
  const example = [
    "示例公司（导入前请删除）", "Buyer Name", "United States", "Sporting Goods",
    "https://example.invalid", "buyer@example.invalid", "", "+10000000000", "", "", "",
    "padel bag;outdoor backpack", "https://example.invalid/public-profile", "new",
    "demo;delete-me", "这是模板示例，不是真实客户", "2026-08-15T09:00:00Z",
  ];
  const cell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const body = `\uFEFF${headers.join(",")}\n${example.map(cell).join(",")}\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lead-crm-import-template.csv"',
    },
  });
}
