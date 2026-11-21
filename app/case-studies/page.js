import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import styles from "./case-studies.module.css";
import {
  buildFaqSchema,
  caseStudies,
  caseStudySiteUrl,
  organizationSchema,
} from "./case-studies";

const padelSampleCase = {
  id: "padel-prototype-case",
  title: "Why one Padel design went to sampling in two constructions",
};
const listedCases = [
  { title: padelSampleCase.title, url: `/case-studies#${padelSampleCase.id}` },
  ...caseStudies,
];

const hubFaqs = [
  {
    question: "What types of custom bag projects are included in these case studies?",
    answer:
      "The case study center includes a U.S. Padel prototype order, European hospitality guest bags, UK beauty accessories and U.S. fashion handbags.",
  },
  {
    question: "Can Cappuccino support both established groups and startup brands?",
    answer:
      "Yes. The documented projects include a European hotel group, a UK beauty startup and a US boutique fashion brand. The development path is scoped around each product, material, quantity and market requirement.",
  },
  {
    question: "How can a buyer start a similar custom bag project?",
    answer:
      "Send the product concept, target market, materials, functions, logo method, estimated quantity and timing. Cappuccino can then review feasibility and propose a sampling path.",
  },
];

export const metadata = {
  title: "Custom Bag Manufacturing Case Studies | Cappuccino Bag",
  description:
    "See why a Padel buyer ordered soft and structured prototypes, and how Cappuccino developed branded hospitality bags, beauty accessories and fashion handbags.",
  alternates: { canonical: `${caseStudySiteUrl}/case-studies` },
  openGraph: {
    title: "Custom Bag Manufacturing Case Studies | Cappuccino Bag",
    description:
      "See how Cappuccino approaches custom materials, branding, sampling and production planning for international bag and accessory brands.",
    url: `${caseStudySiteUrl}/case-studies`,
    type: "website",
    images: [{
      url: "/images/cappuccino-factory-bulk-production-poster.jpg",
      alt: "Cappuccino Bag factory production",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Bag Manufacturing Case Studies | Cappuccino Bag",
    description: "Custom bag and accessory development stories for international brands.",
    images: ["/images/cappuccino-factory-bulk-production-poster.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function CaseStudiesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      {
        "@type": "CollectionPage",
        "@id": `${caseStudySiteUrl}/case-studies#collection`,
        name: "Custom Bag Manufacturing Case Studies",
        description: metadata.description,
        url: `${caseStudySiteUrl}/case-studies`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: listedCases.map((caseStudy, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: caseStudy.title,
            url: `${caseStudySiteUrl}${caseStudy.url}`,
          })),
        },
      },
      buildFaqSchema(hubFaqs),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${caseStudySiteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Case Studies", item: `${caseStudySiteUrl}/case-studies` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Case Studies</span>
        </nav>

        <header className={styles.hubHero}>
          <div>
            <p className={styles.eyebrow}>Case Study Center</p>
            <h1>Custom products, solved through practical development</h1>
            <p>Explore the decisions behind a Padel prototype order, hotel guest bags and private-label accessories.</p>
            <Link className={styles.primaryButton} href="/inquiry?source=case-studies">Discuss your project</Link>
          </div>
          <div className={styles.hubStats} aria-label="Case study coverage">
            <div><strong>{String(listedCases.length).padStart(2, "0")}</strong><span>Documented projects</span></div>
            <div><strong>03</strong><span>International markets</span></div>
            <div><strong>01</strong><span>Sample-first process</span></div>
          </div>
        </header>

        <article id={padelSampleCase.id} className={`${styles.storySection} ${styles.sampleCase}`}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>United States · Paid Padel sample order</p>
            <h2>{padelSampleCase.title}</h2>
            <p>A buyer came to us with one bag design and a question about its shape. A drawing could show the outline. The buyer wanted to compare how a structured body and a soft body would hold that outline in use.</p>
          </div>
          <div>
            <h3>What changed in the sample order?</h3>
            <p>We quoted the same design in two constructions. The buyer paid for one structured prototype and one soft prototype, leaving the production choice open until the two could be compared.</p>
            <h3>How to make the comparison on your own bag</h3>
            <p>Put the same racket, shoes and clothing in each version. Photograph both standing, then take the racket out. Compare how far the opening folds in, how easily the racket goes back and how much room the shoes take from the main compartment.</p>
            <div className={styles.resourceLinks}>
              <Link href="/products/weekend-padel-carryall-pdb016#sample-checks">Plan a packed-fit check for the PDB016 duffel</Link>
              <Link href="/inquiry?product=Padel%20Bags&format=Structured%20and%20soft%20prototype%20comparison">Request a two-construction sample quotation</Link>
            </div>
          </div>
        </article>

        <section className={styles.hubIntro}>
          <p className={styles.eyebrow}>Development proof</p>
          <h2>Choose the case closest to your product brief</h2>
          <p>Each story focuses on the buyer requirement, the development challenge and the manufacturing response. Commercial results are not stated where the source material does not provide them.</p>
        </section>

        <section className={styles.caseGrid} aria-label="Customer case studies">
          {caseStudies.map((caseStudy) => (
            <article key={caseStudy.slug}>
              <div className={styles.cardTopline}><span>{caseStudy.number}</span><span>{caseStudy.market}</span></div>
              <p className={styles.eyebrow}>{caseStudy.category}</p>
              <h2><Link href={caseStudy.url}>{caseStudy.client}</Link></h2>
              <h3>{caseStudy.cardTitle}</h3>
              <p>{caseStudy.summary}</p>
              <Link className={styles.cardLink} href={caseStudy.url}>Read case study <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </section>

        <section className={styles.processSection}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>A repeatable path</p>
            <h2>From buyer brief to production planning</h2>
          </div>
          <ol>
            <li><span>01</span><strong>Define</strong><p>Clarify the user, product, market, quantity and target timing.</p></li>
            <li><span>02</span><strong>Engineer</strong><p>Align materials, structure, branding and decorative methods.</p></li>
            <li><span>03</span><strong>Sample</strong><p>Review the physical prototype and record the approved details.</p></li>
            <li><span>04</span><strong>Control</strong><p>Plan production and quality checks around the approved specification.</p></li>
          </ol>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Start here</p>
            <h2>Case study center FAQ</h2>
          </div>
          <div className={styles.faqList}>
            {hubFaqs.map(({ question, answer }) => (
              <details key={question}><summary>{question}</summary><p>{answer}</p></details>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div>
            <p className={styles.eyebrow}>Your next case study starts with a clear brief</p>
            <h2>Share your product direction</h2>
            <p>Send the intended format, target market, material direction, logo method, quantity and timing for a focused factory review.</p>
          </div>
          <Link className={styles.primaryButton} href="/inquiry?source=case-studies">Start your RFQ</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
