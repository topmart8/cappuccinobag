import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLd, Link, RunningActions, RunningBreadcrumb, RunningShell } from "./running-components";
import { runningArticleMap, runningArticles } from "./running-articles";
import { runningProductMap, runningSiteUrl } from "./running-data";

export function getRunningArticleStaticParams() {
  return runningArticles.map((article) => ({ slug: article.slug }));
}

export async function getRunningArticleMetadata({ params }) {
  const { slug } = await params;
  const article = runningArticleMap[slug];
  if (!article) return {};
  const canonical = `${runningSiteUrl}/running-guides/${article.slug}/`;
  return {
    title: `${article.title} | Cappuccino Bag`,
    description: article.description,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonical,
      type: "article",
      publishedTime: "2026-07-27T00:00:00+08:00",
      modifiedTime: "2026-07-27T00:00:00+08:00",
      authors: ["Cappuccino Bag Product Development Team"],
      images: [{ url: `${runningSiteUrl}/images/running/guide-cover.webp`, width: 1600, height: 900, alt: "Running belt OEM buyer guide cover" }],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: ["/images/running/guide-cover.webp"] },
    robots: { index: true, follow: true },
  };
}

export async function RunningArticlePage({ params }) {
  const { slug } = await params;
  const article = runningArticleMap[slug];
  if (!article) notFound();
  const canonical = `${runningSiteUrl}/running-guides/${article.slug}/`;
  const related = article.relatedSkus.map((sku) =>
    Object.values(runningProductMap).find((product) => product.sku === sku),
  ).filter(Boolean);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: [`${runningSiteUrl}/images/running/guide-cover.webp`],
    datePublished: "2026-07-27",
    dateModified: "2026-07-27",
    author: { "@type": "Organization", name: "Cappuccino Bag Product Development Team", url: runningSiteUrl },
    publisher: { "@type": "Organization", name: "Cappuccino Bag", url: runningSiteUrl },
    mainEntityOfPage: canonical,
  };

  return (
    <>
      <JsonLd value={schema} />
      <RunningShell>
        <main className="running-page running-article-page">
          <RunningBreadcrumb items={[
            { name: "Running Guides", href: "/running-guides/" },
            { name: article.title },
          ]} />
          <article>
            <header className="running-article-hero">
              <div>
                <p className="eyebrow">Running belt buyer guide</p>
                <h1>{article.title}</h1>
                <p className="running-lead">{article.description}</p>
                <p className="running-byline">By Cappuccino Bag Product Development Team · Updated July 27, 2026</p>
                <RunningActions format={article.title} />
              </div>
              <Image src="/images/running/guide-cover.webp" width={1600} height={900} sizes="(max-width: 900px) calc(100vw - 36px), 45vw" alt="Running belt OEM buyer guide cover with concept and sampling workflow" priority />
            </header>
            <div className="running-article-layout">
              <nav aria-label="Article contents">
                <strong>In this guide</strong>
                {article.sections.map(([heading], index) => <a key={heading} href={`#section-${index + 1}`}>{heading}</a>)}
              </nav>
              <div className="running-article-body">
                {article.sections.map(([heading, paragraphs], index) => (
                  <section id={`section-${index + 1}`} key={heading}>
                    <h2>{heading}</h2>
                    {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </section>
                ))}
                <aside className="running-article-cta">
                  <h2>Turn the guide into a factory-ready brief</h2>
                  <p>Share the use case, target waist range, carried items, materials, logo, packaging, quantity, destination market and test expectations.</p>
                  <RunningActions format={article.title} />
                </aside>
              </div>
            </div>
          </article>
          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Related products</p><h2>Apply the buying criteria to these concepts</h2></div><Link className="running-text-link" href="/running-waist-packs/">View all 30 SKU</Link></div>
            <div className="running-product-grid">{related.map((product) => (
              <article className="running-product-card" key={product.sku}>
                <Image src={product.image} width={1200} height={900} sizes="(max-width: 700px) calc(100vw - 28px), 24vw" alt={product.imageAlt} />
                <div><p className="eyebrow">{product.sku}</p><h3><Link href={product.href}>{product.name}</Link></h3><Link className="running-text-link" href={product.href}>View development page</Link></div>
              </article>
            ))}</div>
          </section>
        </main>
      </RunningShell>
    </>
  );
}
