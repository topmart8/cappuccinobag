import Link from "next/link";
import { loadSeoDashboard } from "../../../lib/seo/dashboard";

export default async function SeoDashboardPage() {
  const data = await loadSeoDashboard();
  const metrics = [
    ["Keywords", data.keywords.length],
    ["High priority", data.keywords.filter((row) => row.opportunity_score >= 80).length],
    ["Content review", data.content.filter((row) => row.review_status === "manual_review").length],
    ["Link review", data.links.filter((row) => row.status === "manual_review").length],
    ["Image review", data.images.filter((row) => row.status === "manual_review").length],
    ["PR records", data.publishing.filter((row) => row.pull_request_url).length],
    ["Broken links", data.reports.broken.length],
    ["Orphan pages", data.reports.orphans.length],
    ["SEO issues", data.reports.priority.length],
    ["Content decay", data.analytics.filter((row) => row.content_decay_score >= 50).length],
  ];
  return <main className="crm-content">
    <div className="crm-heading"><div><h1>Cappuccino SEO automation</h1><p>Draft-only operations for keywords, content, links, images and publishing checks.</p></div><span className="seo-safety">draft_only · no auto publish</span></div>
    {!data.configured ? <div className="crm-alert demo">Showing locally generated draft fixtures. Supabase is not configured in this environment.</div> : null}
    <section className="crm-metrics seo-metrics">
      {metrics.map(([label, value]) => <div className="crm-metric" key={label}><small>{label}</small><strong>{value}</strong></div>)}
    </section>
    <div className="crm-grid">
      <section className="crm-panel">
        <div className="crm-panel-header"><div><h2>Review queue</h2><p>Nothing here can publish without human approval and a separate PR merge.</p></div></div>
        <div className="seo-workflow">
          {[
            ["1", "Keyword review", "/crm/seo/keywords"],
            ["2", "Brief & content review", "/crm/seo/content"],
            ["3", "Internal-link review", "/crm/seo/internal-links"],
            ["4", "Image-task review", "/crm/seo/image-jobs"],
            ["5", "PR & Preview checks", "/crm/seo/publishing"],
          ].map(([step, label, href]) => <Link href={href} key={href}><span>{step}</span><strong>{label}</strong></Link>)}
        </div>
      </section>
      <aside className="crm-panel"><h2>Safety gates</h2><ul className="crm-onboarding">
        <li><strong>Main protected</strong><span>No workflow merges or pushes to main.</span></li>
        <li><strong>Claims protected</strong><span>MOQ, prices, lead times and certifications require review.</span></li>
        <li><strong>Email locked</strong><span>info@cappuccinobag.net</span></li>
      </ul></aside>
    </div>
  </main>;
}
