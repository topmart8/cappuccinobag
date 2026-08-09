import { loadSeoDashboard } from "../../../../lib/seo/dashboard";
import SeoTable from "../SeoTable";

export default async function SeoPublishingPage() {
  const { publishing } = await loadSeoDashboard();
  const columns = [
    { key: "run_type", label: "Run" }, { key: "branch_name", label: "Branch" },
    { key: "commit_sha", label: "Commit" }, { key: "pull_request_url", label: "Pull request" },
    { key: "preview_url", label: "Preview" }, { key: "build_status", label: "Build" },
    { key: "approval_status", label: "Approval" },
  ];
  return <main className="crm-content"><div className="crm-heading"><div><h1>Publishing runs</h1><p>Tracks branch, PR, Vercel Preview and validation. Main merge remains human-only.</p></div><span className="seo-safety">auto merge: off</span></div><section className="crm-panel"><SeoTable columns={columns} rows={publishing} empty="No publishing run has been created." /></section></main>;
}
