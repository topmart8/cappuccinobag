import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Padel Collection links every priority product into a buyer-use group", async () => {
  const collection = await source("app/racket-sports/padel-bags/page.js");
  for (const href of [
    "/padel-bags/custom-60l-padel-racket-duffel",
    "/padel-bags/custom-30l-padel-backpack",
    "/products/padel-work-tote-backpack-pdb001",
    "/products/womens-lightweight-padel-tote-pdb014",
    "/products/work-court-padel-commuter-tote-pdb015",
    "/products/weekend-padel-carryall-pdb016",
    "/products/travel-padel-utility-backpack-pdb017",
  ]) assert.match(collection, new RegExp(href.replaceAll("/", "\\/")));
  assert.match(collection, /Players carrying multiple rackets, shoes and clothing/);
  assert.match(collection, /Players prioritizing compact hands-free carry/);
  assert.match(collection, /Court-to-office and lifestyle collections/);
});

test("minimal Padel GEO batch adds one semantic format comparison without fixed capacity claims", async () => {
  const [collection, styles] = await Promise.all([
    source("app/racket-sports/padel-bags/page.js"),
    source("app/racket-sports/padel-bags/page.module.css"),
  ]);
  assert.match(collection, /<table className=\{styles\.comparisonTable\}>/);
  assert.match(collection, /Racket capacity guidance/);
  for (const format of ["Racket duffel", "Padel backpack", "Tote or carryall", "Shoe bag", "Organizer pouch"]) {
    assert.match(collection, new RegExp(format));
  }
  assert.match(collection, /confirm fit|confirm head, handle and zipper clearance/);
  assert.match(styles, /\.comparisonTableWrap[\s\S]*overflow-x: auto/);
  assert.doesNotMatch(collection, /fixed MOQ|fixed lead time/i);
});

test("minimal Padel GEO batch expands only the selected material owner", async () => {
  const [articles, targetPage, competingPage, template] = await Promise.all([
    source("app/hybrid-padel-articles.js"),
    source("app/blog/recycled-water-resistant-materials-padel-bags/page.js"),
    source("app/blog/recycled-water-resistant-fabrics-custom-padel-bags/page.js"),
    source("app/hybrid-padel-article-template.js"),
  ]);
  for (const text of ["PU or vegan-leather trims", "EVA or structural reinforcement", "thermal or insulated racket protection"]) {
    assert.match(articles, new RegExp(text));
  }
  assert.match(articles, /does not guarantee a fixed temperature/);
  assert.match(articles, /project-specific test method and evidence/);
  assert.match(articles, /\/custom-padel-bag-manufacturer/);
  assert.match(template, /article\.relatedLinks\?\.length/);
  assert.match(targetPage, /HybridPadelArticle/);
  assert.doesNotMatch(competingPage, /PU or vegan-leather trims|EVA or structural reinforcement|thermal or insulated racket protection/);
});

test("minimal Padel GEO batch adds Padel QC checkpoints and one six-step resource path", async () => {
  const [quality, resources] = await Promise.all([
    source("public/site/quality-inspection-guide/index.html"),
    source("public/site/resources/index.html"),
  ]);
  for (const heading of [
    "Racket fit and compartment protection",
    "Shoe-zone fit and ventilation",
    "Loaded carry and stress areas",
    "Zippers, seams, lining and pocket access",
    "Branding position and appearance",
    "Packaging and shape protection",
  ]) assert.match(quality, new RegExp(heading));
  assert.equal((resources.match(/<nav class="resource-grid" aria-label="Padel buyer decision path">/g) || []).length, 1);
  for (const href of [
    "/racket-sports/padel-bags",
    "/custom-padel-bag-manufacturer",
    "/blog/recycled-water-resistant-materials-padel-bags",
    "/quality-inspection-guide",
    "/factory-trust-materials",
    "/inquiry?product=Padel%20Bags",
  ]) assert.ok(resources.includes(href), `missing Padel decision-path link: ${href}`);
});

test("priority Padel products expose sourcing facts without fixed unverified commercial claims", async () => {
  const [classicData, classicTemplate, pdb001, hybridData, hybridTemplate] = await Promise.all([
    source("app/padel-products.js"),
    source("app/padel-product-template.js"),
    source("app/products/padel-work-tote-backpack-pdb001/page.js"),
    source("app/hybrid-padel-data.js"),
    source("app/hybrid-padel-product-template.js"),
  ]);
  assert.equal((classicData.match(/procurementSnapshot:/g) || []).length, 2);
  assert.match(classicTemplate, /B2B Procurement Snapshot/);
  assert.match(pdb001, /W31 × H38 × D15 cm/);
  assert.match(pdb001, /No model-specific certification claimed/);
  assert.equal((hybridData.match(/procurementSnapshot:/g) || []).length, 4);
  for (const model of ["PDB014", "PDB015", "PDB016", "PDB017"]) assert.match(hybridData, new RegExp(`model: "${model}"`));
  assert.match(hybridData, /Women’s office-to-club lifestyle collections/);
  assert.match(hybridData, /Urban work-to-court and business-travel programs/);
  assert.match(hybridData, /Match weekends, short travel and tournament programs/);
  assert.match(hybridData, /Padel travel, daily training and functional unisex club collections/);
  assert.match(hybridTemplate, /No model-specific certification claimed/);
  assert.match(`${classicTemplate}${pdb001}${hybridTemplate}`, /Confirm with factory/);
});

test("Padel decision pages use the existing RFQ route and consistent primary CTA", async () => {
  const pages = await Promise.all([
    source("app/padel-product-template.js"),
    source("app/products/padel-work-tote-backpack-pdb001/page.js"),
    source("app/hybrid-padel-product-template.js"),
    source("public/site/custom-padel-bag-manufacturer/index.html"),
    source("public/site/resources/index.html"),
  ]);
  for (const page of pages) assert.match(page, /Request a Quote/);
  assert.match(pages[0], /product=Padel%20Bags&format=/);
  assert.match(pages[1], /product=Padel%20Bags&format=PDB001/);
  assert.match(pages[2], /product=Padel%20Bags&format=/);
  assert.match(pages[3], /href="\/inquiry\?product=Padel%20Bags"/);
  assert.match(pages[4], /href="\/inquiry\?product=Padel%20Bags"/);
});

test("Manufacturer, Factory Proof and Resources form a scoped Padel evidence path", async () => {
  const [manufacturer, factory, resources] = await Promise.all([
    source("public/site/custom-padel-bag-manufacturer/index.html"),
    source("public/factory-trust-materials/index.html"),
    source("public/site/resources/index.html"),
  ]);
  assert.match(manufacturer, /href="\/custom-padel-bag-manufacturer#padel-bag-manufacturer-faq"/);
  assert.doesNotMatch(manufacturer, /href="#padel-bag-manufacturer-faq"/);
  for (const asset of [
    "/assets/videos/uk-client-multifunctional-bag-sewing.mp4",
    "/assets/videos/cappuccino-bag-sample-development.mp4",
    "/videos/cappuccino-factory-bulk-production-website-16x9-720p-web-optimized.mp4",
    "/assets/padel-real-samples/hero-racket-bag-sample.jpg",
  ]) assert.match(`${manufacturer}${factory}`, new RegExp(asset.replaceAll("/", "\\/")));
  for (const page of [manufacturer, factory, resources]) {
    assert.match(page, /\/racket-sports\/padel-bags/);
    assert.match(page, /\/factory-trust-materials|\/custom-padel-bag-manufacturer/);
    assert.match(page, /\/resources|buyer resources/i);
  }
});

test("existing Padel RFQ prefill contract remains unchanged", async () => {
  const client = await source("public/site/assets/script.js");
  assert.match(client, /if \(\/padel\/i\.test\(project\)\)/);
  assert.match(client, /product\.value = "Padel Bags"/);
  assert.match(client, /Padel product format: \$\{format\}/);
});

test("Padel preview visual safeguards cover header offsets and mobile floating controls", async () => {
  const [styles, resources, manufacturer, factory, whatsapp] = await Promise.all([
    source("app/globals.css"),
    source("public/site/resources/index.html"),
    source("public/site/custom-padel-bag-manufacturer/index.html"),
    source("public/factory-trust-materials/index.html"),
    source("components/BrandWhatsAppButton.jsx"),
  ]);
  assert.match(resources, /class="buyer-resources-page header-offset-page"/);
  assert.match(factory, /class="cp-page padel-factory-proof-page"/);
  assert.match(styles, /\.header-offset-page\{padding-top:118px\}/);
  assert.match(styles, /scroll-margin-top:120px/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /body:has\(\.padel-factory-proof-page\) \.quote-float\{right:96px;bottom:28px\}/);
  assert.match(styles, /\.quote-float\{display:none\}/);
  assert.match(styles, /body\.padel-controls-active:not\(\.padel-controls-obstructed\):not\(:has\(\.analytics-consent\)\)/);
  assert.match(styles, /\.analytics-settings\{position:absolute;top:86px/);
  assert.match(styles, /body:has\(\.padel-product-page,\.pdb001-page,\.hybrid-product-page\) \.analytics-settings\{top:134px\}/);
  assert.match(manufacturer, /body:has\(\.padel-manufacturer-page\) \.site-header\.site-header/);
  assert.match(manufacturer, /background:rgba\(16,38,28,\.96\)/);
  assert.match(manufacturer, /\.site-header \.nav-more>summary\{color:#fffdf7;background:rgba\(255,255,255,\.08\)/);
  assert.match(manufacturer, /\.padel-manufacturer-page \.btn-primary\{color:#fff;background:#8b5e3c/);
  assert.match(manufacturer, /\.site-header \.mobile-menu\{flex:0 0 48px;width:48px;min-width:48px;height:48px;background:rgba\(255,255,255,\.08\)/);
  assert.match(whatsapp, /window\.scrollY > window\.innerHeight \* 0\.6/);
  assert.match(whatsapp, /const blockerSelector = "\.hero-actions,\.quote-section,\.padel-product-rfq,\.hybrid-rfq,\.cp-cta,\.site-footer"/);
  assert.match(whatsapp, /padel-controls-obstructed/);
});

test("Padel manufacturing proof videos have real posters, lazy sources and visible failure states", async () => {
  const [manufacturer, factory, styles, client] = await Promise.all([
    source("public/site/custom-padel-bag-manufacturer/index.html"),
    source("public/factory-trust-materials/index.html"),
    source("app/globals.css"),
    source("public/site/assets/script.js"),
  ]);
  assert.equal((manufacturer.match(/<video /g) || []).length, 3);
  assert.equal((factory.match(/<video /g) || []).length, 3);
  for (const page of [manufacturer, factory]) {
    assert.equal((page.match(/poster="/g) || []).length, 3);
    assert.equal((page.match(/data-video-src="/g) || []).length, 3);
    assert.equal((page.match(/proof-video-fallback/g) || []).length, 3);
    assert.doesNotMatch(page, /<video[^>]+autoplay/);
  }
  assert.match(styles, /\.proof-video-frame\.is-unavailable \.proof-video-fallback\{display:block\}/);
  assert.match(client, /function markProofVideoUnavailable/);
  assert.match(client, /source\.addEventListener\("error"/);
});
