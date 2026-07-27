import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createAiDraft } from "../lib/crm/ai.js";
import { recognizeBrand, requiresHumanReview } from "../lib/crm/brand.js";
import { validMetaSignature } from "../lib/crm/metaSignature.js";
import { createInquiry, normalizePhone } from "../lib/crm/supabase.js";
import { processWhatsAppPayload, sendCloudMessage } from "../lib/crm/whatsapp.js";

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

