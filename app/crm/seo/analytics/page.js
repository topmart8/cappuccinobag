import { loadSeoDashboard } from "../../../../lib/seo/dashboard";
import SeoTable from "../SeoTable";

export default async function SeoAnalyticsPage() {
  const { analytics } = await loadSeoDashboard();
  const columns = [
    { key: "url", label: "URL" }, { key: "date", label: "Date" },
    { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" },
    { key: "ctr", label: "CTR" }, { key: "average_position", label: "Position" },
    { key: "content_decay_score", label: "Decay score" },
  ];
  return <main className="crm-content"><div className="crm-heading"><div><h1>Search performance</h1><p>Import GSC rows through the protected API; low-performing pages generate suggestions, never direct edits.</p></div></div><section className="crm-panel"><SeoTable columns={columns} rows={analytics} empty="No Search Console data imported." /></section></main>;
}
