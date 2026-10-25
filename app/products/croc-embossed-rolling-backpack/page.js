import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { faqs, features, images, inquiryHref, productName, productPath, siteUrl, specifications, whatsappHref } from "./data";
import styles from "./page.module.css";

const canonical = `${siteUrl}${productPath}`;
const title = "Custom Croc-Embossed Rolling Backpack | Cappuccino Bag";
const description = "Develop a custom croc-embossed rolling backpack with Cappuccino Bag. Explore black and ivory designs, logo options, laptop storage and OEM/ODM sampling.";

export const metadata = {
  title, description,
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: canonical, type: "website", images: [{ url: `${siteUrl}${images[0].src}`, width: 1536, height: 1024, alt: images[0].alt }] },
  twitter: { card: "summary_large_image", title, description, images: [`${siteUrl}${images[0].src}`] },
};

const company = { "@type": "Organization", name: "Guangzhou Cappuccino Leather Handbag Co., Ltd.", alternateName: "Cappuccino Bag", url: siteUrl, email: "info@cappuccinobag.net" };
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: productName, description, datePublished: "2026-10-25", dateModified: "2026-10-25", inLanguage: "en", publisher: company, primaryImageOfPage: { "@type": "ImageObject", url: `${siteUrl}${images[0].src}`, caption: "AI-assisted product design visualization" }, mainEntity: { "@id": `${canonical}#development` } },
    { "@type": "Service", "@id": `${canonical}#development`, name: "Custom Croc-Embossed Rolling Backpack OEM/ODM Development", serviceType: "Private-label bag design, sampling and manufacturing", provider: company, url: canonical, description: "Project-specific development of a croc-embossed rolling backpack. Materials, dimensions, minimums, price and production timing are confirmed by quotation and sample approval." },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Travel Bags", item: `${siteUrl}/custom-travel-backpacks-weekender-bags` },
      { "@type": "ListItem", position: 3, name: productName, item: canonical },
    ] },
    { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ],
};

function Actions() {
  return <div className={styles.actions}><Link className={styles.primary} href={inquiryHref}>Request a Custom Quote</Link><a className={styles.secondary} href={whatsappHref}>Discuss on WhatsApp</a></div>;
}

export default function RollingBackpackPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <SiteHeader />
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/custom-travel-backpacks-weekender-bags">Travel Bags</Link><span>/</span><span>Rolling Backpack</span></nav>
      <article>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Private Label · OEM / ODM</p>
            <h1>{productName}</h1>
            <p className={styles.tagline}>The Look of a Handbag.<br />The Freedom to Roll.</p>
            <p>A handbag-inspired travel concept with crocodile-effect texture, gold-tone details and a versatile carry system. Develop the colors, materials and organization around your brand.</p>
            <ul className={styles.highlights}><li>Black &amp; ivory design directions</li><li>Pull, lift or carry as a backpack</li><li>Custom logo &amp; interior development</li></ul>
            <Actions />
            <p className={styles.note}>Made-to-order development. Specifications, MOQ and timing are confirmed for your project.</p>
          </div>
          <figure className={styles.heroVisual}><Image src={images[0].src} alt={images[0].alt} width={1536} height={1024} sizes="(max-width: 900px) 100vw, 57vw" priority /><figcaption>AI-assisted design visualization · Final details subject to sample approval.</figcaption></figure>
        </header>

        <section className={styles.section} aria-labelledby="overview">
          <p className={styles.eyebrow}>The product at a glance</p>
          <h2 id="overview">What can your brand develop?</h2>
          <p className={styles.lead}>Cappuccino Bag offers OEM/ODM development for a croc-embossed rolling backpack aimed at work and travel collections. The reference design brings together a structured flap, front zip pocket, side pockets, backpack straps and a four-wheel trolley layout. Choose the base material, size, laptop compartment and branding before the physical sample is approved.</p>
          <div className={styles.featureGrid}>{features.map(([heading, text], index) => <section key={heading}><span className={styles.number}>0{index + 1}</span><h3>{heading}</h3><p>{text}</p></section>)}</div>
        </section>

        <section className={styles.gallery} aria-label="Product design gallery">{images.slice(1).map((item) => <figure key={item.src}><a href={item.src} aria-label={`View full image: ${item.alt}`}><Image src={item.src} alt={item.alt} width={1536} height={1024} sizes="(max-width: 760px) 100vw, 50vw" /></a><figcaption>{item.caption}</figcaption></figure>)}</section>

        <section className={styles.section} aria-labelledby="specifications">
          <p className={styles.eyebrow}>Procurement snapshot</p>
          <h2 id="specifications">Which specifications need to be confirmed?</h2>
          <p>The visual concept establishes the style. The approved sample and bill of materials establish the production specification.</p>
          <table className={styles.specs}><caption>Custom rolling backpack development specifications</caption><tbody>{specifications.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>
        </section>

        <section className={`${styles.section} ${styles.soft}`} aria-labelledby="customization">
          <p className={styles.eyebrow}>From concept to your collection</p>
          <h2 id="customization">How do we develop your private-label version?</h2>
          <ol className={styles.steps}>
            <li><h3>Define the brief</h3><p>Share the target customer, sales channel, quantity per color, budget, destination and launch window.</p></li>
            <li><h3>Select the construction</h3><p>Review embossing, base material, lining, pocket layout, laptop dimensions, wheel system, frame and strap storage.</p></li>
            <li><h3>Approve a physical sample</h3><p>Check appearance, usable space, loaded stability, wheel movement, handle operation, stitching and carry comfort.</p></li>
            <li><h3>Confirm the production order</h3><p>Agree the approved specification, branding, packaging, inspection criteria, quotation and delivery terms.</p></li>
          </ol>
          <div className={styles.related}><Link href="/moq-sampling-faq">MOQ &amp; sampling guide</Link><Link href="/quality-inspection-guide">Quality inspection guide</Link><Link href="/factory-trust-materials">Factory &amp; material evidence</Link></div>
        </section>

        <section className={styles.section} aria-labelledby="trend">
          <p className={styles.eyebrow}>Design context · 25 October 2026</p>
          <h2 id="trend">Why explore texture and wheeled carry together?</h2>
          <p>Croc-embossed bags feature in <a href="https://www.vogue.co.uk/article/autumn-winter-2026-bag-trends">British Vogue&apos;s autumn/winter 2026 bag-trend coverage</a>. Separately, established travel brands offer rolling backpack formats, including <a href="https://www.samsonite.com.au/backpacks/guardit-3-backpack-wheeled.html">Samsonite&apos;s Guardit 3 wheeled laptop backpack</a>. These are two distinct market signals: decorative texture and practical wheeled carry.</p>
          <p>Our design interpretation brings those directions into one private-label concept for women&apos;s work and travel collections. A fashion trend and existing competitor products do not establish demand or sales for this particular model; validate price, weight and usability with your target buyers.</p>
          <p className={styles.note}>Sources reviewed 25 October 2026. Competitor references provide category context and do not imply affiliation or equivalent specifications.</p>
        </section>

        <section className={styles.section} aria-labelledby="faq"><p className={styles.eyebrow}>Buyer questions</p><h2 id="faq">Custom rolling backpack FAQ</h2><div className={styles.faqs}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

        <section className={styles.cta} aria-labelledby="quote"><p className={styles.eyebrow}>Build it around your brand</p><h2 id="quote">Bring your next travel collection into focus.</h2><p>Send your quantity per color, material direction, target dimensions and logo. We will review the development route and prepare a project-specific quotation.</p><Actions /><a className={styles.email} href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a></section>
        <footer className={styles.byline}><p>Published by <Link href="/about-us">Guangzhou Cappuccino Leather Handbag Co., Ltd.</Link> · <time dateTime="2026-10-25">25 October 2026</time></p><p>Initial release: black and ivory concept visuals, customization scope and buyer FAQ.</p><nav className={styles.related} aria-label="Related travel products"><Link href="/custom-travel-backpacks-weekender-bags">Travel bag collection</Link><Link href="/custom-laptop-travel-backpack">Laptop travel backpacks</Link><Link href="/products">All product collections</Link></nav></footer>
      </article>
    </main>
    <SiteFooter />
  </>;
}
