import Image from "next/image";
import NextLink from "next/link";
import { PadelFooter, PadelHeader } from "../padel-components";
import { getPadelProductsByCategory, siteUrl } from "../padel-products";

const accessories = getPadelProductsByCategory("padel-accessories");

function Link(props) {
  return <NextLink {...props} prefetch={false} />;
}

export const metadata = {
  title: "Custom Padel Accessories | Private Label OEM Development",
  description:
    "Explore private-label padel shoe bag and court essentials organizer concepts for coordinated retail, club, tournament and gift collections.",
  alternates: { canonical: `${siteUrl}/padel-accessories` },
  openGraph: {
    title: "Custom Padel Accessories | Private Label OEM Development",
    description:
      "Private-label padel shoe bag and organizer pouch development for brands, clubs and specialist retailers.",
    url: `${siteUrl}/padel-accessories`,
    type: "website",
    images: [
      {
        url: "/images/padel/cappuccino-padel-collection-2026-details.png",
        width: 1254,
        height: 1254,
        alt: "Cappuccino Padel Collection 2026 accessory and construction details",
      },
    ],
  },
};

export default function PadelAccessoriesPage() {
  const breadcrumbSchema = {
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
        name: "Padel Accessories",
        item: `${siteUrl}/padel-accessories`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PadelHeader />
      <main className="padel-accessories-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Padel Accessories</span>
        </nav>
        <section className="padel-accessories-hero">
          <div>
            <p className="eyebrow">Cappuccino Padel Collection 2026</p>
            <h1>Custom Padel Accessories</h1>
            <p>
              Extend a private-label racket bag programme with coordinated
              footwear storage and court-essential organisation for clubs,
              retailers, events and gift bundles.
            </p>
            <p className="padel-accessories-note">
              These are OEM/ODM development directions. Final dimensions,
              materials, MOQ, price and lead time are confirmed during sampling
              and quotation.
            </p>
            <div className="hero-actions">
              <Link
                className="btn btn-primary"
                href="/inquiry/?product=Padel%20Bags&format=Padel%20Accessories"
              >
                Request Accessories Quote
              </Link>
              <Link
                className="btn btn-secondary"
                href="/custom-padel-bag-manufacturer"
              >
                View Full Padel Collection
              </Link>
            </div>
          </div>
          <Image
            src="/images/padel/cappuccino-padel-collection-2026-details.png"
            width={1254}
            height={1254}
            sizes="(max-width: 900px) calc(100vw - 36px), 48vw"
            alt="Cappuccino Padel Collection 2026 accessory and construction details"
            priority
          />
        </section>

        <section className="padel-product-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Padel Accessories</p>
            <h2>Coordinated private-label development directions</h2>
          </div>
          <div className="padel-accessory-grid">
            {accessories.map((product) => (
              <article key={product.sku}>
                <Image
                  src={product.images[0].src}
                  width={1200}
                  height={1200}
                  sizes="(max-width: 700px) calc(100vw - 36px), 50vw"
                  alt={product.images[0].alt}
                />
                <div>
                  <p className="eyebrow">{product.sku}</p>
                  <h2>{product.name}</h2>
                  <p>{product.metaDescription}</p>
                  <Link href={product.href}>View product direction</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <PadelFooter />
    </>
  );
}
