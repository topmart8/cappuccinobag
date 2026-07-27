import { Link, RunningBreadcrumb, RunningShell } from "../running-components";
import { runningArticles } from "../running-articles";
import { runningSiteUrl } from "../running-data";

export const metadata = {
  title: "Running Belt OEM Buyer Guides | Cappuccino Bag",
  description: "Procurement guides for private-label running belts, hydration carry, anti-bounce materials, trail OEM programs, marathon customization and recycled sourcing.",
  alternates: { canonical: `${runningSiteUrl}/running-guides/` },
};

export default function RunningGuidesPage() {
  return (
    <RunningShell>
      <main className="running-page">
        <RunningBreadcrumb items={[{ name: "Running Guides" }]} />
        <section className="running-simple-hero">
          <p className="eyebrow">Buyer resources</p>
          <h1>Running Belt OEM Development Guides</h1>
          <p className="running-lead">Six practical guides for product managers, buyers, running clubs, race programs and private-label teams.</p>
        </section>
        <section className="running-section">
          <div className="running-guide-grid">
            {runningArticles.map((article, index) => (
              <article key={article.slug}>
                <p className="eyebrow">Guide {String(index + 1).padStart(2, "0")}</p>
                <h2><Link href={`/running-guides/${article.slug}/`}>{article.title}</Link></h2>
                <p>{article.description}</p>
                <Link className="running-text-link" href={`/running-guides/${article.slug}/`}>Read buyer guide</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </RunningShell>
  );
}
