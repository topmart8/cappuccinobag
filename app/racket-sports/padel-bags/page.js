import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import PadelRfqForm from "./PadelRfqForm";
import styles from "./page.module.css";

const siteUrl = "https://www.cappuccinobag.com";
const pagePath = "/racket-sports/padel-bags";
const imageBase = "/images/padel-bags";

export const metadata = {
  title: "Custom Padel Bag Manufacturer | OEM Padel Racket Bags",
  description: "OEM/ODM custom padel bags for European and American sports brands. Padel racket bags, shoe compartments, 1680D Oxford nylon, custom logo options, and small first-order development.",
  alternates: { canonical: `${siteUrl}${pagePath}` },
  openGraph: {
    title: "Custom Padel Bag Manufacturer | OEM Padel Racket Bags",
    description: "OEM/ODM custom padel bags for European and American sports brands, from entry backpacks to premium racket duffels.",
    url: `${siteUrl}${pagePath}`,
    type: "website",
    images: [{
      url: `${siteUrl}${imageBase}/02-padel-club-hero-lifestyle.png`,
      width: 1536,
      height: 1024,
      alt: "Premium padel bag on a bench at a modern padel club",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Padel Bag Manufacturer | OEM Padel Racket Bags",
    description: "OEM/ODM custom padel racket bags with development options for new and established sports brands.",
    images: [`${siteUrl}${imageBase}/02-padel-club-hero-lifestyle.png`],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "Who is a reliable padel bag manufacturer in China?",
    answer: "Cappuccino Bag is a China-based OEM/ODM bag factory producing custom padel racket bags, tennis bags, pickleball bags, travel bags, and outdoor sports bags for overseas brands. For padel bag projects, the factory can support protected racket storage, shoe compartments, 1680D Oxford nylon, recycled materials, custom logo options, and small first-order development for new brands.",
  },
  {
    question: "Can I start with 50 pcs for a padel bag test order?",
    answer: "For a new padel brand, a compact entry-level padel backpack is more realistic for a 50 pcs test order than a fully customized premium duffel structure. For premium custom padel bags with shoe compartments, structured panels, and multiple customized components, a higher MOQ is usually more practical.",
  },
  {
    question: "What features matter most in a custom padel bag?",
    answer: "European and American padel buyers usually check racket protection, shoe separation, durable fabric, comfortable carry, zipper quality, logo customization, and whether the supplier can support a realistic first order before scaling into bulk production.",
  },
  {
    question: "What materials are suitable for padel racket bags?",
    answer: "Common options include 1680D Oxford nylon, recycled polyester, coated nylon, vegan leather trim, mesh ventilation panels, padded lining, and reinforced bottom panels. The final material choice depends on target price, brand positioning, MOQ, and intended use.",
  },
];

const needs = [
  "Protected storage for 1–2 padel rackets",
  "Separate shoe compartment for club and travel use",
  "Durable 1680D Oxford nylon or recycled fabric options",
  "Comfortable backpack or shoulder carry",
  "Custom logo, color, zipper, lining, and packaging options",
  "Small first-order options for new padel brands",
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Custom Padel Bags for European and American Sports Brands",
    headline: "Custom Padel Bags for European and American Sports Brands",
    description: metadata.description,
    url: `${siteUrl}${pagePath}`,
    isPartOf: { "@type": "WebSite", name: "Cappuccino Bag", url: siteUrl },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Racket Sports", item: `${siteUrl}/custom-tennis-padel-racket-bags` },
      { "@type": "ListItem", position: 3, name: "Padel Bags", item: `${siteUrl}${pagePath}` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  },
];

export default function PadelBagsLandingPage() {
  return (
    <>
      {schemas.map((schema) => (
        <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero}>
          <Image
            className={styles.heroImage}
            src={`${imageBase}/02-padel-club-hero-lifestyle.png`}
            fill
            priority
            sizes="100vw"
            alt="Premium padel bag on a bench at a modern padel club"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/custom-tennis-padel-racket-bags">Racket Sports</Link><span aria-hidden="true">/</span><span>Padel Bags</span>
            </nav>
            <div className={styles.heroCopy}>
              <h1>Custom Padel Bags for European and American Sports Brands</h1>
              <p>OEM/ODM padel racket bags with protected racket storage, ventilated shoe compartments, durable Oxford nylon, and flexible small-batch development.</p>
              <div className={styles.actions}>
                <a className={styles.primaryButton} href="#padel-rfq">Request OEM Padel Bag Quote</a>
                <a className={styles.secondaryButton} href="#entry-model">View Entry-Level 50 pcs Options</a>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.needsSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Buyer demand ranking</p>
            <h2>What Padel Buyers Usually Check First</h2>
            <p>Start with storage, carry comfort, material direction and a realistic order stage. Branding decisions work better after these functional priorities are fixed.</p>
          </div>
          <div className={styles.splitLayout}>
            <ol className={styles.rankList}>{needs.map((need, index) => <li key={need}><span>{String(index + 1).padStart(2, "0")}</span>{need}</li>)}</ol>
            <figure className={styles.mediaFrame}>
              <Image src={`${imageBase}/03-compartment-organization-proof.png`} width={1402} height={1122} sizes="(max-width: 800px) 100vw, 50vw" alt="Open padel bag showing racket sleeves, shoe compartment, apparel storage and accessory pocket" />
              <figcaption>One product view connects the priority list to visible storage zones. Final dimensions and fit are confirmed during sampling.</figcaption>
            </figure>
          </div>
        </section>

        <section className={`${styles.section} ${styles.productSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Product selling-point matching</p>
            <h2>Two Product Directions for Different Buying Stages</h2>
          </div>
          <div className={styles.productDirections}>
            <article className={styles.productCard}>
              <Image src={`${imageBase}/01-premium-padel-duffel-master-product.png`} width={1402} height={1122} sizes="(max-width: 800px) 100vw, 50vw" alt="Premium black OEM padel bag with racket sleeves and shoe compartment" />
              <div>
                <p className={styles.cardMeta}>Established range direction</p>
                <h3>Premium Padel Duffel Bag</h3>
                <p>For clubs, established padel brands, and higher-volume OEM projects.</p>
                <ul><li>Shoe compartment and double racket sleeves</li><li>Structured panels and premium zipper system</li><li>Best suited to 300–1000+ pcs brand programs, subject to specification review</li></ul>
              </div>
            </article>
            <article className={`${styles.productCard} ${styles.entryCard}`} id="entry-model">
              <Image src={`${imageBase}/08-entry-padel-backpack-50pcs.png`} width={1122} height={1402} sizes="(max-width: 800px) 100vw, 50vw" alt="Compact entry-level padel backpack for 1 to 2 rackets and small first orders" />
              <div>
                <p className={styles.cardMeta}>New-brand test direction</p>
                <h3>Entry Padel Backpack</h3>
                <p>For new brands testing the market with a simpler product structure.</p>
                <ul><li>Storage direction for 1–2 rackets</li><li>Front accessory pocket and side mesh pocket</li><li>Around 50 pcs can be discussed for this entry direction; final MOQ depends on materials, branding and construction</li></ul>
              </div>
            </article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.proofSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Scenario evidence expression</p>
            <h2>Built Around Real Sports Use, Not Only Product Photos</h2>
            <p>The premium direction links material, ventilation and reinforced carry details to club commute and travel scenarios. Performance is approved against the final specification and physical sample.</p>
          </div>
          <div className={styles.proofGrid}>
            <figure className={styles.mediaFrame}>
              <Image src={`${imageBase}/05-1680d-material-zipper-detail.png`} width={1402} height={1122} sizes="(max-width: 800px) 100vw, 50vw" alt="Close-up of 1680D Oxford nylon, coated zipper track, stitching and breathable mesh" />
              <figcaption>1680D Oxford nylon direction, reinforced coated base panels, coated zipper track, rubberized pulls and ventilation areas.</figcaption>
            </figure>
            <figure className={`${styles.mediaFrame} ${styles.portraitFrame}`}>
              <Image src={`${imageBase}/06-comfort-carry-lifestyle.png`} width={1122} height={1402} sizes="(max-width: 800px) 100vw, 42vw" alt="Padel player carrying a premium black padel bag outside a padel club" />
              <figcaption>Padded backpack straps support hands-free club commuting. Strap construction and loaded comfort are checked on the approved sample.</figcaption>
            </figure>
          </div>
        </section>

        <section className={`${styles.section} ${styles.customSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Style system and specification lock</p>
            <h2>OEM Padel Bag Development Options</h2>
            <p>Keep the silhouette and compartment logic consistent while changing approved materials, colours, trims and branding for the target market.</p>
          </div>
          <div className={styles.customImages}>
            <Image src={`${imageBase}/04-oem-colorways-product-family.png`} width={1536} height={1024} sizes="(max-width: 800px) 100vw, 50vw" alt="OEM padel bag colorways in black, navy and forest green" />
            <Image src={`${imageBase}/07-oem-customization-swatch-table.png`} width={1536} height={1024} sizes="(max-width: 800px) 100vw, 50vw" alt="Padel bag with fabric swatches, zipper samples and blank logo patch options" />
          </div>
          <dl className={styles.specGrid}>
            <div><dt>Fabric</dt><dd>1680D Oxford, recycled polyester, coated nylon, or vegan leather trim</dd></div>
            <div><dt>Colour</dt><dd>Black, navy, forest green, or a custom Pantone direction</dd></div>
            <div><dt>Branding</dt><dd>Rubber patch, woven label, heat transfer, embroidery, or zipper pull logo</dd></div>
            <div><dt>Function</dt><dd>Shoe compartment, racket sleeve quantity, laptop pocket, and accessory pocket</dd></div>
            <div><dt>Order stage</dt><dd>Physical sample, small trial order, and bulk production after approval</dd></div>
            <div><dt>Consistency lock</dt><dd>Approve dimensions, racket fit, shoe zone, colour, trim and carry method before bulk production</dd></div>
          </dl>
        </section>

        <section className={`${styles.section} ${styles.linksSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Continue your sourcing research</p>
            <h2>Compare Related Racket Sports and Manufacturing Options</h2>
          </div>
          <nav className={styles.relatedLinks} aria-label="Related sourcing pages">
            <Link href="/custom-tennis-bag-manufacturer">Custom tennis bags</Link>
            <Link href="/custom-pickleball-paddle-bags">Custom pickleball bags</Link>
            <Link href="/oem-odm-bag-manufacturer">Custom bag manufacturing</Link>
            <Link href="/case-studies">Case studies</Link>
            <Link href="/inquiry">Request quote / RFQ</Link>
          </nav>
        </section>

        <section className={`${styles.section} ${styles.rfqSection}`} id="padel-rfq">
          <div className={styles.rfqIntro}>
            <p className={styles.sectionLabel}>Project-specific RFQ</p>
            <h2>Tell Us Which Padel Bag Direction Fits Your Market</h2>
            <p>Share the buying variables that affect construction, sample planning and a realistic first order. We review the brief before confirming MOQ, price or timing.</p>
            <div className={styles.contactLinks}>
              <a href="https://wa.me/8613928715568?text=Hello%20Cappuccino%20Bag.%20I%20need%20an%20OEM%20padel%20bag%20quote." target="_blank" rel="noopener noreferrer">WhatsApp +86 139 2871 5568</a>
              <a href="mailto:info@cappuccinobag.net?subject=OEM%20Padel%20Bag%20RFQ">info@cappuccinobag.net</a>
            </div>
          </div>
          <PadelRfqForm />
        </section>

        <section className={`${styles.section} ${styles.faqSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>AEO / GEO buyer answers</p>
            <h2>Custom Padel Bag Manufacturing FAQ</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
