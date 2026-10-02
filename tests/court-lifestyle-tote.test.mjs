import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const pagePath = "app/products/court-lifestyle-tote-development-sample/page.js";
const route = "/products/court-lifestyle-tote-development-sample";

test("court lifestyle tote uses one canonical page with the approved positioning", () => {
  const page = read(pagePath);

  assert.match(page, /Custom Women's Court Tote \| OEM\/ODM \| Cappuccino Bag/);
  assert.match(page, /<h1>Women’s Court Lifestyle Tote<\/h1>/);
  assert.match(page, /In-house Development Sample/);
  assert.match(page, /Development sample shown\. Final materials, dimensions, equipment fit and production specifications are confirmed for each project\./);
  assert.match(page, /alternates: \{ canonical \}/);
});

test("court lifestyle tote preserves exact commercial facts and four buyer FAQs", () => {
  const page = read(pagePath);

  assert.match(page, /Custom production starts at 300 pieces per style\./);
  assert.match(page, /Custom production orders of 100–200 pieces are not available\./);
  assert.match(page, /Colour allocation is reviewed for each project\./);
  assert.match(page, /Sample development is quoted separately/);
  assert.equal((page.match(/question:/g) || []).length, 4);
  for (const question of [
    "What is the minimum order quantity?",
    "Can I develop a sample first?",
    "Which details can be customized?",
    "How is racket or paddle fit confirmed?",
  ]) assert.match(page, new RegExp(question.replace(/[?]/g, "\\?")));
});

test("schema mirrors visible facts without invented commerce or specifications", () => {
  const page = read(pagePath);

  for (const type of ["WebPage", "BreadcrumbList", "FAQPage"]) assert.match(page, new RegExp(`"@type": "${type}"`));
  assert.doesNotMatch(page, /"@type": "Product"|offers|aggregateRating|reviewCount|InStock/);
  assert.doesNotMatch(page, /detachable|shoe compartment|thermal|bottle pocket|genuine leather|vegan|GRS|7 inch|free sample|customer production/i);
});

test("product directory keeps its existing order and adds only a compact featured module", () => {
  const directory = read("app/products/page.js");
  const corporate = directory.indexOf('name: "Corporate & Tech Gift Solutions"');
  const padel = directory.indexOf('name: "Padel Bags"');
  const pickleball = directory.indexOf('name: "Pickleball Bags"');
  const tennis = directory.indexOf('name: "Tennis Bags"');

  assert.ok(corporate >= 0 && corporate < padel && padel < pickleball && pickleball < tennis);
  assert.equal((directory.match(/name: "Court Lifestyle Bags"/g) || []).length, 0);
  assert.match(directory, /Featured Development Sample/);
  assert.match(directory, /Padel is the first core growth category/);
  assert.match(directory, new RegExp(route));
});

test("original physical sample photos are used and supporting pages link to the owner", () => {
  const page = read(pagePath);
  const pickleball = read("public/custom-pickleball-paddle-bags/index.html");
  const tennis = read("public/site/custom-tennis-bag-manufacturer/index.html");
  const asset = "public/images/court-lifestyle-tote/ivory-brown-tote-front-source.jpeg";

  assert.ok(fs.existsSync(asset));
  assert.ok(fs.statSync(asset).size < 150_000);
  assert.equal(fs.existsSync("public/images/court-lifestyle-tote/court-lifestyle-tote-development-sample-board.png"), false);
  assert.match(page, /Physical development sample/);
  assert.doesNotMatch(page, /AI-assisted|Approved physical sample photography is required/);
  for (const name of ["black-tote-front-source.jpeg", "black-tote-angle-source.jpeg"]) {
    assert.ok(fs.existsSync(`public/images/court-lifestyle-tote/${name}`));
    assert.ok(page.includes(name));
  }
  assert.match(pickleball, new RegExp(route));
  assert.match(tennis, new RegExp(route));
});


test("supporting links remain inside page main content after shared footer removal", () => {
  for (const source of ["public/site/custom-tennis-bag-manufacturer/index.html", "public/custom-pickleball-paddle-bags/index.html"]) {
    const main = read(source).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    assert.ok(main?.includes(`href="${route}"`), `${source} must link within main`);
  }
});

test("Court sample canonical is present exactly once in generated sitemap", async () => {
  const { default: sitemap } = await import("../app/sitemap.js");
  const entries = sitemap().filter((entry) => entry.url === `https://www.cappuccinobag.com${route}`);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].lastModified, "2026-10-02");
});
