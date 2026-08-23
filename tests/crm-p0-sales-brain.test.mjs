import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildCustomerIntelligenceRecommendation } from "../lib/crm/customer-intelligence.js";
import { recommendNextBestAction } from "../lib/crm/next-best-action.js";
import { mapProductTaxonomy } from "../lib/crm/product-taxonomy.js";
import {
  buildRequirementConfirmationActivity,
  mapCanonicalStage,
  validateRequirementConfirmationGate,
} from "../lib/crm/sales-policy.js";
import {
  PLAYBOOK_FAMILIES,
  PLAYBOOK_SCENARIOS,
  SALES_PLAYBOOKS,
} from "../lib/crm/sales-playbooks.js";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("existing customers remain readable and customer intelligence is recommendation-only", () => {
  const customer = Object.freeze({ id: "customer-1", stage: "quoted", source: "website", score: 88 });
  const before = structuredClone(customer);
  const result = buildCustomerIntelligenceRecommendation({
    customer,
    recommendation: { customer_tier: "A", strategic_account: false },
    evidence: [{ type: "inquiry", value: "Repeat category interest", source: "crm" }],
    confidence: 0.72,
  });
  assert.deepEqual(customer, before);
  assert.equal(result.mode, "recommendation_only");
  assert.equal(result.effective.customer_tier, "A");
  assert.equal(result.source, "website");
});

test("human override always wins over AI customer intelligence recommendations", () => {
  const result = buildCustomerIntelligenceRecommendation({
    recommendation: {
      customer_tier: "B",
      strategic_account: false,
      million_dollar_potential: "unknown",
      company_size: "SMALL",
    },
    human_override: {
      customer_tier: "S",
      strategic_account: true,
      million_dollar_potential: true,
      company_size: "ENTERPRISE",
    },
  });
  assert.deepEqual(
    {
      tier: result.effective.customer_tier,
      strategic: result.effective.strategic_account,
      million: result.effective.million_dollar_potential,
      size: result.effective.company_size,
    },
    { tier: "S", strategic: true, million: true, size: "ENTERPRISE" },
  );
});

test("product taxonomy derives one primary mapping without changing existing data", () => {
  const input = {
    product: "Custom padel and travel duffel concept",
    product_category: "Existing Custom Bags",
    product_keywords: ["Padel", "Padel", "Travel"],
  };
  const before = structuredClone(input);
  const mapped = mapProductTaxonomy(input);
  assert.deepEqual(input, before);
  assert.equal(mapped.status, "MAPPED");
  assert.equal(mapped.canonical_family, "RACKET_SPORTS");
  assert.equal(mapped.canonical_type, "PADEL_BAG");
  assert.deepEqual(mapped.raw.product_keywords, ["Padel", "Travel"]);
  assert.equal(Array.isArray(mapped), false);
});

test("unmapped products continue to use their existing category", () => {
  const mapped = mapProductTaxonomy({ product: "Custom promotional set", product_category: "Legacy Promo" });
  assert.equal(mapped.status, "UNMAPPED");
  assert.equal(mapped.canonical_family, null);
  assert.equal(mapped.raw.product_category, "Legacy Promo");
});

test("canonical stage mapping preserves historical raw stages", () => {
  const stage = { value: "quoted" };
  const mapped = mapCanonicalStage(stage.value);
  assert.deepEqual(stage, { value: "quoted" });
  assert.deepEqual(mapped, { raw_stage: "quoted", canonical_stage: "QUOTATION", mapping_version: "P0_V1" });
});

test("requirement confirmation gate blocks premature quotation", () => {
  assert.deepEqual(
    validateRequirementConfirmationGate({ current_stage: "replied", target_stage: "quoted" }),
    {
      allowed: false,
      code: "REQUIREMENT_CONFIRMATION_REQUIRED",
      reason: "Requirement confirmation is required before quotation.",
    },
  );
  const activity = buildRequirementConfirmationActivity({
    customer_id: "customer-1",
    site: "cappuccinobag",
    owner: "sales@example.com",
    requirement_version: "REQ-2026-001",
    confirmed_by: "sales@example.com",
  });
  assert.equal(validateRequirementConfirmationGate({
    current_stage: "replied",
    target_stage: "quoted",
    confirmation: activity,
  }).allowed, true);
});

test("historical quoted records are not retroactively blocked", () => {
  const result = validateRequirementConfirmationGate({ current_stage: "quoted", target_stage: "quoted" });
  assert.equal(result.allowed, true);
});

test("P0 playbook registry contains only four families and six approved scenarios", () => {
  assert.deepEqual(PLAYBOOK_FAMILIES, ["PAD", "BASE", "LEAW", "MEN_TRAVEL"]);
  assert.deepEqual(PLAYBOOK_SCENARIOS, [
    "NEED_DISCOVERY", "REQUIREMENT_CONFIRMATION", "QUOTATION", "SAMPLE", "NEGOTIATION", "PI_PAYMENT",
  ]);
  assert.equal(SALES_PLAYBOOKS.length, 24);
  assert.ok(SALES_PLAYBOOKS.every((item) => item.version === "1.0.0"));
  assert.ok(SALES_PLAYBOOKS.every((item) => item.recommended_script === null));
});

test("company policy and risk rules outrank playbook and AI recommendations", () => {
  const policy = recommendNextBestAction({
    stage: "qualified",
    playbook_family: "PAD",
    do_not_prospect: true,
    ai_recommendation: "Send quotation now",
  });
  assert.equal(policy.action, "STOP_OUTREACH_AND_REVIEW");
  assert.equal(policy.approval_level, "HUMAN_ONLY");

  const commercial = recommendNextBestAction({
    stage: "negotiation",
    playbook_family: "PAD",
    major_discount: true,
    ai_recommendation: "Approve discount",
  });
  assert.equal(commercial.action, "ESCALATE_HUMAN_APPROVAL");
  assert.equal(commercial.approval_level, "HUMAN_ONLY");
});

test("NBA has the minimal output and cannot trigger outbound messaging", async () => {
  const result = recommendNextBestAction({
    stage: "replied",
    playbook_family: "PAD",
    owner: "sales@example.com",
    next_follow_up: "2026-08-24T09:00:00.000Z",
  });
  assert.deepEqual(Object.keys(result), ["action", "reason", "owner", "due_date", "approval_level"]);
  assert.equal(result.action, "CONFIRM_REQUIREMENT_VERSION");
  assert.equal(result.approval_level, "DRAFT_HUMAN_APPROVAL");
  const nbaSource = await source("lib/crm/next-best-action.js");
  assert.doesNotMatch(nbaSource, /\bfetch\s*\(|sendCloudMessage|sendEmail|\bresend\s*\(/);
});

test("lead update route enforces the gate without changing shared ingest or PR 11 contracts", async () => {
  const [route, sharedIngest, identity] = await Promise.all([
    source("app/api/crm/leads/[id]/route.js"),
    source("lib/crm/shared-ingest.js"),
    source("lib/crm/identity.js").catch((error) => {
      if (error?.code === "ENOENT") return null;
      throw error;
    }),
  ]);
  assert.match(route, /validateRequirementConfirmationGate/);
  assert.match(route, /activity_type=eq\.requirement_confirmed/);
  assert.match(route, /input\.action === "confirm_requirements"/);
  assert.doesNotMatch(sharedIngest, /customer-intelligence|product-taxonomy|next-best-action|sales-playbooks/);
  if (identity) assert.doesNotMatch(identity, /customer_tier|canonical_type|playbook_id/);
});
