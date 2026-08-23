import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const globals = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const inquiry = await readFile(new URL("../public/site/assets/inquiry.css", import.meta.url), "utf8");

test("shared floating controls use one safe-area positioning contract", () => {
  assert.match(globals, /--floating-control-inline-edge:max\(14px,env\(safe-area-inset-right\)\)/);
  assert.match(globals, /--floating-control-block-edge:max\(14px,env\(safe-area-inset-bottom\)\)/);
  assert.match(globals, /body \.whatsapp-float\{[^}]*right:var\(--floating-control-inline-edge\)[^}]*bottom:var\(--floating-control-block-edge\)/s);
});

test("quote and cookie controls occupy separate slots around WhatsApp", () => {
  assert.match(globals, /body \.analytics-settings\{[^}]*bottom:calc\(var\(--floating-control-block-edge\) \+ var\(--floating-control-size\) \+ var\(--floating-control-gap\)\)/s);
  assert.match(globals, /body \.quote-float\{[^}]*right:var\(--floating-control-inline-edge\)[^}]*bottom:calc\(var\(--floating-control-block-edge\) \+ var\(--floating-control-size\) \+ var\(--floating-control-gap\)\)/s);
  assert.match(globals, /body:has\(\.quote-float\) \.analytics-settings\{[^}]*var\(--floating-quote-size\)/s);
});

test("mobile hybrid product headings reserve the compact control rail", () => {
  assert.match(globals, /@media\(max-width:680px\)[\s\S]*body \.analytics-settings::before\{[^}]*content:"Cookies"/);
  assert.match(globals, /body \.quote-float::before\{content:"Quote"/);
  assert.match(globals, /body:has\(\.hybrid-product-page\) \.hybrid-hero-copy h1/);
  assert.match(globals, /body:has\(\.hybrid-article-page\) \.hybrid-article-hero h1/);
  assert.match(globals, /body:has\(\.pdb001-article-page\) \.pdb001-article-hero h1/);
  assert.match(globals, /body:has\(\.cp-page\) \.cp-hero>div:first-child/);
  assert.match(globals, /max-width:calc\(100% - var\(--floating-control-size\) - var\(--floating-control-gap\) - env\(safe-area-inset-right\)\)/);
});

test("inquiry keeps all shared floating controls outside the RFQ form", () => {
  assert.match(inquiry, /body:has\(\.rfq-page\) \.whatsapp-float/);
  assert.match(inquiry, /body:has\(\.rfq-page\) \.quote-float/);
  assert.match(inquiry, /body:has\(\.rfq-page\) \.analytics-settings/);
});
