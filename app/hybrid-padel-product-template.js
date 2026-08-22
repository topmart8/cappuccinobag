import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import {
  customizationOptions,
  getHybridProductHref,
  hybridCollection,
  hybridProductEntries,
  hybridProducts,
  hybridSiteUrl,
  imageApprovalDisclaimer,
  materialOptions,
  sharedFaqs,
} from "./hybrid-padel-data";

const relatedBlogs = [
  ["Work-to-Court Padel Bags: A Buyer’s Guide", "/blog/work-to-court-padel-bags"],
  ["How to Choose the Right Padel Bag Style", "/blog/choosing-the-right-padel-bag-style"],
  ["Recycled and Water-Resistant Padel Bag Materials", "/blog/recycled-water-resistant-materials-padel-bags"],
];

function inquiryHref(product) {
  return `/inquiry?product=Padel%20Bags&format=${encodeURIComponent(`${product.model} ${product.name}`)}`;
}

export function getHybridProductMetadata(slug) {
  const product = hybridProducts[slug];
  if (!product) return {};
  const canonical = `${hybridSiteUrl}${getHybridProductHref(slug)}`;
  return {
    title: product.metaTitle,
    description: product.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      url: canonical,
      type: "website",
      images: [{ url: `${hybridSiteUrl}${product.images[0].src}`, width: 1250, height: 1250, alt: product.images[0].alt }],
    },
    twitter: { card: "summary_large_image", title: product.metaTitle, description: product.metaDescription, images: [`${hybridSiteUrl}${product.images[0].src}`] },
    robots: { index: true, follow: true },
  };
}

export function HybridPadelProductPage({ slug }) {
  const product = hybridProducts[slug];
  if (!product) notFound();
  const canonical = `${hybridSiteUrl}${getHybridProductHref(slug)}`;
  const faqs = [
    { question: `What is ${product.model} designed for?`, answer: `${product.model} is designed for ${product.positioning.toLowerCase()}. ${product.shortDescription}` },
    ...sharedFaqs,
  ];
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${hybridSiteUrl}/` },
        { "@type": "ListItem", position: 2, name: hybridCollection.name, item: `${hybridSiteUrl}${hybridCollection.href}` },
        { "@type": "ListItem", position: 3, name: `${product.model} ${product.name}`, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      sku: product.model,
      name: `${product.model} ${product.name}`,
      description: product.metaDescription,
      image: product.images.map((item) => ({ "@type": "ImageObject", url: `${hybridSiteUrl}${item.src}`, caption: item.alt })),
      url: canonical,
      brand: { "@type": "Brand", name: "Cappuccino" },
      manufacturer: { "@type": "Organization", name: "Cappuccino Bag", url: hybridSiteUrl },
      category: "Custom Padel Bags",
      audience: { "@type": "BusinessAudience", audienceType: "Padel brands, club shops, retailers and OEM/ODM buyers" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
    },
  ];

  const relatedProducts = hybridProductEntries.filter((item) => item.model !== product.model).slice(0, 3);

  return (
    <>
      {schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <SiteHeader />
      <main className="hybrid-page hybrid-product-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href={hybridCollection.href}>Hybrid Lifestyle Series</Link><span aria-hidden="true">/</span>
          <span>{product.model}</span>
        </nav>

        <section className="hybrid-product-hero">
          <div className="hybrid-hero-copy">
            <p className="eyebrow">{product.model} · Cappuccino Padel</p>
            <h1>{product.h1}</h1>
            <p className="hybrid-lede">{product.shortDescription}</p>
            <div className="hybrid-hero-facts">
              <p><strong>Laptop:</strong> {product.laptopFit}</p>
              <p><strong>Rackets:</strong> {product.racketFit}</p>
              <p><strong>Carry:</strong> {product.carryModes}</p>
            </div>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={inquiryHref(product)}>Request a Quote</Link>
              <a className="btn btn-secondary dark" href={`mailto:info@cappuccinobag.net?subject=${product.model}%20Product%20Brief`}>Discuss Your Padel Bag Project</a>
            </div>
          </div>
          <figure className="hybrid-hero-image">
            <Image src={product.images[0].src} width={1250} height={1250} sizes="(max-width: 900px) calc(100vw - 28px), 48vw" alt={product.images[0].alt} priority />
          </figure>
        </section>

        <aside className="hybrid-disclaimer">{imageApprovalDisclaimer}</aside>

        <section className="hybrid-section">
          <div className="hybrid-section-heading"><p className="eyebrow">B2B Procurement Snapshot</p><h2>Model-specific facts for sourcing review</h2><p>Dimensions and any unlisted compartment are confirmed with the factory before sampling; no value is inferred from the digital images.</p></div>
          <dl className="padel-reference-grid">
            {product.procurementSnapshot.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}
            <div><dt>Main material options</dt><dd>Water-resistant recycled nylon / polyester or conventional nylon / polyester; final selection follows the project brief</dd></div>
            <div><dt>MOQ</dt><dd>Confirm with factory after structure, material, logo and packaging review</dd></div>
            <div><dt>Sample</dt><dd>Available; typically 7–15 days after specifications and materials are confirmed</dd></div>
            <div><dt>Bulk lead time</dt><dd>Confirm after quantity, materials, approved sample, packaging and inspection steps are agreed</dd></div>
            <div><dt>OEM / ODM</dt><dd>Colours, materials, lining, pocket layout, trims, logo execution and packaging</dd></div>
            <div><dt>Logo options</dt><dd>Embroidery, woven labels and other approved private-label executions</dd></div>
            <div><dt>Packaging</dt><dd>Hangtags and project-specific packaging can be developed to the approved brief</dd></div>
            <div><dt>Compliance status</dt><dd>No model-specific certification claimed; documentation must match the selected material and order scope</dd></div>
          </dl>
          <div className="hybrid-link-row"><Link href="/custom-padel-bag-manufacturer">Padel manufacturer process</Link><Link href="/factory-trust-materials">Factory proof</Link><Link href="/resources">Buyer resources</Link></div>
        </section>

        <section className="hybrid-answer-grid" aria-label="Quick product answers">
          <article><h2>Can this padel bag fit a laptop?</h2><p>{product.laptopFit}. Device fit is approved against the target hardware.</p></article>
          <article><h2>What separates work and court gear?</h2><p>{product.organization}</p></article>
        </section>

        <section className="hybrid-section hybrid-feature-layout">
          <div>
            <p className="eyebrow">Key selling points</p>
            <h2>Organized for daily movement</h2>
            <ul className="hybrid-check-list">{product.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </div>
          <div>
            <p className="eyebrow">Laptop and racket organization</p>
            <h2>Separate the fragile, bulky and frequently used items</h2>
            <p>{product.organization}</p>
            <p>Final padding, opening direction and internal dimensions are confirmed with target devices and rackets during physical sample review.</p>
          </div>
        </section>

        <section className="hybrid-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Complete image gallery</p><h2>{product.model} from product detail to real-life use</h2><p>Each supplied image has a distinct role; no image is repeated within this page.</p></div>
          <div className="hybrid-gallery">
            {product.images.slice(1).map((image, index) => (
              <figure key={image.src} className={index === 2 ? "hybrid-gallery-wide" : ""}>
                <Image src={image.src} width={1250} height={1250} sizes="(max-width: 720px) calc(100vw - 28px), 50vw" alt={image.alt} loading="eager" />
              </figure>
            ))}
          </div>
        </section>

        <section className="hybrid-dark-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Usage scenarios</p><h2>One platform, several buyer programs</h2></div>
          <div className="hybrid-scenario-grid">{product.scenarios.map((scenario) => <article key={scenario}><h3>{scenario}</h3><p>Adjust capacity, materials, colors and organization around this use case during development.</p></article>)}</div>
        </section>

        <section className="hybrid-section hybrid-two-column">
          <div><p className="eyebrow">Material options</p><h2>Water-resistant, lightweight directions</h2><ul>{materialOptions.map((item) => <li key={item}>{item}</li>)}</ul><p><Link href="/recycled-material-bags">Review sustainable material options</Link></p></div>
          <div><p className="eyebrow">OEM/ODM customization</p><h2>Build the product around your brief</h2><ul>{customizationOptions.map((item) => <li key={item}>{item}</li>)}</ul><p><Link href="/oem-odm-bag-manufacturer">See the OEM/ODM development process</Link></p></div>
        </section>

        <section className="hybrid-section hybrid-market-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Buyer-use perspective</p><h2>Developed with global padel routines in mind</h2></div>
          <p>For UK buyers, the format can support commuter-to-club ranges; in the Netherlands, lightweight carry and compact organization suit bike-and-transit routines. France may favor lifestyle-led club collections, while Spain can prioritize frequent club and tournament use. US programs can explore active-lifestyle and pickleball crossover positioning, and Australian buyers can develop lightweight sport-and-weekend travel ranges. These are use-case directions, not sales or market-share claims.</p>
        </section>

        <section className="hybrid-section hybrid-faq-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Buyer FAQ</p><h2>Questions to resolve before sampling</h2></div>
          <div className="padel-faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
        </section>

        <section className="hybrid-section">
          <div className="hybrid-section-heading"><p className="eyebrow">Related products</p><h2>Continue through the hybrid series</h2></div>
          <div className="hybrid-card-grid">{relatedProducts.map((item) => <article key={item.model}><Image src={item.images[0].src} width={1250} height={1250} alt={item.images[0].alt} loading="eager" /><div><p className="eyebrow">{item.model}</p><h3>{item.name}</h3><Link href={getHybridProductHref(item.slug)}>View product page</Link></div></article>)}</div>
          <div className="hybrid-article-links"><h2>Related buyer guides</h2>{relatedBlogs.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>
        </section>

        <section className="hybrid-rfq">
          <div><p className="eyebrow">RFQ</p><h2>Develop {product.model} for your market</h2><p>Send the target market, quantity, logo file, material direction, laptop size, racket capacity and target price for a project-specific review. Email <a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a> or WhatsApp <a href="https://wa.me/8613928715568">+86 139 2871 5568</a>.</p></div>
          <Link className="btn btn-primary" href={inquiryHref(product)}>Request a Quote</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
