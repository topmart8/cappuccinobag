import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  DAILY_BRIEF_LIFECYCLE_AVAILABILITY,
  DAILY_BRIEF_SAFETY,
  evaluateDealHealth,
  generateDailySalesBrief,
} from "../lib/crm/daily-brief.js";
import { qualifyWebsiteInquiry } from "../lib/crm/website-qualification-adapter.js";

const NOW = "2026-08-28T09:00:00.000Z";

function customer(id, overrides = {}) {
  return {
    id,
    site: "cappuccinobag",
    company: `Company ${id}`,
    name: `Buyer ${id}`,
    country: "Germany",
    email: `${id}@example.com`,
    stage: "new",
    source: "website",
    score_override: null,
    product_keywords: ["Padel Bag"],
    created_at: "2026-08-01T09:00:00.000Z",
    updated_at: "2026-08-27T09:00:00.000Z",
    is_demo: false,
    ...overrides,
  };
}

function inquiry(id, customerId, overrides = {}) {
  return {
    id,
    customer_id: customerId,
    site: "cappuccinobag",
    source: "website",
    source_channel: "website",
    product: "Padel Bag",
    product_category: "Padel Bag",
    quantity: "300",
    stage: "new",
    reply_status: "unreplied",
    created_at: "2026-08-27T09:00:00.000Z",
    updated_at: "2026-08-27T09:00:00.000Z",
    is_demo: false,
    ...overrides,
  };
}

function build(records = {}) {
  return generateDailySalesBrief({
    customers: records.customers || [],
    inquiries: records.inquiries || [],
    activities: records.activities || [],
    tasks: records.tasks || [],
    messages: records.messages || [],
    reference_time: NOW,
  });
}

test("TEST 01 active customer beats a stale high-score lead", () => {
  const active = customer("active", { score_override: 42 });
  const stale = customer("stale", { score_override: 96, updated_at: "2026-05-01T00:00:00.000Z" });
  const brief = build({
    customers: [stale, active],
    inquiries: [
      inquiry("active-inquiry", active.id),
      inquiry("stale-inquiry", stale.id, { created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-01T00:00:00.000Z" }),
    ],
  });
  assert.equal(brief.priority_customers[0].customer_id, "active");
  assert.equal(brief.priority_customers.some((item) => item.customer_id === "stale"), false);
  assert.equal(brief.reactivation_opportunities[0].customer_id, "stale");
});

test("TEST 02 high Lead Score is not automatically number one", () => {
  const brief = build({
    customers: [
      customer("high", { score_override: 100, updated_at: "2026-05-01T00:00:00.000Z" }),
      customer("today", { score_override: 35 }),
    ],
    inquiries: [
      inquiry("high-i", "high", { created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-01T00:00:00.000Z" }),
      inquiry("today-i", "today"),
    ],
  });
  assert.equal(brief.priority_customers[0].customer_id, "today");
  assert.equal(brief.priority_customers.some((item) => item.customer_id === "high"), false);
  assert.equal(brief.reactivation_opportunities[0].customer_id, "high");
});

test("TEST 03 overdue canonical task increases today's priority", () => {
  const brief = build({
    customers: [customer("due", { score_override: 30 }), customer("plain", { score_override: 60 })],
    inquiries: [inquiry("due-i", "due"), inquiry("plain-i", "plain")],
    tasks: [{
      id: "task-overdue", customer_id: "due", inquiry_id: "due-i", title: "Human follow-up",
      status: "open", priority: "high", due_at: "2026-08-27T09:00:00.000Z",
    }],
  });
  assert.equal(brief.priority_customers[0].customer_id, "due");
  assert.equal(brief.followups_due[0].task_system, "tasks");
  assert.equal(brief.followups_due[0].write_enabled, false);
});

test("TEST 04 qualification conflict produces attention and human handoff", () => {
  const waInquiry = inquiry("wa-i", "wa", { source: "whatsapp", source_channel: "whatsapp", message: null });
  const brief = build({
    customers: [customer("wa", { whatsapp_phone: "+491234567890" })],
    inquiries: [waInquiry],
    messages: [
      { id: "m1", inquiry_id: "wa-i", direction: "inbound", body: "We need 500 padel bags.", created_at: "2026-08-27T08:00:00.000Z" },
      { id: "m2", inquiry_id: "wa-i", direction: "inbound", body: "We now need 1000 padel bags.", created_at: "2026-08-27T09:00:00.000Z" },
    ],
  });
  assert.deepEqual(brief.qualification_attention[0].conflicts, ["quantity"]);
  assert.equal(brief.qualification_attention[0].handoff.handoff_required, true);
  assert.equal(brief.qualification_attention[0].handoff.mode, "recommendation_only");
});

test("TEST 05 unsupported lifecycle data stays NOT_AVAILABLE", () => {
  const brief = build({ customers: [customer("life")], inquiries: [inquiry("life-i", "life")] });
  assert.deepEqual(brief.lifecycle_availability, DAILY_BRIEF_LIFECYCLE_AVAILABILITY);
  assert.deepEqual(brief.priority_customers[0].lifecycle, {
    quote: "NOT_AVAILABLE", sample: "NOT_AVAILABLE", order: "NOT_AVAILABLE",
    payment: "NOT_AVAILABLE", repeat_order: "NOT_AVAILABLE",
  });
});

test("TEST 06 Deal Health differs from Lead Score", () => {
  const health = evaluateDealHealth({
    reference_time: NOW,
    last_activity_at: "2026-05-01T00:00:00.000Z",
    stage: "new",
    qualification_gaps: ["timeline"],
  });
  assert.equal(health.state, "AT_RISK");
  assert.ok(health.reasons.length > 0);
  assert.equal(health.closing_probability, "NOT_AVAILABLE");
  assert.notEqual(health.state, 100);
});

test("TEST 07 brief makes no closing-probability claim", () => {
  const brief = build({ customers: [customer("prob", { score_override: 88 })], inquiries: [inquiry("prob-i", "prob")] });
  assert.doesNotMatch(JSON.stringify(brief), /\d+% chance to close|closing probability|close probability/i);
  assert.equal(brief.priority_customers[0].deal_health.closing_probability, "NOT_AVAILABLE");
});

test("TEST 08 reactivation candidate is conservative", () => {
  const brief = build({
    customers: [customer("dormant", { score_override: 82, updated_at: "2026-05-01T00:00:00.000Z" })],
    inquiries: [inquiry("dormant-i", "dormant", { created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-01T00:00:00.000Z" })],
  });
  assert.equal(brief.reactivation_opportunities.length, 1);
  assert.equal(brief.reactivation_opportunities[0].classification, "REACTIVATION_CANDIDATE");
  assert.equal(brief.reactivation_opportunities[0].next_best_action.execution, "HUMAN_ONLY");
});

test("TEST 09 no repeat-order claim exists without canonical order data", () => {
  const brief = build({
    customers: [customer("repeat", { score_override: 80, updated_at: "2026-05-01T00:00:00.000Z" })],
    inquiries: [inquiry("repeat-i", "repeat", { created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-01T00:00:00.000Z" })],
  });
  assert.equal(brief.reactivation_opportunities[0].repeat_order_status, "NOT_AVAILABLE");
  assert.doesNotMatch(brief.reactivation_opportunities[0].why_reactivate, /repeat buyer|reorder due|repeat.order opportunity/i);
});

test("TEST 10 no automatic outbound is enabled", () => {
  assert.deepEqual(DAILY_BRIEF_SAFETY, {
    mode: "DERIVED_RUNTIME_ONLY", persistence: "none", task_write: "disabled",
    email_auto_send: 0, whatsapp_auto_send: 0, website_auto_reply: 0, safe_auto: "HARD_DISABLED",
  });
  const brief = build({ customers: [customer("safe")], inquiries: [inquiry("safe-i", "safe")] });
  assert.equal(brief.today_top_actions[0].automatic_execution, false);
  assert.equal(brief.priority_customers[0].next_best_action.execution, "HUMAN_ONLY");
});

test("TEST 11 no task persistence is performed", async () => {
  const source = await readFile(new URL("../lib/crm/daily-brief.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /follow_up_tasks/);
  assert.doesNotMatch(source, /method:\s*["'](?:POST|PATCH|PUT|DELETE)["']/);
  const brief = build({ customers: [customer("task")], inquiries: [inquiry("task-i", "task")] });
  assert.equal(brief.safety.task_write, "disabled");
});

test("TEST 12 no new schema or persistence contract is introduced", async () => {
  const source = await readFile(new URL("../lib/crm/daily-brief.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /create\s+table|alter\s+table|daily_brief\?|deal_health\?|priority\?/i);
  assert.equal(DAILY_BRIEF_SAFETY.persistence, "none");
});

test("TEST 13 fewer than ten valid candidates returns fewer than ten", () => {
  const brief = build({ customers: [customer("only")], inquiries: [inquiry("only-i", "only")] });
  assert.equal(brief.priority_customers.length, 1);
});

test("TEST 14 existing NBA output is reused", () => {
  const lead = customer("nba");
  const request = inquiry("nba-i", "nba");
  const existing = qualifyWebsiteInquiry({ customer: lead, inquiry: request }).qualification.next_best_action;
  const brief = build({ customers: [lead], inquiries: [request] });
  assert.equal(brief.priority_customers[0].next_best_action.action, existing.action);
  assert.equal(brief.priority_customers[0].next_best_action.why, existing.reason);
});

test("TEST 15 existing Script Planner remains DRAFT_ONLY", () => {
  const brief = build({ customers: [customer("script")], inquiries: [inquiry("script-i", "script")] });
  assert.equal(brief.priority_customers[0].script_mode, "DRAFT_ONLY");
  assert.equal(typeof brief.priority_customers[0].recommended_draft, "string");
  assert.equal(brief.priority_customers[0].next_best_action.human_required, true);
});

test("BUSINESS F weak stale cold lead is excluded instead of filling Top 10", () => {
  const brief = build({
    customers: [customer("weak", {
      country: null,
      email: null,
      product_keywords: [],
      updated_at: "2026-05-01T00:00:00.000Z",
    })],
    inquiries: [inquiry("weak-i", "weak", {
      product: null,
      product_category: "Other",
      quantity: null,
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    })],
  });
  assert.equal(brief.priority_customers.length, 0);
  assert.equal(brief.reactivation_opportunities.length, 0);
});

test("BUSINESS G four actionable opportunities return four, not ten", () => {
  const customers = Array.from({ length: 4 }, (_, index) => customer(`valid-${index}`));
  const inquiries = customers.map((item, index) => inquiry(`valid-i-${index}`, item.id));
  const brief = build({ customers, inquiries });
  assert.equal(brief.priority_customers.length, 4);
  assert.equal(brief.today_top_actions.length, 4);
});

test("TODAY TOP ACTIONS are prioritized independently from customer rank", () => {
  const brief = build({
    customers: [
      customer("rank-first", { score_override: 100 }),
      customer("human-first", {
        score_override: 5,
        customer_tier: "S",
        updated_at: "2026-08-05T09:00:00.000Z",
      }),
    ],
    inquiries: [
      inquiry("rank-first-i", "rank-first"),
      inquiry("human-first-i", "human-first", {
        created_at: "2026-08-05T09:00:00.000Z",
        updated_at: "2026-08-05T09:00:00.000Z",
      }),
    ],
  });
  assert.equal(brief.priority_customers[0].customer_id, "rank-first");
  assert.equal(brief.today_top_actions[0].customer_id, "human-first");
  assert.equal(brief.today_top_actions[0].customer_rank, 2);
});
