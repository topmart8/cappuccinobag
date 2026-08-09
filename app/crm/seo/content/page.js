import SeoTaskActions from "../../../../components/SeoTaskActions";
import { loadSeoDashboard } from "../../../../lib/seo/dashboard";
import SeoTable from "../SeoTable";

export default async function SeoContentPage() {
  const { content } = await loadSeoDashboard();
  const columns = [
    { key: "title", label: "Task" },
    { key: "primary_keyword", label: "Keyword" },
    { key: "target_page_type", label: "Page type" },
    { key: "target_url", label: "Target URL" },
    { key: "review_score", label: "Review score" },
    { key: "review_status", label: "Status", render: (row) => <span className="crm-stage">{row.review_status}</span> },
    { key: "actions", label: "Human action", render: (row) => <SeoTaskActions id={row.id} /> },
  ];
  return <main className="crm-content"><div className="crm-heading"><div><h1>Content review</h1><p>Briefs, drafts and seven-layer review results remain unpublished.</p></div></div><section className="crm-panel"><SeoTable columns={columns} rows={content} /></section></main>;
}
