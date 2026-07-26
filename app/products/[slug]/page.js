import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const siteUrl = "https://www.cappuccinobag.com";

const products = {
  "custom-padel-backpack-racket-compartment": {
    title: "Custom Padel Backpack with Laptop Sleeve & Racket Compartment | Cappuccino",
    h1: "Custom Padel Backpack with Racket Compartment",
    description:
      "Premium custom padel backpack with racket side compartment, padded straps, laptop sleeve and organized storage for clubs, sports brands and OEM/ODM buyers.",
    image: "/images/padel/padel-backpack-detail-sheet.webp",
    alt: "custom black padel backpack with racket side compartment and laptop sleeve",
    eyebrow: "Private Label Padel Backpack",
    intro:
      "A court-to-commute backpack for clubs and sports brands that need protected racket carry, organized storage and a clean private-label presentation.",
    points: [
      "Dedicated racket side compartment",
      "Padded straps and back panel for comfort",
      "Laptop sleeve for work-to-court travel",
      "Water-resistant premium exterior",
      "Ideal for OEM / ODM logo customization",
    ],
    keywords:
      "This private label padel backpack can be developed by an OEM padel bag factory as part of a coordinated custom padel bag manufacturer program.",
    gallery: [
      {
        src: "/images/padel/original-laptop-sleeve-detail.webp",
        alt: "padded laptop sleeve detail inside a custom sports backpack",
      },
      {
        src: "/images/padel/original-back-panel-straps.webp",
        alt: "padded back panel and shoulder straps on a custom black sports backpack",
      },
    ],
  },
  "premium-padel-racket-bag": {
    title: "Premium Padel Racket Bag with Ergonomic Carry | Cappuccino",
    h1: "Premium Padel Racket Bag for Players & Clubs",
    description:
      "Sleek padel racket bag with secure racket compartment, ergonomic carry strap and durable water-resistant material for players, clubs and private-label buyers.",
    image: "/images/padel/padel-racket-bag-detail-sheet.webp",
    alt: "premium black padel racket bag with ergonomic carry strap for private label brands",
    eyebrow: "Custom Racket Sports Bag",
    intro:
      "A streamlined racket bag for clubs, players and brand programs that value secure storage, comfortable carry and a polished court-ready profile.",
    points: [
      "Secure racket compartment",
      "Lightweight ergonomic carry",
      "Premium protective shell",
      "Stylish court-ready silhouette",
      "Suitable for custom logo branding",
    ],
    keywords:
      "Develop this custom racket sports bag with material, trim, logo and packaging choices aligned to your private-label collection.",
    gallery: [],
  },
  "custom-padel-duffel-bag-shoe-compartment": {
    title: "Custom Padel Duffel Bag with Separate Shoe Storage | Cappuccino",
    h1: "Custom Padel Duffel Bag with Shoe Compartment",
    description:
      "Spacious custom padel duffel bag with large main compartment, separate shoe storage and padded shoulder strap for sports brands, clubs and OEM/ODM orders.",
    image: "/images/padel/padel-duffel-bag-detail-sheet.webp",
    alt: "custom padel duffel bag with separate shoe compartment and padded shoulder strap",
    eyebrow: "Private Label Match-Day Duffel",
    intro:
      "A high-capacity match-day and travel bag developed for sports brands that need separate footwear storage, adaptable carry and dependable organization.",
    points: [
      "High-capacity main compartment",
      "Separate shoe storage",
      "Padded top handle and shoulder strap",
      "Great for training, travel and match day",
      "Private-label ready with custom branding",
    ],
    keywords:
      "This sports duffel bag with shoe compartment can be sampled with custom dimensions, lining, hardware and club or brand packaging.",
    gallery: [],
  },
  "multi-functional-sports-backpack": {
    title: "Multi-Functional Sports Backpack for Padel Travel & Daily Use | Cappuccino",
    h1: "Multi-Functional Sports Backpack for Padel, Travel & Daily Use",
    description:
      "A multifunction sports backpack designed for padel, commuting and weekend travel, with organized storage, laptop sleeve and premium court-to-travel styling.",
    image: "/images/padel/multi-functional-sports-backpack-detail-sheet.webp",
    alt: "multi functional sports backpack with organized compartments and laptop sleeve for padel travel",
    eyebrow: "Court-to-Travel Backpack",
    intro:
      "A versatile backpack for commuting, training and short trips, with a practical storage plan and a clear area for private-label branding.",
    points: [
      "Organized internal compartments",
      "Travel-friendly padded laptop section",
      "Premium detailing and durable zippers",
      "Court-to-travel versatile design",
      "Clean OEM-friendly branding area",
    ],
    keywords:
      "The format works as a private label padel backpack or wider travel program for buyers sourcing from a custom padel bag manufacturer.",
    gallery: [
      {
        src: "/images/padel/original-laptop-sleeve-detail.webp",
        alt: "organized padded laptop section in a multifunction sports backpack",
      },
      {
        src: "/images/padel/original-back-panel-straps.webp",
        alt: "comfortable padded straps and back panel for a travel sports backpack",
      },
    ],
  },
};

const customizationItems = [
  ["Logo", "silk screen, heat transfer, embroidery, rubber patch, woven label"],
  ["Materials", "nylon, polyester, PU, vegan leather, recycled fabric options"],
  ["MOQ", "based on material and logo method"],
  ["Sample Time", "usually 7–15 days after design confirmation"],
  ["Bulk Lead Time", "based on order quantity and packaging"],
  ["Packaging", "polybag, hangtag, barcode label, carton, retail packaging"],
];

const faqs = [
  {
    question: "Can the size, compartments and materials be customized?",
    answer:
      "Yes. Dimensions, storage layout, fabrics, lining, hardware and reinforcement details are reviewed against the intended use, target price and order quantity.",
  },
  {
    question: "Which logo methods are available?",
    answer:
      "Available methods include silk screen, heat transfer, embroidery, rubber patch and woven label. The suitable method depends on the material, artwork and finish.",
  },
  {
    question: "What is the MOQ for a custom padel bag order?",
    answer:
      "MOQ is confirmed after material and logo review because stock fabrics, custom-dyed materials and different branding methods have different production requirements.",
  },
  {
    question: "How long does sample development take?",
    answer:
      "Sample development usually takes 7–15 days after design confirmation, subject to material availability and construction complexity.",
  },
];

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products[slug];
  if (!product) return {};

  const canonical = `${siteUrl}/products/${slug}`;
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical },
    openGraph: {
      title: product.title,
      description: product.description,
      url: canonical,
      type: "website",
      images: [{ url: product.image, width: 1448, height: 1086, alt: product.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: [product.image],
    },
    robots: { index: true, follow: true },
  };
}

function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Cappuccino Bag home">
        <span className="brand-mark" aria-hidden="true" />
        <span>Cappuccino Bag</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/custom-padel-bag-manufacturer/">Padel Bags</Link>
        <Link href="/custom-pickleball-paddle-bags/">Pickleball Bags</Link>
        <Link href="/custom-tennis-padel-racket-bags/">Tennis Bags</Link>
        <Link href="/custom-travel-backpacks-weekender-bags/">Travel Bags</Link>
        <Link href="/factory-trust-materials/">Factory Proof</Link>
        <Link href="/inquiry/">RFQ</Link>
      </nav>
      <Link className="header-cta" href="/inquiry/">Request a Quote</Link>
      <details className="mobile-menu">
        <summary aria-label="Open mobile navigation"><span /><span /></summary>
        <nav aria-label="Mobile navigation">
          <Link href="/">Home</Link>
          <Link href="/custom-padel-bag-manufacturer/">Padel Bags</Link>
          <Link href="/custom-tennis-padel-racket-bags/">Racket Bags</Link>
          <Link href="/factory-trust-materials/">Factory Proof</Link>
          <Link href="/inquiry/">RFQ</Link>
        </nav>
      </details>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer padel-product-footer">
      <div>
        <strong>Cappuccino Bag</strong>
        <p>Custom outdoor, racquet sports and travel bag manufacturing for global brands.</p>
        <p><a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a></p>
      </div>
      <div className="footer-links">
        <Link href="/">Home</Link>
        <Link href="/custom-padel-bag-manufacturer/">Padel Collection</Link>
        <Link href="/contact/">Contact</Link>
        <Link href="/inquiry/">RFQ</Link>
      </div>
    </footer>
  );
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = products[slug];
  if (!product) notFound();

  const canonical = `${siteUrl}/products/${slug}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Padel Bag Collection",
          item: `${siteUrl}/custom-padel-bag-manufacturer/`,
        },
        { "@type": "ListItem", position: 3, name: product.h1, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.h1,
      description: product.description,
      image: [`${siteUrl}${product.image}`],
      url: canonical,
      brand: { "@type": "Brand", name: "Cappuccino" },
      manufacturer: { "@type": "Organization", name: "Cappuccino Bag", url: siteUrl },
      category: "Custom Padel and Racket Sports Bags",
      audience: { "@type": "BusinessAudience", audienceType: "Brands, clubs and OEM/ODM buyers" },
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
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Header />
      <main className="padel-product-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/custom-padel-bag-manufacturer/">Padel Collection</Link><span aria-hidden="true">/</span>
          <span>{product.h1}</span>
        </nav>

        <section className="padel-product-hero">
          <div className="padel-product-copy">
            <p className="eyebrow">{product.eyebrow}</p>
            <h1>{product.h1}</h1>
            <p className="padel-product-lede">{product.intro}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={`/inquiry/?product=${encodeURIComponent(product.h1)}`}>
                Get Factory Review &amp; Sample Quote
              </Link>
              <Link className="btn btn-secondary" href="/custom-padel-bag-manufacturer/">
                View Padel Collection
              </Link>
            </div>
          </div>
          <figure className="padel-product-main-image">
            <Image src={product.image} width={1448} height={1086} alt={product.alt} priority />
          </figure>
        </section>

        <section className="padel-product-section padel-product-overview">
          <div>
            <p className="eyebrow">Product Highlights</p>
            <h2>Designed Around Real Player and Brand Needs</h2>
            <p>{product.keywords}</p>
          </div>
          <ul>
            {product.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </section>

        {product.gallery.length > 0 && (
          <section className="padel-product-section">
            <div className="padel-product-heading">
              <p className="eyebrow">Detail Gallery</p>
              <h2>Storage and Carry Details</h2>
            </div>
            <div className="padel-product-gallery">
              {product.gallery.map((image) => (
                <Image key={image.src} src={image.src} width={2000} height={2000} alt={image.alt} />
              ))}
            </div>
          </section>
        )}

        <section className="padel-product-section padel-oem-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Factory Development</p>
            <h2>OEM / ODM Customization Options</h2>
            <p>Confirm construction, branding and packaging against your target market before sample development.</p>
          </div>
          <dl className="padel-spec-grid">
            {customizationItems.map(([term, description]) => (
              <div key={term}><dt>{term}</dt><dd>{description}</dd></div>
            ))}
          </dl>
          <Link className="btn btn-primary" href={`/inquiry/?product=${encodeURIComponent(product.h1)}`}>
            Get Factory Review &amp; Sample Quote
          </Link>
        </section>

        <section className="padel-product-section padel-faq-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Buyer Questions</p>
            <h2>Custom Padel Bag FAQ</h2>
          </div>
          <div className="padel-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="padel-product-rfq">
          <div>
            <p className="eyebrow">Start Your Project</p>
            <h2>Send Your Brief for Factory Review</h2>
            <p>Share quantity, material direction, logo artwork, packaging needs and target timing for a practical sample and bulk-order review.</p>
          </div>
          <Link className="btn btn-primary" href={`/inquiry/?product=${encodeURIComponent(product.h1)}`}>
            Request OEM/ODM Quote
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
