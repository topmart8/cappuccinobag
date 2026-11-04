import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import styles from "./page.module.css";

const path = "/products/custom-hybrid-padel-duffel-backpack";
const siteUrl = "https://www.cappuccinobag.com";
const imageRoot = "/images/products/hybrid-padel-duffel-backpack";
const title = "Custom Hybrid Padel Bag | Duffel & Backpack OEM";
const description = "Custom hybrid padel bags in black, white/black and cream/gold. Backpack, shoulder and hand carry. Private-label OEM/ODM from 300 pieces per style.";
const inquiryHref = "/inquiry/?product=Padel%20Bags&format=Hybrid%20Padel%20Duffel%20Backpack";
const colourInquiryHref = (colour) => `${inquiryHref}${encodeURIComponent(` — ${colour}`)}`;

export const metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}${path}` },
  twitter: { card: "summary_large_image", title, description, images: [`${siteUrl}${imageRoot}/duffel.webp`] },
  openGraph: {
    title,
    description,
    url: `${siteUrl}${path}`,
    type: "website",
    images: [{ url: `${siteUrl}${imageRoot}/duffel.webp`, width: 1254, height: 1254, alt: "Unbranded black hybrid padel duffel with shoulder strap and racket compartment" }],
  },
};

const specifications = [
  ["Carry options", "Backpack, shoulder carry and hand carry"],
  ["Storage layout", "Side racket compartment, separate shoe compartment, main packing area and internal organization"],
  ["Device storage", "Padded sleeve; fit checked with your target laptop during sampling"],
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

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}${path}#product`,
    name: "Custom Hybrid Padel Duffel Backpack",
    description,
    url: `${siteUrl}${path}`,
    image: ["duffel", "backpack", "interior", "white-black-duffel", "cream-gold-duffel", "cream-gold-backpack", "cream-gold-workshop"].map((view) => `${siteUrl}${imageRoot}/${view}.webp`),
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
          <div className={styles.heroImage}><Image src={`${imageRoot}/duffel.webp`} alt="Black hybrid padel duffel with hand handles, detachable shoulder strap and shaped racket pocket, with client branding removed" width={1254} height={1254} priority sizes="(max-width: 800px) 100vw, 55vw" /></div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Private-label development · Padel</p>
            <h1 id="product-title">Custom Hybrid Padel Duffel Backpack</h1>
            <p className={styles.lead}>One bag. Three ways to carry.</p>
            <p>Develop a convertible padel bag for your brand, club or sports retail collection. Combine a duffel-style opening with backpack, shoulder and hand carry, plus dedicated space for rackets, shoes and everyday essentials.</p>
            <div className={styles.tags}><span>OEM / ODM</span><span>300 pcs per style</span><span>Your logo &amp; colours</span></div>
            <p><a className={styles.textLink} href="#colour-options">View white and cream colour options ↓</a></p>
            <a className={styles.primary} href={inquiryHref}>Request a Custom Quote <span aria-hidden="true">↗</span></a>
            <p className={styles.note}>Share your target quantity, equipment load and branding brief. Sampling is quoted separately.</p>
          </div>
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
          <p className={styles.note}>Customer logos have been digitally removed. Screen colour and lighting can affect appearance; confirm fabric and hardware using physical samples. Colour splits and special materials may increase minimum quantities.</p>
        </section>

        <section className={styles.section} aria-labelledby="carry-title">
          <p className={styles.eyebrow}>From the commute to the court</p>
          <h2 id="carry-title">Carry flexibility, with an organized interior</h2>
          <div className={styles.gallery}>
            <figure><Image src={`${imageRoot}/backpack.webp`} alt="Hybrid padel bag upright in backpack mode with padded shoulder straps and a separate side racket compartment" width={1254} height={1254} sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><h3>Backpack carry</h3><p>Padded shoulder straps support a hands-free carry format. Strap fit and load comfort are reviewed during sampling.</p></figcaption></figure>
            <figure><Image src={`${imageRoot}/interior.webp`} alt="Open hybrid padel duffel showing grey lining, an internal sleeve and a zipped mesh organizer" width={1254} height={1254} sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><h3>Duffel access and organization</h3><p>A wide opening provides access to the main compartment, with internal pockets and a sleeve for smaller items and devices.</p></figcaption></figure>
          </div>
          <p className={styles.note}>Client branding has been digitally removed from these development reference images. Final construction and specifications follow the approved sample.</p>
          <div className={styles.featureGrid}>
            <article><span>01</span><h3>Separate racket storage</h3><p>A shaped side compartment keeps racket access distinct from the main packing area. Confirm fit with the rackets your customers use.</p></article>
            <article><span>02</span><h3>Dedicated shoe compartment</h3><p>Separate footwear from clothing and accessories. Shoe size, ventilation and compartment volume can be reviewed in your brief.</p></article>
            <article><span>03</span><h3>Built around your brand</h3><p>Develop the fabric, colour palette, lining, trims and logo placement together, with the intended retail positioning in mind.</p></article>
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
