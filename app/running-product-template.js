import Image from "next/image";
import { notFound } from "next/navigation";
import {
  JsonLd,
  Link,
  RunningActions,
  RunningBreadcrumb,
  RunningShell,
} from "./running-components";
import {
  runningCollectionUrl,
  runningProductMap,
  runningProducts,
  runningSiteUrl,
} from "./running-data";

export function getRunningProductStaticParams() {
  return runningProducts.map((product) => ({ slug: product.slug }));
}

export async function getRunningProductMetadata({ params }) {
  const { slug } = await params;
  const product = runningProductMap[slug];
  if (!product) return {};
  const canonical = `${runningSiteUrl}${product.href}`;
  return {
    title: product.metaTitle,
    description: product.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      url: canonical,
      type: "website",
      images: [{ url: `${runningSiteUrl}${product.image}`, width: 1200, height: 900, alt: product.imageAlt }],
    },
    twitter: { card: "summary_large_image", title: product.metaTitle, description: product.metaDescription, images: [product.image] },
    robots: { index: true, follow: true },
  };
}

export async function RunningProductPage({ params }) {
  const { slug } = await params;
  const product = runningProductMap[slug];
  if (!product) notFound();
  const canonical = `${runningSiteUrl}${product.href}`;
  const related = runningProducts
    .filter((item) => item.sku !== product.sku)
    .sort((a, b) => Number(b.collection === product.collection) - Number(a.collection === product.collection))
    .slice(0, 3);
  const sampleSteps = [
    "Share a sketch, tech pack, reference image or functional brief.",
    "Review materials, carried items, dimensions, hardware, logo and target market.",
    "Make the first sample and check fit, bounce, access, sweat contact and requested water-resistance scope.",
    "Record revisions, approve the pre-production specification and confirm packing.",
    "Run material, in-line, final-function, logo, packing and carton-mark QC before shipment.",
  ];
  const productFaqs = [
    ["What can be customized?", `The ${product.name} can be developed by pattern, waist range, pocket layout, materials, hardware, colors, logo methods, labels and packaging.`],
    ["What is the MOQ?", "MOQ depends on material and customization. The factory confirms it after reviewing the specification, material source, hardware, logo and packaging."],
    ["How is fit and bounce reviewed?", "A loaded sample should be worn across the target waist range and checked while walking and running. The agreed brief defines load, fit and acceptance notes."],
    ["Can we submit our own tech pack?", "Yes. Upload a tech pack through the RFQ form or email it with quantity, target market, timing and any required test criteria."],
  ];
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${runningSiteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Running Waist Packs", item: `${runningSiteUrl}${runningCollectionUrl}` },
        { "@type": "ListItem", position: 3, name: product.name, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      sku: product.sku,
      name: product.name,
      description: product.metaDescription,
      image: [`${runningSiteUrl}${product.image}`],
      url: canonical,
      brand: { "@type": "Brand", name: "Cappuccino" },
      manufacturer: { "@type": "Organization", name: "Cappuccino Bag", url: runningSiteUrl },
      category: "Custom running waist packs and running belts",
      audience: { "@type": "BusinessAudience", audienceType: "Running brands, sports retailers, clubs, event programs and private-label buyers" },
    },
  ];

  return (
    <>
      {schemas.map((schema) => <JsonLd key={schema["@type"]} value={schema} />)}
      <RunningShell>
        <main className="running-page">
          <RunningBreadcrumb items={[
            { name: "Running Waist Packs", href: runningCollectionUrl },
            { name: product.name },
          ]} />
          <section className="running-product-hero">
            <div>
              <p className="eyebrow">{product.sku} · {product.collection}</p>
              <h1>{product.name} OEM/ODM Development</h1>
              <p className="running-lead">{product.metaDescription}</p>
              <div className="running-notice"><strong>Development status:</strong> Concept / development option, not a stocked finished product. Final materials, dimensions, performance claims, MOQ, price and timing follow specification review and sampling.</div>
              <RunningActions format={`${product.sku} ${product.name}`} />
            </div>
            <figure className="running-concept-figure">
              <Image src={product.image} width={1200} height={900} sizes="(max-width: 900px) calc(100vw - 36px), 48vw" alt={product.imageAlt} priority />
              <figcaption>Concept development card · not finished-product photography</figcaption>
            </figure>
          </section>

          <section className="running-section running-two-column">
            <div><p className="eyebrow">Product positioning</p><h2>Built around the intended runner and carried load</h2><p>This {product.priceTier.toLowerCase()}-tier development direction is intended for {product.applications.toLowerCase()}. Construction is adjusted to the buyer’s channel, target price, brand language and approved test plan.</p></div>
            <ul className="running-feature-list">{product.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </section>

          <section className="running-section running-spec-section">
            <div className="running-heading"><div><p className="eyebrow">Reference development brief</p><h2>Materials, fit and customization</h2></div><p>These fields guide sampling and do not replace a signed specification.</p></div>
            <dl className="running-spec-grid">
              <div><dt>Applications</dt><dd>{product.applications}</dd></div>
              <div><dt>Material direction</dt><dd>{product.materials}. Equivalent choices are reviewed against performance, documentation, cost and availability.</dd></div>
              <div><dt>Capacity / fit guidance</dt><dd>{product.fitGuidance}</dd></div>
              <div><dt>Color direction</dt><dd>{product.colors}. Custom-dyed material is subject to color approval and project-specific minimums.</dd></div>
              <div><dt>Logo options</dt><dd>Heat transfer, reflective print, silicone or rubber patch, embroidery, woven label, custom elastic and branded zipper-puller options.</dd></div>
              <div><dt>OEM / ODM options</dt><dd>Custom pattern, storage architecture, body-contact panel, elastic, buckle, zipper, reflective trim, labels, packaging and carton marks.</dd></div>
              <div><dt>MOQ</dt><dd>MOQ depends on material and customization. Request a project review rather than relying on an invented fixed quantity.</dd></div>
              <div><dt>Buyer types</dt><dd>Running brands, sports retailers, clubs, race organizers, importers and private-label product teams.</dd></div>
            </dl>
          </section>

          <section className="running-section running-dark">
            <div className="running-heading"><div><p className="eyebrow">Sample and production process</p><h2>From brief to shipment</h2></div><p>Each approval stage reduces ambiguity before bulk production.</p></div>
            <ol className="running-process-list">{sampleSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
            <RunningActions format={`${product.sku} ${product.name}`} />
          </section>

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Buyer questions</p><h2>{product.name} FAQ</h2></div><p>Visible answers for procurement and product-development teams.</p></div>
            <div className="running-faq">{productFaqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
          </section>

          <section className="running-section">
            <div className="running-heading"><div><p className="eyebrow">Related products</p><h2>Compare adjacent running belt directions</h2></div><Link className="running-text-link" href={runningCollectionUrl}>View all 30 SKU</Link></div>
            <div className="running-product-grid">{related.map((item) => (
              <article className="running-product-card" key={item.sku}>
                <Image src={item.image} width={1200} height={900} sizes="(max-width: 700px) calc(100vw - 28px), 31vw" alt={item.imageAlt} />
                <div><p className="eyebrow">{item.sku}</p><h3><Link href={item.href}>{item.name}</Link></h3><Link className="running-text-link" href={item.href}>View development page</Link></div>
              </article>
            ))}</div>
          </section>

          <section className="running-rfq">
            <div><p className="eyebrow">Start your project</p><h2>Send the {product.sku} brief for factory review</h2><p>Upload a tech pack or share quantity, market, materials, logo, packaging and test requirements. Contact <a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a>.</p></div>
            <RunningActions format={`${product.sku} ${product.name}`} />
          </section>
        </main>
      </RunningShell>
    </>
  );
}
