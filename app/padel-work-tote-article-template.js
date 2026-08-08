import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { PadelFooter, PadelHeader } from "./padel-components";
import { padelWorkToteArticles } from "./padel-work-tote-articles";

const siteUrl = "https://www.cappuccinobag.com";
const reviewedDate = "2026-08-02";

function Link(props) {
  return <NextLink {...props} prefetch={false} />;
}

export function getPadelArticleMetadata(slug) {
  const article = padelWorkToteArticles[slug];
  if (!article) return {};
  const canonical = `${siteUrl}/blog/${slug}`;
  return {
    title: `${article.title} | Cappuccino Bag`,
    description: article.description,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: canonical,
      images: [{ url: `${siteUrl}${article.image}`, width: 1400, height: 1400, alt: article.imageAlt }],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [`${siteUrl}${article.image}`] },
    robots: { index: true, follow: true },
  };
}

export function PadelWorkToteArticle({ slug }) {
  const article = padelWorkToteArticles[slug];
  if (!article) notFound();
  const canonical = `${siteUrl}/blog/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: `${siteUrl}${article.image}`,
    mainEntityOfPage: canonical,
    datePublished: reviewedDate,
    dateModified: reviewedDate,
    author: { "@type": "Organization", name: "Cappuccino Bag Product Development Team", url: siteUrl },
    publisher: { "@type": "Organization", name: "Cappuccino Bag", url: siteUrl },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${siteUrl}/resources` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PadelHeader />
      <main className="pdb001-article-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/resources">Resources</Link><span aria-hidden="true">/</span><span>{article.title}</span></nav>
        <article>
          <header className="pdb001-article-hero">
            <div><p className="eyebrow">Padel buyer guide</p><h1>{article.title}</h1><p>{article.intro}</p><p className="pdb001-article-byline">By Cappuccino Bag Product Development Team · Last reviewed August 2, 2026</p></div>
            <Image src={article.image} width={1400} height={1400} sizes="(max-width: 900px) calc(100vw - 28px), 48vw" alt={article.imageAlt} priority />
          </header>
          <div className="pdb001-article-body">
            {article.sections.map(([heading, paragraphs]) => <section key={heading}><h2>{heading}</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
            <aside className="pdb001-article-cta"><h2>Develop an office-to-court padel bag</h2><p>Review the PDB001 product direction or send your target quantity, market, material, colour, laptop size, racket type and logo brief for an OEM/ODM review.</p><div><Link className="btn btn-primary" href="/products/padel-work-tote-backpack-pdb001">View PDB001</Link><Link className="btn btn-secondary" href="/inquiry?product=Padel%20Bags&format=PDB001%20Padel%20Work%20Tote%20Backpack">Request a custom sample</Link></div></aside>
          </div>
        </article>
      </main>
      <PadelFooter />
    </>
  );
}
