import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { techGiftArticles, techGiftCollectionPath, techGiftProductPath, techGiftSiteUrl } from "./corporate-tech-gift-data";

const publishedDate = "2026-08-13";

export function getTechGiftArticleMetadata(slug) {
  const article = techGiftArticles[slug];
  if (!article) return {};
  const canonical = `${techGiftSiteUrl}/blog/${slug}`;
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: { canonical },
    openGraph: { title: article.title, description: article.description, type: "article", url: canonical, images: [{ url: `${techGiftSiteUrl}${article.image.src}`, width: 1254, height: 1254, alt: article.image.alt }] },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [`${techGiftSiteUrl}${article.image.src}`] },
    robots: { index: true, follow: true },
  };
}

export function TechGiftArticlePage({ slug }) {
  const article = techGiftArticles[slug];
  if (!article) notFound();
  const canonical = `${techGiftSiteUrl}/blog/${slug}`;
  const schema = {
    "@context": "https://schema.org", "@type": "Article", headline: article.title,
    description: article.description, image: `${techGiftSiteUrl}${article.image.src}`,
    mainEntityOfPage: canonical, datePublished: publishedDate, dateModified: publishedDate,
    author: { "@type": "Organization", name: "Cappuccino Bag Product Development Team", url: techGiftSiteUrl },
    publisher: { "@type": "Organization", name: "Cappuccino Bag", url: techGiftSiteUrl },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <SiteHeader />
    <main className="tech-gift-page tech-gift-article-page">
      <nav className="padel-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={techGiftCollectionPath}>Corporate &amp; Tech Gift Solutions</Link><span>/</span><span>{article.title}</span></nav>
      <article>
        <header className="tech-gift-article-hero"><div><h1>{article.title}</h1><p>{article.intro}</p><p className="tech-gift-byline">By Cappuccino Bag Product Development Team · Reviewed August 13, 2026</p></div><Image src={article.image.src} alt={article.image.alt} width={1254} height={1254} sizes="(max-width: 900px) calc(100vw - 28px), 45vw" priority /></header>
        <div className="tech-gift-article-body">
          {article.sections.map(([heading, paragraphs]) => <section key={heading}><h2>{heading}</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
          <section><h2>Quick answer</h2><h3>{article.faq[0]}</h3><p>{article.faq[1]}</p></section>
          <aside className="tech-gift-compliance"><strong>Compliance note:</strong> Electronics documentation and destination requirements depend on the exact selected model and market. No certification is claimed until verified for the project.</aside>
          <aside className="tech-gift-article-cta"><h2>Build a coordinated corporate gift set</h2><p>Review the product configuration, then send your target market, quantity and branding requirements.</p><div><Link className="btn btn-primary" href={techGiftProductPath}>View the 3-in-1 set</Link><Link className="btn btn-secondary" href="/oem-odm-bag-manufacturer">Review OEM / ODM</Link><Link className="btn btn-secondary" href="/inquiry?product=Corporate%20Tech%20Gift%20Set">Request OEM Quote</Link></div></aside>
        </div>
      </article>
    </main>
    <SiteFooter />
  </>;
}
