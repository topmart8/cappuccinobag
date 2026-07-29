import { loadSeoDashboard } from "../../../../lib/seo/dashboard";
import SeoTable from "../SeoTable";

export default async function SeoInternalLinksPage() {
  const { links } = await loadSeoDashboard();
  const columns = [
    { key: "source_url", label: "Source" }, { key: "target_url", label: "Target" },
    { key: "anchor_text", label: "Anchor" }, { key: "relevance_score", label: "Relevance" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", render: (row) => <span className="crm-stage">{row.status}</span> },
  ];
  return <main className="crm-content"><div className="crm-heading"><div><h1>Internal-link suggestions</h1><p>Suggestions only. Links are never inserted automatically in phase one.</p></div></div><section className="crm-panel"><SeoTable columns={columns} rows={links} /></section></main>;
}
