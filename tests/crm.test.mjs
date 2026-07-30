import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createAiDraft } from "../lib/crm/ai.js";
import { recognizeBrand, requiresHumanReview } from "../lib/crm/brand.js";
import { validMetaSignature } from "../lib/crm/metaSignature.js";
import { createInquiry, normalizePhone } from "../lib/crm/supabase.js";
import { processWhatsAppPayload, sendCloudMessage } from "../lib/crm/whatsapp.js";
import { mapImportRow, normalizeImportRow } from "../lib/crm/importer.js";
import { scoreLead } from "../lib/crm/scoring.js";
import { analyticsDateRange } from "../lib/analytics/config.js";
import { normalizeGscRows, normalizeGa4Rows } from "../lib/analytics/google.js";
import { mergeDaily } from "../lib/analytics/sync.js";
import { normalizeAnalyticsFilters, summarizeAnalytics } from "../lib/analytics/dashboard.js";

test("E.164 normalization and brand routing are deterministic", () => {
  assert.equal(normalizePhone("+86 (139) 2871-5568"), "+8613928715568");
  assert.equal(normalizePhone("123"), null);
  assert.equal(recognizeBrand("Hello Cappuccino Bag CAP-PDL").site, "cappuccinobag");
  assert.equal(recognizeBrand("Novlane tartan wallet NOV-TAR").site, "novlane");
});

test("commercial commitments and complaints always require a person", () => {
  for (const text of ["Please quote final price", "Send PI and bank account", "质量投诉和赔偿"]) {
    assert.equal(requiresHumanReview(text), true);
  }
});

test("rule fallback keeps brand knowledge and signatures isolated", async () => {
  const savedKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const cap = await createAiDraft({ site: "cappuccinobag", product_category: "Padel Bags", message: "Need OEM bag" });
  const nov = await createAiDraft({ site: "novlane", product_category: "Tartan Collection", message: "Need a handbag" });
  assert.match(cap.reply_body, /Cappuccino Bag Team/);
  assert.doesNotMatch(cap.reply_body, /Novlane Team/);
  assert.match(nov.reply_body, /Novlane Team/);
  assert.doesNotMatch(nov.reply_body, /Cappuccino Bag Team/);
  if (savedKey) process.env.OPENAI_API_KEY = savedKey;
});

test("OpenAI failure degrades safely to a reviewable rules draft", async () => {
  const originalFetch = global.fetch;
  process.env.OPENAI_API_KEY = "test-only";
  global.fetch = async () => new Response("unavailable", { status: 503 });
  const result = await createAiDraft({ site: "cappuccinobag", message: "Please send PI" });
  assert.equal(result.model, "rules-fallback");
  assert.equal(result.human_review_required, true);
  global.fetch = originalFetch;
  delete process.env.OPENAI_API_KEY;
});

test("Meta signature validation rejects altered payloads", () => {
  const raw = JSON.stringify({ object: "whatsapp_business_account" });
  const secret = "test-secret";
  const signature = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  assert.equal(validMetaSignature(raw, signature, secret), true);
  assert.equal(validMetaSignature(`${raw}x`, signature, secret), false);
});

test("duplicate webhook messages stop at the idempotency lookup", async () => {
  const originalFetch = global.fetch;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-role";
  let calls = 0;
  global.fetch = async (url) => {
    calls += 1;
    assert.match(String(url), /webhook_events/);
    return Response.json([{ id: "existing" }]);
  };
  const payload = { entry: [{ changes: [{ value: { messages: [{ id: "wamid.duplicate", from: "8613928715568", type: "text", text: { body: "Hello" } }] } }] }] };
  await processWhatsAppPayload(payload, JSON.stringify(payload));
  assert.equal(calls, 1);
  global.fetch = originalFetch;
});

test("same email keeps one master customer and separate brand inquiries", async () => {
  const originalFetch = global.fetch;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-role";
  const master = { id: "customer-1", email_normalized: "buyer@example.com", language: "en" };
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.includes("customers?select")) return Response.json([master]);
    if (target.includes("customers?id=")) return Response.json([master]);
    if (target.endsWith("/inquiries")) {
      const body = JSON.parse(options.body);
      return Response.json([{ id: `${body.site}-inquiry`, ...body }]);
    }
    throw new Error(`Unexpected mock request: ${target}`);
  };
  const cap = await createInquiry({ site: "cappuccinobag", brand: "Cappuccino Bag", email: "buyer@example.com" });
  const nov = await createInquiry({ site: "novlane", brand: "Novlane", email: "buyer@example.com" });
  assert.equal(cap.inquiry.customer_id, nov.inquiry.customer_id);
  assert.notEqual(cap.inquiry.site, nov.inquiry.site);
  global.fetch = originalFetch;
});

test("WhatsApp API retries transient failure without real delivery", async () => {
  const originalFetch = global.fetch;
  process.env.WHATSAPP_ACCESS_TOKEN = "test-token";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "test-number";
  let calls = 0;
  global.fetch = async () => { calls += 1; return new Response("failed", { status: 500 }); };
  await assert.rejects(sendCloudMessage("+8613900000000", "mock message"));
  assert.equal(calls, 3);
  global.fetch = originalFetch;
  delete process.env.WHATSAPP_ACCESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
});

test("migration contains constrained brand numbering and all shared tables", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260728_unified_crm.sql", import.meta.url), "utf8");
  for (const table of ["customers", "inquiries", "conversations", "messages", "ai_reply_logs", "follow_up_tasks", "webhook_events", "attachments"]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
  }
  assert.match(sql, /CAP.*YYYY|prefix.*CAP/s);
  assert.match(sql, /lpad\(next_value::text, 4, '0'\)/);
});

test("lead scoring uses market, product, contacts, quantity, domain and trusted source", () => {
  const result = scoreLead({
    country: "United States",
    product_category: "Padel Bags",
    email: "buyer@example.com",
    phone: "+1 555 111 2222",
    whatsapp: "+1 555 111 2222",
    quantity: "1200 pcs",
    website: "https://buyer.example.com",
    source: "website",
  });
  assert.equal(result.automatic, 93);
  assert.equal(result.final, 93);
  assert.ok(result.reasons.length >= 5);
  assert.equal(scoreLead({ ...result, score_override: 61 }).final, 61);
});

test("CSV mapping normalizes fields and reports invalid rows before import", () => {
  const mapped = mapImportRow(
    { "Company Name": "Acme Sports", "Business Email": "BUYER@EXAMPLE.COM", Products: "padel bag;wallet" },
    { "Company Name": "company", "Business Email": "email", Products: "product_keywords" },
  );
  const valid = normalizeImportRow(mapped, { site: "cappuccinobag", owner: "sales@example.com", source: "csv" });
  assert.equal(valid.normalized.email, "buyer@example.com");
  assert.deepEqual(valid.normalized.product_keywords, ["padel bag", "wallet"]);
  assert.equal(valid.errors.length, 0);
  const phone = normalizeImportRow(
    { company: "Phone Co", whatsapp: "+1 (555) 111-2222" },
    { site: "cappuccinobag", owner: "sales@example.com" },
  );
  assert.equal(phone.normalized.whatsapp_phone, "+15551112222");
  const invalid = normalizeImportRow({ company: "No contact" }, { site: "novlane", owner: "sales@example.com" });
  assert.match(invalid.errors.join(" "), /至少填写一项/);
});

test("CRM v2 migration includes roles, import audit, tasks, drafts and private storage", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260730_lead_crm_v2.sql", import.meta.url), "utf8");
  for (const table of ["profiles", "activities", "tasks", "email_drafts", "whatsapp_drafts", "imports", "import_rows"]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
  }
  assert.match(sql, /role in \('admin','sales'\)/);
  assert.match(sql, /mode = 'draft_only'/);
  assert.match(sql, /crm attachment members read/);
  assert.match(sql, /customers_domain_idx/);
  assert.match(sql, /table_name \|\| '_updated_at'/);
});

test("CRM proxy injects trusted role headers for admin and sales accounts", async () => {
  const source = await readFile(new URL("../proxy.js", import.meta.url), "utf8");
  assert.match(source, /CRM_ADMIN_USER/);
  assert.match(source, /CRM_SALES_USER/);
  assert.match(source, /x-crm-role/);
  assert.match(source, /matcher: \["\/crm\/:path\*", "\/api\/crm\/:path\*"\]/);
});

test("analytics date ranges and filters use supported reporting windows", () => {
  const range = analyticsDateRange(28, 3, new Date("2026-07-30T12:00:00Z"));
  assert.deepEqual(range, { days: 28, startDate: "2026-06-30", endDate: "2026-07-27" });
  assert.deepEqual(normalizeAnalyticsFilters({ site: "novlane", days: "7" }), { site: "novlane", days: 7 });
  assert.deepEqual(normalizeAnalyticsFilters({ site: "invalid", days: "31" }), { site: "all", days: 28 });
});

test("GSC and GA4 responses normalize without leaking provider-specific shapes", () => {
  const gsc = normalizeGscRows([
    { keys: ["2026-07-01"], clicks: 4, impressions: 100, ctr: 0.04, position: 7.2 },
  ], ["date"]);
  assert.deepEqual(gsc[0], {
    date: "2026-07-01", clicks: 4, impressions: 100, ctr: 0.04, position: 7.2,
  });
  const ga4 = normalizeGa4Rows({
    dimensionHeaders: [{ name: "date" }],
    metricHeaders: [{ name: "sessions" }, { name: "activeUsers" }],
    rows: [{
      dimensionValues: [{ value: "20260701" }],
      metricValues: [{ value: "12" }, { value: "9" }],
    }],
  });
  assert.deepEqual(ga4[0], { date: "20260701", sessions: 12, activeUsers: 9 });
});

test("analytics daily merge and weighted summaries preserve metric definitions", () => {
  const rows = mergeDaily("cappuccinobag", [
    { date: "2026-07-01", clicks: 5, impressions: 100, ctr: 0.05, position: 4 },
    { date: "2026-07-02", clicks: 5, impressions: 300, ctr: 1 / 60, position: 8 },
  ], [
    { date: "2026-07-01", sessions: 20, active_users: 15, engaged_sessions: 10 },
    { date: "2026-07-02", sessions: 30, active_users: 22, engaged_sessions: 18 },
  ]);
  const summary = summarizeAnalytics(rows, [
    { site: "cappuccinobag" },
    { site: "cappuccinobag" },
  ]).total;
  assert.equal(summary.clicks, 10);
  assert.equal(summary.impressions, 400);
  assert.equal(summary.ctr, 0.025);
  assert.equal(summary.position, 7);
  assert.equal(summary.sessions, 50);
  assert.equal(summary.inquiries, 2);
  assert.equal(summary.conversion_rate, 0.04);
});

test("analytics migration includes indexed aggregates, sync audit and protected RLS", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260730_google_analytics.sql", import.meta.url), "utf8");
  for (const table of ["analytics_daily", "analytics_search_rows", "analytics_sync_runs"]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
  }
  assert.match(sql, /unique \(site, metric_date\)/);
  assert.match(sql, /analytics_daily_site_date_idx/);
  assert.match(sql, /analytics members read/);
  assert.match(sql, /analytics service role manages/);
});
