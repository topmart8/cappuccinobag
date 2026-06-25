const categories = [
  {
    title: "Tennis & Padel Racket Bags",
    href: "/custom-tennis-padel-racket-bags/",
    text: "Thermal racket compartments, shoe pockets, club-ready silhouettes, and private-label trims.",
  },
  {
    title: "Pickleball Paddle Bags",
    href: "/custom-pickleball-paddle-bags/",
    text: "Paddle backpacks, sling bags, fence-hook bags, sleeves, and tournament carry programs.",
  },
  {
    title: "Hiking Daypacks",
    href: "/custom-hiking-daypacks-outdoor-backpacks/",
    text: "Trail packs, urban-outdoor daypacks, hydration layouts, breathable back systems, and QC.",
  },
  {
    title: "Travel Duffel Bags",
    href: "/custom-sports-duffel-bags.html",
    text: "Gym, travel, team, wet-pocket, shoe-tunnel, and reinforced-bottom duffel programs.",
  },
  {
    title: "Hotel Custom Bags",
    href: "/hotel-group-custom-bag-project-guide/",
    text: "Amenity totes, laundry bags, slipper pouches, guest organizers, and hotel packaging.",
  },
  {
    title: "RFID Wallets & Passport Holders",
    href: "/rfid-wallets-passport-holders/",
    text: "Slim travel wallets, RFID passport holders, gift sets, and coordinated accessories.",
  },
];

const trustItems = [
  [
    "16 years bag manufacturing experience",
    "Long-term production know-how across soft goods, trims, packing, and export workflows.",
  ],
  [
    "OEM/ODM sample development",
    "Turn references, sketches, and buyer briefs into workable samples and production specs.",
  ],
  [
    "Outdoor, racquet sports, travel and wallet production",
    "One partner for category expansion across sports, outdoor, daily carry, and accessories.",
  ],
  [
    "BSCI / CE manufacturing support",
    "Documentation and production support for buyers with compliance and retail requirements.",
  ],
  [
    "QC photos before shipment",
    "Front, inside, logo, compartment, packing, and carton evidence before goods leave the factory.",
  ],
  [
    "Private label packaging support",
    "Hang tags, polybags, barcode labels, carton marks, and buyer-specific packing instructions.",
  ],
  [
    "Export-ready packing for global buyers",
    "Carton planning and shipment preparation for distributors, retailers, clubs, and brand owners.",
  ],
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://cappuccinobag.com/#organization",
      name: "Cappuccino Bags",
      url: "https://cappuccinobag.com/",
      description:
        "OEM/ODM bag manufacturer in China for outdoor, racquet sports, travel, wallet, and hospitality bag programs.",
      image: "https://cappuccinobag.com/assets/hero-sports-bag-manufacturer.png",
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
      name: "Cappuccino Bags",
      publisher: { "@id": "https://cappuccinobag.com/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": "https://cappuccinobag.com/#webpage",
      url: "https://cappuccinobag.com/",
      name: "Custom Outdoor & Racquet Sports Bag Manufacturer in China",
      isPartOf: { "@id": "https://cappuccinobag.com/#website" },
      about: { "@id": "https://cappuccinobag.com/#organization" },
      primaryImageOfPage: "https://cappuccinobag.com/assets/hero-sports-bag-manufacturer.png",
      inLanguage: "en",
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <section className="homeHero" aria-label="Custom outdoor and racquet sports bag manufacturer">
        <nav className="homeNav" aria-label="Primary navigation">
          <a className="brand" href="#">
            <span className="brandMark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 17.5 12 4l7 13.5H5Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 14h6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            Cappuccino Bags
          </a>
          <div className="navLinks" aria-label="Homepage sections">
            <a href="#products">Products</a>
            <a href="#trust">Why Us</a>
            <a href="/custom-tennis-padel-racket-bags/">Tennis & Padel</a>
            <a href="/resources/outdoor-multifunctional-bag-manufacturing-guide/">Resources</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="navCta" href="#contact">Request Samples</a>
        </nav>

        <div className="heroInner">
          <div className="heroCopy">
            <h1>Custom Outdoor &amp; Racquet Sports Bags</h1>
            <p className="lead">OEM/ODM manufacturing for padel, pickleball, tennis, hiking, travel, and hotel brands.</p>

            <div className="actions" aria-label="Primary actions">
              <a className="primary" href="#contact">
                Start Your Custom Bag Project
                <span aria-hidden="true">-&gt;</span>
              </a>
              <a className="secondary" href="#products">View Bag Collections</a>
            </div>

            <div className="proof" aria-label="Manufacturing highlights">
              <div className="proofItem">
                <span className="proofValue">OEM/ODM</span>
                <span className="proofLabel">Private-label development from material selection to bulk production.</span>
              </div>
              <div className="proofItem">
                <span className="proofValue">Multi-category</span>
                <span className="proofLabel">Outdoor, racquet sports, travel, wallet, and hotel bag programs.</span>
              </div>
              <div className="proofItem">
                <span className="proofValue">Export Ready</span>
                <span className="proofLabel">Sampling, QC, packaging, and shipment support for global sports brands.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="preview" aria-label="Next section preview">
          <div className="previewCell">
            <span className="previewTitle">Built for brands, teams, and distributors</span>
            <span className="previewText">Custom fabric, compartments, logo applications, zipper pulls, trims, and retail packaging.</span>
          </div>
          <div className="previewCell">
            <span className="previewTitle">From sample to shipment</span>
            <span className="previewText">Clear development workflow for fast quoting, prototyping, and reliable production control.</span>
          </div>
        </div>
      </section>

      <section className="below" id="products" aria-label="Product categories">
        <div className="belowInner">
          {categories.map((category) => (
            <a className="category" href={category.href} key={category.title}>
              <h2>{category.title}</h2>
              <p>{category.text}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="trust" id="trust" aria-label="Why brand buyers work with Cappuccino Bags">
        <div className="trustInner">
          <div>
            <h2>Why Brand Buyers Work With Cappuccino Bags</h2>
            <p className="trustLead">
              A practical factory partner for custom outdoor, racquet sports, travel, wallet, and hospitality bag programs.
            </p>
          </div>
          <div className="trustGrid">
            {trustItems.map(([title, text]) => (
              <div className="trustItem" key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="oemStrip" aria-label="OEM ODM capability">
        <div>
          <h2>One Factory. Multiple Outdoor Bag Solutions.</h2>
          <p>Design support, material sourcing, sampling, revisions, bulk manufacturing, quality inspection, private label customization, and export-ready packing.</p>
        </div>
        <a href="/factory-trust-materials/">View Factory Trust Materials</a>
      </section>

      <section className="contact" id="contact" aria-label="Request OEM ODM bag support">
        <div className="contactInner">
          <div>
            <h2>Ready to develop a custom bag line?</h2>
            <p>
              Send your target product, reference photos, quantity, logo method, packaging needs, and deadline. Cappuccino Bags can review the brief and suggest a practical sample route.
            </p>
          </div>
          <span className="contactAction">Request OEM/ODM Support</span>
        </div>
      </section>
    </main>
  );
}
