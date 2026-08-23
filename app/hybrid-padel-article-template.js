import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { hybridCollection, hybridSiteUrl, imageApprovalDisclaimer } from "./hybrid-padel-data";
import { hybridPadelArticles } from "./hybrid-padel-articles";

const reviewedDate = "2026-08-02";

export function getHybridArticleMetadata(slug) {
  const article = hybridPadelArticles[slug];
  if (!article) return {};
  const canonical = `${hybridSiteUrl}/blog/${slug}`;
  return {
    title: `${article.title} | Cappuccino Bag`,
    description: article.description,
    alternates: { canonical },
    openGraph: { title: article.title, description: article.description, type: "article", url: canonical, images: [{ url: `${hybridSiteUrl}${article.image}`, width: 1250, height: 1250, alt: article.imageAlt }] },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [`${hybridSiteUrl}${article.image}`] },
    robots: { index: true, follow: true },
  };
}
export function HybridPadelArticle({ slug }) {
  const article = hybridPadelArticles[slug];
  if (!article) notFound();
  const canonical = `${hybridSiteUrl}/blog/${slug}`;
  const schemas = [
    { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, image: `${hybridSiteUrl}${article.image}`, mainEntityOfPage: canonical, datePublished: reviewedDate, dateModified: reviewedDate, author: { "@type": "Organization", name: "Cappuccino Bag Product Development Team", url: hybridSiteUrl }, publisher: { "@type": "Organization", name: "Cappuccino Bag", url: hybridSiteUrl } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${hybridSiteUrl}/` }, { "@type": "ListItem", position: 2, name: hybridCollection.name, item: `${hybridSiteUrl}${hybridCollection.href}` }, { "@type": "ListItem", position: 3, name: article.title, item: canonical }] },
  ];
  return (
    <>
      {schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <SiteHeader />
      <main className="hybrid-page hybrid-article-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href={hybridCollection.href}>Hybrid Lifestyle Series</Link><span aria-hidden="true">/</span><span>{article.title}</span></nav>
        <article>
          <header className="hybrid-article-hero"><div><p className="eyebrow">Cappuccino Padel buyer guide</p><h1>{article.title}</h1><p>{article.intro}</p><p className="hybrid-byline">By Cappuccino Bag Product Development Team · Reviewed August 2, 2026</p></div><Image src={article.image} width={1250} height={1250} sizes="(max-width: 900px) calc(100vw - 28px), 45vw" alt={article.imageAlt} priority /></header>
          <div className="hybrid-article-body">{article.sections.map(([heading, paragraphs]) => <section key={heading}><h2>{heading}</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}{article.relatedLinks?.length ? <nav className="hybrid-article-links" aria-label="Related Padel buyer resources"><h2>Continue the Padel material review</h2>{article.relatedLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav> : null}<aside className="hybrid-disclaimer">{imageApprovalDisclaimer}</aside><aside className="hybrid-article-cta"><h2>Explore the complete Cappuccino hybrid series</h2><p>Compare PDB014–PDB017, then send your target model, quantity direction, material, logo and market for an OEM/ODM review.</p><div><Link className="btn btn-primary" href={hybridCollection.href}>View collection</Link><Link className="btn btn-secondary" href="/inquiry?product=Padel%20Bags&format=Hybrid%20Lifestyle%20Series%202026">Request an RFQ</Link></div></aside></div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
