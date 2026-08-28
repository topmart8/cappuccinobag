import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveCustomerOutboundPolicy } from "../lib/crm/outbound-safety.js";
import {
  buildWhatsAppQualificationInput,
  isCanonicalCappuccinoWhatsAppInquiry,
  qualifyWhatsAppInquiry,
} from "../lib/crm/whatsapp-qualification-adapter.js";

function inquiry(overrides = {}) {
  return {
    id: "inquiry-02-c",
    customer_id: "customer-02-c",
    inquiry_number: "CAP-WA-0001",
    site: "cappuccinobag",
    source: "whatsapp",
    source_channel: "whatsapp",
    stage: "new",
    owner: "sales@example.com",
    whatsapp: "+491234567890",
    ...overrides,
  };
}

function inbound(body, overrides = {}) {
  return {
    id: `message-${Math.random()}`,
    direction: "inbound",
    body,
    created_at: "2026-08-28T08:00:00.000Z",
    ...overrides,
  };
}

test("BUILD 02-C selects only the canonical Cappuccino WhatsApp inquiry", () => {
  assert.equal(isCanonicalCappuccinoWhatsAppInquiry(inquiry()), true);
  assert.equal(isCanonicalCappuccinoWhatsAppInquiry({ site: "cappuccinobag", source_channel: "website" }), false);
  assert.equal(isCanonicalCappuccinoWhatsAppInquiry({ site: "novlane", source_channel: "whatsapp" }), false);
  assert.throws(
    () => buildWhatsAppQualificationInput({ inquiry: { site: "novlane", source_channel: "whatsapp" } }),
    /only the canonical Cappuccino WhatsApp inquiry path/,
  );
});

test("TEST 01 direct product and quantity are confirmed while target market stays UNKNOWN", () => {
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry(),
    customer: { id: "customer-02-c" },
    messages: [inbound("We need 500 custom padel bags.")],
  }).qualification;
  assert.equal(result.facts.product.value, "Padel Bag");
  assert.equal(result.facts.product.state, "CUSTOMER_CONFIRMED");
  assert.equal(result.facts.quantity.value, "500");
  assert.equal(result.facts.quantity.state, "CUSTOMER_CONFIRMED");
  assert.equal(result.facts.target_market.state, "UNKNOWN");
  assert.equal(typeof result.next_question.next_question, "string");
  assert.equal(result.next_question.mode, "recommendation_only");
});

test("TEST 02 CRM country and company remain context-only requirements", () => {
  const input = buildWhatsAppQualificationInput({
    inquiry: inquiry({ product_category: "Padel Bags" }),
    customer: { id: "customer-02-c", country: "Germany", company: "CRM GmbH" },
    messages: [inbound("Need 300 tennis bags.")],
  });
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry({ product_category: "Padel Bags" }),
    customer: input.customer,
    messages: [inbound("Need 300 tennis bags.")],
  }).qualification;
  assert.equal(input.customer.country, "Germany");
  assert.equal(input.customer.company, "CRM GmbH");
  assert.equal(input.facts.target_market, undefined);
  assert.equal(input.facts.company_name, undefined);
  assert.equal(input.facts.product.value, "Tennis Bag");
  assert.equal(result.facts.target_market.state, "UNKNOWN");
  assert.equal(result.facts.company_name.state, "UNKNOWN");
});

test("TEST 03 an explicit customer selling-market statement confirms target market", () => {
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry(),
    messages: [inbound("We sell mainly in the UK.")],
  }).qualification;
  assert.equal(result.facts.target_market.value, "United Kingdom");
  assert.equal(result.facts.target_market.state, "CUSTOMER_CONFIRMED");
});

test("TEST 04 customer target price is evidence, never a quotation", () => {
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry(),
    messages: [inbound("Target price is around USD 18.")],
  }).qualification;
  assert.equal(result.facts.budget_or_target_price.value, "USD 18");
  assert.equal(result.facts.budget_or_target_price.state, "CUSTOMER_CONFIRMED");
  assert.equal(result.human_handoff.handoff_required, true);
  assert.doesNotMatch(result.script_plan.draft || "", /approved|quotation|we can offer|final price/i);
});

test("TEST 05 conflicting quantities remain CONFLICTED and require human handoff", () => {
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry(),
    messages: [
      inbound("We need 500 custom padel bags.", { id: "message-old" }),
      inbound("We now need 1000 custom padel bags.", { id: "message-new" }),
    ],
  }).qualification;
  assert.equal(result.qualification_topics.quantity.state, "CONFLICTED");
  assert.equal(result.next_question.missing_fact, "quantity");
  assert.equal(result.next_question.approval_level, "HUMAN_ONLY");
  assert.equal(result.human_handoff.handoff_required, true);
});

test("TEST 06 outbound messages are ignored and exactly one next question is recommended", () => {
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry(),
    messages: [
      inbound("We need 500 custom padel bags."),
      { id: "outbound-1", direction: "outbound", body: "Target market: Germany" },
    ],
  }).qualification;
  assert.equal(result.facts.target_market.state, "UNKNOWN");
  assert.equal(typeof result.next_question.next_question, "string");
  assert.equal(Array.isArray(result.next_question), false);
});

test("TEST 07 score override stays authoritative and shadow score stays shadow-only", () => {
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry(),
    customer: { id: "customer-02-c", score_override: 81 },
    messages: [inbound("We need 500 custom padel bags.")],
  }).qualification;
  assert.equal(result.operational_lead_score.final, 81);
  assert.equal(result.shadow_score.mode, "shadow_only");
  assert.equal(result.shadow_score.operational_source_of_truth, "existing_score");
});

test("TEST 08 historical safe_auto remains non-executable", () => {
  assert.deepEqual(resolveCustomerOutboundPolicy("safe_auto"), {
    configured_mode: "safe_auto",
    effective_mode: "draft_only",
    historical_safe_auto: true,
    unattended_send_allowed: false,
  });
});

test("TEST 09 adapter has no sender, persistence, task write, environment access or media intelligence", async () => {
  const source = await readFile(new URL("../lib/crm/whatsapp-qualification-adapter.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /sendCloudMessage|supabaseRequest|\bfetch\s*\(|process\.env|follow_up_tasks/);
  assert.doesNotMatch(source, /method:\s*["'](?:POST|PATCH|PUT|DELETE)["']/);
  const result = qualifyWhatsAppInquiry({ inquiry: inquiry(), messages: [inbound("Need a padel bag.")] });
  assert.equal(result.safety.outbound, "disabled");
  assert.equal(result.safety.persistence, "none");
  assert.equal(result.safety.task_persistence, "blocked");
  assert.equal(result.safety.media_qualification, "deferred");
});

test("TEST 10 CRM integration is read-only and preserves manual human-approved send", async () => {
  const page = await readFile(new URL("../app/crm/inquiries/[id]/page.js", import.meta.url), "utf8");
  const whatsapp = await readFile(new URL("../lib/crm/whatsapp.js", import.meta.url), "utf8");
  const manualRoute = await readFile(new URL("../app/api/crm/inquiries/[id]/route.js", import.meta.url), "utf8");
  assert.match(page, /qualifyWhatsAppInquiry\(\{ inquiry, customer: inquiry\.customers \|\| \{\}, messages \}\)/);
  assert.match(page, /只读计算 · 不发送消息 · 不创建任务/);
  assert.match(whatsapp, /requireHumanApprovedOutbound\(approvalContext\)/);
  assert.match(manualRoute, /sendCloudMessage\(phone, draft, \{ humanApproved: true \}\)/);
});

test("direct material, dimensions, logo, timeline, compliance and sample statements remain grounded", () => {
  const result = qualifyWhatsAppInquiry({
    inquiry: inquiry(),
    messages: [inbound(
      "We need recycled polyester, 55 x 30 x 25 cm, with our logo. Need them by October. REACH required and we need a sample.",
    )],
  }).qualification;
  assert.equal(result.facts.material.value, "Recycled polyester");
  assert.equal(result.facts.dimensions_specification.value, "55 x 30 x 25 cm");
  assert.equal(result.facts.logo_customization.value, "Required");
  assert.equal(result.facts.timeline.value, "October");
  assert.equal(result.facts.compliance.value, "REACH");
  assert.equal(result.facts.sample_requirement.value, "Required");
});
