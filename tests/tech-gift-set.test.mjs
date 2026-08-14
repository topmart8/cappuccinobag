import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("3-in-1 tech gift cluster includes required routes, schemas and eight images", () => {
  const product = read("app/products/3-in-1-tech-gift-set-backpack-headphones-speaker/page.js");
  const data = read("app/corporate-tech-gift-data.js");
  const sitemap = read("app/sitemap.js");
  const images = fs.readdirSync("public/images/corporate-tech-gift-set").filter((file) => file.endsWith(".webp"));
  assert.equal(images.length, 8);
  for (const type of ["Product", "FAQPage", "BreadcrumbList"]) assert.match(product, new RegExp(`\"@type\": \"${type}\"`));
  assert.equal((data.match(/seoTitle:/g) || []).length, 3);
  assert.match(sitemap, /techGiftArticles/);
  assert.match(sitemap, /techGiftProductPath/);
});

test("relevant legacy pages link back to the corporate tech gift set", () => {
  const staticSite = read("app/static-site.js");
  for (const slug of ["oem-odm-bag-manufacturer", "custom-laptop-travel-backpack", "phone-case-cardholder-gift-set-oem"]) {
    assert.match(staticSite, new RegExp(`\"${slug}\"`));
  }
  assert.match(staticSite, /\/products\/3-in-1-tech-gift-set-backpack-headphones-speaker/);
});

test("tech gift collection and articles expose complete social metadata and internal links", () => {
  const collection = read("app/corporate-tech-gift-solutions/page.js");
  const articleTemplate = read("app/tech-gift-article-template.js");
  const articleData = read("app/corporate-tech-gift-data.js");
  assert.match(collection, /Corporate & Tech Gift Solutions \| Cappuccino Bag/);
  assert.match(collection, /Backpack-led OEM tech gift sets for corporate promotions, employee welcome kits, distributors and Latin America programs\./);
  assert.match(collection, /images: \[`\$\{techGiftSiteUrl\}\$\{techGiftImages\[0\]\.src\}`\]/);
  assert.match(articleData, /"01-cappuccino-3in1-tech-gift-set-hero\.webp"/);
  assert.match(articleData, /src: `\/images\/corporate-tech-gift-set\/\$\{file\}`/);
  for (const field of ["title: article.seoTitle", "description: article.description", "alternates: { canonical }", "openGraph:", "twitter:"]) {
    assert.match(articleTemplate, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(articleTemplate, /"@type": "Article"/);
  assert.match(articleTemplate, /href={techGiftCollectionPath}/);
  assert.match(articleTemplate, /href={techGiftProductPath}/);
  assert.equal((articleData.match(/seoTitle:/g) || []).length, 3);
  assert.equal((articleData.match(/description:/g) || []).length, 3);
});
