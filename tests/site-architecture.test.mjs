import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import sitemap from "../app/sitemap.js";
import nextConfig from "../next.config.mjs";
import {
  footerNavigation,
  moreCollectionsNavigation,
  primaryNavigation,
  utilityNavigation,
} from "../lib/site-navigation.js";

test("desktop and mobile navigation share the required Padel-first configuration", () => {
  assert.deepEqual(primaryNavigation.map((item) => item.label), [
    "Padel Bags", "Pickleball Bags", "Tennis Bags", "Outdoor & Hiking", "Travel Bags",
  ]);
  assert.deepEqual(moreCollectionsNavigation.map((item) => item.label), [
    "Running & Sports Bags", "Pet Travel Bags", "RFID Wallets", "Sustainable Materials",
    "Padel Accessories", "Buyer Resources",
  ]);
  assert.deepEqual(utilityNavigation.map((item) => item.label), ["Factory Proof", "RFQ"]);
  assert.equal(footerNavigation[0].links[0].label, "Padel Bags");
});

test("sitemap contains only canonical no-trailing-slash URLs and prioritizes Padel", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes("https://www.cappuccinobag.com/custom-padel-bag-manufacturer"));
  assert.ok(urls.includes("https://www.cappuccinobag.com/products"));
  assert.ok(urls.includes("https://www.cappuccinobag.com/resources"));
  assert.ok(urls.includes("https://www.cappuccinobag.com/rfid-wallet-passport-holder-manufacturer"));
  assert.ok(!urls.includes("https://www.cappuccinobag.com/custom-padel-bags.html"));
  assert.ok(!urls.includes("https://www.cappuccinobag.com/custom-outdoor-sports-travel-bags"));
  assert.ok(!urls.includes("https://www.cappuccinobag.com/custom-tennis-padel-racket-bag-landing"));
  assert.ok(!urls.some((url) => url !== "https://www.cappuccinobag.com/" && url.endsWith("/")));
  const priority = (path) => entries.find((entry) => entry.url.endsWith(path))?.priority;
  assert.ok(priority("/racket-sports/padel-bags") > priority("/custom-padel-bag-manufacturer"));
  assert.ok(priority("/custom-padel-bag-manufacturer") > priority("/custom-tennis-padel-racket-bags"));
  assert.ok(priority("/custom-padel-bag-manufacturer") > priority("/running-waist-packs"));
  assert.ok(priority("/running-waist-packs") > priority("/pet-travel-bags"));
  assert.ok(entries.every((entry) => typeof entry.lastModified === "string"));
});

test("C2 sitemap guides contain distinct buyer guidance instead of the legacy template", async () => {
  const guides = [
    ["outdoor-multifunctional-bag-manufacturing-guide", "Define the use cases before the feature list"],
    ["custom-tennis-bag-guide", "Specify racket fit and protection"],
    ["pickleball-bag-customization-guide", "Start with paddle count and bag format"],
    ["hiking-backpack-customization-guide", "Map hydration and trail access"],
    ["quality-inspection-guide", "Define the inspection reference"],
    ["moq-sampling-faq", "MOQ Factors"],
  ];
  const sources = await Promise.all(guides.map(([slug]) => readFile(
    new URL(`../public/site/${slug}/index.html`, import.meta.url),
    "utf8",
  )));
  for (const [index, [, distinctiveHeading]] of guides.entries()) {
    assert.match(sources[index], /<main class="c2-guide">/);
    assert.match(sources[index], new RegExp(distinctiveHeading.replace(/[?]/g, "\\?")));
    assert.doesNotMatch(sources[index], /planning OEM\/ODM outdoor bags, wallets, RFID products, travel products or eco-tech smart bag projects/);
    assert.doesNotMatch(sources[index], /<h2>What this guide covers<\/h2>/);
  }
});

test("Padel PR B keeps three URLs but assigns distinct search-intent roles", async () => {
  const [manufacturer, collection, overview, staticSite, products] = await Promise.all([
    readFile(new URL("../public/site/custom-padel-bag-manufacturer/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/racket-sports/padel-bags/page.js", import.meta.url), "utf8"),
    readFile(new URL("../public/site/custom-tennis-padel-racket-bags/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/static-site.js", import.meta.url), "utf8"),
    readFile(new URL("../app/products/page.js", import.meta.url), "utf8"),
  ]);

  assert.match(manufacturer, /<title>Custom Padel Bag Manufacturer in China \| OEM\/ODM Factory<\/title>/);
  assert.match(manufacturer, /<h1>OEM\/ODM Padel Bag Manufacturer in China<\/h1>/);
  assert.match(manufacturer, /How Buyers Develop Custom Padel Bags With a Manufacturer/);
  assert.match(manufacturer, /href="\/racket-sports\/padel-bags"/);

  assert.match(collection, /title: "Custom Padel Bags Collection \| Racket Bags, Backpacks & Duffels"/);
  assert.match(collection, /<h1>Custom Padel Bags: Racket Bags, Backpacks &amp; Duffels<\/h1>/);
  assert.match(collection, /What Types of Custom Padel Bags Can Brands Develop\?/);
  assert.match(collection, /href="\/custom-padel-bag-manufacturer"/);

  assert.match(overview, /<title>Racquet Sports Bag Guide \| Tennis, Padel &amp; Pickleball<\/title>/);
  assert.match(overview, /<h1>Racquet Sports Bags: Tennis, Padel &amp; Pickleball<\/h1>/);
  assert.match(overview, /What is different about padel, tennis and pickleball bag design\?/);
  assert.match(overview, /href="\/racket-sports\/padel-bags"/);
  assert.match(overview, /href="\/custom-padel-bag-manufacturer"/);

  assert.match(products, /name: "Padel Bags", href: "\/racket-sports\/padel-bags"/);
  assert.match(staticSite, /href="\/racket-sports\/padel-bags">Explore Padel Bags<\/a>/);
  assert.doesNotMatch(staticSite, /id="padel-collection-2026-products"/);
});

test("confirmed shadow and legacy landing routes redirect permanently", async () => {
  const redirects = await nextConfig.redirects();
  for (const [source, destination] of [
    ["/custom-outdoor-sports-travel-bags", "/custom-outdoor-sports-bag-manufacturer"],
    ["/custom-tennis-padel-racket-bag-landing", "/custom-tennis-padel-racket-bags"],
  ]) {
    for (const variant of [source, `${source}/`]) {
      assert.deepEqual(
        redirects.find((redirect) => redirect.source === variant),
        { source: variant, destination, statusCode: 301 },
      );
    }
  }
});

test("site fonts are self-hosted by Next without a Google Fonts CSS request", async () => {
  const [layout, globalStyles, staticStyles] = await Promise.all([
    readFile(new URL("../app/layout.js", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/site/assets/styles.css", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /from "next\/font\/google"/);
  assert.match(layout, /--font-inter/);
  assert.match(layout, /--font-montserrat/);
  assert.match(globalStyles, /var\(--font-inter\)/);
  assert.match(staticStyles, /var\(--font-montserrat\)/);
  assert.doesNotMatch(staticStyles, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
});

test("audited static pages link directly to the canonical inquiry route", async () => {
  const pages = [
    "custom-gym-duffel-bag-landing",
    "custom-hiking-daypack-landing",
    "custom-insulated-cooler-backpack",
    "custom-outdoor-sports-bag-manufacturer",
    "custom-pickleball-bag-landing",
    "custom-rfid-wallet-card-holder-landing",
    "custom-rfid-wallet-manufacturer",
    "custom-tennis-bag-manufacturer",
    "custom-tennis-padel-racket-bags",
    "custom-travel-backpacks-weekender-bags",
    "custom-travel-weekender-bag-landing",
    "custom-waterproof-adventure-duffel",
    "custom-waterproof-wheeled-gear-bag",
    "gps-trackable-smart-bag-landing",
    "hotel-group-custom-bag-project-guide",
    "recycled-eco-tech-bag-landing",
    "recycled-material-bags",
    "rfid-wallet-passport-holder-manufacturer",
  ];
  const sources = await Promise.all(pages.map((page) => readFile(
    new URL(`../public/site/${page}/index.html`, import.meta.url),
    "utf8",
  )));
  assert.ok(sources.every((source) => !/(?:\.\.\/|\/)inquiry\//.test(source)));
  assert.ok(sources.every((source) => source.includes("/inquiry")));
});

test("inquiry compatibility keeps legacy product fields and three collection presets", async () => {
  const api = await readFile(new URL("../app/api/inquiries/route.js", import.meta.url), "utf8");
  const crm = await readFile(new URL("../lib/crm/inquiry.js", import.meta.url), "utf8");
  const client = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  assert.match(api, /data\.product_category\s*=\s*data\.product_category\s*\|\|\s*data\.product_needed\s*\|\|\s*data\.product/);
  assert.match(crm, /raw\.product_category\s*\|\|\s*raw\.product_needed\s*\|\|\s*raw\.product/);
  assert.ok(client.includes("if (/pet/i.test"));
  assert.ok(client.includes("if (/padel/i.test"));
  assert.ok(client.includes("if (/running|outdoor sports bags/i.test"));
  assert.match(client, /product\.value = "Padel Bags"/);
  assert.match(client, /product\.value = "Outdoor Sports Bags"/);
  assert.match(client, /"Pet Travel Bags"/);
  assert.match(client, /sort\(\(a, b\) => b\.value\.length - a\.value\.length\)/);
});

test("inquiry forms initialize after Next.js client navigation", async () => {
  const client = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  assert.match(client, /function initializeInquiryForm\(form\)/);
  assert.match(client, /form\.dataset\.inquiryInitialized === "true"/);
  assert.match(client, /new MutationObserver/);
  assert.match(client, /node\.querySelectorAll\("\.inquiry-form"\)\.forEach\(initializeInquiryForm\)/);
  assert.match(client, /if \(inquiryForm\) preselectInquiryContext\(inquiryForm\)/);
});

test("Cappuccino inquiry retries reuse one submission_id until success", async () => {
  const client = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  assert.match(client, /function submissionIdFor\(form\)/);
  assert.match(client, /form\.dataset\.submissionId = window\.crypto\.randomUUID\(\)/);
  assert.match(client, /submission_id: submissionIdFor\(form\)/);
  assert.match(client, /formData\.set\("submission_id", submissionIdFor\(form\)\)/);
  assert.equal((client.match(/completeSubmission\(form\)/g) || []).length, 3);
});

test("PDB001 and Padel S001-S004 product assets remain present", async () => {
  const files = [
    "../app/products/padel-work-tote-backpack-pdb001/page.js",
    "../public/images/padel/PDB001/hero-colors/PDB001-charcoal-grey-main.webp",
    "../public/images/padel/S001/S001-01-main.png",
    "../public/images/padel/S002/S002-01-main.png",
    "../public/images/padel/S003/S003-01-main.png",
    "../public/images/padel/S004/S004-01-main.png",
  ];
  await Promise.all(files.map((file) => access(new URL(file, import.meta.url))));
});
