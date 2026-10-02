import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import styles from "./page.module.css";

const siteUrl = "https://www.cappuccinobag.com";
const path = "/products/court-lifestyle-tote-development-sample";
const canonical = `${siteUrl}${path}`;
const ivory = "/images/court-lifestyle-tote/court-ivory-retouched.webp";
const black = "/images/court-lifestyle-tote/court-black-retouched.webp";
const inquiryHref = "/inquiry?product=Court%20Lifestyle%20Tote%20Development%20Sample";
const imageCaption = "Retouched presentation images based on our physical samples. Refer to the approved sample and specification for final details.";

export const metadata = {
  title: "Women’s Court Lifestyle Tote | OEM/ODM | Cappuccino Bag",
  description: "Develop a private-label women’s court tote with Cappuccino Bag. View ivory-brown and black samples, discuss your specifications and request a development review.",
  alternates: { canonical },
  openGraph: {
    title: "Your Next Court Lifestyle Tote Starts Here",
    description: "See Cappuccino Bag’s in-house tote samples in ivory with brown trim and black. Discuss a private-label development brief for your collection.",
    url: canonical,
    type: "website",
    images: [{ url: `${siteUrl}${ivory}`, width: 1122, height: 1402, alt: "Retouched ivory Court Lifestyle Tote sample with brown trim and curved front pouch" }],
  },
  twitter: { card: "summary_large_image", title: "Your Next Court Lifestyle Tote Starts Here", description: "In-house tote samples in ivory with brown trim and black for private-label development review.", images: [`${siteUrl}${ivory}`] },
  robots: { index: true, follow: true },
};

const options = [
  ["Material and color", "Surface finish, lining, body and trim colors"],
  ["Fit and organization", "Dimensions, openings, pocket layout and target equipment"],
  ["Branding and hardware", "Logo placement, application method and hardware details"],
  ["Presentation", "Labels, hangtags and packaging"],
];
const facts = [
  ["Product", "Women’s Court Lifestyle Tote"],
  ["Supplier", "Cappuccino Bag"],
  ["Stage", "In-house physical development sample"],
  ["Sample colors", "Ivory with brown trim; black"],
  ["Visible design", "Rectangular tote body, twin handles, curved front pouch, textured exterior and zipper details"],
];
const faqs = [
  { question: "Can I use this sample for my private-label project?", answer: "Use the sample as a starting point and send the changes your collection needs. Cappuccino Bag can review the development scope with you." },
  { question: "Will my paddles or rackets fit?", answer: "Fit has not been validated for the equipment you use. Include the equipment type, dimensions, quantity and any covers so the developed sample can be checked for opening clearance, closure and carry requirements." },
  { question: "Is the sample leather, and are accessories included?", answer: "The photographs establish the textured appearance. Material composition, removable features and included accessories need confirmation for the selected version." },
  { question: "How do I get a quote?", answer: "Send the quantity per style and color, material preference, branding, packaging and requested delivery window. These details provide the basis for a model-specific quotation and sample discussion." },
];

export default function CourtLifestyleTotePage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "WebPage", "@id": `${canonical}#webpage`, name: "Women’s Court Lifestyle Tote", description: metadata.description, url: canonical, inLanguage: "en", primaryImageOfPage: { "@type": "ImageObject", url: `${siteUrl}${ivory}`, width: 1122, height: 1402, caption: imageCaption }, isPartOf: { "@type": "WebSite", name: "Cappuccino Bag", url: siteUrl }, about: { "@type": "Thing", name: "Court Lifestyle Tote development sample" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` }, { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` }, { "@type": "ListItem", position: 3, name: "Court Lifestyle Tote", item: canonical }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ];
  return <>
    {schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
    <SiteHeader />
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/products">Products</Link><span aria-hidden="true">/</span><span>Court Lifestyle Tote</span></nav>
      <section className={styles.hero}>
        <div className={styles.heroHeading}><p className={styles.eyebrow}>In-House Sample · Private-Label OEM/ODM</p><h1>Women’s Court Lifestyle Tote</h1><p className={styles.tagline}>Start with a real sample.<br />Shape it around your brand.</p><p className={styles.audience}>For brands developing tennis, pickleball and padel lifestyle collections.</p></div>
        <figure className={styles.heroVisual}><Image src={ivory} alt="Retouched ivory Court Lifestyle Tote sample with brown trim and curved front pouch" width={1122} height={1402} sizes="(max-width: 760px) 320px, 480px" priority /><figcaption>Ivory with brown trim · In-house development sample</figcaption></figure>
        <div className={styles.heroIntro}><p>A curved front pouch, textured finish and twin handles define this in-house tote by Cappuccino Bag. Compare two physical sample colors, then discuss the materials, layout and branding your collection needs.</p><Link className={styles.cta} href={inquiryHref}>Start Your Tote Inquiry <span aria-hidden="true">↗</span></Link><p className={styles.helper}>Share your quantity, target market and required changes.</p></div>
      </section>
      <section className={styles.section} aria-labelledby="colors"><p className={styles.eyebrow}>Sample colors</p><h2 id="colors">Two colors. Two ways to set the tone.</h2><div className={styles.colors}>
        <article><Image className={styles.colorImage} src={ivory} alt="Retouched ivory and brown tote sample, front presentation" width={1122} height={1402} sizes="(max-width: 760px) 280px, 380px" /><div className={styles.colorCopy}><h3>Ivory with Brown Trim</h3><p>Brown edging traces the curved front pouch against the ivory body. A two-tone starting point for your collection.</p></div></article>
        <article><Image className={styles.colorImage} src={black} alt="Retouched black Court Lifestyle Tote sample with curved front pouch" width={1122} height={1402} sizes="(max-width: 760px) 280px, 380px" /><div className={styles.colorCopy}><h3>Black</h3><p>A tonal finish brings the pouch shape and textured surface into focus. Review the front and angled sample views to compare the proportions.</p><Link className={styles.textLink} href="/images/court-lifestyle-tote/black-tote-angle-source.jpeg">View original angled sample photo ↗</Link></div></article>
      </div><p className={styles.imageNote}>{imageCaption}</p></section>
      <section className={`${styles.section} ${styles.options}`} aria-labelledby="options"><p className={styles.eyebrow}>Your development brief</p><h2 id="options">What would make it yours?</h2><p>Bring your priorities to the development brief:</p><dl className={styles.optionGrid}>{options.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl><p className={styles.helper}>Each option is reviewed for feasibility and included in the specification only after approval.</p></section>
      <section className={styles.section} aria-labelledby="facts"><p className={styles.eyebrow}>A clear starting point</p><h2 id="facts">Sample facts</h2><table className={styles.factTable}><caption className={styles.srOnly}>Current information for the Court Lifestyle Tote sample</caption><tbody>{facts.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table><p className={styles.specNote}><strong>Project-specification note:</strong> The samples show a design direction. Final materials, measurements, equipment capacity, interior layout, accessory functions, production colors and order terms require project-specific confirmation. MOQ, sample charges, pricing and timing are agreed in the quotation.</p></section>
      <section className={styles.section} aria-labelledby="process"><p className={styles.eyebrow}>The next steps</p><h2 id="process">From your brief to an approved sample</h2><ol className={styles.steps}><li><span>01</span><h3>Define the project.</h3><p>Share the intended use, quantity, market and changes you need.</p></li><li><span>02</span><h3>Agree the sample scope.</h3><p>Review construction, materials, branding, sample charges and timing before proceeding.</p></li><li><span>03</span><h3>Check and approve.</h3><p>Review the sample, test any required equipment fit and record revisions before approving the production specification.</p></li></ol></section>
      <section className={styles.section} aria-labelledby="questions"><p className={styles.eyebrow}>Before you inquire</p><h2 id="questions">Buyer questions</h2><div className={styles.faqs}>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
      <section className={styles.finalCta}><div><p className={styles.eyebrow}>Bring your tote brief</p><h2>Tell us what your collection needs.</h2><p>Start with the details you already have:</p><ul><li>Intended use, destination market and quantity by color</li><li>Material, dimensions and storage requirements</li><li>Logo, accessory and packaging requirements</li><li>Target cost, currency and requested delivery window</li></ul><p>For equipment storage, include the paddle or racket measurements and number of pieces. If the design is still taking shape, identify the decisions you would like to discuss.</p><Link className={styles.cta} href={inquiryHref}>Start Your Tote Inquiry <span aria-hidden="true">↗</span></Link><p className={styles.helper}>Opens our inquiry form. Add your requirements in the Message field.</p></div></section>
    </main><SiteFooter />
  </>;
}
