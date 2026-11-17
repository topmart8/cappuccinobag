import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const guideSource = () => source("public/site/padel-bag-design-guide/index.html");
const schema = (page) => JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test("Padel guide states custom-only, per-style minimum without promising mixed-style approval", async () => {
  const guide = await guideSource();
  const faq = schema(guide)["@graph"].find((node) => node["@type"] === "FAQPage");
  const answer = faq.mainEntity.find((node) => node.name === "How are MOQ and lead time confirmed for an OEM Padel bag?").acceptedAnswer.text;
  for (const fact of [
    "New custom bulk orders start at 300 pieces per style, not per colour.",
    "Different styles cannot be combined to reach the minimum.",
    "may require a higher quantity",
    "Sample development and any fee are assessed separately after design approval.",
    "Existing agreed orders keep their agreed terms; exceptions require explicit approval.",
  ]) assert.ok(answer.includes(fact), `Missing approved policy: ${fact}`);
  assert.match(guide, /New custom bulk orders start at 300 pieces per style; different styles cannot be combined/);
  assert.match(guide, /href="\/moq-sampling-faq">custom MOQ and sampling policy/);
});

test("all five Padel guide FAQ answers match visible content exactly", async () => {
  const guide = await guideSource();
  const faq = schema(guide)["@graph"].find((node) => node["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, 5);
  for (const question of faq.mainEntity) {
    assert.ok(guide.includes(`<h3>${question.name}</h3><p>${question.acceptedAnswer.text}</p>`));
  }
});

test("Padel guide preserves informational intent and the existing sourcing owners", async () => {
  const guide = await guideSource();
  assert.match(guide, /<title>Custom Padel Bag Design &amp; Procurement Guide \| OEM Brief<\/title>/);
  assert.equal((guide.match(/<h1>/g) || []).length, 1);
  assert.match(guide, /<h1>Custom Padel Bag Design &amp; Procurement Guide<\/h1>/);
  assert.match(guide, /rel="canonical" href="https:\/\/www\.cappuccinobag\.com\/padel-bag-design-guide"/);
  for (const href of ["/custom-padel-bag-manufacturer", "/racket-sports/padel-bags", "/quality-inspection-guide", "/factory-trust-materials"]) {
    assert.ok(guide.includes(`href="${href}"`), `Missing existing owner: ${href}`);
  }
  assert.equal(schema(guide)["@graph"].filter((node) => node["@type"] === "Article").length, 1);
  assert.doesNotMatch(guide, /"@type"\s*:\s*"(?:Product|Offer|AggregateRating|Review)"/);
});

test("Padel guide links the existing material article without unverified performance claims", async () => {
  const [guide, material] = await Promise.all([
    guideSource(),
    source("app/blog/recycled-water-resistant-materials-padel-bags/page.js"),
  ]);
  assert.match(guide, /href="\/blog\/recycled-water-resistant-materials-padel-bags"/);
  assert.match(material, /HybridPadelArticle/);
  assert.match(guide, /Material names alone do not prove finished-bag durability, water resistance, recycled content or compliance/);
});

test("Padel guide keeps two non-submitting existing inquiry links and adds no form or media", async () => {
  const guide = await guideSource();
  assert.equal((guide.match(/href="\/inquiry\?product=Padel%20Bags"/g) || []).length, 2);
  assert.doesNotMatch(guide, /<form|<iframe|<img|<video/);
  assert.doesNotMatch(guide, /\/api\/|fetch\(|sendBeacon\(/);
});
