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
