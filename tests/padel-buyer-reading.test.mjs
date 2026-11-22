import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { hybridPadelArticles } from "../app/hybrid-padel-articles.js";
import { padelWorkToteArticles } from "../app/padel-work-tote-articles.js";
import { getPadelArticleNavigation, padelArticleTopics, padelBuyerReading, padelGuide } from "../app/padel-buyer-reading.js";
import { renderPadelReading } from "../app/padel-buyer-reading-html.js";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const packedFit = "/blog/padel-bag-packed-fit-test";
const model = "/products/travel-padel-utility-backpack-pdb017";
const manufacturer = "/custom-padel-bag-manufacturer";

test("assigns every existing Padel article exactly one topic and a real buying destination", async () => {
  const entries = (await readdir(new URL("../public/site/blog/", import.meta.url), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.includes("padel")).map(({ name }) => name);
  const published = [...Object.keys(hybridPadelArticles), ...Object.keys(padelWorkToteArticles), ...entries];
  assert.equal(new Set(published).size, published.length);
  assert.deepEqual(padelBuyerReading.map(({ slug }) => slug).sort(), published.sort());
  for (const item of padelBuyerReading) {
    assert.equal(padelArticleTopics.filter(({ id }) => id === item.topic).length, 1);
    assert.ok(item.destination[0].startsWith("/"));
    assert.ok(item.tags.length > 0);
  }
});

test("recommends other articles by shared tags, without tag URLs or self-links", () => {
  for (const { slug, tags, href, topic } of padelBuyerReading) {
    const nav = getPadelArticleNavigation(slug);
    assert.equal(nav.topic[0], `${padelGuide}#${topic}`);
    assert.equal(nav.recommendations.length, 2);
    for (const [target] of nav.recommendations) {
      assert.notEqual(target, href);
      const item = padelBuyerReading.find((article) => article.href === target);
      assert.ok(item?.tags.some((tag) => tags.includes(tag)));
    }
  }
  assert.equal(getPadelArticleNavigation("not-a-padel-article"), null);
});

test("the design guide groups published articles once and links to packed-fit, model and manufacturer", async () => {
  const hub = renderPadelReading(await source("public/site/padel-bag-design-guide/index.html"), padelGuide.slice(1));
  for (const { id } of padelArticleTopics) assert.equal(hub.split(`id="${id}"`).length - 1, 1);
  for (const { href } of padelBuyerReading) assert.equal(hub.split(`href="${href}"`).length - 1, 1);
  assert.ok(hub.includes(`href="${packedFit}"`));
  const article = renderPadelReading(await source(`public/site${packedFit}/index.html`), packedFit.slice(1));
  assert.equal(article.split(`href="${model}"`).length - 1, 1);
  assert.ok(article.includes(`href="${manufacturer}"`));
  assert.ok(article.includes(`href="${padelGuide}#padel-load-testing"`));
  assert.ok(article.includes('href="/inquiry?product=Padel%20Bags"'));
});

test("buyer topic hub follows the existing MOQ policy without taking over the guide FAQ", async () => {
  const sourceHtml = await source("public/site/padel-bag-design-guide/index.html");
  const rendered = renderPadelReading(sourceHtml, padelGuide.slice(1));
  assert.match(rendered, /300 pieces per style; different styles cannot be combined\. Samples are assessed separately\./);
  assert.ok(rendered.includes('<a href="/moq-sampling-faq">Review the custom MOQ and sampling policy.'));
  assert.equal(rendered.match(/<script type="application\/ld\+json">.*?<\/script>/s)[0],
    sourceHtml.match(/<script type="application\/ld\+json">.*?<\/script>/s)[0]);
});

test("non-Padel pages preserve their existing HTML", () => {
  const input = "<article><h1>Unrelated article</h1></article>";
  assert.equal(renderPadelReading(input, "blog/unrelated-article"), input);
  assert.equal(renderPadelReading(input, "inquiry"), input);
});

test("catalogue routes stay model-specific and separate evidence from proposed checks", async () => {
  const { getPadelCatalogGuides, padelCatalog, padelBackpackCollection, rankComparablePadelProducts } =
    await import("../app/padel-catalog-navigation.js");
  assert.deepEqual(padelCatalog.PDB017.observed, []);
  assert.ok(padelCatalog.PDB017.reviewTopics.includes("shoe"));
  assert.equal(getPadelCatalogGuides("PDB017")[0][0], packedFit);
  assert.match(padelCatalog.S005.observed[0][1], /sample-photo reference; thermal performance untested/);
  assert.match(getPadelCatalogGuides("S005")[0][1], /thermal-claim limits/);
  assert.equal(rankComparablePadelProducts("PDB017", [{ model: "PDB014" }, { model: "PDB016" }])[0].model, "PDB016");
  const [collection, backpacks, template, sitemap] = await Promise.all([
    source("app/racket-sports/padel-bags/page.js"),
    source("app/dual-pocket-padel-data.js"),
    source("app/hybrid-padel-product-template.js"),
    source("app/sitemap.js"),
  ]);
  for (const sku of ["PDB014", "PDB016", "PDB017", "S005"]) assert.ok(collection.includes(padelCatalog[sku].href));
  assert.equal(padelBackpackCollection, "/racket-sports/padel-backpacks");
  assert.ok(backpacks.includes(padelCatalog.PDB017.href));
  assert.match(template, /\/inquiry\?product=Padel%20Bags&format=\$\{encodeURIComponent/);
  assert.equal(sitemap.split('path: "/padel-bag-design-guide"').length - 1, 1);
});

test("homepage preserves the two buyer routes and resources links to the topic hub", async () => {
  const [homeRenderer, resources] = await Promise.all([
    source("app/static-site.js"),
    source("public/site/resources/index.html"),
  ]);
  const homeLinks = homeRenderer.match(/<nav aria-label="Padel product paths">.*?<\/nav>/)?.[0];
  assert.ok(homeLinks?.includes('href="/racket-sports/padel-bags"'));
  assert.ok(homeLinks?.includes('href="/custom-padel-bag-manufacturer"'));
  assert.ok(resources.includes('href="/padel-bag-design-guide#padel-reading-topics"'));
});
