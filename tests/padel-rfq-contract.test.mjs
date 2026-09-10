import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildPadelInquiryPayload,
  createSubmissionGuard,
  readInquiryAttribution,
} from "../lib/inquiry/client-contract.js";

function storage(values = {}) {
  return { getItem: (key) => values[key] ?? null };
}

test("Padel logical submissions lock rapid duplicates and retain one ID until success", () => {
  const ids = ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222"];
  const guard = createSubmissionGuard(() => ids.shift());

  const first = guard.begin();
  assert.equal(first, "11111111-1111-4111-8111-111111111111");
  assert.equal(guard.begin(), null);

  guard.finish({ success: false });
  assert.equal(guard.begin(), first);

  guard.finish({ success: true });
  assert.equal(guard.currentSubmissionId(), "");
  assert.equal(guard.begin(), "22222222-2222-4222-8222-222222222222");
});

test("Padel attribution preserves first/current touch and strips contact details from URLs", () => {
  const firstKey = "cappuccino_first_touch";
  const currentKey = "cappuccino_current_visit";
  const browser = {
    location: {
      href: "https://www.cappuccinobag.com/racket-sports/padel-bags?utm_source=linkedin&email=buyer@example.com",
    },
    document: { referrer: "https://www.google.com/search?q=padel" },
    navigator: { userAgent: "Mobile Safari" },
    localStorage: storage({
      [firstKey]: JSON.stringify({
        first_landing_page: "https://www.cappuccinobag.com/custom-padel-bag-manufacturer?utm_source=google",
        first_visit_time: "2026-08-28T01:00:00.000Z",
        referrer: "https://www.google.com/",
        utm_source: "google",
        utm_campaign: "padel-manufacturer",
      }),
      [currentKey]: JSON.stringify({ utm_source: "fallback" }),
    }),
    sessionStorage: storage({
      [currentKey]: JSON.stringify({
        referrer: "https://www.linkedin.com/",
        utm_source: "linkedin",
        utm_campaign: "padel-rfq",
      }),
    }),
  };

  const attribution = readInquiryAttribution(browser, () => new Date("2026-08-28T02:00:00.000Z"));
  assert.equal(attribution.utm_source, "google");
  assert.equal(attribution.current_utm_source, "linkedin");
  assert.equal(attribution.current_utm_campaign, "padel-rfq");
  assert.equal(attribution.device, "mobile");
  assert.equal(attribution.submit_time, "2026-08-28T02:00:00.000Z");
  assert.doesNotMatch(attribution.current_page_url, /buyer%40example\.com|buyer@example\.com/);
});

test("Padel payload maps canonical CRM fields and keeps project detail", () => {
  const payload = buildPadelInquiryPayload({
    name: "Buyer",
    email: "buyer@example.com",
    product_type: "Premium padel duffel",
    target_price_range: "EUR 28-32",
    bulk_delivery_deadline: "2026-12-15",
    target_market: "EU",
    reference_notes: "Two-colour range",
    shoe_compartment: "Yes",
    racket_sleeve_quantity: "2",
    sample_deadline: "2026-09-30",
  }, {
    first_landing_page: "https://www.cappuccinobag.com/custom-padel-bag-manufacturer",
    current_utm_source: "linkedin",
  }, "11111111-1111-4111-8111-111111111111");

  assert.equal(payload.product_category, "Padel Bags");
  assert.equal(payload.product, "Premium padel duffel");
  assert.equal(payload.target_price, "EUR 28-32");
  assert.equal(payload.target_delivery_date, "2026-12-15");
  assert.equal(payload.current_utm_source, "linkedin");
  assert.match(payload.message, /Reference \/ design notes: Two-colour range/);
});

test("Padel component keeps the guarded API and conversion contract", async () => {
  const source = await readFile(
    new URL("../app/racket-sports/padel-bags/PadelRfqForm.jsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /submissionGuard\.current\.begin\(\)/);
  assert.match(source, /if \(!submissionId\) return/);
  assert.match(source, /if \(!response\.ok\) throw new Error/);
  assert.match(source, /submissionGuard\.current\.finish\(\{ success: succeeded \}\)/);
  assert.match(source, /trackLeadSuccess\(\s*"rfq",\s*result\.inquiryNumber,\s*\{ product_category: "Padel Bags" \}/);
  assert.equal((source.match(/await fetch\(/g) || []).length, 1);

  const conversion = source.match(/trackLeadSuccess\([\s\S]*?\);/)?.[0] || "";
  for (const personalField of ["name", "email", "phone", "whatsapp", "message"]) {
    assert.doesNotMatch(conversion, new RegExp(`\\b${personalField}\\b`, "i"));
  }
});

test("general inquiry retry contract remains present and unchanged", async () => {
  const source = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
  assert.match(source, /form\.dataset\.submitting === "true"/);
  assert.match(source, /formData\.set\("submission_id", submissionIdFor\(form\)\)/);
  assert.match(source, /completeSubmission\(form\)/);
  assert.match(source, /trackLeadSuccess\(\s*"rfq",\s*result\.inquiryNumber/);
});
