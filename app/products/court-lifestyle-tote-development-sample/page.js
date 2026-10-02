import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import styles from "./page.module.css";

const siteUrl = "https://www.cappuccinobag.com";
const path = "/products/court-lifestyle-tote-development-sample";
const canonical = `${siteUrl}${path}`;
const sampleImage = "/images/court-lifestyle-tote/ivory-brown-tote-front-source.jpeg";
const inquiryHref = "/inquiry?product=Court%20Lifestyle%20Tote%20Development%20Sample";

export const metadata = {
  title: "Custom Women's Court Tote | OEM/ODM | Cappuccino Bag",
  description:
    "Review a Cappuccino Bag in-house women’s court lifestyle tote sample, project-specific customization, 300-piece production MOQ and sample development.",
  alternates: { canonical },
  openGraph: {
    title: "Custom Women's Court Tote | OEM/ODM | Cappuccino Bag",
    description:
      "An in-house Court Lifestyle Tote development sample for project-specific private-label collections.",
    url: canonical,
    type: "website",
    images: [{
      url: `${siteUrl}${sampleImage}`,
      width: 720,
      height: 1280,
      alt: "Original photograph of the ivory and brown Court Lifestyle Tote development sample",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Women's Court Tote | Cappuccino Bag",
    description: "Review an in-house Court Lifestyle Tote development sample and project-specific customization process.",
    images: [sampleImage],
  },
  robots: { index: true, follow: true },
};

const customization = [
  ["Materials and lining", "Reviewed against the intended use, appearance, structure and project requirements."],
  ["Colour allocation", "The main body, trim, lining and hardware palette is reviewed for each project."],
  ["Branding", "Logo placement and method are selected after the material and artwork are reviewed."],
  ["Storage layout", "Pocket arrangement and closures are developed around the approved brief and target equipment."],
  ["Carry details", "Handle and shoulder-carry requirements are confirmed in the project specification."],
  ["Packaging", "Labels, hangtags and retail packaging can be reviewed after the product direction is agreed."],
];

const faqs = [
  {
    question: "What is the minimum order quantity?",
    answer: "Custom production starts at 300 pieces per style. Custom production orders of 100–200 pieces are not available. Colour allocation is reviewed for each project.",
  },
  {
    question: "Can I develop a sample first?",
    answer: "Yes. Sample development is quoted separately and can be reviewed before a custom production order. Share the intended use, target equipment, material direction, colour and branding requirements for review.",
  },
  {
    question: "Which details can be customized?",
    answer: "Materials, lining, colour allocation, branding, hardware direction, storage layout, carry details and packaging can be reviewed. Final choices are confirmed for the individual project.",
  },
  {
    question: "How is racket or paddle fit confirmed?",
    answer: "Fit is not assumed from the visual direction. The actual target racket or paddle dimensions and equipment should be checked against the developed sample before the final production specification is approved.",
  },
];

export default function CourtLifestyleTotePage() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Women’s Court Lifestyle Tote",
      description: metadata.description,
      url: canonical,
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${siteUrl}${sampleImage}`,
        width: 720,
        height: 1280,
        caption: "Original physical development sample photograph. Final specifications are confirmed per project.",
      },
      isPartOf: { "@type": "WebSite", name: "Cappuccino Bag", url: siteUrl },
      about: { "@type": "Thing", name: "Court Lifestyle Tote development sample" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` },
        { "@type": "ListItem", position: 3, name: "Court Lifestyle Tote", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <>
      {schemas.map((schema) => (
        <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteHeader />
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/products">Products</Link><span aria-hidden="true">/</span>
          <span>Court Lifestyle Tote</span>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">In-house Development Sample</p>
            <h1>Women’s Court Lifestyle Tote</h1>
            <p className={styles.lede}>Cappuccino Bag develops custom women’s court totes for private-label collections. This in-house sample provides a starting point for project-specific materials, trim and storage layouts. Custom production starts at 300 pieces per style, with sample development quoted separately.</p>
            <p className={styles.notice}>Development sample shown. Final materials, dimensions, equipment fit and production specifications are confirmed for each project.</p>
            <div className={styles.actions}>
              <Link className="btn btn-primary" href={inquiryHref}>Request a Custom Sample</Link>
              <Link className={`btn btn-secondary ${styles.secondaryAction}`} href="/inquiry">Discuss Your Bag Project</Link>
            </div>
          </div>
          <figure className={styles.heroVisual}>
            <Image
              src={sampleImage}
              alt="Original photograph of the ivory and brown Court Lifestyle Tote development sample"
              width={720}
              height={1280}
              sizes="(max-width: 900px) calc(100vw - 28px), 54vw"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption><strong>Physical development sample.</strong> Original factory photograph; protective wrapping remains on the handles. Final specifications are confirmed per project.</figcaption>
          </figure>
        </section>

        <section className={styles.answerGrid} aria-label="Court Lifestyle Tote project facts">
          <article><p className="eyebrow">What it is</p><h2>An in-house development sample</h2><p>A single tote direction for project-specific private-label development. It is presented only as an in-house development sample.</p></article>
          <article><p className="eyebrow">Who it is for</p><h2>Lifestyle-led court collections</h2><p>For brands, retailers and clubs reviewing a women’s tote direction connected to racket-sport culture and everyday carry.</p></article>
          <article><p className="eyebrow">What is confirmed</p><h2>Two physical sample versions</h2><p>Ivory with brown trim and black physical samples are confirmed. Materials, dimensions and equipment fit remain project-specific.</p></article>
          <article><p className="eyebrow">MOQ and sample</p><h2>300 pieces per style</h2><p>Custom production starts at 300 pieces per style. Orders of 100–200 pieces are not available. Sample development is quoted separately.</p></article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><div><p className="eyebrow">Sample Versions</p><h2>One product, two visual directions</h2></div><p>Two sample colour directions for project review. Custom production is developed to an agreed specification.</p></div>
          <div className={styles.versionGrid}>
            <article><Image className={styles.samplePhoto} src={sampleImage} alt="Ivory and brown physical tote sample, front view" width={720} height={1280} sizes="(max-width: 640px) 100vw, 50vw" /><h3>Ivory × Brown</h3><p>Ivory with brown trim, shown in the original physical sample photograph. Final specifications are confirmed per project.</p></article>
            <article><Image className={styles.samplePhoto} src="/images/court-lifestyle-tote/black-tote-front-source.jpeg" alt="Black physical tote sample, front view with protective handle wrapping" width={720} height={1280} sizes="(max-width: 640px) 100vw, 50vw" /><h3>Black</h3><p>A second confirmed physical sample colour direction, not a separate product or ready-stock option.</p></article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.sectionHeading}><div><p className="eyebrow">Visible Structure &amp; Development</p><h2>Review the brief before confirming specifications</h2></div><p>The photographs show a front pouch design. Construction details and equipment fit are confirmed during sample review.</p></div>
          <figure className={styles.detailPhoto}><Image src="/images/court-lifestyle-tote/black-tote-angle-source.jpeg" alt="Original angled photograph of the black tote sample and front pouch design" width={1280} height={960} sizes="(max-width: 640px) 100vw, 680px" /><figcaption>Black physical development sample, angled view. Protective wrapping remains on the handles.</figcaption></figure>
          <ol className={styles.process}>
            <li><span>01</span><h3>Define the brief</h3><p>Share intended use, target equipment, market, quantity, appearance and branding requirements.</p></li>
            <li><span>02</span><h3>Confirm the specification</h3><p>Review materials, dimensions, front pouch construction, storage layout and carry details.</p></li>
            <li><span>03</span><h3>Develop the sample</h3><p>Sample development is quoted separately from custom production.</p></li>
            <li><span>04</span><h3>Test actual equipment</h3><p>Use the target racket or paddle to confirm fit before approving the production specification.</p></li>
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><div><p className="eyebrow">Customization Review</p><h2>Options assessed for each project</h2></div><p>Materials, dimensions, equipment fit and performance requirements are agreed and checked for each project.</p></div>
          <dl className={styles.customGrid}>
            {customization.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}
          </dl>
        </section>

        <section className={`${styles.section} ${styles.moq}`}>
          <div><p className="eyebrow">MOQ &amp; Sample Development</p><h2>A clear route from sample to custom production</h2></div>
          <div><p><strong>Custom production:</strong> starts at 300 pieces per style.</p><p><strong>100–200 pieces:</strong> not available for custom production.</p><p><strong>Colour allocation:</strong> reviewed for each project.</p><p><strong>Sample development:</strong> quoted separately and not blocked by the custom-production MOQ.</p></div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><div><p className="eyebrow">Buyer Questions</p><h2>Court Lifestyle Tote FAQ</h2></div></div>
          <div className={styles.faqList}>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
        </section>

        <section className={styles.finalCta}>
          <div><p className="eyebrow">Start a Project</p><h2>Discuss your Court Lifestyle Tote brief</h2><p>Share the intended use, target equipment, quantity, material direction, colour allocation, branding and market for a project-specific review.</p></div>
          <div className={styles.actions}><Link className="btn btn-primary" href={inquiryHref}>Request a Custom Sample</Link><Link className={`btn btn-secondary ${styles.secondaryAction}`} href="/inquiry">Discuss Your Bag Project</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
