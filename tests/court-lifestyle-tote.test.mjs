import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read = (path) => fs.readFileSync(path, "utf8");
const pagePath = "app/products/court-lifestyle-tote-development-sample/page.js";
const route = "/products/court-lifestyle-tote-development-sample";

test("Court retains one canonical page and approved brand audience without fit claims", () => {
  const page = read(pagePath);
  assert.match(page, /<h1>Women’s Court Lifestyle Tote<\/h1>/);
  assert.match(page, /For brands developing tennis, pickleball and padel lifestyle collections/);
  assert.match(page, /alternates: \{ canonical \}/);
  assert.match(page, /Fit has not been validated/);
});
test("model-specific order terms require quotation instead of an unconfirmed MOQ", () => {
  const page = read(pagePath);
  assert.match(page, /MOQ, sample charges, pricing and timing are agreed in the quotation/);
  assert.doesNotMatch(page, /300|100–200|free sample|in.stock/i);
  assert.doesNotMatch(read("app/products/page.js"), /300-piece production MOQ/);
});
test("own retouched images are identified and third-party details are excluded", () => {
  const page = read(pagePath);
  for (const name of ["court-ivory-retouched.webp", "court-black-retouched.webp"]) {
    assert.ok(fs.existsSync(`public/images/court-lifestyle-tote/${name}`));
    assert.ok(page.includes(name));
  }
  assert.match(page, /Retouched presentation images based on our physical samples/);
  assert.doesNotMatch(page, /court-interior-detail|court-back-detail|court-base-detail|court-complete-set/);
  assert.match(page, /Material composition, removable features and included accessories need confirmation/);
});
test("schema matches visible questions without invented commerce or specifications", () => {
  const page = read(pagePath);
  for (const type of ["WebPage", "BreadcrumbList", "FAQPage"]) assert.ok(page.includes(`"@type": "${type}"`));
  assert.match(page, /acceptedAnswer: \{ "@type": "Answer", text: faq.answer \}/);
  assert.equal((page.match(/question:/g) || []).length, 4);
  assert.doesNotMatch(page, /"@type": "Product"|offers|aggregateRating|reviewCount|InStock|7 inch/);
});
test("mobile images have restrained sizing and a single inquiry destination", () => {
  const css = read("app/products/court-lifestyle-tote-development-sample/page.module.css");
  assert.match(css, /max-width:760px/);
  assert.match(css, /height:320px;max-height:44svh/);
  assert.match(css, /height:280px;aspect-ratio:4\/5/);
  const page=read(pagePath);
  assert.match(page, /\/inquiry\?product=Court%20Lifestyle%20Tote%20Development%20Sample/);
  assert.equal((page.match(/href=\{inquiryHref\}/g)||[]).length,2);
  assert.match(page, /Add your requirements in the Message field/);
});
test("catalog preserves collection order and Court supporting links remain in main content", () => {
  const directory=read("app/products/page.js");
  assert.ok(directory.indexOf('name: "Corporate & Tech Gift Solutions"') < directory.indexOf('name: "Padel Bags"'));
  assert.match(directory,/Featured Development Sample/);
  for(const source of ["public/site/custom-tennis-bag-manufacturer/index.html","public/custom-pickleball-paddle-bags/index.html"]){
    const main=read(source).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    assert.ok(main?.includes(`href="${route}"`));
  }
});
test("Court sitemap canonical remains present exactly once",async()=>{
  const {default:sitemap}=await import("../app/sitemap.js");
  assert.equal(sitemap().filter(entry=>entry.url===`https://www.cappuccinobag.com${route}`).length,1);
});

test("black lining is a labeled customization illustration, separate from sample facts", () => {
  const page = read(pagePath);
  assert.ok(fs.existsSync("public/images/court-lifestyle-tote/court-black-lining-concept.webp"));
  assert.match(page, /Customization concept — black lining\. Final layout confirmed during sampling\./);
  assert.match(page, /alt="Customization illustration of a proposed black tote lining and interior layout"/);
  const facts = page.match(/const facts = \[([\s\S]*?)\];/)[1];
  assert.doesNotMatch(facts, /lining|divider|capacity|compartment/i);
  const css = read("app/products/court-lifestyle-tote-development-sample/page.module.css");
  assert.match(css, /liningVisual img\{display:block;width:100%;height:auto;aspect-ratio:3\/2;object-fit:contain/);
});
