import Image from "next/image";
import { notFound } from "next/navigation";
import {
  JsonLd,
  ProductCard,
  ReferenceProof,
  RunningActions,
  RunningBreadcrumb,
  RunningNavCards,
  RunningShell,
} from "./running-components";
import {
  getProductsForCollection,
  runningCollections,
  runningFaqs,
  runningSiteUrl,
} from "./running-data";

const developmentCapabilities = [
  ["Concept to pattern", "Translate a sketch, reference or tech pack into a pattern and bill-of-material direction for review."],
  ["Anti-bounce fit review", "Check loaded movement, waist-range fit, elastic recovery, pocket access and pressure distribution against an agreed sample plan."],
  ["Hydration compatibility", "Develop retention and access around buyer-supplied soft flasks or bottles, including filled-load balance checks."],
  ["Material options", "Review stretch textiles, ripstop, power mesh, spacer mesh, coated fabrics and recycled-material sources against the brief."],
  ["Weather direction", "Discuss coated materials, waterproof zipper options and seam-taped compartments without overstating a finished product’s protection."],
  ["Custom trims", "Develop elastic, buckles, zipper pullers, reflective details, logo methods, labels and retail packaging."],
  ["Sample revisions", "Record comments and revise agreed construction, fit, materials, graphics and packing details before approval."],
  ["QC and export", "Use incoming, first-piece, in-line, final-function, logo, packing and carton-mark checks with export communication."],
];

export function getRunningCollectionStaticParams() {
  return Object.keys(runningCollections).map((category) => ({ category }));
}

export async function getRunningCollectionMetadata({ params }) {
  const { category } = await params;
  const collection = runningCollections[category];
  if (!collection) return {};
  const canonical = `${runningSiteUrl}/running/${category}`;
  const title = `${collection.h1} | Cappuccino Bag`;
  return {
    title,
    description: collection.description,
    alternates: { canonical },
    openGraph: {
      title,
      description: collection.description,
      url: canonical,
      type: "website",
      images: [{ url: `${runningSiteUrl}/images/running/collection-concept.webp`, width: 1600, height: 900, alt: "Cappuccino Running Collection 2026 concept development overview" }],
    },
    twitter: { card: "summary_large_image", title, description: collection.description, images: ["/images/running/collection-concept.webp"] },
    robots: { index: true, follow: true },
  };
}

export async function RunningCollectionPage({ params }) {
  const { category } = await params;
  const collection = runningCollections[category];
  if (!collection) notFound();
  const products = getProductsForCollection(category);
  const canonical = `${runningSiteUrl}/running/${category}`;
  const isOem = category === "custom-oem-odm";
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${runningSiteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Running Waist Packs", item: `${runningSiteUrl}/running-waist-packs` },
        { "@type": "ListItem", position: 3, name: collection.name, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: runningFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <>
      {schemas.map((schema) => <JsonLd key={schema["@type"]} value={schema} />)}
      <RunningShell>
        <main className="running-page">
          <RunningBreadcrumb items={[
            { name: "Running Waist Packs", href: "/running-waist-packs" },
            { name: collection.name },
          ]} />
          <section className="running-collection-hero">
            <div>
              <p className="eyebrow">{collection.eyebrow}</p>
              <h1>{collection.h1}</h1>
              <p className="running-lead">{collection.description}</p>
              <p>China-based OEM/ODM bag manufacturing support for running brands, sports retailers, clubs, race organizers and private-label buyers. Search focus: {collection.keyword}.</p>
              <RunningActions format={collection.name} />
            </div>
            <figure>
              <Image src="/images/running/collection-concept.webp" width={1600} height={900} sizes="(max-width: 900px) calc(100vw - 36px), 48vw" alt="Cappuccino Running Collection 2026 concept development overview, not finished-product inventory" priority />
              <figcaption>Collection concept / development overview</figcaption>
            </figure>
          </section>

          {isOem && <ReferenceProof />}

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">{products.length} development directions</p><h2>{isOem ? "Priority concepts for custom development" : `Explore ${collection.name.toLowerCase()}`}</h2></div><p>Every card is clearly identified as a concept / development option until SKU-specific photography and an approved specification are available.</p></div>
            <div className="running-product-grid">{products.map((product, index) => <ProductCard product={product} priority={index < 2} key={product.sku} />)}</div>
          </section>

          <section className="running-section running-dark">
            <div className="running-heading"><div><p className="eyebrow">OEM / ODM differentiation</p><h2>Development decisions buyers can verify</h2></div><p>Scope, test method and acceptance criteria are agreed per project; no certification, waterproof rating or fixed performance result is invented.</p></div>
            <div className="running-capability-grid">{developmentCapabilities.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
          </section>

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Buyer questions</p><h2>{collection.name} FAQ</h2></div><p>Answers covering customization, materials, sampling, buyers, test planning and tech-pack submission.</p></div>
            <div className="running-faq">{runningFaqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
          </section>

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Explore the range</p><h2>Running collection paths</h2></div><p>Move between the full 30-SKU range, focused collections, OEM development and buyer guides.</p></div>
            <RunningNavCards />
          </section>

          <section className="running-rfq">
            <div><p className="eyebrow">Submit a tech pack</p><h2>Request a sample and factory review</h2><p>Send target quantity, use case, materials, carried items, waist range, artwork, packaging, destination market and timing to <a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a>.</p></div>
            <RunningActions format={collection.name} />
          </section>
        </main>
      </RunningShell>
    </>
  );
}
