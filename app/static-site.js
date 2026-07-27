import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { notFound } from "next/navigation";

const siteRoot = path.join(process.cwd(), "public", "site");
const publicRoot = path.join(process.cwd(), "public");
const publicRootPages = new Set([
  "custom-hiking-daypacks-outdoor-backpacks",
  "custom-pickleball-paddle-bags",
  "factory-trust-materials",
  "padel-brand-collection-development",
]);
const allowedPages = new Set([
  "",
  "contact",
  "download-catalog",
  "inquiry",
  "why-us",
  "resources",
  "custom-outdoor-multifunctional-bag-manufacturer",
  "custom-outdoor-sports-bag-manufacturer",
  "custom-tennis-bag-manufacturer",
  "custom-pickleball-bag-manufacturer",
  "custom-padel-bag-manufacturer",
  "custom-convertible-padel-backpack-duffel",
  "custom-hiking-backpack-manufacturer",
  "custom-mountaineering-backpack-manufacturer",
  "custom-travel-bag-luggage-manufacturer",
  "custom-rfid-wallet-manufacturer",
  "custom-magsafe-cardholder-manufacturer",
  "custom-phone-pouch-manufacturer",
  "phone-case-cardholder-gift-set-oem",
  "vegan-leather-tech-accessories-manufacturer",
  "eco-tech-smart-bag-manufacturer",
  "rfid-wallet-passport-holder-manufacturer",
  "custom-travel-backpacks-weekender-bags",
  "custom-tennis-padel-racket-bags",
  "custom-outdoor-sports-travel-bags",
  "custom-waterproof-adventure-duffel",
  "custom-waterproof-wheeled-gear-bag",
  "custom-insulated-cooler-backpack",
  "custom-waterproof-roll-top-backpack",
  "custom-insulated-cooler-tote-bag",
  "custom-laptop-travel-backpack",
  "alcantara-collection",
  "custom-alcantara-duffle-bag",
  "custom-alcantara-iphone-case",
  "custom-alcantara-card-holder",
  "blog/alcantara-bag-accessory-production-process",
  "blog/how-to-source-custom-waterproof-roll-top-backpack",
  "blog/custom-cooler-tote-bag-development-guide",
  "blog/laptop-travel-backpack-oem-buying-guide",
  "blog/verify-custom-bag-manufacturer-china",
  "blog/custom-bag-development-quality-control-process",
  "blog/bag-manufacturer-compliance-documents-explained",
  "outdoor-multifunctional-bag-manufacturing-guide",
  "outdoor-sports-bag-manufacturing-guide",
  "custom-tennis-bag-guide",
  "pickleball-bag-customization-guide",
  "padel-bag-design-guide",
  "hiking-backpack-customization-guide",
  "mountaineering-backpack-manufacturing-guide",
  "travel-bag-luggage-customization-guide",
  "hotel-group-custom-bag-project-guide",
  "wallet-materials-guide",
  "rfid-wallet-customization-guide",
  "card-holder-customization-guide",
  "eco-tech-bag-material-guide",
  "gps-trackable-bag-guide",
  "logo-customization-guide",
  "private-label-packaging-guide",
  "moq-sampling-faq",
  "quality-inspection-guide",
  "sustainable-bag-wallet-materials-guide",
  "recycled-eco-tech-bag-landing",
  "gps-trackable-smart-bag-landing",
  "custom-rfid-wallet-card-holder-landing",
  "custom-travel-weekender-bag-landing",
  "custom-gym-duffel-bag-landing",
  "custom-hiking-daypack-landing",
  "custom-tennis-padel-racket-bag-landing",
  "custom-pickleball-bag-landing",
  ...publicRootPages,
]);

export function generateStaticParamsForStaticPages({ includeHome = false } = {}) {
  return Array.from(allowedPages).map((pageSlug) => ({
    slug: pageSlug ? pageSlug.split("/") : []
  })).filter((params) => includeHome || params.slug.length > 0);
}

function getStaticFilePath(slug = []) {
  const pageSlug = slug.join("/");
  if (!allowedPages.has(pageSlug)) return null;

  if (!pageSlug) return path.join(siteRoot, "index.html");

  const sitePath = path.join(siteRoot, pageSlug, "index.html");
  if (fs.existsSync(sitePath)) return sitePath;

  if (publicRootPages.has(pageSlug)) {
    return path.join(publicRoot, pageSlug, "index.html");
  }

  return null;
}

function readStaticDocument(slug = []) {
  const filePath = getStaticFilePath(slug);
  if (!filePath || !fs.existsSync(filePath)) return null;

  return fs.readFileSync(filePath, "utf8");
}

function readStaticPage(slug = []) {
  const html = readStaticDocument(slug);
  if (!html) return null;

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const pageSlug = slug.join("/");
  return addPadelCollectionEntry(addRunningHomeEntry(addPadelHomeEntry(addBuyerGuideLinks(
    addAlcantaraContextLinks(
      addProductExpansionLinks(
        addRunningNavigation(normalizeHtml(bodyMatch ? bodyMatch[1] : html)),
        pageSlug
      ),
      pageSlug
    ),
    pageSlug
  ), pageSlug), pageSlug), pageSlug);
}

function addRunningNavigation(html) {
  if (html.includes('href="/running-waist-packs/"')) return html;
  return html
    .replace(
      /(<nav[^>]*aria-label=["'](?:Main navigation|Primary navigation)["'][^>]*>)/i,
      '$1<a href="/running-waist-packs/">Running Packs</a>',
    )
    .replace(
      /(<nav[^>]*aria-label=["']Mobile navigation["'][^>]*>)/i,
      '$1<a href="/running-waist-packs/">Running Packs</a>',
    );
}

function addRunningHomeEntry(html, pageSlug) {
  if (pageSlug !== "" || html.includes('id="running-collection-2026"')) return html;
  const section = `<style>.running-home-entry{width:min(1180px,calc(100% - 36px));margin:0 auto;padding:76px 0}.running-home-card{display:grid;grid-template-columns:.8fr 1.2fr;gap:42px;padding:38px;color:#fff;background:#1f3328;border-radius:16px}.running-home-card h2{margin:0;color:#fff;font-size:clamp(34px,4vw,54px);line-height:1.04}.running-home-card p{margin:0;color:#dfe9df;line-height:1.75}.running-home-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}@media(max-width:760px){.running-home-entry{width:calc(100% - 28px);padding:54px 0}.running-home-card{grid-template-columns:1fr;gap:18px;padding:25px}}</style><section class="running-home-entry" id="running-collection-2026"><div class="running-home-card"><div><p class="eyebrow">30 OEM/ODM development directions</p><h2>Cappuccino Running Collection 2026</h2></div><div><p>Explore custom running waist packs, hydration belts, trail carry, marathon race belts and phone belts for sports brands, retailers and clubs.</p><div class="running-home-actions"><a class="btn btn-primary" href="/running-waist-packs/">View 30 SKU Collection</a><a class="btn btn-secondary" href="/running/custom-oem-odm/">Running Belt OEM/ODM</a></div></div></div></section>`;
  return html.replace(/<section class="section" id="collections">/, `${section}<section class="section" id="collections">`);
}

function addPadelHomeEntry(html, pageSlug) {
  if (pageSlug !== "") return html;
  return html
    .replace(
      /<section class="section" id="collections">/,
      '<style>.padel-home-collection{width:min(1180px,calc(100% - 36px));margin:0 auto;padding:76px 0}.padel-home-banner{overflow:hidden;border-radius:16px;background:#171411;color:#fff}.padel-home-banner img{width:100%;height:auto;aspect-ratio:1672/941;object-fit:cover}.padel-home-banner-copy{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding:34px}.padel-home-banner-copy h2{margin:0;font-size:clamp(32px,4vw,52px);line-height:1.04}.padel-home-banner-copy p{margin:0;color:#e7ddd2;line-height:1.75}.padel-home-banner-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}@media(max-width:760px){.padel-home-collection{width:calc(100% - 28px);padding:54px 0}.padel-home-banner-copy{grid-template-columns:1fr;padding:24px}}</style><section class="padel-home-collection" id="padel-collection-2026"><div class="padel-home-banner"><img src="/images/padel/cappuccino-padel-collection-2026-lifestyle.png" width="1672" height="941" loading="lazy" alt="Cappuccino Padel Collection 2026 lifestyle scene for private-label sports bag development"><div class="padel-home-banner-copy"><div><p class="eyebrow">OEM/ODM development directions</p><h2>Cappuccino Padel Collection 2026</h2></div><div><p>Explore coordinated racket duffel, backpack, shoe bag and court organizer concepts. Final specifications, MOQ, price and lead time are confirmed during sampling and quotation.</p><div class="padel-home-banner-actions"><a class="btn btn-primary" href="/custom-padel-bag-manufacturer/">View Padel Collection</a><a class="btn btn-secondary" href="/inquiry/?product=Padel%20Bags&amp;format=Padel%20Collection%202026">Request OEM/ODM Quote</a></div></div></div></div></section><section class="section" id="collections">'
    );
}

const padelCollectionCards = [
  {
    sku: "S001",
    name: "Performance 60L Padel Racket Duffel",
    category: "Padel Bags",
    image: "/images/padel/S001/S001-01-main.png",
    alt: "Custom full-size padel racket duffel bag in graphite and warm stone",
    href: "/padel-bags/custom-60l-padel-racket-duffel/",
  },
  {
    sku: "S002",
    name: "Urban 30L Padel Backpack",
    category: "Padel Bags",
    image: "/images/padel/S002/S002-01-main.png",
    alt: "Custom 30L padel backpack in graphite and warm stone",
    href: "/padel-bags/custom-30l-padel-backpack/",
  },
  {
    sku: "S003",
    name: "Ventilated Padel Shoe Bag",
    category: "Padel Accessories",
    image: "/images/padel/S003/S003-01-main.png",
    alt: "Custom ventilated padel shoe bag",
    href: "/padel-accessories/custom-ventilated-padel-shoe-bag/",
  },
  {
    sku: "S004",
    name: "Court Essentials Organizer Pouch",
    category: "Padel Accessories",
    image: "/images/padel/S004/S004-01-main.png",
    alt: "Custom padel accessories organizer pouch",
    href: "/padel-accessories/custom-padel-organizer-pouch/",
  },
];

function addPadelCollectionEntry(html, pageSlug) {
  if (
    pageSlug !== "custom-padel-bag-manufacturer" ||
    html.includes('id="padel-collection-2026-products"')
  ) {
    return html;
  }

  const cards = padelCollectionCards
    .map(
      (product) =>
        `<article class="padel-collection-card"><img src="${product.image}" width="1200" height="1200" loading="lazy" alt="${product.alt}"><div><p class="eyebrow">${product.sku} · ${product.category}</p><h3>${product.name}</h3><a href="${product.href}">View product direction</a></div></article>`,
    )
    .join("");
  const padelHeader = `<header class="site-header"><a class="brand" href="/" aria-label="Cappuccino Bag home"><span class="brand-mark" aria-hidden="true"></span><span>Cappuccino Bag</span></a><nav class="desktop-nav" aria-label="Main navigation"><a href="/running-waist-packs/">Running Packs</a><a href="/custom-padel-bag-manufacturer/">Padel Bags</a><a href="/custom-pickleball-paddle-bags/">Pickleball Bags</a><a href="/custom-tennis-padel-racket-bags/">Tennis Bags</a><a href="/custom-travel-backpacks-weekender-bags/">Travel Bags</a><a href="/factory-trust-materials/">Factory Proof</a><a href="/inquiry/">RFQ</a></nav><a class="header-cta" href="/inquiry/">Request a Quote</a><details class="mobile-menu"><summary aria-label="Open mobile navigation"><span></span><span></span></summary><nav aria-label="Mobile navigation"><a href="/">Home</a><a href="/running-waist-packs/">Running Packs</a><a href="/custom-padel-bag-manufacturer/">Padel Bags</a><a href="/padel-accessories/">Padel Accessories</a><a href="/factory-trust-materials/">Factory Proof</a><a href="/inquiry/">RFQ</a></nav></details></header>`;
  const section = `<style>.padel-collection-page{padding-top:118px}.padel-collection-launch{width:min(1180px,calc(100% - 36px));margin:0 auto;padding:76px 0}.padel-collection-hero{overflow:hidden;margin-bottom:42px;border-radius:16px;background:#171411;color:#fff}.padel-collection-hero img{width:100%;height:auto;aspect-ratio:1672/941;object-fit:cover}.padel-collection-copy{display:grid;grid-template-columns:.85fr 1.15fr;gap:44px;padding:34px}.padel-collection-copy h2{margin:0;font-size:clamp(34px,4vw,54px);line-height:1.04}.padel-collection-copy p{margin:0;color:#e7ddd2;line-height:1.75}.padel-collection-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.padel-collection-card{overflow:hidden;background:#fff;border:1px solid #d8ded2;border-radius:14px}.padel-collection-card img{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover}.padel-collection-card>div{padding:24px}.padel-collection-card h3{margin:7px 0 14px;font-size:26px;line-height:1.12}.padel-collection-card a{color:#6f452d;font-weight:800;text-decoration:underline;text-underline-offset:3px}.padel-collection-links{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}@media(max-width:760px){.padel-collection-page{padding-top:92px}.padel-collection-launch{width:calc(100% - 28px);padding:54px 0}.padel-collection-copy,.padel-collection-grid{grid-template-columns:1fr}.padel-collection-copy{gap:18px;padding:24px}}</style><section class="padel-collection-launch" id="padel-collection-2026-products"><div class="padel-collection-hero"><img src="/images/padel/cappuccino-padel-collection-2026-studio.png" width="1672" height="941" loading="eager" alt="Cappuccino Padel Collection 2026 studio lineup of coordinated bags and accessories"><div class="padel-collection-copy"><h2>Cappuccino Padel Collection 2026</h2><p>Four coordinated OEM/ODM product development directions for padel brands, clubs, specialist retailers, importers and wholesalers. Final capacity, dimensions, materials, MOQ, price and lead time are confirmed during sampling and quotation.</p></div></div><div class="padel-collection-grid">${cards}</div><div class="padel-collection-links"><a class="btn btn-primary" href="/padel-accessories/">Explore Padel Accessories</a><a class="btn btn-secondary" href="/inquiry/?product=Padel%20Bags&amp;format=Padel%20Collection%202026">Request Collection Quote</a></div></section>`;

  return html
    .replace(/<header class="site-header">[\s\S]*?<\/header>/, padelHeader)
    .replace(/<main>/, '<main class="padel-collection-page">')
    .replace(/<section class="section">/, `${section}<section class="section">`);
}

const productExpansionCards = {
  adventure: `<article class="expansion-card"><img src="/site/assets/cappuccino-waterproof-adventure-duffel-concept.webp" width="1200" height="800" loading="lazy" alt="Original waterproof adventure duffel concept"><div><p class="eyebrow">40L / 70L</p><h3>Waterproof Adventure Duffel</h3><p>Coated material options, wet/dry separation, a reinforced base and removable backpack straps.</p><a href="/custom-waterproof-adventure-duffel/">Explore the adventure duffel</a></div></article>`,
  wheeled: `<article class="expansion-card"><img src="/site/assets/cappuccino-waterproof-wheeled-gear-bag-concept.webp" width="1200" height="800" loading="lazy" alt="Original waterproof wheeled gear bag concepts"><div><p class="eyebrow">40L / 90L</p><h3>Waterproof Wheeled Gear Bag</h3><p>Reinforced wheels, pull-handle development and separated wet or dirty equipment storage.</p><a href="/custom-waterproof-wheeled-gear-bag/">Explore the wheeled gear bag</a></div></article>`,
  cooler: `<article class="expansion-card"><img src="/site/assets/cappuccino-insulated-cooler-backpack-concept.webp" width="1200" height="800" loading="lazy" alt="Original insulated outdoor cooler backpack concept"><div><p class="eyebrow">Insulated Carry</p><h3>Outdoor Cooler Backpack</h3><p>PEVA-style lining, insulation, dry/wet organization and a comfortable backpack carry system.</p><a href="/custom-insulated-cooler-backpack/">Explore the cooler backpack</a></div></article>`,
  rollTop: `<article class="expansion-card"><img src="/site/assets/cappuccino-waterproof-roll-top-backpack-concept.webp" width="1200" height="800" loading="lazy" alt="Original waterproof roll-top backpack concept"><div><p class="eyebrow">25L / 35L</p><h3>Waterproof Roll-Top Backpack</h3><p>Coated material options, adjustable roll-top capacity, attachment points and reinforced backpack carry.</p><a href="/custom-waterproof-roll-top-backpack/">Explore the roll-top backpack</a></div></article>`,
  coolerTote: `<article class="expansion-card"><img src="/site/assets/cappuccino-insulated-cooler-tote-bag-concept.webp" width="1200" height="800" loading="lazy" alt="Original insulated cooler tote bag concept"><div><p class="eyebrow">20L / 30L</p><h3>Insulated Cooler Tote Bag</h3><p>PEVA-style lining, insulation, dry organizer pockets and flexible event or hospitality carry.</p><a href="/custom-insulated-cooler-tote-bag/">Explore the cooler tote</a></div></article>`,
  laptopTravel: `<article class="expansion-card"><img src="/site/assets/cappuccino-laptop-travel-backpack-concept.webp" width="1200" height="800" loading="lazy" alt="Original laptop travel backpack concept"><div><p class="eyebrow">25L / 40L</p><h3>Laptop Travel Backpack</h3><p>Padded device storage, clamshell organization, a trolley sleeve and business-travel details.</p><a href="/custom-laptop-travel-backpack/">Explore the travel backpack</a></div></article>`
};

function addProductExpansionLinks(html, pageSlug) {
  const homePages = new Set([""]);
  const outdoorPages = new Set([
    "custom-outdoor-sports-bag-manufacturer",
    "custom-outdoor-multifunctional-bag-manufacturer",
    "custom-outdoor-sports-travel-bags"
  ]);
  const travelPages = new Set([
    "custom-travel-bag-luggage-manufacturer",
    "custom-travel-backpacks-weekender-bags"
  ]);

  let cards = [];
  if (homePages.has(pageSlug)) cards = Object.values(productExpansionCards);
  if (outdoorPages.has(pageSlug)) {
    cards = [productExpansionCards.rollTop, productExpansionCards.adventure, productExpansionCards.coolerTote, productExpansionCards.cooler];
  }
  if (travelPages.has(pageSlug)) {
    cards = [productExpansionCards.laptopTravel, productExpansionCards.wheeled, productExpansionCards.adventure, productExpansionCards.coolerTote];
  }
  if (!cards.length || html.includes('id="product-expansion"')) return html;

  const section = `<style>.expansion-section{background:#fff8ee}.expansion-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.expansion-card{overflow:hidden;background:#fff;border:1px solid #e6d5c3;border-radius:16px;box-shadow:0 12px 34px rgba(65,42,27,.09)}.expansion-card img{display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:cover}.expansion-card>div{padding:22px}.expansion-card h3{margin:4px 0 10px}.expansion-card a{color:#6f452d;font-weight:800;text-decoration:underline;text-underline-offset:3px}@media(max-width:820px){.expansion-grid{grid-template-columns:1fr}.expansion-card{max-width:620px;margin:0 auto}}</style><section class="section expansion-section" id="product-expansion"><div class="section-head section-heading"><p class="eyebrow">New OEM/ODM Development Concepts</p><h2>Outdoor, Insulated and Travel Gear</h2><p>Original product directions for brands, teams, hospitality buyers and travel programs. Final specifications are confirmed during sampling.</p></div><div class="expansion-grid">${cards.join("")}</div></section>`;

  const insertionPoint = html.indexOf('<section class="section trust-section"');
  if (insertionPoint >= 0) {
    return `${html.slice(0, insertionPoint)}${section}${html.slice(insertionPoint)}`;
  }
  return html.replace(/<\/main>/i, `${section}</main>`);
}

const buyerGuideCards = [
  `<article class="guide-entry-card"><p class="eyebrow">Waterproof Product Development</p><h3>How to Source a Custom Roll-Top Backpack</h3><p>A practical brief for comparing coated materials, closure construction, carry comfort, sample tests and supplier quotations.</p><a href="/blog/how-to-source-custom-waterproof-roll-top-backpack/">Read the sourcing guide</a></article>`,
  `<article class="guide-entry-card"><p class="eyebrow">Insulated Bag Development</p><h3>What to Decide Before Sampling a Cooler Tote</h3><p>How capacity, lining, insulation, cleaning, carry and test language shape a credible private-label cooler program.</p><a href="/blog/custom-cooler-tote-bag-development-guide/">Read the development guide</a></article>`,
  `<article class="guide-entry-card"><p class="eyebrow">Travel Product Development</p><h3>Choosing a Laptop Travel Backpack Manufacturer</h3><p>A buyer's checklist for device fit, packing architecture, high-contact reinforcement, approvals and production QC.</p><a href="/blog/laptop-travel-backpack-oem-buying-guide/">Read the buying guide</a></article>`
];

function addBuyerGuideLinks(html, pageSlug) {
  if (pageSlug !== "resources" || html.includes('id="new-buyer-guides"')) return html;

  const section = `<style>.guide-entry-section{background:#f7f0e6}.guide-entry-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.guide-entry-card{padding:28px;background:#fffaf4;border:1px solid #decbb8;border-radius:14px}.guide-entry-card h3{margin:7px 0 12px;color:#3a281d;font-size:24px;line-height:1.12}.guide-entry-card a{color:#6f452d;font-weight:800;text-decoration:underline;text-underline-offset:3px}@media(max-width:820px){.guide-entry-grid{grid-template-columns:1fr}}</style><section class="section guide-entry-section" id="new-buyer-guides"><div class="section-head section-heading"><p class="eyebrow">New Buyer Guides</p><h2>From Search Query to Production-Ready Brief</h2><p>Three focused guides for buyers developing waterproof, insulated and business-travel bag programs.</p></div><div class="guide-entry-grid">${buyerGuideCards.join("")}</div></section>`;
  return html.replace(/<\/main>/i, `${section}</main>`);
}

const alcantaraCards = {
  collection: `<article class="alc-card alc-product-card"><img src="/site/assets/alcantara/alcantara-collection-duffle-phone-case-card-holder.avif" width="1448" height="1086" loading="lazy" alt="Coordinated Alcantara duffle bag phone case and card holder collection"><div><h3>Alcantara Collection</h3><p>Coordinate travel bags, phone accessories and card holders around one material, colour and packaging direction.</p><a href="/alcantara-collection/">Explore the collection</a></div></article>`,
  duffle: `<article class="alc-card alc-product-card"><img src="/site/assets/alcantara/custom-alcantara-duffle-bag-colours.avif" width="1448" height="1086" loading="lazy" alt="Custom Alcantara duffle bags in coordinated colours"><div><h3>Custom Alcantara Duffle Bag</h3><p>Travel-bag development with material review, structure, lining, logo, hardware, sampling and quality control.</p><a href="/custom-alcantara-duffle-bag/">View the duffle bag</a></div></article>`,
  phone: `<article class="alc-card alc-product-card"><img src="/site/assets/alcantara/custom-alcantara-iphone-case-collection.avif" width="1448" height="1086" loading="lazy" alt="Custom Alcantara iPhone case collection"><div><h3>Custom Alcantara iPhone Case</h3><p>Model-specific private-label development with fit, camera opening, material, logo and packaging review.</p><a href="/custom-alcantara-iphone-case/">View the iPhone case</a></div></article>`,
  card: `<article class="alc-card alc-product-card"><img src="/site/assets/alcantara/custom-alcantara-card-holder-passport-cover-colours.avif" width="1448" height="1086" loading="lazy" alt="Custom Alcantara card holders and passport covers"><div><h3>Custom Alcantara Card Holder</h3><p>Card holder and passport-cover development with custom slots, edge finishing, logo and gift packaging.</p><a href="/custom-alcantara-card-holder/">View the card holder</a></div></article>`,
  guide: `<article class="alc-card"><h3>Alcantara Production Guide</h3><p>Follow the workflow from material sourcing and documentation through sampling, bulk production, QC and shipment.</p><a class="alc-link" href="/blog/alcantara-bag-accessory-production-process/">Read the guide</a></article>`
};

function addAlcantaraContextLinks(html, pageSlug) {
  if (pageSlug.startsWith("custom-alcantara-") || pageSlug === "alcantara-collection" || pageSlug === "blog/alcantara-bag-accessory-production-process") return html;

  const homePages = new Set([""]);
  const travelPages = new Set(["custom-travel-backpacks-weekender-bags", "custom-travel-weekender-bag-landing", "custom-travel-bag-luggage-manufacturer"]);
  const techPages = new Set(["custom-magsafe-cardholder-manufacturer", "custom-phone-pouch-manufacturer", "phone-case-cardholder-gift-set-oem", "vegan-leather-tech-accessories-manufacturer"]);
  const walletPages = new Set(["custom-cardholder-manufacturer", "rfid-wallet-passport-holder-manufacturer", "custom-rfid-wallet-manufacturer", "custom-rfid-wallet-card-holder-landing", "card-holder-customization-guide"]);
  const resourcePages = new Set(["resources"]);

  let cards = [];
  if (homePages.has(pageSlug)) cards = [alcantaraCards.collection, alcantaraCards.duffle, alcantaraCards.phone, alcantaraCards.card];
  if (travelPages.has(pageSlug)) cards = [alcantaraCards.duffle, alcantaraCards.collection];
  if (techPages.has(pageSlug)) cards = [alcantaraCards.phone, alcantaraCards.collection];
  if (walletPages.has(pageSlug)) cards = [alcantaraCards.card, alcantaraCards.collection];
  if (resourcePages.has(pageSlug)) cards = [alcantaraCards.guide, alcantaraCards.collection];
  if (!cards.length || html.includes('id="alcantara-entry"')) return html;

  const section = `<section class="alc-section alc-entry-section" id="alcantara-entry"><div class="alc-heading"><h2>Custom Alcantara Bags &amp; Accessories</h2><p>Explore a coordinated OEM/ODM product family with project-specific material sourcing, sampling, branding, packaging and quality control.</p></div><div class="alc-grid">${cards.join("")}</div></section>`;
  return html.replace(/<\/main>/i, `${section}</main>`);
}

function decodeHtmlEntities(text = "") {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#([0-9]+);/g, (_, num) =>
      String.fromCodePoint(Number.parseInt(num, 10))
    );
}

function extractMetadata(html, slug = []) {
  const pageSlug = slug.join("/");
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descriptionMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i
  );
  const canonicalMatch = html.match(
    /<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']\s*\/?>/i
  );
  const ogImageMatch = html.match(
    /<meta\s+property=["']og:image["']\s+content=["']([\s\S]*?)["']\s*\/?>/i
  );
  const ogTypeMatch = html.match(
    /<meta\s+property=["']og:type["']\s+content=["']([\s\S]*?)["']\s*\/?>/i
  );

  const fallbackCanonical = pageSlug
    ? `https://www.cappuccinobag.com/${pageSlug}/`
    : "https://www.cappuccinobag.com/";

  return {
    title: decodeHtmlEntities(titleMatch?.[1]?.trim() || ""),
    description: decodeHtmlEntities(descriptionMatch?.[1]?.trim() || ""),
    canonical: decodeHtmlEntities(canonicalMatch?.[1]?.trim() || "") || fallbackCanonical,
    ogImage: decodeHtmlEntities(ogImageMatch?.[1]?.trim() || ""),
    ogType: decodeHtmlEntities(ogTypeMatch?.[1]?.trim() || "website")
  };
}

function extractJsonLdScripts(html) {
  return Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  )
    .map((match) => match[1]?.trim())
    .filter(Boolean);
}

function extractInlineStyles(html) {
  return Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
    .map((match) => match[1]?.trim())
    .filter(Boolean);
}

function extractLocalStylesheets(html) {
  return Array.from(
    html.matchAll(
      /<link[^>]*rel=["']stylesheet["'][^>]*href=["'](\/[^"']+)["'][^>]*>/gi
    )
  )
    .map((match) => match[1]?.trim())
    .filter(Boolean);
}

export async function generateMetadataForStaticPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  const html = readStaticDocument(slug);

  if (!html) {
    return {};
  }

  const meta = extractMetadata(html, slug);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      type: meta.ogType === "article" ? "article" : "website",
      ...(meta.ogImage ? { images: [{ url: meta.ogImage }] } : {})
    },
    twitter: {
      title: meta.title,
      description: meta.description,
      card: "summary_large_image",
      ...(meta.ogImage ? { images: [meta.ogImage] } : {})
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

function normalizeHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/src="(?:\.\.\/)?assets\//g, 'src="/site/assets/')
    .replace(/href="(?:\.\.\/)?assets\//g, 'href="/site/assets/')
    .replace(/href="\/index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="\.\.\/index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="\/index\.html"/g, 'href="/"')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="\.\.\/index\.html"/g, 'href="/"')
    .replace(/href="\.\.\/([^"]+)\/"/g, 'href="/$1/"')
    .replace(/href="(contact|download-catalog|inquiry|why-us|resources|custom-outdoor-multifunctional-bag-manufacturer|custom-outdoor-sports-bag-manufacturer|custom-tennis-bag-manufacturer|custom-pickleball-bag-manufacturer|custom-padel-bag-manufacturer|custom-hiking-backpack-manufacturer|custom-mountaineering-backpack-manufacturer|custom-travel-bag-luggage-manufacturer|custom-rfid-wallet-manufacturer|custom-magsafe-cardholder-manufacturer|custom-phone-pouch-manufacturer|phone-case-cardholder-gift-set-oem|vegan-leather-tech-accessories-manufacturer|eco-tech-smart-bag-manufacturer|rfid-wallet-passport-holder-manufacturer|custom-travel-backpacks-weekender-bags|custom-tennis-padel-racket-bags|custom-hiking-daypacks-outdoor-backpacks|custom-pickleball-paddle-bags|custom-waterproof-adventure-duffel|custom-waterproof-wheeled-gear-bag|custom-insulated-cooler-backpack|custom-waterproof-roll-top-backpack|custom-insulated-cooler-tote-bag|custom-laptop-travel-backpack|outdoor-multifunctional-bag-manufacturing-guide|outdoor-sports-bag-manufacturing-guide|custom-tennis-bag-guide|pickleball-bag-customization-guide|padel-bag-design-guide|hiking-backpack-customization-guide|mountaineering-backpack-manufacturing-guide|travel-bag-luggage-customization-guide|hotel-group-custom-bag-project-guide|wallet-materials-guide|rfid-wallet-customization-guide|card-holder-customization-guide|eco-tech-bag-material-guide|gps-trackable-bag-guide|logo-customization-guide|private-label-packaging-guide|moq-sampling-faq|quality-inspection-guide|sustainable-bag-wallet-materials-guide|custom-pickleball-bag-landing|custom-tennis-padel-racket-bag-landing|custom-hiking-daypack-landing|custom-gym-duffel-bag-landing|custom-travel-weekender-bag-landing|custom-rfid-wallet-card-holder-landing|gps-trackable-smart-bag-landing|recycled-eco-tech-bag-landing)\//g, 'href="/$1/')
    .replace(/href="#/g, 'href="/#')
    .replace(/id="home"/g, 'id="home" data-rendered-by="next"');
}

export async function StaticSitePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  const sourceHtml = readStaticDocument(slug);
  const html = readStaticPage(slug);
  if (!html) notFound();

  const jsonLdScripts = sourceHtml ? extractJsonLdScripts(sourceHtml) : [];
  const inlineStyles = sourceHtml ? extractInlineStyles(sourceHtml) : [];
  const localStylesheets = sourceHtml ? extractLocalStylesheets(sourceHtml) : [];

  return (
    <>
      {localStylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {inlineStyles.map((css, index) => (
        <style
          key={`inline-style-${index}`}
          dangerouslySetInnerHTML={{ __html: css }}
        />
      ))}
      {jsonLdScripts.map((jsonLd, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ))}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/site/assets/script.js" strategy="afterInteractive" />
    </>
  );
}
