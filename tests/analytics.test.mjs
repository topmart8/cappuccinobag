import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sanitizeUrl, submissionEventFor } from "../lib/analytics/client.js";

test("analytics URL sanitizer removes PII and preserves campaign attribution", () => {
  const value = sanitizeUrl(
    "https://www.cappuccinobag.com/inquiry/?utm_source=linkedin&email=buyer%40example.com&phone=123#form",
  );
  assert.equal(
    value,
    "https://www.cappuccinobag.com/inquiry/?utm_source=linkedin",
  );
});

test("form types map to stable GA4 conversion events", () => {
  assert.equal(submissionEventFor("rfq"), "rfq_submit");
  assert.equal(submissionEventFor("contact"), "contact_submit");
  assert.equal(submissionEventFor("product_inquiry"), "product_inquiry_submit");
  assert.equal(submissionEventFor("sample_request"), "sample_request_submit");
});

test("analytics source does not allow personal form fields in event parameters", async () => {
  const source = await readFile(new URL("../lib/analytics/client.js", import.meta.url), "utf8");
  for (const forbidden of ['"name"', '"email"', '"phone"', '"whatsapp"', '"message"']) {
    assert.doesNotMatch(
      source.match(/const ALLOWED_PARAMS[\s\S]*?\]\);/)?.[0] || "",
      new RegExp(forbidden),
    );
  }
});

test("a successful lead emits one deduplicated conversion event", async () => {
  const source = await readFile(
    new URL("../components/analytics/AnalyticsProvider.jsx", import.meta.url),
    "utf8",
  );
  const handler = source.match(/trackLeadSuccess\(formType, reference, params = \{\}\) \{[\s\S]*?\n      \}/)?.[0] || "";
  assert.match(handler, /submittedReferences\.has\(dedupeKey\)/);
  assert.match(handler, /submittedReferences\.add\(dedupeKey\)/);
  assert.equal((handler.match(/trackEvent\(/g) || []).length, 1);
  assert.doesNotMatch(handler, /generate_lead/);
  assert.match(handler, /submissionEventFor\(formType\)/);
});

test("lead attribution migration is additive and keeps first-touch columns", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/20260731_lead_attribution.sql", import.meta.url),
    "utf8",
  );
  assert.match(sql, /add column if not exists current_utm_source/);
  assert.doesNotMatch(sql, /\bdrop\s+(column|table)\b/i);
});
