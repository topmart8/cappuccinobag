import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

const siteUrl = "https://www.cappuccinobag.com";
const collections = [
  { name: "Padel Bags", href: "/custom-padel-bag-manufacturer", description: "Racket duffels, backpacks, shoe bags, organizers and court-to-office formats." },
  { name: "Pickleball Bags", href: "/custom-pickleball-paddle-bags", description: "Paddle storage, compact tournament carry, club programs and US retail formats." },
  { name: "Tennis Bags", href: "/custom-tennis-bag-manufacturer", description: "Custom racket capacity, thermal sections, footwear storage and club collections." },
  { name: "Outdoor & Hiking Bags", href: "/custom-outdoor-sports-bag-manufacturer", description: "Load systems, shoulder straps, back panels, hydration storage and weather-resistant constructions." },
  { name: "Travel Bags", href: "/custom-travel-backpacks-weekender-bags", description: "Weekenders, duffels, laptop travel, organization and hospitality programs." },
  { name: "Running & Sports Bags", href: "/running-waist-packs", description: "Waist packs, hydration belts, marathon race belts, phone belts and trail running formats." },
  { name: "Pet Travel Bags", href: "/pet-travel-bags", description: "Carefully scoped carrier, organizer and accessory development with project-specific requirements." },
  { name: "RFID Wallets & Accessories", href: "/rfid-wallet-passport-holder-manufacturer", description: "RFID wallets, passport holders, card holders and coordinated travel accessories." },
];

export const metadata = {
  title: "Custom Bag Product Collections | Cappuccino Bag",
  description: "Browse Cappuccino Bag OEM/ODM collections for padel, pickleball, tennis, outdoor, travel, running, pet travel and RFID accessory projects.",
  alternates: { canonical: `${siteUrl}/products` },
  openGraph: {
    title: "Custom Bag Product Collections | Cappuccino Bag",
    description: "A product navigation directory for Cappuccino Bag OEM/ODM bag collections.",
    url: `${siteUrl}/products`,
    type: "website",
  },
  twitter: { card: "summary", title: "Custom Bag Product Collections | Cappuccino Bag" },
  robots: { index: true, follow: true },
};

export default function ProductsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Custom Bag Collections for OEM/ODM Projects",
        url: `${siteUrl}/products`,
        isPartOf: { "@type": "WebSite", name: "Cappuccino Bag", url: siteUrl },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: collections.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: `${siteUrl}${item.href}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <main className="products-directory">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Products</span></nav>
        <section className="products-directory-hero">
          <p className="eyebrow">Product Directory</p>
          <h1>Custom Bag Collections for OEM/ODM Projects</h1>
          <p>Choose a product family to review formats, development considerations and a focused RFQ path. Padel is the first core growth category.</p>
        </section>
        <section className="products-directory-grid" aria-label="Custom bag collections">
          {collections.map((item, index) => (
            <article key={item.href}>
              <p className="eyebrow">{String(index + 1).padStart(2, "0")}</p>
              <h2><Link href={item.href}>{item.name}</Link></h2>
              <p>{item.description}</p>
              <Link className="padel-text-link" href={item.href}>Explore collection</Link>
            </article>
          ))}
        </section>
        <section className="padel-product-section">
          <div className="padel-product-heading">
            <p className="eyebrow">Development Proof</p>
            <h2>See how custom briefs become manufacturable products</h2>
            <p>Review hospitality, vegan leather beauty accessory and rhinestone handbag projects before preparing your own product brief.</p>
          </div>
          <Link className="padel-text-link" href="/case-studies">Explore customer case studies</Link>
        </section>
        <section className="padel-product-rfq">
          <div><p className="eyebrow">Project Review</p><h2>Need help choosing a collection?</h2><p>Send the intended product, quantity, material direction, functions, target market and timing for a practical development route.</p></div>
          <Link className="btn btn-primary" href="/inquiry">Start an RFQ</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
