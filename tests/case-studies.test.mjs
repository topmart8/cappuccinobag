import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import sitemap from "../app/sitemap.js";
import {
  buildCaseStudySchema,
  caseStudies,
  caseStudyMap,
} from "../app/case-studies/case-studies.js";

test("case study center exposes the three requested canonical routes", async () => {
  assert.deepEqual(caseStudies.map((item) => item.url), [
    "/fletcher-hotels-custom-bag",
    "/noeve-vegan-beauty-accessory",
    "/kitty-couture-rhinestone-handbag",
  ]);

  const pageFiles = [
    "../app/case-studies/page.js",
    ...caseStudies.map((item) => `../app${item.url}/page.js`),
  ];
  await Promise.all(pageFiles.map((file) => access(new URL(file, import.meta.url))));

  const sitemapUrls = new Set(sitemap().map((entry) => entry.url));
  assert.ok(sitemapUrls.has("https://www.cappuccinobag.com/case-studies"));
  for (const item of caseStudies) {
    assert.ok(sitemapUrls.has(`https://www.cappuccinobag.com${item.url}`));
  }
});
test("every case study includes SEO copy, visible FAQs and required schema types", () => {
  for (const item of caseStudies) {
    assert.ok(item.seoTitle.length <= 60);
    assert.ok(item.metaDescription.length >= 120 && item.metaDescription.length <= 165);
    assert.ok(item.faqs.length >= 3);
    assert.equal(caseStudyMap[item.slug], item);

    const schema = buildCaseStudySchema(item);
    const types = new Set(schema["@graph"].map((entry) => entry["@type"]));
    assert.ok(types.has("Organization"));
    assert.ok(types.has("Product"));
    assert.ok(types.has("FAQPage"));
    assert.ok(types.has("BreadcrumbList"));
    assert.equal(
      schema["@graph"].find((entry) => entry["@type"] === "FAQPage").mainEntity.length,
      item.faqs.length,
    );
  }
});
