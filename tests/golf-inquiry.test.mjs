import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { golfInquiryHref, golfProducts } from "../app/golf-bags/data.js";
import { mapSharedInquiryPayload } from "../lib/crm/shared-ingest.js";

test("golf collection and product links preserve their selected format in the shared RFQ", async () => {
  const script = (await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8")).replace(/\r\n/g, "\n");
  const html = await readFile(new URL("../public/site/inquiry/index.html", import.meta.url), "utf8");
  const start = script.indexOf("function preselectInquiryContext(form)");
  const end = script.indexOf("\nfunction ", start + 1);
  assert.ok(start >= 0 && end > start);
  for (const format of [undefined, ...golfProducts.map((product) => product.name), "Competition Golf Shoe Bag"]) {
    const url = new URL(golfInquiryHref(format), "https://www.cappuccinobag.com");
    const form = { elements: { inquiry_intention: {}, product_needed: { options: [] }, message: {} }, querySelector: () => null };
    vm.runInNewContext(`${script.slice(start, end)}\npreselectInquiryContext(form);`, { URLSearchParams, window: { location: { search: url.search } }, form });
    assert.equal(url.pathname, "/inquiry");
    assert.equal(form.elements.product_needed.value, "Golf Bags");
    assert.equal(form.elements.inquiry_intention.value, "Private Label Production");
    for (const field of ["product_needed", "inquiry_intention"]) {
      const options = html.match(new RegExp(`<select name="${field}"[\\s\\S]*?</select>`))?.[0];
      assert.ok(options?.includes(`<option>${form.elements[field].value}</option>`));
    }
    assert.equal(form.elements.message.value, `Golf product format: ${url.searchParams.get("format")}\n`);
    const payload = mapSharedInquiryPayload("cappuccino", {
      submission_id: "44444444-4444-4444-8444-444444444444",
      name: "Synthetic Buyer",
      email: "synthetic@example.invalid",
      product_needed: form.elements.product_needed.value,
      message: form.elements.message.value,
    });
    assert.equal(payload.product_category, "Golf Bags");
    assert.ok(payload.message.includes(url.searchParams.get("format")));
  }
});

test("explicit Golf precedence preserves Padel, travel, running and pet prefill", async () => {
  const script = (await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8")).replace(/\r\n/g, "\n");
  const extract = (name) => {
    const start = script.indexOf(`function ${name}(`);
    const end = script.indexOf("\nfunction ", start + 1);
    assert.ok(start >= 0 && end > start);
    return script.slice(start, end);
  };
  const source = `${script.includes("function updatePetProjectField(") ? extract("updatePetProjectField") : ""}\n${extract("preselectInquiryContext")}`;
  const cases = [
    ["Padel Bags", "PDB001 Work Tote Backpack", "Padel Bags", "Pickleball / Padel Bag Project", "Padel product format"],
    ["Travel Bags", "Rolling Backpack", "Travel Bags", "Travel Bag / Luggage Project", "Travel product format"],
    ["Outdoor Sports Bags", "Running Waist Belt", "Outdoor Sports Bags", "Outdoor Sports Bag Project", "Running product format"],
    ["Pet Travel Bags", "Dog Road Trip Bag", "Pet Travel Bags", "Pet Travel Bag Project", "Pet travel product"],
    ["Pet Travel Bags", "Pet Carrier Backpack", "Pet Carrier Backpack", "Pet Travel Bag Project", "Pet travel product"],
  ];
  for (const [project, format, expectedProduct, expectedIntention, prefix] of cases) {
    const secondaryFields = { open: false };
    const form = {
      elements: {
        inquiry_intention: { options: [{ value: "Pickleball / Padel Bag Project" }] },
        product_needed: { options: [{ value: "Pet Travel Bags" }, { value: "Pet Carrier Backpack" }] },
        message: {},
      },
      querySelector: (selector) => selector === ".rfq-secondary" ? secondaryFields : null,
    };
    const search = `?${new URLSearchParams({ product: project, format })}`;
    vm.runInNewContext(`${source}\npreselectInquiryContext(form);`, { URLSearchParams, window: { location: { search } }, form });
    assert.equal(form.elements.product_needed.value, expectedProduct);
    assert.equal(form.elements.inquiry_intention.value, expectedIntention);
    assert.equal(form.elements.message.value, `${prefix}: ${format}\n`);
    assert.equal(secondaryFields.open, project === "Pet Travel Bags");
  }
});
