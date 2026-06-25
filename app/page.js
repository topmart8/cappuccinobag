const categories = [
  {
    title: "Padel Bags",
    href: "/custom-padel-bags.html",
    text: "Thermal racquet pockets, shoe compartments, wet zones, and club-ready carry systems.",
  },
  {
    title: "Pickleball Bags",
    href: "/custom-pickleball-bags.html",
    text: "Compact court bags, paddle sleeves, tournament backpacks, and retail sets.",
  },
  {
    title: "Tennis Bags",
    href: "/custom-tennis-bags.html",
    text: "Racquet capacity planning, thermal lining, shoe pockets, and retail-ready structures.",
  },
  {
    title: "Hiking Backpacks",
    href: "/custom-hiking-backpacks.html",
    text: "Trail packs with breathable backs, hydration routing, rain covers, and durable trims.",
  },
  {
    title: "Sports Duffel Bags",
    href: "/custom-sports-duffel-bags.html",
    text: "Gym, team, travel, shoe tunnel, wet pocket, and reinforced bottom programs.",
  },
  {
    title: "Hotel Custom Bags",
    href: "/custom-hotel-bags.html",
    text: "Amenity totes, laundry bags, slipper pouches, hospitality organizers, and private packing.",
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

export default function Home() {
  return (
    <main>
      <section className="homeHero" aria-label="Custom outdoor and racquet sports bag manufacturer">
        <nav className="homeNav" aria-label="Primary navigation">
          <a className="brand" href="#">
            <span className="brandMark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 17.5 12 4l7 13.5H5Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 14h6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            Bag OEM China
          </a>
          <div className="navLinks" aria-label="Homepage sections">
            <a href="#products">Products</a>
            <a href="#trust">Why Us</a>
            <a href="/custom-tennis-bags.html">Tennis</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="navCta" href="#contact">Request Samples</a>
        </nav>

        <div className="heroInner">
          <div className="heroCopy">
            <h1>Custom Outdoor &amp; Racquet Sports Bag Manufacturer in China</h1>
            <p className="lead">OEM/ODM Padel Bags, Pickleball Bags, Hiking Backpacks &amp; Travel Bags</p>

            <div className="actions" aria-label="Primary actions">
              <a className="primary" href="#contact">
                Start Your Custom Bag Project
                <span aria-hidden="true">-&gt;</span>
              </a>
              <a className="secondary" href="#products">View Bag Categories</a>
            </div>

            <div className="proof" aria-label="Manufacturing highlights">
              <div className="proofItem">
                <span className="proofValue">OEM/ODM</span>
                <span className="proofLabel">Private-label development from material selection to bulk production.</span>
              </div>
              <div className="proofItem">
                <span className="proofValue">4 Lines</span>
                <span className="proofLabel">Padel, pickleball, hiking, and travel bag programs under one factory partner.</span>
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
