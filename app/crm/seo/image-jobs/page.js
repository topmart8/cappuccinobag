import { loadSeoDashboard } from "../../../../lib/seo/dashboard";
import SeoTable from "../SeoTable";

export default async function SeoImageJobsPage() {
  const { images } = await loadSeoDashboard();
  const columns = [
    { key: "sku", label: "SKU" }, { key: "image_type", label: "Type" },
    { key: "output_filename", label: "Filename" }, { key: "aspect_ratio", label: "Ratio" },
    { key: "alt_text", label: "Alt text" },
    { key: "status", label: "Status", render: (row) => <span className="crm-stage">{row.status}</span> },
  ];
  return <main className="crm-content"><div className="crm-heading"><div><h1>Image task center</h1><p>Real product images take priority; concept images require disclosure and human approval.</p></div></div><section className="crm-panel"><SeoTable columns={columns} rows={images} /></section></main>;
}
