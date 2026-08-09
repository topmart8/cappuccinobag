import SeoKeywordImport from "../../../../components/SeoKeywordImport";
import { loadSeoDashboard } from "../../../../lib/seo/dashboard";
import SeoTable from "../SeoTable";

export default async function SeoKeywordsPage() {
  const { keywords } = await loadSeoDashboard();
  const columns = [
    { key: "keyword", label: "Keyword" },
    { key: "opportunity_score", label: "Score" },
    { key: "search_intent", label: "Intent" },
    { key: "buyer_stage", label: "Buyer stage" },
    { key: "target_category", label: "Category" },
    { key: "target_page_type", label: "Page type" },
    { key: "target_url", label: "Target URL" },
    { key: "status", label: "Status", render: (row) => <span className="crm-stage">{row.status}</span> },
  ];
  return <main className="crm-content">
    <div className="crm-heading"><div><h1>Keyword management</h1><p>Manual, pasted and CSV inputs are normalized, deduplicated, classified and scored.</p></div></div>
    <section className="crm-panel seo-import-panel"><h2>Import keywords</h2><SeoKeywordImport /></section>
    <section className="crm-panel"><SeoTable columns={columns} rows={keywords} /></section>
  </main>;
}
