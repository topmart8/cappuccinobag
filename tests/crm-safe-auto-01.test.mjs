import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CUSTOMER_OUTBOUND_DEFAULT_MODE,
  requireHumanApprovedOutbound,
  resolveCustomerOutboundPolicy,
} from "../lib/crm/outbound-safety.js";
import { processWhatsAppPayload, sendCloudMessage } from "../lib/crm/whatsapp.js";

test("customer outbound defaults to draft_only and never permits unattended sending", () => {
  assert.equal(CUSTOMER_OUTBOUND_DEFAULT_MODE, "draft_only");
  assert.deepEqual(resolveCustomerOutboundPolicy(), {
    configured_mode: "draft_only",
    effective_mode: "draft_only",
    historical_safe_auto: false,
    unattended_send_allowed: false,
  });
});

test("historical safe_auto remains readable but resolves to non-executable draft_only", () => {
  assert.deepEqual(resolveCustomerOutboundPolicy("safe_auto"), {
    configured_mode: "safe_auto",
    effective_mode: "draft_only",
    historical_safe_auto: true,
    unattended_send_allowed: false,
  });
});

test("CAP and NOV customer reply configuration defaults off and draft_only", async () => {
  const env = await readFile(new URL("../.env.example", import.meta.url), "utf8");
  for (const prefix of ["CAP", "NOV"]) {
    assert.match(env, new RegExp(`^${prefix}_INQUIRY_AUTO_REPLY_ENABLED=false$`, "m"));
    assert.match(env, new RegExp(`^${prefix}_INQUIRY_REPLY_MODE=draft_only$`, "m"));
    assert.match(env, new RegExp(`^${prefix}_WHATSAPP_REPLY_MODE=draft_only$`, "m"));
  }
});

test("customer delivery requires an explicit human approval context", async () => {
  assert.throws(() => requireHumanApprovedOutbound(), /Explicit human approval/);
  assert.doesNotThrow(() => requireHumanApprovedOutbound({ humanApproved: true }));

  const savedToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const savedPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_ACCESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  try {
    await assert.rejects(sendCloudMessage("+8613900000000", "blocked"), /Explicit human approval/);
    assert.equal(await sendCloudMessage("+8613900000000", "approved", { humanApproved: true }), false);
  } finally {
    if (savedToken === undefined) delete process.env.WHATSAPP_ACCESS_TOKEN;
    else process.env.WHATSAPP_ACCESS_TOKEN = savedToken;
    if (savedPhoneId === undefined) delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    else process.env.WHATSAPP_PHONE_NUMBER_ID = savedPhoneId;
  }
});

test("WhatsApp safe_auto env still creates a reviewable draft without customer outbound", async () => {
  const saved = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CAP_WHATSAPP_REPLY_MODE: process.env.CAP_WHATSAPP_REPLY_MODE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  };
  const originalFetch = global.fetch;
  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-role";
  process.env.CAP_WHATSAPP_REPLY_MODE = "safe_auto";
  process.env.WHATSAPP_ACCESS_TOKEN = "must-not-send";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "must-not-send";
  delete process.env.OPENAI_API_KEY;

  const writes = [];
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    assert.doesNotMatch(target, /graph\.facebook\.com/);
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;
    writes.push({ target, method, body });

    if (target.includes("webhook_events?") && method === "GET") return Response.json([]);
    if (target.includes("customers?select=")) {
      return Response.json([{
        id: "customer-1",
        site: "cappuccinobag",
        brand: "Cappuccino Bag",
        language: "en",
        whatsapp_phone: "+8613928715568",
        human_takeover: false,
        auto_reply_enabled: true,
      }]);
    }
    if (target.includes("customers?id=eq.customer-1") && method === "PATCH") {
      return Response.json([{ id: "customer-1", human_takeover: false, auto_reply_enabled: true, ...body }]);
    }
    if (target.includes("conversations?") && method === "GET") {
      return Response.json([{ id: "conversation-1", customer_id: "customer-1", site: "cappuccinobag" }]);
    }
    if (target.endsWith("/messages") && method === "POST") return Response.json([{ id: "message-1", ...body }]);
    if (target.includes("inquiries?") && method === "GET") {
      return Response.json([{
        id: "inquiry-1",
        customer_id: "customer-1",
        site: "cappuccinobag",
        brand: "Cappuccino Bag",
        product_category: "Padel Bags",
      }]);
    }
    return Response.json([]);
  };

  const payload = {
    entry: [{
      changes: [{
        value: {
          messages: [{
            id: "wamid.safe-auto-disabled",
            from: "8613928715568",
            type: "text",
            text: { body: "Need a Cappuccino padel bag" },
          }],
        },
      }],
    }],
  };

  try {
    await processWhatsAppPayload(payload, JSON.stringify(payload));
    const replyLog = writes.find(({ target, method }) => target.endsWith("/ai_reply_logs") && method === "POST");
    assert.ok(replyLog, "WhatsApp processing should persist a reviewable AI draft log");
    assert.equal(replyLog.body.mode, "draft_only");
    assert.equal(replyLog.body.status, "draft");
    assert.ok(replyLog.body.result.reply_body);
    assert.equal(writes.some(({ target }) => /graph\.facebook\.com/.test(target)), false);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("runtime paths contain no safe_auto automatic send branch and preserve manual approval", async () => {
  const shared = await readFile(new URL("../lib/crm/shared-ingest.js", import.meta.url), "utf8");
  const whatsapp = await readFile(new URL("../lib/crm/whatsapp.js", import.meta.url), "utf8");
  const manualRoute = await readFile(new URL("../app/api/crm/inquiries/[id]/route.js", import.meta.url), "utf8");
  assert.doesNotMatch(shared, /safeAuto|INQUIRY_AUTO_REPLY_ENABLED/);
  assert.doesNotMatch(whatsapp, /mode\s*===\s*["']safe_auto["']/);
  assert.doesNotMatch(whatsapp, /await sendCloudMessage\(phone, draft\.reply_body\)/);
  assert.match(manualRoute, /input\.action === "approve"/);
  assert.match(manualRoute, /sendCloudMessage\(phone, draft, \{ humanApproved: true \}\)/);
  assert.match(whatsapp, /human_takeover: true, auto_reply_enabled: false/);
});

test("historical schema remains unchanged and continues to accept safe_auto reads", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260728_unified_crm.sql", import.meta.url), "utf8");
  assert.match(sql, /mode in \('manual', 'draft_only', 'safe_auto'\)/);
});
