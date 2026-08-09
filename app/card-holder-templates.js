import Link from "next/link";
import { notFound } from "next/navigation";
import { BackToCollection, Breadcrumb, CardHolderShell, FaqSection, InquiryActions, InternalLinks, JsonLd, ProductGallery, ProductGrid, QuotationChecklist } from "./card-holder-components";
import { cardHolderCollectionUrl, cardHolderFaqs, cardHolderHubLinks, cardHolderProductMap, cardHolderProducts, cardHolderSiteUrl } from "./card-holder-data";
import styles from "./card-holders/card-holders.module.css";

function faqSchema(faqs) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
}

function itemListSchema(products, url) {
  return { "@context": "https://schema.org", "@type": "ItemList", url, numberOfItems: products.length, itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, url: `${cardHolderSiteUrl}${product.href}`, name: product.name })) };
}

function breadcrumbSchema(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) };
}

export function CardHolderCollectionPage() {
  const canonical = `${cardHolderSiteUrl}${cardHolderCollectionUrl}`;
  const schemas = [
    breadcrumbSchema([{ name: "Home", url: `${cardHolderSiteUrl}/` }, { name: "Card Holders", url: canonical }]),
    itemListSchema(cardHolderProducts, canonical),
    faqSchema(cardHolderFaqs),
  ];
  return <>{schemas.map((schema) => <JsonLd value={schema} key={schema["@type"]} />)}<CardHolderShell><main className={styles.page}>
    <Breadcrumb items={[{ name: "Card Holders" }]} />
    <section className={styles.hero}><div><h1>Custom Card Holder Manufacturer for Private-Label Projects</h1><p className={styles.lead}>Eight source-verified card holder directions selected for brands, gift companies, retailers and corporate buyers. Product claims are limited to the accessible Cappuccino Bag collection titles and images.</p><InquiryActions product="Card Holder Collection" /></div><div className={styles.heroProof}><strong>8 selected models</strong><span>Genuine leather, top-layer cowhide and full-grain vegetable-tanned leather options</span><span>Six models identified as RFID blocking in their source titles</span><span>No public product price is shown</span></div></section>
    <section className={styles.section}><div className={styles.sectionHeading}><h2>Selected card holders and RFID wallets</h2><p>Each product page separates confirmed information from details that require an approved quotation and sample.</p></div><ProductGrid products={cardHolderProducts} /></section>
    <section className={`${styles.section} ${styles.splitSection}`}><div><h2>OEM card holder development without unsupported claims</h2><p>The accessible source confirms OEM/ODM or customization on selected models, plus specific materials and RFID wording where stated. It does not confirm a universal logo process, packaging program, sample timeline or custom slot-count policy.</p><p>Choose a model code, then send the target dimensions, layout, logo artwork, quantity and market. The factory can confirm the feasible construction and commercial terms in the quotation.</p></div><div><h2>Primary buyer groups</h2><ul className={styles.plainList}><li>Accessory and leather-goods brands</li><li>Corporate and promotional gift companies</li><li>Retailers and distributors</li><li>Private-label sourcing teams</li></ul></div></section>
    <FaqSection faqs={cardHolderFaqs} />
    <section className={`${styles.section} ${styles.relatedSection}`}><div className={styles.sectionHeading}><h2>Related manufacturing and material pages</h2><p>Continue from the product cluster to the most relevant RFID, leather, factory or material review.</p></div><InternalLinks links={cardHolderHubLinks} /></section>
    <section className={styles.rfqBand}><div><h2>Request a card holder quotation</h2><p>Reference the CAP-CH model code and send the fields below. Missing specifications will be identified before sampling.</p><QuotationChecklist /></div><InquiryActions product="Card Holder Collection" /></section>
  </main></CardHolderShell></>;
}

export function CardHolderHubPage({ title, lead, products, faqs, path, intro, buyerNote }) {
  const canonical = `${cardHolderSiteUrl}${path}`;
  const schemas = [
    breadcrumbSchema([{ name: "Home", url: `${cardHolderSiteUrl}/` }, { name: "Card Holders", url: `${cardHolderSiteUrl}${cardHolderCollectionUrl}` }, { name: title, url: canonical }]),
    itemListSchema(products, canonical),
    faqSchema(faqs),
  ];
  return <>{schemas.map((schema) => <JsonLd value={schema} key={schema["@type"]} />)}<CardHolderShell><main className={styles.page}>
    <Breadcrumb items={[{ name: "Card Holders", href: cardHolderCollectionUrl }, { name: title }]} />
    <section className={styles.hero}><div><h1>{title}</h1><p className={styles.lead}>{lead}</p><InquiryActions product={title} /></div><div className={styles.heroProof}><strong>{products.length} matching models</strong><span>{intro}</span><span>{buyerNote}</span></div></section>
    <section className={styles.section}><div className={styles.sectionHeading}><h2>Compare source-verified product structures</h2><p>RFID, material and construction wording is included only where the accessible source confirms it.</p></div><ProductGrid products={products} /></section>
    <FaqSection faqs={faqs} title={`Questions about ${title.toLowerCase()}`} />
    <section className={`${styles.section} ${styles.relatedSection}`}><div className={styles.sectionHeading}><h2>Continue your product review</h2></div><InternalLinks links={[{ href: cardHolderCollectionUrl, label: "All card holders" }, ...cardHolderHubLinks.filter((link) => link.href !== path)]} /></section>
    <section className={styles.rfqBand}><div><h2>Build a complete RFQ</h2><p>Use the model code to anchor the request, then specify every required change rather than assuming a standard configuration.</p><QuotationChecklist /></div><InquiryActions product={title} /></section>
  </main></CardHolderShell></>;
}

export function getCardHolderProductMetadata(slug) {
  const product = cardHolderProductMap[slug];
  if (!product) return {};
  const canonical = `${cardHolderSiteUrl}${product.href}`;
  return { title: product.metaTitle, description: product.metaDescription, alternates: { canonical }, openGraph: { title: product.metaTitle, description: product.metaDescription, url: canonical, type: "website", images: [{ url: `${product.imageBase}/${product.images[0][0]}`, width: 1000, height: 1000, alt: product.images[0][1] }] }, twitter: { card: "summary_large_image", title: product.metaTitle, description: product.metaDescription, images: [`${product.imageBase}/${product.images[0][0]}`] }, robots: { index: true, follow: true } };
}

export function CardHolderProductPage({ slug }) {
  const product = cardHolderProductMap[slug];
  if (!product) notFound();
  const canonical = `${cardHolderSiteUrl}${product.href}`;
  const productFaqs = [
    ["Is RFID blocking confirmed for this model?", product.rfid],
    ["What material is confirmed for this card holder?", product.material],
    ["Can the logo be customized?", product.logo],
    ["What must be supplied before sampling?", "Provide the model code, target dimensions, slot layout, material and color, RFID requirement, artwork, packaging, quantity, market and target timing. Sample steps and timing are confirmed in the quotation."],
  ];
  const related = cardHolderProducts.filter((item) => item.code !== product.code && (item.rfidConfirmed === product.rfidConfirmed || item.material.toLowerCase().includes("leather"))).slice(0, 3);
  const schemas = [
    breadcrumbSchema([{ name: "Home", url: `${cardHolderSiteUrl}/` }, { name: "Card Holders", url: `${cardHolderSiteUrl}${cardHolderCollectionUrl}` }, { name: product.name, url: canonical }]),
    { "@context": "https://schema.org", "@type": "Product", sku: product.code, name: product.name, description: product.metaDescription, url: canonical, image: product.images.map(([filename]) => `${cardHolderSiteUrl}${product.imageBase}/${filename}`), material: product.material, category: "Card Holder", brand: { "@type": "Brand", name: "Cappuccino Bag" }, manufacturer: { "@type": "Organization", name: "Guangzhou Cappuccino Leather Handbag Co., Ltd.", url: cardHolderSiteUrl }, audience: { "@type": "BusinessAudience", audienceType: product.audience } },
    faqSchema(productFaqs),
  ];
  const specs = [["Internal model", product.code], ["Material", product.material], ["Card slots and structure", product.structure], ["RFID status", product.rfid], ["Dimensions", product.dimensions], ["MOQ", product.moq], ["Colors shown", product.colors], ["Logo customization", product.logo], ["Packaging", product.packaging]];
  return <>{schemas.map((schema) => <JsonLd value={schema} key={schema["@type"]} />)}<CardHolderShell><main className={styles.page}>
    <Breadcrumb items={[{ name: "Card Holders", href: cardHolderCollectionUrl }, { name: product.name }]} />
    <section className={styles.productHero}><div><p className={styles.productCode}>{product.code}</p><h1>{product.name}</h1><p className={styles.lead}>{product.structure}</p><div className={styles.statusNote}><strong>Source verification</strong><span>{product.sourceNote}</span></div><InquiryActions product={`${product.code} ${product.name}`} /></div><ProductGallery product={{ ...product, images: product.images.slice(0, 1) }} /></section>
    <section className={styles.section}><div className={styles.sectionHeading}><h2>Product views</h2><p>These are the original product photographs supplied through the Cappuccino Bag source collection, converted to WebP without changing structure, color, material or slot count.</p></div><ProductGallery product={{ ...product, images: product.images.slice(1) }} /></section>
    <section className={`${styles.section} ${styles.specSection}`}><div><h2>Confirmed product specification</h2><p>{product.sourceNote}</p><p><strong>Suitable for:</strong> {product.audience}</p><p><strong>Application:</strong> {product.useCases}</p></div><dl className={styles.specList}>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    <section className={`${styles.section} ${styles.splitSection}`}><div><h2>OEM and ODM review</h2><p>Use {product.code} as the reference structure. Any change to material, dimensions, card slots, closure, RFID layer, color, logo or packaging must be reviewed and confirmed in the quotation and approved sample.</p><p>No certification, universal lead time or unverified production specification is claimed on this page.</p></div><div><h2>Quotation checklist</h2><QuotationChecklist /></div></section>
    <FaqSection faqs={productFaqs} title={`Questions about ${product.shortName}`} />
    <section className={styles.section}><div className={styles.sectionHeading}><h2>Related card holders</h2><BackToCollection /></div><ProductGrid products={related} /><InternalLinks links={cardHolderHubLinks} /></section>
    <section className={styles.rfqBand}><div><h2>Request a {product.code} quotation</h2><p>Send the model code with the required material, layout, artwork, packaging and estimated quantity.</p></div><InquiryActions product={`${product.code} ${product.name}`} /></section>
  </main></CardHolderShell></>;
}
