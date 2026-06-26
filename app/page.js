const categoryCards = [
  {
    title: "Padel Bags",
    image: "/assets/chatgpt-padel-duffel-closeup.jpg",
    alt: "Custom padel duffel bag in a premium court setting",
    large: true,
  },
  {
    title: "Padel Backpacks",
    image: "/assets/chatgpt-padel-backpack-closeup.jpg",
    alt: "Padel backpack and duffel with racket storage",
  },
  {
    title: "Travel Duffel Bags",
    image: "/assets/category-custom-printed-duffel-1200x1200.jpg",
    alt: "Custom printed travel duffel bags",
  },
  {
    title: "Hotel Custom Bags",
    image: "/assets/trust-showroom-1600x900.jpg",
    alt: "Hotel custom bag product range",
  },
  {
    title: "RFID Wallets & Passport Holders",
    text: "Travel accessories with private label support.",
    tone: "sky",
  },
  {
    title: "Sustainable / Recycled Programs",
    text: "Recycled fabrics, material sourcing, and buyer documentation.",
    tone: "moss",
  },
  {
    title: "Sport & Gym Bags",
    image: "/assets/trust-real-factory-product-1600x900.jpg",
    alt: "Sport and gym bag manufacturing options",
  },
  {
    title: "Custom Printed Bags",
    image: "/assets/category-bag-open-storage-1200x1200.jpg",
    alt: "Custom printed bag with organized compartments",
  },
];

const trustCards = [
  {
    title: "Sample Development",
    text: "Translate sketches, references, and buyer briefs into workable samples with practical revisions.",
    image: "/assets/chatgpt-oem-workshop-lineup.jpg",
    alt: "OEM bag development with materials, trims, and product lineup",
  },
  {
    title: "Showroom & Product Range",
    text: "Review silhouettes, trims, materials, and category structures across sport, travel, and hospitality.",
    image: "/assets/trust-showroom-1600x900.jpg",
    alt: "Showroom product range for custom bags",
  },
  {
    title: "Bulk Production & QC",
    text: "Production planning, inspection checkpoints, and export-ready packing for repeat orders.",
    image: "/assets/trust-bulk-and-family-lineup-1600x900.jpg",
    alt: "Bulk production lineup for custom bags",
  },
];

const capabilities = [
  "Design Support",
  "Material Sourcing",
  "Sampling & Revisions",
  "Bulk Manufacturing",
  "Quality Inspection",
  "Private Label Customization",
];

const detailChips = [
  "Racket compartment",
  "Shoe pocket",
  "Laptop sleeve",
  "Custom logo",
  "Custom printing",
  "Organized storage",
  "OEM packaging support",
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://cappuccinobag.com/#organization",
      name: "Cappuccino Bag",
      url: "https://cappuccinobag.com/",
      description:
        "China-based OEM/ODM manufacturer of custom outdoor, racquet sports, travel, hotel, RFID, and recycled bag programs.",
      image: "https://cappuccinobag.com/assets/chatgpt-hero-racquet-lifestyle.jpg",
      makesOffer: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "OEM/ODM bag sample development" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Private label bag manufacturing" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Export-ready packing and QC support" } },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://cappuccinobag.com/#website",
      url: "https://cappuccinobag.com/",
      name: "Cappuccino Bag",
      publisher: { "@id": "https://cappuccinobag.com/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": "https://cappuccinobag.com/#webpage",
      url: "https://cappuccinobag.com/",
      name: "Custom Outdoor & Racquet Sports Bags",
      isPartOf: { "@id": "https://cappuccinobag.com/#website" },
      about: { "@id": "https://cappuccinobag.com/#organization" },
      primaryImageOfPage: "https://cappuccinobag.com/assets/chatgpt-hero-racquet-lifestyle.jpg",
      inLanguage: "en",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Cappuccino Bag home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Cappuccino Bag</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#collections">Collections</a>
          <a href="#trust">Factory</a>
          <a href="#capabilities">OEM / ODM</a>
          <a href="#features">Features</a>
        </nav>
        <a className="header-cta" href="#inquiry">Start OEM Project</a>
        <details className="mobile-menu">
          <summary aria-label="Open mobile navigation">
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile navigation">
            <a href="#collections">Collections</a>
            <a href="#trust">Factory</a>
            <a href="#capabilities">OEM / ODM</a>
            <a href="#features">Features</a>
            <a href="#inquiry">Contact Sales</a>
          </nav>
        </details>
      </header>

      <main id="top">
        <section className="hero">
          <img
            className="hero-image"
            src="/assets/chatgpt-hero-racquet-lifestyle.jpg"
            alt="Cappuccino racquet sports bags in a premium tennis court lifestyle scene"
            width="1672"
            height="941"
            fetchPriority="high"
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1>Custom Outdoor &amp; Racquet Sports Bags</h1>
            <p>OEM/ODM manufacturing for padel, pickleball, tennis, hiking, travel, and hotel brands.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#inquiry">Start Your Custom Bag Project</a>
              <a className="btn btn-secondary" href="#collections">View Bag Collections</a>
            </div>
          </div>
        </section>

        <section className="section intro-panel" aria-label="Buyer support overview">
          <div className="intro-copy">
            <h2>Built for sourcing teams that need reliable category depth.</h2>
            <p>
              Cappuccino Bag supports overseas brands with product development, sampling, private label details,
              and export-ready production across sports, travel, hospitality, and sustainable bag programs.
            </p>
          </div>
          <div className="proof-grid">
            <div>
              <strong>OEM / ODM</strong>
              <span>Custom patterns, trims, labels, and packaging.</span>
            </div>
            <div>
              <strong>Sample Support</strong>
              <span>Structured revisions before bulk production.</span>
            </div>
            <div>
              <strong>Export Ready</strong>
              <span>Clear communication for overseas B2B buyers.</span>
            </div>
          </div>
        </section>

        <section className="section" id="collections">
          <div className="section-heading">
            <h2>Bag Collections for Outdoor, Sport &amp; Travel Brands</h2>
            <p>Explore core categories, then request samples, MOQ details, material options, and lead times.</p>
          </div>
          <div className="category-grid">
            {categoryCards.map((category) => (
              <a
                className={[
                  "category-card",
                  category.large ? "large" : "",
                  category.text ? "text-card" : "",
                  category.tone || "",
                ].filter(Boolean).join(" ")}
                href="#inquiry"
                key={category.title}
              >
                {category.image ? (
                  <>
                    <img src={category.image} alt={category.alt} width="1672" height="941" loading="lazy" />
                    <span>{category.title}</span>
                  </>
                ) : (
                  <>
                    <strong>{category.title}</strong>
                    <small>{category.text}</small>
                  </>
                )}
              </a>
            ))}
          </div>
        </section>

        <section className="section trust-section" id="trust">
          <div className="section-heading align-left">
            <h2>Why Overseas Buyers Trust Us</h2>
            <p>Real development steps, showroom range, and production readiness are visible from the first conversation.</p>
          </div>
          <div className="trust-grid">
            {trustCards.map((card) => (
              <article className="trust-card" key={card.title}>
                <img src={card.image} alt={card.alt} width="1672" height="941" loading="lazy" />
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="capability-band" id="capabilities">
          <div className="capability-copy">
            <h2>One Factory. Multiple Outdoor Bag Solutions.</h2>
            <p>
              From racquet compartments to recycled fabric programs, we help buyers turn category plans into
              manufacturable, brand-ready products.
            </p>
          </div>
          <div className="capability-list" aria-label="OEM ODM capability list">
            {capabilities.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="campaign-block">
          <img
            src="/assets/chatgpt-padel-backpack-closeup.jpg"
            alt="Cappuccino racquet sports bags for coordinated brand programs"
            width="1672"
            height="941"
            loading="lazy"
          />
          <div className="campaign-copy">
            <h2>Built for Players. Designed for Brands.</h2>
            <p>
              Build a coordinated line across padel, pickleball, tennis, gym, travel, and hospitality with consistent
              materials, hardware, logo placement, and packing standards.
            </p>
            <a className="btn btn-primary compact" href="#inquiry">Ask for MOQ &amp; Lead Time</a>
          </div>
        </section>

        <section className="section collection-board" aria-label="Padel bag collection campaign board">
          <img
            src="/assets/chatgpt-padel-collection-campaign.jpg"
            alt="Cappuccino padel bag collection 2026 campaign board"
            width="1672"
            height="941"
            loading="lazy"
          />
        </section>

        <section className="section feature-section" id="features">
          <div className="section-heading">
            <h2>Product Details Buyers Ask About First</h2>
            <p>Keep practical construction, branding, and packing conversations close to the inquiry flow.</p>
          </div>
          <div className="feature-layout">
            <article className="feature-media-card">
              <img
                src="/assets/chatgpt-padel-backpack-closeup.jpg"
                alt="Racquet backpack and duffel showing organized sports storage"
                width="1672"
                height="941"
                loading="lazy"
              />
              <div>
                <h3>Organized Storage</h3>
                <p>Racket compartment, shoe pocket, laptop sleeve, wet/dry zones, and daily-use interior pockets.</p>
              </div>
            </article>
            <article className="feature-media-card">
              <img
                src="/assets/chatgpt-padel-duffel-closeup.jpg"
                alt="Custom branded padel duffel bag for OEM programs"
                width="1672"
                height="941"
                loading="lazy"
              />
              <div>
                <h3>Brand-Ready Customization</h3>
                <p>Custom logo, custom printing, trims, woven labels, hangtags, and OEM packaging support.</p>
              </div>
            </article>
            <div className="detail-chips">
              {detailChips.map((chip) => <span key={chip}>{chip}</span>)}
            </div>
          </div>
        </section>

        <section className="factory-strip">
          <img
            src="/assets/chatgpt-oem-workshop-lineup.jpg"
            alt="Outdoor and racquet sports bags with material swatches for OEM development"
            width="1672"
            height="941"
            loading="lazy"
          />
          <div>
            <h2>Real Manufacturing, Clear Export Support</h2>
            <p>
              Work with a factory team that understands sample support, QC process, production communication,
              and export-ready service for overseas bag programs.
            </p>
            <a className="btn btn-secondary dark" href="#inquiry">Contact Sales</a>
          </div>
        </section>

        <section className="inquiry-section" id="inquiry">
          <div className="inquiry-copy">
            <h2>Start Your Custom Bag Project</h2>
            <p>Tell us your category, target quantity, materials, logo needs, and sample timeline.</p>
          </div>
          <form className="inquiry-form">
            <label>
              Product category
              <select defaultValue="Padel bags" aria-label="Product category">
                <option>Padel bags</option>
                <option>Pickleball bags</option>
                <option>Tennis bags</option>
                <option>Hiking backpacks</option>
                <option>Travel duffel bags</option>
                <option>Hotel custom bags</option>
                <option>RFID wallets / passport holders</option>
                <option>Sustainable / recycled program</option>
              </select>
            </label>
            <label>
              Project details
              <textarea rows="4" placeholder="Quantity, target market, materials, logo method, and timeline" />
            </label>
            <a className="btn btn-primary" href="mailto:info@cappuccinobag.com?subject=Custom%20Bag%20Project%20Inquiry">
              Request Sample
            </a>
            <p className="form-note">We will review MOQ, sample time, and customization options with you.</p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <a className="brand footer-brand" href="#top" aria-label="Cappuccino Bag home">
            <span className="brand-mark" aria-hidden="true" />
            <span>Cappuccino Bag</span>
          </a>
          <p>China-based OEM/ODM custom outdoor and racquet sports bag manufacturer.</p>
        </div>
        <div className="footer-links">
          <a href="#inquiry">Contact</a>
          <a href="#trust">Factory</a>
          <a href="#collections">Product Categories</a>
          <a href="#inquiry">Request Sample</a>
          <a href="#capabilities">OEM / ODM</a>
          <a href="#inquiry">WhatsApp / Email / Alibaba</a>
        </div>
      </footer>
    </>
  );
}
