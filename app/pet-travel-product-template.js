import { notFound } from "next/navigation";
import { JsonLd, Link, PetActions, PetBreadcrumb, PetLifestyleVisual, PetProductCard, PetProductVisual, PetShell, QuotationChecklist } from "./pet-travel-components";
import { petCollectionUrl, petGuidesUrl, petProductCodeMap, petProductMap, petProducts, petSiteUrl } from "./pet-travel-data";

export async function getPetProductMetadata(slug) {
  const product = petProductMap[slug];
  if (!product) return {};
  const canonical = `${petSiteUrl}${product.href}`;
  return { title: product.metaTitle, description: product.metaDescription, alternates: { canonical }, openGraph: { title: product.metaTitle, description: product.metaDescription, url: canonical, type: "website" }, twitter: { card: "summary", title: product.metaTitle, description: product.metaDescription }, robots: { index: true, follow: true } };
}

export function PetProductPage({ slug }) {
  const product = petProductMap[slug];
  if (!product) notFound();
  const canonical = `${petSiteUrl}${product.href}`;
  const related = product.related.map((code) => petProductCodeMap[code]).filter(Boolean);
  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${petSiteUrl}/` }, { "@type": "ListItem", position: 2, name: "Pet Travel Bags", item: `${petSiteUrl}${petCollectionUrl}` }, { "@type": "ListItem", position: 3, name: product.category, item: `${petSiteUrl}${petCollectionUrl}${product.categorySlug}/` }, { "@type": "ListItem", position: 4, name: product.name, item: canonical }] },
    { "@context": "https://schema.org", "@type": "Product", sku: product.code, name: product.name, description: product.description, url: canonical, brand: { "@type": "Brand", name: "Cappuccino Bag" }, manufacturer: { "@type": "Organization", name: "Guangzhou Cappuccino Leather Handbag Co., Ltd.", url: petSiteUrl }, category: product.category, audience: { "@type": "BusinessAudience", audienceType: "Brands, retailers, distributors, importers and private-label product teams" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: product.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];
  return <>{schemas.map((schema) => <JsonLd key={schema["@type"]} value={schema} />)}<PetShell><main className="pet-page"><PetBreadcrumb items={[{ name: "Pet Travel Bags", href: petCollectionUrl }, { name: product.category, href: `${petCollectionUrl}${product.categorySlug}/` }, { name: product.name }]} />
    <section className="pet-product-hero"><div><p className="eyebrow">{product.code} · {product.category}</p><h1>{product.name}</h1><p className="pet-lead">{product.short}</p><p>{product.description}</p><div className="pet-notice"><strong>Development status:</strong> OEM/ODM concept for specification and sampling. Final dimensions, materials, MOQ and timing are confirmed after review.</div><PetActions format={`${product.code} ${product.name}`} /></div><PetProductVisual product={product} purpose="main product image production asset pending" /></section>
    <section className="pet-section pet-lifestyle-section"><div><p className="eyebrow">Use context</p><h2>Designed around real pet travel routines</h2><p>This scene illustrates the intended use direction for buyer review. Construction, proportions and materials remain subject to approved samples and specifications.</p></div><PetLifestyleVisual product={product} /></section>
    <section className="pet-section pet-two-column"><div><p className="eyebrow">Commercial intent</p><h2>{product.primaryKeyword}</h2><p>{product.description}</p><h3>Recommended use cases</h3><p>{product.uses}</p></div><ul className="pet-feature-list">{product.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>
    <section className="pet-section pet-dark"><div className="pet-heading"><div><p className="eyebrow">Custom specification</p><h2>Materials, components and private-label options</h2></div><p>Every field is confirmed in the approved sample and project specification.</p></div><div className="pet-spec-table">{product.customization.map(([label, value]) => <div key={label}><strong>{label}</strong><span>{value}</span></div>)}<div><strong>Capacity or pet-size guidance</strong><span>{product.capacity}</span></div><div><strong>MOQ</strong><span>{product.moq}</span></div></div></section>
    <section className="pet-section"><div className="pet-heading"><div><p className="eyebrow">OEM / ODM workflow</p><h2>From product brief to export packing</h2></div><p>{product.timing}</p></div><ol className="pet-process">{product.process.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol><div className="pet-note-grid"><article><h3>Sample development</h3><p>{product.sampleNote}</p></article><article><h3>Bulk production</h3><p>{product.bulkNote}</p></article><article><h3>Quality control</h3><p>{product.qc}</p></article><article><h3>Sustainability</h3><p>{product.sustainability}</p></article></div></section>
    <section className="pet-section"><div className="pet-heading"><div><p className="eyebrow">Buyer FAQ</p><h2>Questions about {product.name}</h2></div><p>Concise answers for product managers and sourcing teams.</p></div><div className="pet-faq">{product.faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <section className="pet-section"><div className="pet-heading"><div><p className="eyebrow">Related development paths</p><h2>Compare adjacent pet travel products</h2></div><Link className="pet-text-link" href={petCollectionUrl}>View the full collection</Link></div><div className="pet-product-grid">{related.map((item) => <PetProductCard product={item} key={item.code} />)}</div><div className="pet-context-links"><Link href="/factory-trust-materials/">Review factory proof</Link><Link href="/oem-odm-bag-manufacturer/">Explore custom manufacturing</Link><Link href={petGuidesUrl}>Read pet travel buyer guides</Link><Link href="/inquiry/">Open the RFQ form</Link></div></section>
    <section className="pet-rfq"><div><p className="eyebrow">RFQ checklist</p><h2>Request a {product.code} development review</h2><p>Send a concise project brief to info@cappuccinobag.net.</p><QuotationChecklist /></div><PetActions format={`${product.code} ${product.name}`} /></section>
  </main></PetShell></>;
}

export const allPetProductSlugs = petProducts.map((product) => product.slug);
