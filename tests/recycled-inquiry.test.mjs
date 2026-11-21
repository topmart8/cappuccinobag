import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const script = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
const html = await readFile(new URL("../public/site/inquiry/index.html", import.meta.url), "utf8");
const start = script.indexOf("function preselectInquiryContext(form)");
const end = script.indexOf("\nfunction ", start + 1);
assert.ok(start >= 0 && end > start);
const source = script.slice(start, end);

function run(project, format = "", messageValue = "") {
  const secondary = { open: false };
  const form = {
    elements: {
      inquiry_intention: { value: "Outdoor Multifunctional Bag Project", options: [{ value: "Pickleball / Padel Bag Project" }] },
      product_needed: { value: "Outdoor Multifunctional Bags", options: [{ value: "Pet Travel Bags" }, { value: "Pet Carrier Backpack" }] },
      message: { value: messageValue },
    },
    querySelector: () => secondary,
  };
  const search = "?" + new URLSearchParams({ product: project, format });
  vm.runInNewContext(source + "\npreselectInquiryContext(form);", { form, URLSearchParams, window: { location: { search } } });
  return { form, secondary };
}

test("recycled article CTA selects the material category and a valid intention", () => {
  const { form, secondary } = run("Recycled Material Bags");
  assert.equal(form.elements.product_needed.value, "Recycled Material Bags");
  assert.equal(form.elements.inquiry_intention.value, "Eco-Tech Sustainable Product Project");
  assert.equal(form.elements.message.value, "");
  assert.equal(secondary.open, false);
  for (const field of ["product_needed", "inquiry_intention"]) {
    const options = html.match(new RegExp('<select name="' + field + '"[\\s\\S]*?</select>'))?.[0];
    assert.ok(options?.includes("<option>" + form.elements[field].value + "</option>"));
  }
});

test("rPET product wording does not route a recycled inquiry into pet products", () => {
  const { form, secondary } = run("Recycled Material Bags", "rPET folding tote");
  assert.equal(form.elements.product_needed.value, "Recycled Material Bags");
  assert.equal(form.elements.message.value, "Recycled bag format: rPET folding tote\n");
  assert.equal(secondary.open, false);
});

test("recycled format prefill keeps an existing buyer message", () => {
  const { form } = run("Recycled Material Bags", "rPET folding tote", "Our own dimensions and lining requirements");
  assert.equal(form.elements.message.value, "Our own dimensions and lining requirements");
});

test("existing Golf, Padel, travel, running and pet category choices stay intact", () => {
  const cases = [
    ["Golf Bags", "Competition Golf Shoe Bag", "Golf Bags", "Private Label Production"],
    ["Padel Bags", "Racket Backpack", "Padel Bags", "Pickleball / Padel Bag Project"],
    ["Travel Bags", "Weekender", "Travel Bags", "Travel Bag / Luggage Project"],
    ["Outdoor Sports Bags", "Running Waist Belt", "Outdoor Sports Bags", "Outdoor Sports Bag Project"],
    ["Pet Travel Bags", "Pet Carrier Backpack", "Pet Carrier Backpack", "Pet Travel Bag Project"],
  ];
  for (const [project, format, product, intention] of cases) {
    const { form } = run(project, format);
    assert.equal(form.elements.product_needed.value, product);
    assert.equal(form.elements.inquiry_intention.value, intention);
  }
});
