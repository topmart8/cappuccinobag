import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import PadelHeader from "./racket-sports/padel-bags/PadelHeader";
import RacketSportsRfqForm from "./racket-sports-rfq-form";
import { siteUrl } from "./racket-sports-pages";
import styles from "./racket-sports-pages.module.css";

const customOptions = [
  ["Materials", "Nylon, polyester, recycled fabrics, coated fabrics and selected vegan material options"],
  ["Protection", "Thermal lining, soft lining, foam padding, reinforcement and equipment-fit review"],
  ["Branding", "Print, embroidery, rubber patch, woven label and other surface-appropriate logo applications"],
  ["Components", "Custom zipper pullers, webbing, adjusters, hooks and selected hardware"],
  ["Colour", "Colour matching across body fabric, lining, webbing, piping, patches and zipper components"],
  ["Packing", "Hangtags, care labels, barcode stickers, polybags, inserts, retail cartons and carton marks"],
];

const process = [
  ["Reference review", "Review product use, equipment dimensions, target market, quantity and brand direction."],
  ["Structure proposal", "Map protection, access, compartments, carry and product-family requirements."],
  ["Material selection", "Shortlist body fabric, lining, padding, reinforcement, trims and hardware."],
  ["Sample development", "Build and review a physical sample against the agreed specification."],
  ["Logo & packaging", "Confirm logo application, labels, hangtags, barcode and packing details."],
  ["Bulk production", "Produce against approved sample references and documented requirements."],
  ["QC & shipping", "Review function, workmanship, branding, packing and shipment requirements."],
];

const excludedProducts = [
  "We do not manufacture padel rackets directly.",
  "We do not manufacture tennis rackets directly.",
  "We do not manufacture pickleball paddles directly.",
  "We focus on OEM/ODM bags, sleeves, covers, cases and soft goods.",
];

export function getRacketSportsMetadata(page) {
  const canonical = `${siteUrl}${page.path}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: { title: page.title, description: page.description, url: canonical, type: "website" },
    twitter: { card: "summary", title: page.title, description: page.description },
    robots: { index: true, follow: true },
  };
}

function schemasFor(page) {
  const canonical = `${siteUrl}${page.path}`;
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: page.path === "/custom-racket-sports-bags-and-cases/" ? page.breadcrumb : "Racket Sports", item: `${siteUrl}/custom-racket-sports-bags-and-cases/` },
  ];
  if (page.path !== "/custom-racket-sports-bags-and-cases/") breadcrumbItems.push({ "@type": "ListItem", position: 3, name: page.breadcrumb, item: canonical });
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.serviceName,
      serviceType: page.serviceType,
      description: page.description,
      url: canonical,
      provider: { "@type": "Organization", name: "Cappuccino Bag", url: siteUrl },
      areaServed: ["United Kingdom", "Europe", "United States", "Worldwide"],
      audience: { "@type": "BusinessAudience", audienceType: page.audience },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ];
}

export default function RacketSportsPage({ page }) {
  const schemas = schemasFor(page);
  return (
    <>
      {schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <PadelHeader />
      <main className={`${styles.page} racket-soft-goods-page`}>
        <section className={styles.hero}>
          <div>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/custom-racket-sports-bags-and-cases/">Racket Sports</Link>{page.path !== "/custom-racket-sports-bags-and-cases/" ? <><span>/</span><span>{page.breadcrumb}</span></> : null}</nav>
            <p className={styles.eyebrow}>{page.eyebrow}</p>
            <h1>{page.h1}</h1>
            <p className={styles.lede}>{page.lede}</p>
            <p className={styles.scope}>{page.scope}</p>
            <div className={styles.actions}><a className={styles.primaryButton} href="#padel-rfq">{page.primaryCta}</a><a className={styles.secondaryButton} href="#product-support">{page.secondaryCta}</a></div>
          </div>
          <div className={styles.heroPanel} aria-label="Racket sports soft goods capability summary"><span>Bags</span><span>Sleeves</span><span>Covers</span><span>Cases</span><strong>OEM/ODM Soft Goods</strong></div>
        </section>

        <section className={styles.introSection}>
          <div><p className={styles.eyebrow}>Brand expansion</p><h2>{page.introTitle}</h2></div>
          <div>{page.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section className={styles.section} id="product-support">
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>What we develop</p><h2>{page.categoriesTitle}</h2></div>
          <div className={styles.cardGrid}>{page.categories.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className={styles.darkSection}>
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>OEM/ODM custom options</p><h2>From Material Sourcing to Retail Packing</h2><p>Options are reviewed against product structure, target quantity, market, retail position and approved sample requirements.</p></div>
          <dl className={styles.optionGrid}>{customOptions.map(([title, copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl>
        </section>

        {page.audienceList ? <section className={styles.audienceSection}><div><p className={styles.eyebrow}>Who this is for</p><h2>Developed for Padel Brands, Clubs and Distribution Programs</h2></div><ul>{page.audienceList.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}

        {page.commercialTitle ? <section className={styles.commercialSection}><p className={styles.eyebrow}>Commercial development</p><h2>{page.commercialTitle}</h2><p>{page.commercialCopy}</p></section> : null}

        <section className={styles.boundarySection}>
          <div><p className={styles.eyebrow}>Clear manufacturing scope</p><h2>What We Do Not Manufacture Directly</h2><p>Rackets and paddles may be used as reference equipment for fit and protection review, but they are not presented as Cappuccino Bag manufactured products.</p></div>
          <ul>{excludedProducts.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>Development process</p><h2>From Reference Review to QC and Shipping</h2></div>
          <ol className={styles.processGrid}>{process.map(([title, copy], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>Related sourcing paths</p><h2>Continue to the Right Product or Project Page</h2></div>
          <nav className={styles.linkGrid} aria-label="Related racket sports sourcing pages">{page.links.map(([label, href]) => <Link key={href} href={href} prefetch={false}><span>{label}</span><span aria-hidden="true">→</span></Link>)}</nav>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>FAQ</p><h2>{page.h1} FAQ</h2></div>
          <div className={styles.faqList}>{page.faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </section>

        <section className={styles.rfqSection} id="padel-rfq">
          <div className={styles.rfqIntro}><p className={styles.eyebrow}>RFQ</p><h2>{page.rfqTitle}</h2><p>{page.rfqCopy}</p><p>Include the product type, reference images, expected order quantity, logo method, target market and required sample timeline.</p></div>
          <RacketSportsRfqForm defaultProduct={page.defaultProduct} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
