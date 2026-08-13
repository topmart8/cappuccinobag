import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import { techGiftArticles, techGiftCollectionPath, techGiftFaqs, techGiftImages, techGiftProductPath, techGiftSiteUrl } from "../../corporate-tech-gift-data";

const canonical = `${techGiftSiteUrl}${techGiftProductPath}`;
const inquiryHref = "/inquiry?product=Corporate%20Tech%20Gift%20Set&format=3-in-1%20Backpack%20Headphones%20Speaker";

export const metadata = {
  title: "3-in-1 Tech Gift Set | Water-Resistant Laptop Backpack with Headphones & Speaker | Cappuccino Bag",
  description: "Explore Cappuccino Bag’s 3-in-1 tech gift set featuring a water-resistant laptop backpack, wireless headphones and Bluetooth speaker. Ideal for corporate gifts, promotional campaigns and private label projects.",
  alternates: { canonical },
  openGraph: { title: "3-in-1 Tech Gift Set", description: "Water-resistant laptop backpack, wireless headphones, Bluetooth speaker and private-label gift box options for B2B programs.", url: canonical, type: "website", images: [{ url: `${techGiftSiteUrl}${techGiftImages[0].src}`, width: 1254, height: 1254, alt: techGiftImages[0].alt }] },
  twitter: { card: "summary_large_image", title: "3-in-1 Tech Gift Set", description: "A backpack-led OEM corporate gift solution with flexible electronics and packaging options.", images: [`${techGiftSiteUrl}${techGiftImages[0].src}`] },
  robots: { index: true, follow: true },
};

const specifications = [
  ["Backpack size", "Approx. 33 × 13 × 46.5 cm"], ["Laptop fit", "Up to approx. 15.6 inches"],
  ["Standard color shown", "Black"], ["Exterior", "Water-resistant; not positioned as waterproof"],
  ["Set options", "Backpack only, + headphones, + speaker, or full set"], ["OEM / ODM", "Available"],
  ["Branding", "Custom logo and retail gift box available"], ["Packaging languages", "Spanish and Portuguese layouts available by project"],
];
const included = ["Water-resistant laptop backpack", "Wireless headphones", "Bluetooth speaker", "Customizable gift box"];
const features = ["Water-resistant exterior", "Fits laptops up to approx. 15.6 inches", "Multiple interior compartments", "Padded shoulder straps", "Side bottle or umbrella pocket", "Clean business-oriented silhouette"];
const organization = ["Laptop and tablet zones", "Document storage", "Phone and small-item pockets", "Cable and accessory organization", "Main compartment for daily essentials"];
const applications = ["Corporate gifts", "Employee onboarding and welcome kits", "Telecom promotions", "Electronics retail bundles", "School and campus campaigns", "Distributor promotional programs", "Seasonal branded gift campaigns"];
const customization = ["Logo on backpack", "Logo on selected speaker and headphone models", "Custom gift box", "Pantone color matching where feasible", "Barcode label and manual", "Spanish or Portuguese packaging layouts", "Retail-ready packaging"];
const options = ["Backpack only", "Backpack + headphones", "Backpack + speaker", "Full 3-in-1 set"];
const process = ["Idea confirmation", "Sampling", "Branding development", "Production", "Quality control", "Packing", "Shipment coordination"];

export default function TechGiftProductPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "Product", name: "3-in-1 Tech Gift Set", description: metadata.description, url: canonical, category: "Corporate & Tech Gift Solutions", image: techGiftImages.map((item) => `${techGiftSiteUrl}${item.src}`), brand: { "@type": "Brand", name: "Cappuccino Bag" }, manufacturer: { "@type": "Organization", name: "Guangzhou Cappuccino Leather Handbag Co., Ltd.", url: techGiftSiteUrl }, size: "Backpack approx. 33 × 13 × 46.5 cm", color: "Black", additionalProperty: [{ "@type": "PropertyValue", name: "Laptop fit", value: "Up to approximately 15.6 inches" }, { "@type": "PropertyValue", name: "Exterior", value: "Water-resistant" }, { "@type": "PropertyValue", name: "OEM / ODM", value: "Available" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: techGiftFaqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${techGiftSiteUrl}/` }, { "@type": "ListItem", position: 2, name: "Corporate & Tech Gift Solutions", item: `${techGiftSiteUrl}${techGiftCollectionPath}` }, { "@type": "ListItem", position: 3, name: "3-in-1 Tech Gift Set", item: canonical }] },
  ];
  const articleEntries = Object.entries(techGiftArticles);
  return <>
    {schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
    <SiteHeader />
    <main className="tech-gift-page">
      <nav className="padel-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={techGiftCollectionPath}>Corporate &amp; Tech Gift Solutions</Link><span>/</span><span>3-in-1 Tech Gift Set</span></nav>
      <section className="tech-gift-hero"><div><h1>3-in-1 Tech Gift Set</h1><h2>Water-Resistant Laptop Backpack + Wireless Headphones + Bluetooth Speaker</h2><p>A complete branded gift solution for modern work, travel and promotional campaigns, with retail-ready private-label packaging options.</p><div className="hero-actions"><Link className="btn btn-primary" href={inquiryHref}>Request OEM Quote</Link><Link className="btn btn-secondary dark" href={`${inquiryHref}&intent=project-discussion`}>Discuss Your Gift Set Project</Link></div></div><Image src={techGiftImages[0].src} alt={techGiftImages[0].alt} width={1254} height={1254} sizes="(max-width: 900px) calc(100vw - 28px), 52vw" priority /></section>

      <Section image={techGiftImages[1]} title="What’s Included" intro="One coordinated presentation built around a practical business backpack and flexible audio accessories." items={included} />
      <Section image={techGiftImages[2]} title="Backpack Features" intro="Designed for office, commuting, campus and short travel use." items={features} reverse />
      <Section image={techGiftImages[3]} title="Smart Interior Organization" intro="Dedicated zones help separate work equipment, documents and daily accessories." items={organization} />
      <Section image={techGiftImages[4]} title="Ideal Applications" intro="Suitable for B2B programs that need useful products, coordinated branding and scalable configurations." items={applications} reverse />
      <Section image={techGiftImages[5]} title="Private Label Customization" intro="Build market-specific presentation across the backpack, selected accessories and packaging." items={customization} />
      <Section image={techGiftImages[6]} title="Flexible Set Options" intro="Adjust the configuration to the campaign budget, recipient tier and distribution channel." items={options} reverse />
      <Section image={techGiftImages[7]} title="One-Stop OEM / ODM Service" intro="Coordinate product development, branding and final packing through one documented workflow." items={process} />

      <section className="tech-gift-section"><div className="tech-gift-heading"><h2>Product Specifications</h2><p>Reference facts for initial project planning. Final construction and accessory models are confirmed through sampling.</p></div><dl className="tech-gift-specs">{specifications.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></section>
      <aside className="tech-gift-compliance"><strong>Compliance note:</strong> Bluetooth accessories and lithium batteries may require destination-specific documentation, radio approvals or transport paperwork. Requirements depend on the exact selected electronics model and destination. No certification is claimed until verified for that project.</aside>
      <section className="tech-gift-section tech-gift-faq"><div className="tech-gift-heading"><h2>Frequently Asked Questions</h2><p>Direct answers for corporate buyers, importers and promotional program teams.</p></div><div className="padel-faq-list">{techGiftFaqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
      <section className="tech-gift-inquiry"><div><h2>Build the right backpack gift set solution</h2><p>Tell us your target market, quantity and branding request. We can help you build the right backpack gift set solution.</p></div><div className="tech-gift-cta-actions"><Link className="btn btn-primary" href={inquiryHref}>Request OEM Quote</Link><Link className="btn btn-secondary" href={`${inquiryHref}&intent=project-discussion`}>Discuss Your Gift Set Project</Link></div></section>
      <section className="tech-gift-section"><div className="tech-gift-heading"><h2>Related Articles</h2><p>Practical B2B guidance for configuration, campaign planning and coordinated OEM sourcing.</p></div><div className="tech-gift-article-grid">{articleEntries.map(([slug, article]) => <article key={slug}><Image src={article.image.src} alt={article.image.alt} width={1254} height={1254} sizes="(max-width: 680px) calc(100vw - 28px), 31vw" loading="lazy" /><div><h3>{article.title}</h3><p>{article.description}</p><Link href={`/blog/${slug}`}>Read buyer guide</Link></div></article>)}</div></section>
    </main>
    <SiteFooter />
  </>;
}

function Section({ image, title, intro, items, reverse = false }) {
  return <section className={`tech-gift-section tech-gift-feature${reverse ? " is-reverse" : ""}`}><div><div className="tech-gift-heading"><h2>{title}</h2><p>{intro}</p></div><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div><Image src={image.src} alt={image.alt} width={1254} height={1254} sizes="(max-width: 900px) calc(100vw - 28px), 48vw" loading="lazy" /></section>;
}
