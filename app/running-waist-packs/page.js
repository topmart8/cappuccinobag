import Image from "next/image";
import {
  JsonLd,
  ProductCard,
  ReferenceProof,
  RunningActions,
  RunningBreadcrumb,
  RunningNavCards,
  RunningShell,
} from "../running-components";
import {
  featuredRunningSkus,
  runningFaqs,
  runningProducts,
  runningSiteUrl,
} from "../running-data";

const canonical = `${runningSiteUrl}/running-waist-packs/`;

export const metadata = {
  title: "Custom Running Waist Pack Manufacturer | 30 OEM/ODM Concepts",
  description: "Explore Cappuccino Running Collection 2026: 30 custom running waist pack, hydration belt, trail belt, race belt and phone belt OEM/ODM development directions.",
  alternates: { canonical },
  openGraph: {
    title: "Cappuccino Running Collection 2026 — 30 SKU",
    description: "Thirty clearly labeled OEM/ODM running belt development directions for brands, sports retailers, clubs and race programs.",
    url: canonical,
    type: "website",
    images: [{ url: `${runningSiteUrl}/images/running/collection-concept.webp`, width: 1600, height: 900, alt: "Cappuccino Running Collection 2026 concept overview" }],
  },
  twitter: { card: "summary_large_image", title: "Cappuccino Running Collection 2026 — 30 SKU", description: "Custom running waist pack and hydration belt OEM/ODM development.", images: ["/images/running/collection-concept.webp"] },
  robots: { index: true, follow: true },
};

export default function RunningWaistPacksPage() {
  const featured = runningProducts.filter((product) => featuredRunningSkus.has(product.sku));
  const remaining = runningProducts.filter((product) => !featuredRunningSkus.has(product.sku));
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${runningSiteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Running Waist Packs", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Cappuccino Running Collection 2026",
      numberOfItems: runningProducts.length,
      itemListElement: runningProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${runningSiteUrl}${product.href}`,
        name: `${product.sku} ${product.name}`,
      })),
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
          <RunningBreadcrumb items={[{ name: "Running Waist Packs" }]} />
          <section className="running-collection-hero">
            <div>
              <p className="eyebrow">Cappuccino Running Collection 2026 · 30 SKU</p>
              <h1>Custom Running Waist Pack Manufacturer</h1>
              <p className="running-lead">A complete B2B development range spanning anti-bounce phone belts, hydration systems, trail carry, marathon race belts, club programs, recycled-material options and all-weather directions.</p>
              <p>Cappuccino Bag supports running brands, sports retailers, clubs, event programs and private-label buyers from concept and tech pack through sampling, QC, packing and export communication.</p>
              <RunningActions format="Cappuccino Running Collection 2026" />
            </div>
            <figure>
              <Image src="/images/running/collection-concept.webp" width={1600} height={900} sizes="(max-width: 900px) calc(100vw - 36px), 48vw" alt="Cappuccino Running Collection 2026 concept overview, clearly labeled as development directions" priority />
              <figcaption>Collection concept / development overview — not 30 finished-product photographs</figcaption>
            </figure>
          </section>

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Collection architecture</p><h2>Find the right running belt program</h2></div><p>Browse by hydration, trail, marathon, phone storage or the full OEM/ODM process.</p></div>
            <RunningNavCards />
          </section>

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Priority launch · 15 SKU</p><h2>Commercial focus products</h2></div><p>Selected for phone storage, hydration, marathon, trail, inclusive fit, night visibility, team customization, recycled options, weather protection and modular ODM development.</p></div>
            <div className="running-product-grid">{featured.map((product, index) => <ProductCard product={product} priority={index < 3} key={product.sku} />)}</div>
          </section>

          <ReferenceProof />

          <section className="running-section running-remaining">
            <div className="running-heading"><div><p className="eyebrow">Complete collection · 15 additional SKU</p><h2>More development options</h2></div><p>These products remain fully published and ready for buyer briefs while SKU-specific photography is still pending.</p></div>
            <div className="running-product-grid">{remaining.map((product) => <ProductCard product={product} key={product.sku} />)}</div>
          </section>

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Buyer questions</p><h2>Custom running waist pack FAQ</h2></div><p>Visible answers align with the page’s FAQPage structured data.</p></div>
            <div className="running-faq">{runningFaqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
          </section>

          <section className="running-rfq">
            <div><p className="eyebrow">Start a 2026 running program</p><h2>Send your brief for sample review</h2><p>Upload a sketch, tech pack or reference and share target quantity, market, carried items, materials, logo, packaging and timing. Email <a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a>.</p></div>
            <RunningActions format="Cappuccino Running Collection 2026" />
          </section>
        </main>
      </RunningShell>
    </>
  );
}
