import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { inquiryHref } from "../app/products/croc-embossed-rolling-backpack/data.js";

test("rolling backpack RFQ selects the travel category and preserves the product brief", async () => {
  const script = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  const start = script.indexOf("function preselectInquiryContext(form)");
  const end = script.indexOf("\nfunction submissionIdFor", start);
  assert.ok(start >= 0 && end > start);
  const form = { elements: { inquiry_intention: {}, product_needed: {}, message: {} } };
  const context = { URLSearchParams, window: { location: { search: inquiryHref.split("?")[1] } }, form };
  vm.runInNewContext(`${script.slice(start, end)}\npreselectInquiryContext(form);`, context);
  assert.equal(form.elements.inquiry_intention.value, "Travel Bag / Luggage Project");
  assert.equal(form.elements.product_needed.value, "Travel Bags");
  assert.equal(form.elements.message.value, "Travel product format: Croc-Embossed Rolling Backpack\n");
});

test("travel prefill does not capture unrelated private-label projects", async () => {
  const script = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  const source = script.slice(script.indexOf("function preselectInquiryContext(form)"), script.indexOf("\nfunction submissionIdFor"));
  const form = { elements: { inquiry_intention: { value: "Private Label Production" }, product_needed: { value: "Wallets" }, message: { value: "Existing brief" } } };
  vm.runInNewContext(`${source}\npreselectInquiryContext(form);`, { URLSearchParams, window: { location: { search: "?product=Wallets" } }, form });
  assert.equal(form.elements.product_needed.value, "Wallets");
  assert.equal(form.elements.message.value, "Existing brief");
});
