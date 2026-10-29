import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { cardHolderProducts, cardHolderFaqs, rfidHubFaqs, leatherHubFaqs } from "../app/card-holder-data.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("all eight card holders qualify custom MOQ and preserve agreed order terms", () => {
  assert.equal(cardHolderProducts.length, 8);
  for (const product of cardHolderProducts) {
    assert.match(product.moq, /300 pieces per style for new custom bulk orders/);
    assert.match(product.moq, /not per colour/);
    assert.match(product.moq, /Different styles cannot be combined/);
    assert.match(product.moq, /Existing agreed orders keep their agreed terms/);
    assert.match(product.moq, /after design approval/);
    assert.match(product.moq, /exceptions require explicit approval/i);
  }
});

test("card-holder FAQ sources distinguish stock enquiries from current custom terms", () => {
  for (const faqs of [cardHolderFaqs, rfidHubFaqs, leatherHubFaqs]) {
    const answer = faqs.find(([question]) => /stock or wholesale/i.test(question))?.[1];
    assert.ok(answer);
    assert.match(answer, /not a stock or wholesale offer/);
    assert.match(answer, /Historical catalogue quantities/);
    assert.match(answer, /availability and order terms require separate confirmation/);
  }
});

test("AI discovery summary preserves policy scope, legacy orders and approval gates", async () => {
  const llms = await read("public/llms.txt");
  assert.match(llms, /Guangzhou Cappuccino Leather Handbag Co\., Ltd\./);
  assert.match(llms, /new custom bulk orders/i);
  assert.match(llms, /300 (?:pcs|pieces) per style/);
  assert.match(llms, /Different styles cannot be combined/);
  assert.match(llms, /Existing agreed orders keep their agreed terms/);
  assert.match(llms, /stock or wholesale offer/);
  assert.match(llms, /An RFQ does not authorize sampling or charges/);
});

test("both page renderers expose the same custom-only MOQ guide entry", async () => {
  for (const path of ["components/SiteFooter.jsx", "app/static-site.js"]) {
    const source = await read(path);
    assert.match(source, /Custom bulk MOQ: 300 pieces per style/);
    assert.match(source, /href="\/moq-sampling-faq"/);
  }
});

test("card-holder RFQ preserves each model and selects existing form options", async () => {
  const script = await read("public/site/assets/script.js");
  const source = script.slice(script.indexOf("function preselectInquiryContext(form)"), script.indexOf("\nfunction showToast"));
  const html = await read("public/site/inquiry/index.html");
  assert.match(html, /<option>Wallet \/ Card Holder Project<\/option>/);
  assert.match(html, /<option>Card Holders<\/option>/);
  for (const product of cardHolderProducts) {
    const format = `${product.code} ${product.name}`;
    const form = { elements: { inquiry_intention: {}, product_needed: {}, message: {} } };
    vm.runInNewContext(`${source}\npreselectInquiryContext(form);`, {
      URLSearchParams, form, window: { location: { search: `?product=Card%20Holder&format=${encodeURIComponent(format)}` } },
    });
    assert.equal(form.elements.inquiry_intention.value, "Wallet / Card Holder Project");
    assert.equal(form.elements.product_needed.value, "Card Holders");
    assert.equal(form.elements.message.value, `Card holder model: ${format}\n`);
  }
});

test("card-holder prefill does not take over unrelated product enquiries", async () => {
  const script = await read("public/site/assets/script.js");
  const source = script.slice(script.indexOf("function preselectInquiryContext(form)"), script.indexOf("\nfunction showToast"));
  const form = { elements: { inquiry_intention: { value: "Private Label Production" }, product_needed: { value: "Wallets" }, message: { value: "Existing brief" } } };
  vm.runInNewContext(`${source}\npreselectInquiryContext(form);`, { URLSearchParams, form, window: { location: { search: "?product=Wallets&format=Wallet%20with%20card%20holder" } } });
  assert.equal(form.elements.product_needed.value, "Wallets");
  assert.equal(form.elements.message.value, "Existing brief");
});
