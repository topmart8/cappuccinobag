import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import sitemap from "../app/sitemap.js";
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
  assert.ok(!urls.includes("https://www.cappuccinobag.com/custom-padel-bags.html"));
  assert.ok(!urls.some((url) => url !== "https://www.cappuccinobag.com/" && url.endsWith("/")));
  const priority = (path) => entries.find((entry) => entry.url.endsWith(path))?.priority;
  assert.ok(priority("/custom-padel-bag-manufacturer") > priority("/running-waist-packs"));
  assert.ok(priority("/running-waist-packs") > priority("/pet-travel-bags"));
  assert.ok(entries.every((entry) => typeof entry.lastModified === "string"));
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

test("inquiry page loads its page stylesheet and preserves the complete RFQ contract", async () => {
  const source = await readFile(new URL("../public/site/inquiry/index.html", import.meta.url), "utf8");
  assert.match(source, /href="\/site\/assets\/inquiry\.css"/);
  assert.equal((source.match(/<fieldset class="rfq-group">/g) || []).length, 4);
  for (const field of [
    "inquiry_intention", "product_needed", "quantity", "country", "material",
    "function_requirement", "logo_method", "packaging", "name", "company",
    "email", "phone", "message", "attachment", "target_dimensions",
    "intended_pet_size", "color", "target_market", "target_delivery_date",
  ]) {
    assert.match(source, new RegExp(`name="${field}"`));
  }
  assert.match(source, /data-form="b2b_inquiry"/);
  assert.match(source, /enctype="multipart\/form-data"/);
});

test("inquiry submission has one guarded API path and no inquiry-page floating controls", async () => {
  const client = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  const inquiryHandler = client.match(/function initializeInquiryForm\(form\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(inquiryHandler, /form\.dataset\.submitting === "true"/);
  assert.match(inquiryHandler, /form\.dataset\.submitting = "true"/);
  assert.match(inquiryHandler, /submitButton\.disabled = true/);
  assert.match(inquiryHandler, /const endpoint = "\/api\/inquiries"/);
  assert.equal((inquiryHandler.match(/await fetch\(/g) || []).length, 1);
  assert.match(client, /if \(window\.location\.pathname\.startsWith\("\/inquiry"\)\) return;/);
  assert.match(client, /field\.matches\("input, textarea, select"\)/);
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
