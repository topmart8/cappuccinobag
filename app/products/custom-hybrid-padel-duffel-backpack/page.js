import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import styles from "./page.module.css";

const path = "/products/custom-hybrid-padel-duffel-backpack";
const siteUrl = "https://www.cappuccinobag.com";
const imageRoot = "/images/products/hybrid-padel-duffel-backpack";
const heroImage = `${imageRoot}/black-padel-hero.webp`;
const heroAlt = "Black Cappuccino hybrid duffel with a perforated padel racket and wrist strap beside the front racket pocket";
const title = "Custom Hybrid Padel Bag | Duffel & Backpack OEM";
const description = "Custom hybrid padel bags in black, white/black and cream/gold. Backpack, shoulder and hand carry. Private-label OEM/ODM from 300 pieces per style.";
const inquiryHref = "/inquiry/?product=Padel%20Bags&format=Hybrid%20Padel%20Duffel%20Backpack";
const colourInquiryHref = (colour) => `${inquiryHref}${encodeURIComponent(` — ${colour}`)}`;

export const metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}${path}` },
  twitter: { card: "summary_large_image", title, description, images: [`${siteUrl}${heroImage}`] },
  openGraph: {
    title,
    description,
    url: `${siteUrl}${path}`,
    type: "website",
    images: [{ url: `${siteUrl}${heroImage}`, width: 1254, height: 1254, alt: heroAlt }],
  },
};

const specifications = [
  ["Carry options", "Backpack, shoulder carry and hand carry"],
  ["Storage layout", "Shaped racket pocket with handle loop, side-access shoe compartment, zipped lid mesh pocket and main compartment"],
  ["Device storage", "Padded sleeve with retaining strap. Share your laptop dimensions for a sample fit check."],
  ["Exterior and lining", "Fabric, coating, lining and colour selected to the project brief"],
  ["Colour references", "Black, white with black trim, and cream with gold-tone hardware; final colour and finish confirmed against physical samples"],
  ["Branding", "Custom logo, labels, zipper pulls and packaging, subject to material and process review"],
  ["Minimum order", "300 pieces per style for new custom bulk orders"],
  ["Size and capacity", "Confirmed against the approved sample and intended racket, shoe and clothing load"],
  ["Sampling and lead time", "Quoted after reviewing the specification, branding and quantity"],
];

const faqs = [
  ["What is a hybrid padel bag?", "A hybrid padel bag combines a duffel-style packing area with multiple carry options. This development format offers backpack straps, hand handles and a shoulder strap, together with separate racket and shoe storage."],
  ["Can we develop this bag with our own logo?", "Yes. Cappuccino can review your logo artwork, colours, materials and pocket layout for a private-label OEM/ODM project. Branding position and production method are confirmed during sampling."],
  ["What is the minimum order quantity?", "New custom bulk orders start at 300 pieces per style. Different styles cannot be combined to meet this minimum. Colour splits and special materials may require higher quantities; samples are assessed separately."],
  ["How many rackets and what shoe size will fit?", "Capacity depends on racket thickness, footwear size and how the main compartment is packed. Send your intended racket count, racket dimensions, largest shoe size and other equipment so we can confirm fit against a sample."],
  ["Can we request thermal lining or water-resistant fabric?", "These can be reviewed as development options. Material selection, construction and any performance or compliance claims must be agreed and verified for your final specification."],
];

const blackDetails = [
  { file: "black-open", label: "Main compartment", alt: "Open black duffel showing its zipped lid mesh pocket and padded sleeve with a central retaining strap" },
  { file: "black-sleeve", label: "Padded laptop sleeve", alt: "Laptop edge inside the grey sleeve beside the hook-and-loop fastening" },
  { file: "black-racket-pocket", label: "Racket pocket and handle loop", alt: "A handle loop holds the racket grip above the black shaped pocket with tonal Cappuccino branding" },
  { file: "black-straps", label: "Backpack carry", alt: "Rear view of the black bag with its two adjustable padded shoulder straps" },
  { file: "black-packing", label: "Side-access shoe compartment", alt: "Packed duffel with the lid open and footwear visible through the separate side opening" },
];

const creamHardware = [
  { file: "cream-d-ring", label: "Stitched D-ring attachment", alt: "Workshop close-up of the gold-tone D-ring held by cream webbing beneath a triangular stitched tab", height: 1280 },
  { file: "cream-hooks", label: "Detachable strap hooks", alt: "Two gold-tone swivel snap hooks attached to cream straps", height: 1280 },
];

const creamConcepts = [
  { file: "cream-open", label: "Open main compartment", alt: "Cream colour visualisation of the duffel with its mesh lid pocket and strapped interior sleeve" },
  { file: "cream-sleeve", label: "Laptop sleeve and binding", alt: "Cream colour visualisation of the laptop sleeve, woven binding and fastening" },
  { file: "cream-straps", label: "Padded backpack straps", alt: "Cream colour visualisation of the two padded backpack straps with gold-tone adjusters" },
];

function DetailGallery({ items }) {
  return (
    <div className={styles.detailGallery}>
      {items.map(({ file, label, alt, height = 960 }) => (
        <figure key={file}>
          <Image src={`${imageRoot}/${file}.webp`} alt={alt} width={960} height={height} sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw" />
          <figcaption>{label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}${path}#product`,
    name: "Custom Hybrid Padel Duffel Backpack",
    description,
    url: `${siteUrl}${path}`,
    image: ["black-padel-hero", "black-open", "black-racket-pocket", "black-straps", "cream-d-ring", "white-black-duffel", "cream-gold-duffel", "cream-gold-backpack", "cream-gold-workshop"].map((view) => `${siteUrl}${imageRoot}/${view}.webp`),
    color: "Black; White / Black Trim; Cream / Gold-Tone Hardware",
    category: "Custom Padel Bags",
    manufacturer: { "@type": "Organization", name: "Guangzhou Cappuccino Leather Handbag Co., Ltd.", url: siteUrl },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Padel Bags", item: `${siteUrl}/racket-sports/padel-bags` },
      { "@type": "ListItem", position: 3, name: "Hybrid Padel Duffel Backpack", item: `${siteUrl}${path}` },
    ],
  },
];

export default function HybridPadelDuffelBackpackPage() {
  return (
    <>
      <SiteHeader />
      {schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/racket-sports/padel-bags">Padel Bags</Link><span>/</span><span>Hybrid Duffel Backpack</span></nav>
        <section className={styles.hero} aria-labelledby="product-title">
          <div className={styles.heroImage}><Image src={heroImage} alt={heroAlt} width={1254} height={1254} priority sizes="(max-width: 800px) 100vw, 55vw" /></div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Private-label development · Padel</p>
            <h1 id="product-title">Custom Hybrid Padel Duffel Backpack</h1>
            <p className={styles.lead}>One bag. Three ways to carry.</p>
            <p>Develop a convertible padel bag for your brand, club or sports retail collection. Combine a duffel-style opening with backpack, shoulder and hand carry, plus dedicated space for rackets, shoes and everyday essentials.</p>
            <div className={styles.tags}><span>OEM / ODM</span><span>300 pcs per style</span><span>Your logo &amp; colours</span></div>
            <p className={styles.viewLinks}><a className={styles.textLink} href="#construction-details">Explore compartments and straps</a><a className={styles.textLink} href="#colour-options">See white and cream options</a></p>
            <a className={styles.primary} href={inquiryHref}>Request a Custom Quote <span aria-hidden="true">↗</span></a>
            <p className={styles.note}>Share your target quantity, equipment load and branding brief. Sampling is quoted separately.</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.colourSection}`} id="construction-details" aria-labelledby="details-title">
          <h2 id="details-title">Inside the black padel duffel</h2>
          <p className={styles.colourIntro}>The lid unzips to reveal a full-width mesh pocket and a padded laptop sleeve with a retaining strap. Shoes load through the side. A separate shaped pocket holds the racket head while an exterior loop secures the handle.</p>
          <DetailGallery items={blackDetails} />
        </section>

        <section className={`${styles.section} ${styles.colourSection}`} id="colour-options" aria-labelledby="colour-title">
          <p className={styles.eyebrow}>Colour &amp; trim references</p>
          <h2 id="colour-title">White and cream, with two distinct finishes</h2>
          <p className={styles.colourIntro}>Choose crisp white with black trim or a warmer cream with gold-tone hardware, alongside the black version above. These are colour references for the same hybrid format; your final shade, trims and colour split are confirmed during sampling.</p>
          <div className={`${styles.gallery} ${styles.colourGallery}`}>
            <figure><Image src={`${imageRoot}/white-black-duffel.webp`} alt="White hybrid padel duffel with black piping, black zippers and a white shoulder pad, with customer branding removed" width={1254} height={1254} sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><h3>White / Black Trim</h3><p>A white body with contrasting black piping, zippers and handle wrap.</p><a className={styles.colourCta} href={colourInquiryHref("White / Black Trim")}>Enquire About White / Black →</a></figcaption></figure>
            <figure><Image src={`${imageRoot}/cream-gold-duffel.webp`} alt="Cream hybrid padel duffel with matching cream straps and gold-tone zipper pulls and hardware, without customer logos" width={1254} height={1254} sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><h3>Cream / Gold-Tone Hardware</h3><p>A warm cream palette with matching straps and gold-tone hardware.</p><a className={styles.colourCta} href={colourInquiryHref("Cream / Gold-Tone Hardware")}>Enquire About Cream / Gold →</a></figcaption></figure>
            <figure><Image src={`${imageRoot}/cream-gold-backpack.webp`} alt="Cream padel bag in backpack mode with padded shoulder straps and gold-tone adjusters, with client branding removed" width={1254} height={1254} sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><h3>Cream in backpack mode</h3><p>View the carry straps, adjustment hardware and shaped side racket pocket.</p></figcaption></figure>
            <figure><Image src={`${imageRoot}/cream-gold-workshop.webp`} alt="Cream and gold-tone padel bag on a workshop table, with customer branding digitally removed" width={1280} height={960} sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><h3>Workshop colour reference</h3><p>A workshop photograph shows the cream fabric, matching trim and gold-tone hardware under different lighting.</p></figcaption></figure>
          </div>
          <div className={styles.detailGroup} id="cream-hardware">
            <h3>Gold-tone hardware on the cream sample</h3>
            <p>The shoulder strap clips to a D-ring sewn into the side of the bag. These workshop views show the attachment and the swivel hooks. The customer logo has been removed from the hook photo.</p>
            <DetailGallery items={creamHardware} />
          </div>
          <div className={styles.detailGroup} id="cream-details">
            <h3>Cream detail visualisations</h3>
            <p>These three AI-generated views show how the black sample’s interior and backpack straps could look in cream. Confirm lining colour, trim and fittings against your physical sample.</p>
            <DetailGallery items={creamConcepts} />
          </div>
        </section>

        <section className={`${styles.section} ${styles.specSection}`} aria-labelledby="spec-title">
          <div><p className={styles.eyebrow}>Development specification</p><h2 id="spec-title">Define the bag before sampling</h2><p>This format draws on Cappuccino’s development work for a UK padel customer. Start with your own player needs, branding and target price, then confirm the final material and layout through sampling.</p><Link className={styles.textLink} href="/custom-padel-bag-manufacturer">Explore our padel bag manufacturing process →</Link></div>
          <dl className={styles.specs}>{specifications.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
        </section>

        <section className={styles.section} aria-labelledby="faq-title"><p className={styles.eyebrow}>Buyer questions</p><h2 id="faq-title">Planning your private-label padel bag</h2><div className={styles.faqs}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

        <section className={styles.cta} aria-labelledby="quote-title"><div><p className={styles.eyebrow}>Start your project</p><h2 id="quote-title">Make the hybrid format work for your collection.</h2><p>Send your quantity, target market, racket and shoe requirements, material preferences and logo artwork. We will review a suitable development specification and quote.</p></div><a className={styles.primary} href={inquiryHref}>Discuss Your Padel Bag <span aria-hidden="true">↗</span></a></section>
      </main>
      <SiteFooter />
    </>
  );
}
