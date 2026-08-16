import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { mapSharedInquiryPayload } from "../lib/crm/shared-ingest.js";

const TEST_SUBMISSION_ID = "33333333-3333-4333-8333-333333333333";

test("homepage source defines the approved seven-stage decision hierarchy", async () => {
  const source = await readFile(new URL("../app/static-site.js", import.meta.url), "utf8");
  const start = source.indexOf("function addHomePrioritySections");
  const end = source.indexOf("function addPadelCollectionEntry", start);
  const homepage = source.slice(start, end);
  const stageIds = [
    "home-hero",
    "buyer-paths",
    "featured-products",
    "factory-development-proof",
    "case-studies",
    "material-capabilities",
    "project-cta",
  ];

  assert.deepEqual(
    stageIds.filter((id) => homepage.includes(`id=\"${id}\"`)),
    stageIds,
  );
  assert.equal((homepage.match(/<h1>/g) || []).length, 1);
  assert.match(homepage, /Start Your Custom Bag Project/);
  assert.match(homepage, /href=\"\/products\">Explore Product Collections/);
  assert.doesNotMatch(homepage, /id=\"secondary-collections\"|id=\"product-expansion\"|id=\"alcantara-entry\"/);
});

test("homepage preserves the three distinct Padel destinations from PR B", async () => {
  const source = await readFile(new URL("../app/static-site.js", import.meta.url), "utf8");
  assert.match(source, /href=\"\/racket-sports\/padel-bags\">Explore Padel Bags<\/a>/);
  assert.match(source, /href=\"\/custom-padel-bag-manufacturer\">Padel Bag Manufacturer<\/a>/);
  assert.match(source, /href=\"\/custom-tennis-padel-racket-bags\">Compare Racquet Sports Bags<\/a>/);
});

test("Cappuccino RFQ requires email while treating WhatsApp as optional", async () => {
  const inquiry = await readFile(new URL("../public/site/inquiry/index.html", import.meta.url), "utf8");
  assert.match(inquiry, /<span>Email <strong>\*<\/strong><\/span><input name=\"email\"[^>]* required>/);
  assert.match(inquiry, /<span>WhatsApp \(optional\)<\/span><input name=\"phone\"[^>]*pattern=\"\^\\\+\?\[0-9\\s\(\)\.\-\]\{7,20\}\$\">/);
  assert.doesNotMatch(inquiry, /<span>WhatsApp \(optional\)<\/span><input name=\"phone\"[^>]* required/);
});

test("synthetic Cappuccino payload succeeds without phone or WhatsApp", () => {
  const payload = mapSharedInquiryPayload("cappuccino", {
    submission_id: TEST_SUBMISSION_ID,
    name: "Synthetic Buyer",
    email: "synthetic@example.invalid",
    product_needed: "Travel Bags",
  });

  assert.equal(payload.email, "synthetic@example.invalid");
  assert.equal(payload.phone, null);
  assert.equal(payload.whatsapp, null);
  assert.equal(payload.product_category, "Travel Bags");
});

test("client keeps optional-number validation and tracks success only after an OK response", async () => {
  const client = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  assert.match(client, /const emptyRequired = field\.required && !value/);
  assert.match(client, /const invalidPattern = value && !field\.checkValidity\(\)/);
  const responseCheck = client.indexOf('if \(!response\.ok\) throw new Error\("Inquiry endpoint failed\."\);');
  const successEvent = client.indexOf('trackLeadSuccess(\n          "rfq"');
  assert.ok(responseCheck >= 0);
  assert.ok(successEvent > responseCheck);
});
