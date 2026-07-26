import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PadelFooter, PadelHeader } from "./padel-components";
import { padelProductEntries, padelProducts, siteUrl } from "./padel-products";

const developmentNotice =
  "This page presents an OEM/ODM product development direction, not a stocked retail item. Final capacity, dimensions, materials, MOQ, pricing and lead time are confirmed during specification review, sampling and quotation.";

function getProduct(categorySlug, slug) {
  const product = padelProducts[slug];
  return product?.categorySlug === categorySlug ? product : null;
}

function getProductUrl(product, slug) {
  return `${siteUrl}/${product.categorySlug}/${slug}/`;
}

function getInquiryUrl(product) {
  const format = `${product.sku} ${product.name}`;
  return `/inquiry/?product=Padel%20Bags&format=${encodeURIComponent(format)}`;
}

export function getProductStaticParams(categorySlug) {
  return padelProductEntries
    .filter((product) => product.categorySlug === categorySlug)
    .map((product) => ({ slug: product.slug }));
}

export async function getProductMetadata({ params, categorySlug }) {
  const { slug } = await params;
  const product = getProduct(categorySlug, slug);
  if (!product) return {};

  const canonical = getProductUrl(product, slug);
  return {
    title: product.metaTitle,
    description: product.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      url: canonical,
      type: "website",
      images: [
        {
          url: product.images[0].src,
          width: 1200,
          height: 1200,
          alt: product.images[0].alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle,
      description: product.metaDescription,
      images: [product.images[0].src],
    },
    robots: { index: true, follow: true },
  };
}

export async function PadelProductPage({ params, categorySlug }) {
  const { slug } = await params;
  const product = getProduct(categorySlug, slug);
  if (!product) notFound();

  const canonical = getProductUrl(product, slug);
  const categoryUrl =
    product.categorySlug === "padel-accessories"
      ? `${siteUrl}/padel-accessories/`
      : `${siteUrl}/custom-padel-bag-manufacturer/`;
  const categoryHref =
    product.categorySlug === "padel-accessories"
      ? "/padel-accessories/"
      : "/custom-padel-bag-manufacturer/";
  const relatedProducts = padelProductEntries.filter(
    (related) => related.sku !== product.sku,
  );
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: product.category,
          item: categoryUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: canonical,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      sku: product.sku,
      name: product.name,
      description: product.metaDescription,
      image: product.images.map((image) => `${siteUrl}${image.src}`),
      url: canonical,
      brand: { "@type": "Brand", name: "Cappuccino" },
      manufacturer: {
        "@type": "Organization",
        name: "Cappuccino Bag",
        url: siteUrl,
      },
      category: product.category,
      audience: {
        "@type": "BusinessAudience",
        audienceType:
          "Padel brands, clubs, specialist retailers, importers and wholesalers",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: product.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PadelHeader />
      <main className="padel-product-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={categoryHref}>{product.category}</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <section className="padel-product-hero">
          <div className="padel-product-copy">
            <p className="eyebrow">
              {product.sku} · OEM/ODM development direction
            </p>
            <h1>{product.title}</h1>
            <h2 className="padel-hero-heading">{product.heroHeading}</h2>
            <p className="padel-product-lede">{product.intro}</p>
            <p className="padel-reference-capacity">
              <strong>Reference:</strong> {product.referenceCapacity}
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={getInquiryUrl(product)}>
                Request Project Review &amp; Quote
              </Link>
              <a
                className="btn btn-secondary"
                href="mailto:info@cappuccinobag.net"
              >
                Email Product Brief
              </a>
            </div>
          </div>
          <figure className="padel-product-main-image">
            <Image
              src={product.images[0].src}
              width={1200}
              height={1200}
              sizes="(max-width: 900px) calc(100vw - 36px), 54vw"
              alt={product.images[0].alt}
              priority
            />
          </figure>
        </section>

        <aside className="padel-development-notice">
          <strong>Development status:</strong> {developmentNotice}
        </aside>

        <section className="padel-product-section padel-product-overview">
          <div>
            <p className="eyebrow">Product Highlights</p>
            <h2>Designed for a coordinated private-label range</h2>
            <p>
              The structure, material, trim, branding and packaging can be
              developed around the buyer&apos;s target market and approved
              specification.
            </p>
          </div>
          <ul>
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="padel-product-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Four-view gallery</p>
            <h2>Main, carry, open-structure and detail views</h2>
          </div>
          <div className="padel-product-gallery">
            {product.images.map((image) => (
              <Image
                key={image.src}
                src={image.src}
                width={1200}
                height={1200}
                sizes="(max-width: 620px) calc(100vw - 28px), (max-width: 900px) 48vw, 25vw"
                alt={image.alt}
              />
            ))}
          </div>
        </section>

        <section className="padel-product-section padel-reference-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Reference development specification</p>
            <h2>Sampling brief, not a fixed retail specification</h2>
          </div>
          <dl className="padel-reference-grid">
            {product.specifications.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="padel-product-section padel-oem-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Factory Development</p>
            <h2>OEM / ODM customization options</h2>
            <p>
              Final materials, construction, MOQ, price, sampling plan and
              production lead time are quoted after the project brief is
              reviewed.
            </p>
          </div>
          <div className="padel-option-layout">
            <div>
              <h3>Development options</h3>
              <ul>
                {product.oemOptions.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Ideal buyers</h3>
              <ul>
                {product.buyers.map((buyer) => (
                  <li key={buyer}>{buyer}</li>
                ))}
              </ul>
            </div>
          </div>
          <Link className="btn btn-primary" href={getInquiryUrl(product)}>
            Send {product.sku} Development Brief
          </Link>
        </section>

        <section className="padel-product-section padel-faq-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Buyer Questions</p>
            <h2>{product.name} FAQ</h2>
          </div>
          <div className="padel-faq-list">
            {product.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="padel-product-section padel-related-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Related Collection</p>
            <h2>Build a complete Cappuccino Padel Collection 2026 range</h2>
          </div>
          <div className="padel-related-grid">
            {relatedProducts.map((related) => (
              <article key={related.sku}>
                <Image
                  src={related.images[0].src}
                  width={1200}
                  height={1200}
                  sizes="(max-width: 700px) calc(100vw - 36px), 31vw"
                  alt={related.images[0].alt}
                />
                <div>
                  <p className="eyebrow">{related.sku}</p>
                  <h3>{related.name}</h3>
                  <Link href={related.href}>View product direction</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="padel-product-rfq">
          <div>
            <p className="eyebrow">Start Your Project</p>
            <h2>Send the {product.sku} brief for factory review</h2>
            <p>
              {product.cta} Email{" "}
              <a href="mailto:info@cappuccinobag.net">
                info@cappuccinobag.net
              </a>
              .
            </p>
          </div>
          <Link className="btn btn-primary" href={getInquiryUrl(product)}>
            Request OEM/ODM Quote
          </Link>
        </section>
      </main>
      <PadelFooter />
    </>
  );
}
