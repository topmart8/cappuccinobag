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
    question: "Can I start with a small padel bag test order?",
    answer: "A compact entry-level padel backpack may be discussed from around 50 pcs when the construction, stock materials and branding method are suitable. More structured custom padel bags usually need a different order strategy, so MOQ is confirmed only after specification review.",
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

const priorities = [
  "Racket protection",
  "Separate shoe storage",
  "Durable performance materials",
  "Comfortable carry",
  "Private-label branding",
  "Order strategy matched to launch stage",
];

const programs = [
  {
    name: "Premium Padel Duffel",
    image: `${imageBase}/01-premium-padel-duffel-master-product.png`,
    width: 1402,
    height: 1122,
    alt: "Premium black custom padel duffel with racket and shoe storage",
    fit: "For established brands building a premium court and travel range.",
    features: ["Protected racket storage", "Separate shoe compartment", "Structured material and trim direction"],
    guidance: "Best for specification-led programs after sample approval.",
  },
  {
    name: "Padel Backpack",
    image: "/images/padel/hybrid-lifestyle-2026/PDB017/PDB017-hero.webp",
    width: 1400,
    height: 1400,
    alt: "Structured padel backpack with padded carry straps and organized storage",
    fit: "For brands wanting a versatile training, commute and travel format.",
    features: ["Padded backpack carry", "Dedicated racket zone", "Organized accessory pockets"],
    guidance: "Suitable for core retail collections and range extensions.",
  },
  {
    name: "Tournament / Club Bag",
    image: "/assets/padel-real-samples/hero-racket-bag-sample.jpg",
    width: 1280,
    height: 720,
    alt: "Racket sports tournament bag reference beside a court",
    fit: "For clubs, events and team programs that need visible capacity.",
    features: ["High-capacity main zone", "Racket and footwear separation", "Club-ready branding surfaces"],
    guidance: "Develop around the final load, event use and packing plan.",
  },
  {
    name: "Entry-Level Launch Program",
    image: `${imageBase}/08-entry-padel-backpack-50pcs.png`,
    width: 1122,
    height: 1402,
    alt: "Compact entry-level black padel backpack for a test launch",
    fit: "For new brands validating a simpler product before scaling.",
    features: ["Streamlined construction", "Storage for 1–2 rackets", "Focused logo and colour options"],
    guidance: "Around 50 pcs may be discussed, subject to specification review.",
    id: "entry-model",
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
  ["Dimensions", "/images/padel/PDB001/angles/PDB001-dimensions-31x38x15cm.webp", 1000, 1000, "Padel sample dimensions reference used during specification review"],
  ["Logo approval", "/assets/padel-real-samples/backpack-brand-panel-reference.jpg", 385, 545, "Padel bag brand panel and logo placement reference"],
  ["Packing", "/images/cappuccino-factory-bulk-production-poster.jpg", 1280, 720, "Bulk bag production and packing reference at the factory"],
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
    headline: "Custom Padel Bags Built for Growing Sports Brands",
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
            <h1>Custom Padel Bags Built for Growing Sports Brands</h1>
            <p>OEM &amp; ODM padel bag manufacturing for European and North American brands, with custom materials, private-label branding, structured storage and scalable production programs.</p>
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
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>What padel brands prioritize</p>
            <h2>Start With Function, Then Build the Brand</h2>
          </div>
          <ol className={styles.priorityList}>
            {priorities.map((priority, index) => <li key={priority}><span>{String(index + 1).padStart(2, "0")}</span><strong>{priority}</strong></li>)}
          </ol>
        </section>

        <section className={`${styles.section} ${styles.programSection}`} id="product-programs">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Product programs</p>
            <h2>Choose the Right Padel Bag Program</h2>
          </div>
          <div className={styles.programGrid}>
            {programs.map((program) => (
              <article className={styles.program} id={program.id} key={program.name}>
                <div className={styles.programImage}>
                  <Image src={program.image} width={program.width} height={program.height} sizes="(max-width: 760px) 100vw, 42vw" alt={program.alt} />
                </div>
                <div className={styles.programCopy}>
                  <h3>{program.name}</h3>
                  <p>{program.fit}</p>
                  <ul>{program.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                  <p className={styles.orderGuidance}>{program.guidance}</p>
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
            <p>Factory, sampling and product references make each checkpoint visible without implying unverified certifications.</p>
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
            <p className={styles.sectionLabel}>Padel bag manufacturing FAQ</p>
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
