import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import PadelHeader from "./PadelHeader";
import PadelRfqForm from "./PadelRfqForm";
import styles from "./page.module.css";

const siteUrl = "https://www.cappuccinobag.com";
const pagePath = "/racket-sports/padel-bags";
const imageBase = "/images/padel-bags";

export const metadata = {
  title: "Custom Padel Bag Manufacturer | OEM Padel Racket Bags",
  description: "OEM/ODM custom padel bags for European and North American sports brands, with private-label branding, material development, sampling, QC and scalable production.",
  alternates: { canonical: `${siteUrl}${pagePath}` },
  openGraph: {
    title: "Custom Padel Bag Manufacturer | OEM Padel Racket Bags",
    description: "OEM/ODM custom padel bags for European and North American sports brands, from entry launch programs to premium racket duffels.",
    url: `${siteUrl}${pagePath}`,
    type: "website",
    images: [{
      url: `${siteUrl}${imageBase}/02-padel-club-hero-lifestyle.png`,
      width: 1536,
      height: 1024,
      alt: "Premium padel bag beside a modern padel court",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Padel Bag Manufacturer | OEM Padel Racket Bags",
    description: "OEM/ODM custom padel bag programs for growing sports brands.",
    images: [`${siteUrl}${imageBase}/02-padel-club-hero-lifestyle.png`],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "How is the MOQ for a padel bag program determined?",
    answer: "MOQ is reviewed after the bag structure, materials, colour requirements, branding method and packaging are defined. A focused launch design may support a different production plan from a highly customized premium bag.",
  },
  {
    question: "Which materials suit premium padel bags?",
    answer: "Common directions include 1680D Oxford, recycled polyester, coated nylon, breathable mesh and vegan leather trim. The best choice depends on the target market, retail position, structure, colour requirements and planned quantity.",
  },
  {
    question: "What should I send before sampling?",
    answer: "Send your target quantity, market, reference design or tech pack, racket capacity, shoe-storage requirement, material direction, logo method, packaging needs and target timing. A clear brief helps the China manufacturing team review feasibility before quotation and sample development.",
  },
  {
    question: "How is quality checked before bulk production?",
    answer: "The approved sample and written specification establish the reference for dimensions, materials, racket fit, shoe compartment, construction, logo position, carry system and packing. Bulk-production checks are then planned against that agreed standard.",
  },
];

const partnershipReasons = [
  ["OEM/ODM development experience", "Turn a design brief, reference sample or early concept into a production-ready direction."],
  ["Flexible production programs", "Plan the product around the brand's launch stage, specification and approved materials."],
  ["Material sourcing support", "Compare practical fabric, trim, colour and branding options for the intended market."],
  ["Quality control", "Use the approved sample and written specification as the reference for production checks."],
  ["Long-term partnership", "Keep product decisions documented so future colours, formats and range extensions stay consistent."],
];

const programs = [
  {
    name: "Premium Club Series",
    image: `${imageBase}/01-premium-padel-duffel-master-product.png`,
    width: 1402,
    height: 1122,
    alt: "Premium black custom padel duffel with racket and shoe storage",
    buyer: "Established brands, clubs and specialist distributors",
    value: "A refined, high-capacity direction for premium court and travel collections.",
    features: ["Protected racket storage", "Separate footwear zone", "Structured materials and trims"],
  },
  {
    name: "Brand Launch Series",
    image: `${imageBase}/08-entry-padel-backpack-50pcs.png`,
    width: 1122,
    height: 1402,
    alt: "Compact black padel backpack for a focused brand launch program",
    buyer: "New and growing padel brands",
    value: "A focused starting point with controlled options and clear sample approval.",
    features: ["Streamlined construction", "Core private-label details", "Scalable range planning"],
  },
  {
    name: "Custom Development",
    image: `${imageBase}/07-oem-customization-swatch-table.png`,
    width: 1536,
    height: 1024,
    alt: "Padel bag development table with fabric, zipper, colour and branding options",
    buyer: "Product teams creating an original padel bag",
    value: "A specification-led route for a distinctive structure, material story and brand finish.",
    features: ["Material and trim direction", "Custom storage architecture", "Sample-led specification lock"],
  },
];

const productProof = ["Racket protection", "Shoe compartment", "Reinforced base", "Carry straps", "Zipper system", "Accessory storage"];

const specifications = [
  ["Materials", ["1680D Oxford", "Recycled polyester", "Coated nylon", "Vegan leather trim"]],
  ["Branding", ["Rubber patch", "Woven label", "Heat transfer", "Embroidery", "Custom zipper pull"]],
  ["Colour", ["Black", "Navy", "Forest green", "Custom Pantone direction"]],
  ["Function", ["Racket sleeves", "Shoe compartment", "Accessory pockets", "Carry configuration"]],
];

const processSteps = ["Brief Review", "Material & Structure Direction", "Sample Development", "Approval & QC Standard", "Bulk Production"];

const manufacturingProof = [
  ["Material inspection", "/site/assets/factory-qc-branded.webp", 1600, 900, "Factory team reviewing bag materials and construction"],
  ["Construction review", "/images/padel/PDB001/real-sample-reference/PDB001-real-sample-zipper-and-interior.webp", 1400, 1400, "Approved padel sample zipper and interior construction reference"],
  ["Approved sample reference", "/images/padel/PDB001/real-sample-reference/PDB001-real-sample-front-angle.webp", 1400, 1400, "Approved physical bag sample shown from the front angle"],
];

const relatedLinks = [
  ["Tennis Bags", "/custom-tennis-bag-manufacturer"],
  ["Pickleball Bags", "/custom-pickleball-paddle-bags"],
  ["Outdoor & Hiking", "/custom-outdoor-sports-bag-manufacturer"],
  ["Travel Bags", "/custom-travel-backpacks-weekender-bags"],
  ["Custom Bag Manufacturing", "/oem-odm-bag-manufacturer"],
  ["Case Studies", "/case-studies"],
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Custom Padel Bags for European and North American Sports Brands",
    headline: "Your Padel Bag Development Partner",
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
      <PadelHeader />
      <main className={`${styles.page} padel-bags-page`}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/custom-tennis-padel-racket-bags">Racket Sports</Link><span aria-hidden="true">/</span><span>Padel Bags</span>
            </nav>
            <h1>Your Padel Bag Development Partner</h1>
            <p>From material direction to an approved production sample, Cappuccino helps sports brands build considered padel bag collections for their market and growth plan.</p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href="#padel-rfq">Request a Custom Quote</a>
              <a className={styles.secondaryButton} href="#product-programs">Explore Padel Bag Programs</a>
            </div>
          </div>
          <div className={styles.heroMedia}>
            <Image src={`${imageBase}/02-padel-club-hero-lifestyle.png`} fill priority sizes="(max-width: 800px) 100vw, 52vw" alt="Premium padel bag beside a modern padel court" />
          </div>
        </section>

        <section className={`${styles.section} ${styles.prioritySection}`}>
          <div className={styles.partnershipLayout}>
            <div className={styles.sectionIntro}>
              <p className={styles.sectionLabel}>A considered manufacturing partnership</p>
              <h2>Why Brands Work With Cappuccino</h2>
              <p>Clear decisions at development stage create a stronger product and a more consistent path into production.</p>
            </div>
            <div className={styles.partnershipReasons}>
              {partnershipReasons.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.programSection}`} id="product-programs">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Product programs</p>
            <h2>Three Ways to Build Your Range</h2>
          </div>
          <div className={styles.programGrid}>
            {programs.map((program) => (
              <article className={styles.program} key={program.name}>
                <div className={styles.programImage}>
                  <Image src={program.image} width={program.width} height={program.height} sizes="(max-width: 760px) 100vw, 33vw" alt={program.alt} />
                </div>
                <div className={styles.programCopy}>
                  <h3>{program.name}</h3>
                  <p className={styles.suitableBuyer}><span>Suitable for</span>{program.buyer}</p>
                  <p>{program.value}</p>
                  <ul>{program.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.productProofSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Product proof</p>
            <h2>Designed Around Real Padel Use</h2>
          </div>
          <div className={styles.proofLayout}>
            <div className={styles.proofImage}>
              <Image src={`${imageBase}/03-compartment-organization-proof.png`} width={1402} height={1122} sizes="(max-width: 800px) 100vw, 55vw" alt="Open padel bag showing protected racket, shoe and accessory storage" />
            </div>
            <ol className={styles.proofList}>
              {productProof.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
            </ol>
          </div>
        </section>

        <section className={`${styles.section} ${styles.customSection}`}>
          <div className={styles.customHeading}>
            <div className={styles.sectionIntro}>
              <p className={styles.sectionLabel}>OEM materials &amp; customization</p>
              <h2>Build the Product Around Your Brand</h2>
              <p>Align material, branding and function with the target market before the sample becomes the production reference.</p>
            </div>
            <div className={styles.customImages}>
              <Image src={`${imageBase}/05-1680d-material-zipper-detail.png`} width={1402} height={1122} sizes="(max-width: 800px) 100vw, 32vw" alt="1680D Oxford fabric, zipper and trim detail for a custom padel bag" />
              <Image src={`${imageBase}/07-oem-customization-swatch-table.png`} width={1536} height={1024} sizes="(max-width: 800px) 100vw, 32vw" alt="Custom padel bag fabric, colour, zipper and logo swatches" />
            </div>
          </div>
          <dl className={styles.specificationGrid}>
            {specifications.map(([title, values]) => <div key={title}><dt>{title}</dt><dd>{values.map((value) => <span key={value}>{value}</span>)}</dd></div>)}
          </dl>
        </section>

        <section className={`${styles.section} ${styles.processSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>From brief to bulk production</p>
            <h2>A Clear Route From Direction to Delivery</h2>
          </div>
          <ol className={styles.processList}>
            {processSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>)}
          </ol>
        </section>

        <section className={`${styles.section} ${styles.manufacturingSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Quality &amp; manufacturing proof</p>
            <h2>Approve the Details That Control Production</h2>
            <p>Each checkpoint stays tied to the approved sample and written specification.</p>
          </div>
          <div className={styles.manufacturingGrid}>
            {manufacturingProof.map(([caption, src, width, height, alt]) => (
              <figure key={caption}>
                <Image src={src} width={width} height={height} sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw" alt={alt} />
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.relatedSection}`}>
          <p className={styles.sectionLabel}>Related manufacturing options</p>
          <nav className={styles.relatedLinks} aria-label="Related manufacturing options">
            {relatedLinks.map(([label, href]) => <Link href={href} key={href} prefetch={false}><span>{label}</span><span aria-hidden="true">↗</span></Link>)}
          </nav>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`}>
          <div className={styles.sectionIntro}>
            <h2>Padel Bag Manufacturing FAQ</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </section>

        <section className={`${styles.section} ${styles.rfqSection}`} id="padel-rfq">
          <div className={styles.rfqIntro}>
            <p className={styles.sectionLabel}>Project RFQ</p>
            <h2>Start Your Padel Bag Project</h2>
            <p>Tell us your target quantity, material direction, logo method, target market and reference design. We review the construction before confirming MOQ, sampling plan and quotation.</p>
            <div className={styles.contactLinks}>
              <a href="https://wa.me/8613928715568?text=Hello%20Cappuccino%20Bag.%20I%20need%20an%20OEM%20padel%20bag%20quote." target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a>
              <a href="mailto:info@cappuccinobag.net?subject=OEM%20Padel%20Bag%20RFQ">Email <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <PadelRfqForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
