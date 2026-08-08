import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import {
  getHybridProductHref,
  hybridCollection,
  hybridProductEntries,
  hybridSiteUrl,
  imageApprovalDisclaimer,
  materialOptions,
  sharedFaqs,
} from "../../hybrid-padel-data";

export const metadata = {
  title: hybridCollection.title,
  description: hybridCollection.description,
  alternates: { canonical: `${hybridSiteUrl}${hybridCollection.href}` },
  openGraph: {
    title: hybridCollection.title,
    description: hybridCollection.description,
    url: `${hybridSiteUrl}${hybridCollection.href}`,
    type: "website",
    images: [{ url: `${hybridSiteUrl}${hybridProductEntries[0].images[0].src}`, width: 1250, height: 1250, alt: hybridProductEntries[0].images[0].alt }],
  },
  twitter: { card: "summary_large_image", title: hybridCollection.title, description: hybridCollection.description, images: [`${hybridSiteUrl}${hybridProductEntries[0].images[0].src}`] },
  robots: { index: true, follow: true },
};

const collectionFaqs = [
  { question: "What is a work-to-court padel bag?", answer: "A work-to-court padel bag combines racket storage with everyday organization such as a padded laptop sleeve, small-item pockets and a silhouette suitable for commuting before an evening match." },
  { question: "Which model is suitable for women’s lifestyle collections?", answer: "PDB014 is the most lifestyle-led women’s tote, while PDB015 adds more commuter and travel organization for urban work-to-court use." },
  { question: "Which model is suitable for weekend travel?", answer: "PDB016 offers the roomiest carryall direction for match weekends and short trips. PDB017 is the backpack option for buyers prioritizing hands-free travel and separate shoe or accessory storage." },
  { question: "What is the difference between a padel tote and a traditional racket bag?", answer: "A hybrid padel tote balances racket protection with laptop and daily-item organization. A traditional racket bag generally prioritizes sports equipment capacity and match-only storage." },
  ...sharedFaqs,
];

export default function HybridLifestyleCollectionPage() {
  const canonical = `${hybridSiteUrl}${hybridCollection.href}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${hybridSiteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Padel Bags", item: `${hybridSiteUrl}/custom-padel-bag-manufacturer` },
        { "@type": "ListItem", position: 3, name: hybridCollection.name, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: hybridCollection.name,
      headline: hybridCollection.h1,
      description: hybridCollection.description,
      url: canonical,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: hybridProductEntries.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: `${product.model} ${product.name}`, url: `${hybridSiteUrl}${getHybridProductHref(product.slug)}` })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: collectionFaqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
    },
  ];

  return (
    <>
      {schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <SiteHeader />
      <main className="hybrid-page hybrid-collection-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/custom-padel-bag-manufacturer">Padel Bags</Link><span aria-hidden="true">/</span><span>Hybrid Lifestyle Series 2026</span></nav>
        <header className="hybrid-collection-hero">
          <p className="eyebrow">Cappuccino Padel · 2026 Collection</p>
          <h1>{hybridCollection.h1}</h1>
          <p className="hybrid-slogan">{hybridCollection.slogan}</p>
          <p>Four Cappuccino-branded OEM/ODM directions connect laptop protection, dedicated racket storage and lightweight travel organization for buyers serving modern padel routines.</p>
          <div className="hero-actions"><a className="btn btn-primary" href="#hybrid-models">Explore four models</a><Link className="btn btn-secondary dark" href="/inquiry?product=Padel%20Bags&format=Hybrid%20Lifestyle%20Series%202026">Request collection RFQ</Link></div>
        </header>

        <aside className="hybrid-disclaimer">{imageApprovalDisclaimer}</aside>

        <section className="hybrid-section" id="hybrid-models">
          <div className="hybrid-section-heading"><p className="eyebrow">Four-model collection</p><h2>Tote, commuter, carryall and backpack formats</h2><p>Each format addresses a different daily rhythm without relying on fabricated price, stock, MOQ or sales claims.</p></div>
          <div className="hybrid-collection-grid">{hybridProductEntries.map((product) => <article key={product.model}><Image src={product.images[0].src} width={1250} height={1250} sizes="(max-width: 700px) calc(100vw - 28px), 50vw" alt={product.images[0].alt} /><div><p className="eyebrow">{product.model}</p><h2>{product.name}</h2><p>{product.shortDescription}</p><Link href={getHybridProductHref(product.slug)}>View {product.model} product page</Link></div></article>)}</div>
        </section>

        <section className="hybrid-answer-grid hybrid-collection-answers">
          <article><h2>What is a work-to-court padel bag?</h2><p>A hybrid bag that organizes a laptop and daily essentials alongside a protected padel racket compartment for commuting and after-work play.</p></article>
          <article><h2>Which model fits weekend travel?</h2><p>PDB016 is the larger carryall direction; PDB017 adds hands-free backpack carry and a separate shoe or accessory pocket.</p></article>
          <article><h2>Can recycled fabrics be selected?</h2><p>Yes, subject to sourcing and approval. Certification claims are used only when the exact material and documentation qualify.</p></article>
          <article><h2>Can logo, pockets and colors change?</h2><p>Yes. OEM/ODM development can adapt the color, material, pocket map, laptop fit, racket capacity, trim and branding.</p></article>
        </section>

        <section className="hybrid-section hybrid-story-section">
          <div><p className="eyebrow">Collection story</p><h2>From desk to court</h2></div>
          <div><p>Modern padel users do not always want a large traditional racket bag. Many need a lighter, cleaner design that carries a laptop in the morning, daily essentials through the workday and a racket for an evening match.</p><p>The Cappuccino Padel Hybrid Lifestyle Series 2026 brings together a women’s lifestyle tote, an urban commuter model, a weekend carryall and a travel-ready utility backpack. The collection gives brands, club stores and retailers a path beyond conventional match-only equipment bags.</p><Link href="/blog/from-desk-to-court-cappuccino-padel-collection">Read the full collection story</Link></div>
        </section>

        <section className="hybrid-dark-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Work · commute · club · weekend · travel</p><h2>Why hybrid organization matters</h2><p>Dedicated zones reduce daily repacking and keep work devices away from rackets, bottles, footwear and loose accessories.</p></div>
          <div className="hybrid-scenario-grid">{["Laptop protection", "Curved racket storage", "Quick-access pockets", "Travel-ready carry"].map((item) => <article key={item}><h3>{item}</h3><p>Dimensions and construction are confirmed against the target user, device and racket during sampling.</p></article>)}</div>
        </section>

        <section className="hybrid-section hybrid-two-column">
          <div><p className="eyebrow">Materials</p><h2>Responsible claims begin with the selected specification</h2><ul>{materialOptions.map((item) => <li key={item}>{item}</li>)}</ul><Link href="/blog/recycled-water-resistant-materials-padel-bags">Read the material guide</Link></div>
          <div><p className="eyebrow">OEM/ODM process</p><h2>Brief, sample, approve, produce</h2><ol><li>Confirm market, style, quantity direction and target price.</li><li>Define dimensions, laptop and racket fit, material, color and branding.</li><li>Review swatches and a physical sample before bulk approval.</li><li>Confirm production details, packaging and quality checkpoints.</li></ol><Link href="/oem-odm-bag-manufacturer">Review Cappuccino OEM/ODM capabilities</Link></div>
        </section>

        <section className="hybrid-section hybrid-market-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Geographic buyer-use directions</p><h2>Adapt one collection to different routines</h2></div>
          <div className="hybrid-market-grid">
            <article><h3>UK & Netherlands</h3><p>Develop lightweight commuter-to-club bags for rail, bike and compact urban movement, with laptop protection and balanced carry weight.</p></article>
            <article><h3>France & Spain</h3><p>Explore women’s lifestyle, premium club, frequent match and tournament-oriented versions without making unsupported sales claims.</p></article>
            <article><h3>USA & Australia</h3><p>Consider active-lifestyle, pickleball crossover, warm-weather sport and weekend-travel organization around the chosen model.</p></article>
          </div>
        </section>

        <section className="hybrid-section hybrid-proof-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Evidence and development</p><h2>Continue from concept to a verified specification</h2></div>
          <div className="hybrid-link-row"><Link href="/custom-padel-bag-manufacturer">Main Padel Bag category</Link><Link href="/factory-trust-materials">Factory Proof</Link><Link href="/oem-odm-bag-manufacturer">OEM/ODM</Link><Link href="/inquiry">RFQ</Link></div>
        </section>

        <section className="hybrid-section hybrid-faq-section"><div className="hybrid-section-heading"><p className="eyebrow">Buyer FAQ</p><h2>Concise answers for sourcing decisions</h2></div><div className="padel-faq-list">{collectionFaqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>

        <section className="hybrid-rfq"><div><p className="eyebrow">Collection RFQ</p><h2>Build a Cappuccino hybrid padel range</h2><p>Send your target market, selected models, quantity direction, material, logo and target price. Email <a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a> or WhatsApp <a href="https://wa.me/8613928715568">+86 139 2871 5568</a>.</p></div><Link className="btn btn-primary" href="/inquiry?product=Padel%20Bags&format=Hybrid%20Lifestyle%20Series%202026">Request collection RFQ</Link></section>
      </main>
      <SiteFooter />
    </>
  );
}
