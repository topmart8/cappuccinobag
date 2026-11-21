import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { golfFaqs, golfImage, golfInquiryHref, golfPath, golfProducts } from "./data";
import styles from "./page.module.css";

const siteUrl = "https://www.cappuccinobag.com";
const canonical = `${siteUrl}${golfPath}`;
const title = "Custom Golf Bags & Accessories | Cappuccino Bag";
const description = "Develop private-label golf shoe bags, weekenders, valuables pouches and accessories cases with Cappuccino Bag. New custom bulk orders from 300 pieces per style.";
const imageAlt = "AI-generated golf bag concepts: olive shoe bag, green weekender, cream valuables pouch and open accessories case";

export const metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website", images: [{ url: `${siteUrl}${golfImage}`, width: 1536, height: 1024, alt: imageAlt }] },
  twitter: { card: "summary_large_image", title, description, images: [`${siteUrl}${golfImage}`] },
  robots: { index: true, follow: true },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage", name: title, description, url: canonical,
      isPartOf: { "@type": "WebSite", name: "Cappuccino Bag", url: siteUrl },
      primaryImageOfPage: { "@type": "ImageObject", url: `${siteUrl}${golfImage}`, caption: "AI-generated design concepts; specifications subject to physical sampling." },
      mainEntity: { "@type": "ItemList", itemListElement: golfProducts.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: `${canonical}#${product.id}` })) },
    },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` },
      { "@type": "ListItem", position: 3, name: "Golf Bags & Accessories", item: canonical },
    ] },
  ],
};

export default function GolfBagsPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <SiteHeader />
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/products">Products</Link><span aria-hidden="true">/</span><span aria-current="page">Golf Bags</span></nav>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Cappuccino Bag · Private label / OEM / ODM</p>
            <h1>Custom Golf Bags<br />&amp; Accessories</h1>
            <p className={styles.tagline}>A considered collection.<br />From clubhouse to weekend away.</p>
            <p className={styles.intro}>Shoe bags, weekenders and small accessories developed around your brand, club or golf travel program.</p>
            <div className={styles.actions}><Link className={styles.primary} href={golfInquiryHref()}>Discuss Your Golf Collection</Link><a className={styles.secondary} href="#collection">Explore the Four Formats <span aria-hidden="true">↗</span></a></div>
            <p className={styles.minimum}>New custom bulk orders: <strong>300 pieces per style</strong></p>
          </div>
          <figure className={styles.heroVisual}>
            <Image src={golfImage} alt={imageAlt} width={1536} height={1024} sizes="(max-width: 900px) 100vw, 58vw" priority />
            <figcaption>AI-generated design concepts · Final materials, dimensions and construction subject to physical sample approval.</figcaption>
          </figure>
        </header>

        <section className={styles.collection} id="collection" aria-labelledby="collection-heading">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The starting collection</p><h2 id="collection-heading">Four formats. Your brand direction.</h2></div><p>Choose a starting point, then define the details. Each format is a separate development project with its own specification and minimum quantity.</p></div>
          <div className={styles.productGrid}>{golfProducts.map((product, index) => <article className={styles.product} id={product.id} key={product.id}>
            <div className={styles.productTop}><span className={styles.number}>0{index + 1}</span><span className={styles.concept}>Design concept</span></div>
            <p className={styles.use}>{product.use}</p><h3>{product.name}</h3><p>{product.description}</p>
            <p className={styles.optionsLabel}>Options to develop</p><ul>{product.options.map((option) => <li key={option}>{option}</li>)}</ul>
            <p className={styles.brief}>{product.brief}</p>
            <Link className={styles.productLink} href={golfInquiryHref(product.name)}>Discuss this format <span aria-hidden="true">↗</span><span className={styles.srOnly}>: {product.name}</span></Link>
          </article>)}</div>
        </section>

        <section className={styles.program} aria-labelledby="program-heading">
          <div><p className={styles.eyebrow}>Custom production</p><h2 id="program-heading">Build a coordinated golf collection.</h2><p>Review fabric, trim, color, lining, logo placement and packaging together. Start with a clear brief and approve the physical sample before confirming bulk production.</p></div>
          <div className={styles.minimumPanel}><p className={styles.minimumNumber}>300<span>pieces per style</span></p><p>Styles cannot be mixed to reach the minimum. Color splits and special materials may require higher quantities. Samples are assessed separately.</p></div>
        </section>

        <section className={styles.development} aria-labelledby="development-heading"><p className={styles.eyebrow}>From brief to production</p><h2 id="development-heading">Make the details work for your collection.</h2><ol className={styles.steps}>
          <li><h3>Define the project</h3><p>Share the product format, quantity by style and color, target market, dimensions and delivery window.</p></li>
          <li><h3>Review &amp; sample</h3><p>Confirm materials, construction and branding. Review sample fees, then check fit, finish and function on a physical sample.</p></li>
          <li><h3>Approve the specification</h3><p>Agree the final sample, quotation, packaging, inspection criteria and delivery terms for your bulk order.</p></li>
        </ol><div className={styles.related}><Link href="/factory-trust-materials">Factory &amp; material information ↗</Link><Link href="/quality-inspection-guide">Quality inspection guide ↗</Link></div></section>

        <section className={styles.faq} aria-labelledby="faq-heading"><p className={styles.eyebrow}>Before you start</p><h2 id="faq-heading">Golf collection questions</h2>{golfFaqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>

        <section className={styles.quote} aria-labelledby="quote-heading"><div><p className={styles.eyebrow}>Start with your brief</p><h2 id="quote-heading">Your next golf collection starts here.</h2><p>Send a reference, your quantity per style and your preferred material direction.</p></div><div className={styles.quoteActions}><Link className={styles.primary} href={golfInquiryHref()}>Request a Golf Bag Quote</Link><a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a></div></section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
