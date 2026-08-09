import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import styles from "./case-studies.module.css";
import {
  buildCaseStudySchema,
  caseStudies,
  caseStudyMap,
  caseStudySiteUrl,
} from "./case-studies";

function JsonLd({ value }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
    />
  );
}
function CaseVisual({ caseStudy }) {
  if (caseStudy.image) {
    return (
      <figure className={styles.caseImage}>
        <Image
          src={caseStudy.image}
          width={1254}
          height={1254}
          sizes="(max-width: 860px) calc(100vw - 36px), 48vw"
          alt={caseStudy.imageAlt}
          priority
        />
        <figcaption>{caseStudy.imageCaption}</figcaption>
      </figure>
    );
  }

  return (
    <div className={styles.caseVisual} aria-label={`${caseStudy.client} project overview`}>
      <span>{caseStudy.number}</span>
      <p>{caseStudy.market}</p>
      <strong>{caseStudy.category}</strong>
      <small>Custom development case study</small>
    </div>
  );
}

export function getCaseStudyMetadata(slug) {
  const caseStudy = caseStudyMap[slug];
  const canonical = `${caseStudySiteUrl}${caseStudy.url}`;
  const image = caseStudy.image || "/images/cappuccino-factory-bulk-production-poster.jpg";

  return {
    title: caseStudy.seoTitle,
    description: caseStudy.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: caseStudy.seoTitle,
      description: caseStudy.metaDescription,
      url: canonical,
      type: "article",
      images: [{ url: image, alt: caseStudy.imageAlt || "Cappuccino Bag factory production" }],
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.seoTitle,
      description: caseStudy.metaDescription,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function CaseStudyPage({ slug }) {
  const caseStudy = caseStudyMap[slug];
  const relatedCases = caseStudies.filter((item) => item.slug !== slug);

  return (
    <>
      <JsonLd value={buildCaseStudySchema(caseStudy)} />
      <SiteHeader />
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/case-studies">Case Studies</Link><span aria-hidden="true">/</span>
          <span>{caseStudy.client}</span>
        </nav>

        <article>
          <header className={styles.caseHero}>
            <div>
              <p className={styles.eyebrow}>Case Study {caseStudy.number} · {caseStudy.market}</p>
              <h1>{caseStudy.title}</h1>
              <p className={styles.lede}>{caseStudy.summary}</p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} href={`/inquiry?product=${caseStudy.slug}`}>
                  Discuss a similar project
                </Link>
                <Link className={styles.secondaryButton} href="/case-studies">
                  View all case studies
                </Link>
              </div>
            </div>
            <CaseVisual caseStudy={caseStudy} />
          </header>

          <section className={styles.directAnswer} aria-label="Direct answer">
            <p><strong>Direct answer:</strong> {caseStudy.directAnswer}</p>
          </section>

          <section className={styles.storySection}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>The brief</p>
              <h2>What the project needed to solve</h2>
              <p>{caseStudy.summary}</p>
            </div>
            <ol className={styles.challengeList}>
              {caseStudy.challenges.map((challenge, index) => (
                <li key={challenge}><span>{String(index + 1).padStart(2, "0")}</span>{challenge}</li>
              ))}
            </ol>
          </section>

          <section className={`${styles.storySection} ${styles.solutionSection}`}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Development response</p>
              <h2>How Cappuccino supported the project</h2>
              <p>{caseStudy.outcome}</p>
            </div>
            <div className={styles.solutionGrid}>
              {caseStudy.solutions.map((solution) => (
                <article key={solution}><span aria-hidden="true">✓</span><h3>{solution}</h3></article>
              ))}
            </div>
          </section>

          <section className={styles.linksSection}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Continue your research</p>
              <h2>Related manufacturing resources</h2>
            </div>
            <div className={styles.resourceLinks}>
              {caseStudy.relatedLinks.map((link) => (
                <Link href={link.href} key={link.href}>{link.label}<span aria-hidden="true">↗</span></Link>
              ))}
            </div>
          </section>

          <section className={styles.faqSection}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Buyer questions</p>
              <h2>Frequently asked questions</h2>
            </div>
            <div className={styles.faqList}>
              {caseStudy.faqs.map(({ question, answer }) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.relatedSection}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>More proof</p>
              <h2>Explore more development stories</h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedCases.map((item) => (
                <article key={item.slug}>
                  <span>{item.number}</span>
                  <p>{item.category}</p>
                  <h3><Link href={item.url}>{item.client}</Link></h3>
                  <Link href={item.url}>Read case study</Link>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.ctaSection}>
            <div>
              <p className={styles.eyebrow}>Your project</p>
              <h2>Turn a product idea into a sample-ready brief</h2>
              <p>Share the intended product, materials, logo method, quantity, market and target timing for a practical development review.</p>
            </div>
            <Link className={styles.primaryButton} href={`/inquiry?product=${caseStudy.slug}`}>
              Start your RFQ
            </Link>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
