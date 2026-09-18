import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("racket sports soft goods pages keep distinct metadata and manufacturing intent", async () => {
  const [data, template] = await Promise.all([
    source("app/racket-sports-pages.js"),
    source("app/racket-sports-page-template.js"),
  ]);
  for (const h1 of [
    "Custom Racket Sports Bags and Cases Manufacturer",
    "Custom Padel Racket Sleeves Manufacturer",
    "Padel Brand Product Line Development",
  ]) assert.match(data, new RegExp(h1));
  for (const schema of ["FAQPage", "Service", "BreadcrumbList"]) assert.match(template, new RegExp(`"@type": "${schema}"`));
  for (const statement of [
    "We do not manufacture padel rackets directly.",
    "We do not manufacture tennis rackets directly.",
    "We do not manufacture pickleball paddles directly.",
  ]) assert.match(template + data, new RegExp(statement.replaceAll(".", "\\.")));
  assert.doesNotMatch(data + template, /Nossa|\bTom\b|official supplier|official partner/i);
});

test("cluster links to product owners and protects the existing Padel collection metadata", async () => {
  const [data, collection, racketHub, sitemap] = await Promise.all([
    source("app/racket-sports-pages.js"),
    source("app/racket-sports/padel-bags/page.js"),
    source("public/site/custom-tennis-padel-racket-bags/index.html"),
    source("app/sitemap.js"),
  ]);
  for (const href of [
    "/custom-padel-bag-manufacturer/",
    "/custom-padel-racket-sleeves/",
    "/custom-racket-sports-bags-and-cases/",
    "/padel-brand-collection-development/",
    "/inquiry/",
  ]) assert.match(data + collection + racketHub, new RegExp(href.replaceAll("/", "\\/")));
  assert.match(collection, /title: "Custom Padel Bags for Brands \| OEM Racket Bags & Backpacks"/);
  assert.match(collection, /<h1>Custom Padel Bags: Racket Bags, Backpacks &amp; Duffels<\/h1>/);
  assert.match(collection, /Compare OEM padel racket bags, backpacks, duffels, totes and shoe bags/);
  assert.equal((sitemap.match(/padel-brand-collection-development/g) || []).length, 1);
});

test("RFQ surfaces the approved racket sports product set without a database migration", async () => {
  const [component, inquiry] = await Promise.all([
    source("app/racket-sports-rfq-form.jsx"),
    source("public/site/inquiry/index.html"),
  ]);
  for (const option of [
    "Padel bag",
    "Padel backpack",
    "Padel racket sleeve / cover",
    "Tennis racket bag",
    "Pickleball bag",
    "Racket sports accessory case",
    "Club/team gear bag",
    "Other racket sports soft goods",
  ]) {
    assert.match(component, new RegExp(option.replace("/", "\\/")));
    assert.match(inquiry, new RegExp(option.replace("/", "\\/")));
  }
  assert.match(component, /name="attachments"/);
  assert.match(component, /name="sample_timeline"/);
});
