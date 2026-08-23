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
  title: "Custom Padel Bags Collection | Racket Bags, Backpacks & Duffels",
  description: "Explore custom padel racket bags, backpacks, duffels, totes and shoe bags. Compare storage, carry systems, materials and private-label design options.",
  alternates: { canonical: `${siteUrl}${pagePath}` },
  openGraph: {
    title: "Custom Padel Bags Collection | Racket Bags, Backpacks & Duffels",
    description: "Compare custom padel bag formats, storage layouts, carry systems and private-label design options for a focused product range.",
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
    title: "Custom Padel Bags Collection | Racket Bags, Backpacks & Duffels",
    description: "Explore custom padel bag formats and shortlist a product direction for your brand.",
    images: [`${siteUrl}${imageBase}/02-padel-club-hero-lifestyle.png`],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "What types of custom padel bags can brands develop?",
    answer: "Brands can develop racket duffels, backpacks, totes, sling bags, shoe bags and organizers. The right format depends on racket capacity, footwear separation, carried accessories, travel needs and the intended retail position.",
  },
  {
    question: "How should buyers choose between a padel duffel and backpack?",
    answer: "A duffel supports higher capacity and broad compartment access, while a backpack prioritizes hands-free carry and a more compact profile. Buyers should compare racket count, shoe storage, clothing volume and travel use before shortlisting a format.",
  },
  {
    question: "Which compartments are useful in a custom padel racket bag?",
    answer: "Common choices include protected racket storage, a ventilated shoe section, wet or dry separation, bottle storage, accessory pockets and an optional laptop sleeve. The layout should reflect the buyer's intended player and carry scenario.",
  },
  {
    question: "What can be customized across a padel bag collection?",
    answer: "Material, colour, lining, pocket layout, racket and shoe storage, straps, hardware, zipper pulls, logo execution, labels and packaging can be reviewed against the selected format and target market.",
  },
  {
    question: "How does a product shortlist become an OEM project?",
    answer: "After choosing a format, buyers can send the intended quantity, target market, functions, material direction, branding and reference images to the padel bag manufacturer for specification, MOQ and sampling review.",
  },
];

const selectionCriteria = [
  ["Player load", "List the racket count, shoes, clothing, balls, bottle and accessories the bag must organize."],
  ["Carry scenario", "Decide whether the buyer needs court-only carry, club travel, commuting or a hybrid lifestyle format."],
  ["Bag structure", "Compare a high-capacity duffel, compact backpack, tote, sling or supporting accessory."],
  ["Design language", "Coordinate colour blocking, material hand feel, trims and logo placement across the range."],
  ["Range logic", "Choose one anchor product and supporting formats instead of repeating the same storage layout."],
];

const programs = [
  {
    name: "Padel Racket Duffels",
    image: `${imageBase}/01-premium-padel-duffel-master-product.png`,
    width: 1402,
    height: 1122,
    alt: "Premium black custom padel duffel with racket and shoe storage",
    buyer: "Players carrying multiple rackets, shoes and clothing",
    value: "A high-capacity direction with wide access for court, club and tournament travel.",
    features: ["Protected racket storage", "Separate footwear zone", "Structured materials and trims"],
    products: [
      ["S001 · Performance 60L Padel Racket Duffel", "/padel-bags/custom-60l-padel-racket-duffel"],
    ],
  },
  {
    name: "Padel Backpacks",
    image: `${imageBase}/08-entry-padel-backpack-50pcs.png`,
    width: 1122,
    height: 1402,
    alt: "Compact black padel backpack for a focused brand launch program",
    buyer: "Players prioritizing compact hands-free carry",
    value: "A focused format for racket protection, daily essentials and easier movement between locations.",
    features: ["Streamlined construction", "Core private-label details", "Scalable range planning"],
    products: [
      ["S002 · Urban 30L Padel Backpack", "/padel-bags/custom-30l-padel-backpack"],
      ["PDB001 · Padel Work Tote Backpack", "/products/padel-work-tote-backpack-pdb001"],
      ["PDB017 · Travel Court Utility Backpack", "/products/travel-padel-utility-backpack-pdb017"],
    ],
  },
  {
    name: "Totes & Hybrid Lifestyle Bags",
    image: `${imageBase}/04-oem-colorways-product-family.png`,
    width: 1536,
    height: 1024,
    alt: "Custom padel bag product family in coordinated OEM colourways",
    buyer: "Court-to-office and lifestyle collections",
    value: "A lighter direction that combines racket storage with work, travel or everyday organization.",
    features: ["Material and trim direction", "Custom storage architecture", "Sample-led specification lock"],
    products: [
      ["PDB014 · Women’s Court Chic Tote", "/products/womens-lightweight-padel-tote-pdb014"],
      ["PDB015 · Work-Court Commuter Tote", "/products/work-court-padel-commuter-tote-pdb015"],
      ["PDB016 · Weekend Match Carryall", "/products/weekend-padel-carryall-pdb016"],
    ],
  },
];

const formatComparison = [
  {
    format: "Racket bag",
    href: "/products/premium-padel-racket-bag",
    use: "Streamlined court carry focused on racket protection",
    rackets: "Dedicated racket storage; confirm fit with the intended rackets",
    shoes: "Usually omitted where a compact silhouette is the priority",
    suitability: "Focused club, retail and player programs",
  },
  {
    format: "Padel duffel",
    href: "/padel-bags/custom-60l-padel-racket-duffel",
    use: "Court, club and tournament loads with clothing and accessories",
    rackets: "Higher-capacity racket storage; confirm fit with the intended rackets",
    shoes: "A dedicated footwear zone can be built into the layout",
    suitability: "Club, tournament and short-travel programs",
  },
  {
    format: "Padel backpack",
    href: "/padel-bags/custom-30l-padel-backpack",
    use: "Compact hands-free carry for training, commuting and daily club use",
    rackets: "Compact racket load; confirm head, handle and zipper clearance",
    shoes: "Optional side or base storage depends on the target bag size",
    suitability: "Urban, entry-range and daily training programs",
  },
  {
    format: "Tote or carryall",
    href: "/products/weekend-padel-carryall-pdb016",
    use: "Office-to-court, lifestyle and weekend carry",
    rackets: "Use a dedicated sleeve or pocket and verify the intended load in sampling",
    shoes: "Separate shoe storage is optional where the structure allows it",
    suitability: "Lifestyle, resort and work-to-court collections",
  },
  {
    format: "Shoe bag",
    href: "/padel-accessories/custom-ventilated-padel-shoe-bag",
    use: "Keep footwear separate from rackets, clothing and clean items",
    rackets: "Not intended for racket storage",
    shoes: "The primary function; lining and ventilation follow the use case",
    suitability: "Club kits, tournament packs and coordinated accessory ranges",
  },
  {
    format: "Organizer pouch",
    href: "/padel-accessories/custom-padel-organizer-pouch",
    use: "Group grips, balls, valuables and small court accessories",
    rackets: "Not intended for racket storage",
    shoes: "Not intended for footwear",
    suitability: "Accessory programs and range extensions",
  },
];

const productProof = ["Racket protection", "Shoe compartment", "Reinforced base", "Carry straps", "Zipper system", "Accessory storage"];

const specifications = [
  ["Materials", ["1680D Oxford", "Recycled polyester", "Coated nylon", "Vegan leather trim"]],
  ["Branding", ["Rubber patch", "Woven label", "Heat transfer", "Embroidery", "Custom zipper pull"]],
  ["Colour", ["Black", "Navy", "Forest green", "Custom Pantone direction"]],
  ["Function", ["Racket sleeves", "Shoe compartment", "Accessory pockets", "Carry configuration"]],
];

const shortlistSteps = [
  ["Define the use case", "Choose club, tournament, travel, commuter or lifestyle use."],
  ["Choose the format", "Compare duffel, backpack, tote, sling and accessory directions."],
  ["Map the storage", "Prioritize rackets, shoes, clothing, bottle, balls, laptop and small items."],
  ["Set the design direction", "Align materials, colour blocking, trims, carry and branding."],
  ["Prepare the project brief", "Send the shortlist to the manufacturer for specification and sampling review."],
];

const comparisonChecks = [
  ["Racket fit", "Compare racket count, opening shape, padding and protection placement."],
  ["Shoe separation", "Decide whether footwear needs ventilation, lining or a removable divider."],
  ["Carry system", "Review handles, shoulder straps and backpack straps for the intended load."],
  ["Organization", "Map quick-access pockets, bottle storage, clothing and small accessories."],
  ["Range extension", "Check whether colours and details can translate into related formats."],
];

const manufacturingProof = [
  ["Carry-system review", `${imageBase}/06-comfort-carry-lifestyle.png`, 1122, 1402, "Padel backpack carry system shown in real court use"],
  ["Construction checking", "/images/padel/PDB001/real-sample-reference/PDB001-real-sample-zipper-and-interior.webp", 1400, 1400, "Physical padel bag sample zipper and interior construction reference"],
  ["Sample confirmation", "/images/padel/PDB001/real-sample-reference/PDB001-real-sample-front-angle.webp", 1400, 1400, "Approved physical bag sample shown from the front angle"],
];

const relatedLinks = [
  ["Racquet Sports Bag Overview", "/custom-tennis-padel-racket-bags"],
  ["Padel Bag Manufacturer", "/custom-padel-bag-manufacturer"],
  ["Tennis Bags", "/custom-tennis-bag-manufacturer"],
  ["Pickleball Bags", "/custom-pickleball-paddle-bags"],
  ["All Product Collections", "/products"],
  ["Materials & Factory Proof", "/factory-trust-materials"],
  ["Case Studies", "/case-studies"],
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Custom Padel Bags Collection",
    headline: "Custom Padel Racket Bags, Backpacks, Duffels and Totes",
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
            <h1>Custom Padel Bags: Racket Bags, Backpacks &amp; Duffels</h1>
            <p>Compare padel racket duffels, backpacks, totes, shoe bags and organizers by storage layout, carry system, materials and private-label design potential.</p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href="#padel-rfq">Request a Quote</a>
              <a className={styles.secondaryButton} href="#product-programs">Explore Padel Bag Formats</a>
            </div>
          </div>
          <div className={styles.heroMedia}>
            <Image src={`${imageBase}/02-padel-club-hero-lifestyle.png`} fill priority sizes="(max-width: 800px) 100vw, 52vw" alt="Premium padel bag beside a modern padel court" />
          </div>
        </section>

        <section className={`${styles.section} ${styles.prioritySection}`}>
          <div className={styles.partnershipLayout}>
            <div className={styles.sectionIntro}>
              <p className={styles.sectionLabel}>Answer first</p>
              <h2>What Types of Custom Padel Bags Can Brands Develop?</h2>
              <p>Brands can develop racket duffels, backpacks, totes, slings, shoe bags and organizers. Start with the player load and carry scenario, then compare format, compartments and design direction.</p>
            </div>
            <div className={styles.partnershipReasons}>
              {selectionCriteria.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.programSection}`} id="product-programs">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Product discovery</p>
            <h2>Compare Three Core Padel Bag Formats</h2>
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
                  <div className={styles.programProducts} aria-label={`${program.name} product pages`}>
                    {program.products.map(([label, href]) => <Link key={href} href={href}>{label}<span aria-hidden="true">→</span></Link>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.comparisonSection}`} aria-labelledby="padel-format-comparison">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Format comparison</p>
            <h2 id="padel-format-comparison">Which Padel Bag Format Fits the Buyer Program?</h2>
            <p>Choose the format from the intended load and carry routine. Racket and shoe fit still need confirmation with the target equipment during sampling.</p>
          </div>
          <div className={styles.comparisonTableWrap} tabIndex="0" role="region" aria-label="Scrollable padel bag format comparison">
            <table className={styles.comparisonTable}>
              <caption>Padel bag formats compared by use, storage and buyer program</caption>
              <thead>
                <tr>
                  <th scope="col">Format</th>
                  <th scope="col">Typical use</th>
                  <th scope="col">Racket capacity guidance</th>
                  <th scope="col">Shoe storage</th>
                  <th scope="col">Best-fit buyer or use case</th>
                </tr>
              </thead>
              <tbody>
                {formatComparison.map((row) => (
                  <tr key={row.format}>
                    <th scope="row"><Link href={row.href}>{row.format}</Link></th>
                    <td>{row.use}</td>
                    <td>{row.rackets}</td>
                    <td>{row.shoes}</td>
                    <td>{row.suitability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <p className={styles.sectionLabel}>Materials &amp; design options</p>
              <h2>Shape the Collection Around Your Brand</h2>
              <p>Compare material, branding, colour, storage and carry options after choosing the product format.</p>
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
            <p className={styles.sectionLabel}>Product selection path</p>
            <h2>From Use Case to a Focused Product Brief</h2>
          </div>
          <ol className={styles.processList}>
            {shortlistSteps.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}
          </ol>
        </section>

        <section className={`${styles.section} ${styles.manufacturingSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Format comparison</p>
            <h2>Details to Compare Before Sampling</h2>
            <p>Use the product images and checklist to decide which structure deserves a detailed factory review.</p>
          </div>
          <ol className={styles.qualityChecks}>
            {comparisonChecks.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}
          </ol>
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
          <p className={styles.sectionLabel}>Continue your research</p>
          <nav className={styles.relatedLinks} aria-label="Related padel and racquet sports pages">
            {relatedLinks.map(([label, href]) => <Link href={href} key={href} prefetch={false}><span>{label}</span><span aria-hidden="true">↗</span></Link>)}
          </nav>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`}>
          <div className={styles.sectionIntro}>
            <h2>Custom Padel Bag Collection FAQ</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </section>

        <section className={`${styles.section} ${styles.rfqSection}`} id="padel-rfq">
          <div className={styles.rfqIntro}>
            <p className={styles.sectionLabel}>Product shortlist</p>
            <h2>Turn Your Preferred Format Into a Project Brief</h2>
            <p>Tell us which format, storage layout, carry system and design direction you prefer. For factory capability, MOQ factors, sampling and QC, review the <Link href="/custom-padel-bag-manufacturer">padel bag manufacturer page</Link>.</p>
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
