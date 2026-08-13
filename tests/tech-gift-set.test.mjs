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
