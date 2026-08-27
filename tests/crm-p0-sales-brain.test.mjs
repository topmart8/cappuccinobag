import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildCustomerIntelligenceRecommendation } from "../lib/crm/customer-intelligence.js";
import { recommendNextBestAction } from "../lib/crm/next-best-action.js";
import { mapProductTaxonomy } from "../lib/crm/product-taxonomy.js";
import {
  buildRequirementConfirmationActivity,
  findExistingRequirementConfirmation,
  latestRequirementConfirmation,
  mapCanonicalStage,
  normalizeRequirementConfirmationContext,
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

test("P0.1 explicit opportunity identifier wins over the inquiry fallback", () => {
  const inquiryId = "11111111-1111-4111-8111-111111111111";
  const context = normalizeRequirementConfirmationContext({
    requirement_version: "  REQ-2026-001\0\n ",
    inquiry_id: ` ${inquiryId} `,
    opportunity_id: "  OPP-EXPLICIT\0  ",
    product_category: "  Travel\0 Bags  ",
  });
  assert.deepEqual(context, {
    requirement_version: "REQ-2026-001",
    inquiry_id: inquiryId,
    opportunity_id: "OPP-EXPLICIT",
    product_family: "Travel Bags",
  });
});

test("P0.1 inquiry identifier remains an allowed opportunity fallback", () => {
  const inquiryId = "11111111-1111-4111-8111-111111111111";
  const context = normalizeRequirementConfirmationContext({
    requirement_version: "REQ-2026-001",
    inquiry_id: inquiryId,
    product_family: "Travel Bags",
  });
  assert.equal(context.opportunity_id, inquiryId);
  const activity = buildRequirementConfirmationActivity({
    customer_id: "customer-1",
    site: "cappuccinobag",
    requirement_version: context.requirement_version,
    inquiry_id: context.inquiry_id,
    product_family: context.product_family,
    confirmed_by: "sales@example.com",
  });
  assert.equal(activity.inquiry_id, inquiryId);
  assert.equal(activity.metadata.opportunity_id, inquiryId);
  assert.equal(activity.metadata.product_family, "Travel Bags");
  assert.equal(activity.metadata.confirmation_source, "human_crm");
});

test("P0.1 missing opportunity and inquiry context remains customer-level compatible", () => {
  const context = normalizeRequirementConfirmationContext({ requirement_version: "REQ-2026-001" });
  assert.equal(context.opportunity_id, null);
  assert.equal(context.inquiry_id, null);
  const activity = buildRequirementConfirmationActivity({
    customer_id: "customer-1",
    site: "cappuccinobag",
    requirement_version: context.requirement_version,
    confirmed_by: "sales@example.com",
  });
  assert.equal("inquiry_id" in activity, false);
  assert.equal(activity.metadata.opportunity_id, null);
});

test("P0.1 confirmation lookup is idempotent by customer query, version and optional opportunity", () => {
  const existing = buildRequirementConfirmationActivity({
    customer_id: "customer-1",
    site: "cappuccinobag",
    requirement_version: "REQ-2026-001",
    opportunity_id: "OPP-001",
    confirmed_by: "sales@example.com",
  });
  const activities = [{ id: "activity-1", created_at: "2026-08-23T00:00:00.000Z", ...existing }];

  assert.equal(findExistingRequirementConfirmation([], existing.metadata), null, "A: first confirmation can create");
  assert.equal(
    findExistingRequirementConfirmation(activities, existing.metadata)?.id,
    "activity-1",
    "B: same version and opportunity reuses the original activity",
  );
  assert.equal(
    findExistingRequirementConfirmation(activities, {
      requirement_version: "REQ-2026-002",
      opportunity_id: "OPP-001",
    }),
    null,
    "C: a different requirement version can create a new confirmation",
  );
  assert.equal(
    findExistingRequirementConfirmation(activities, {
      requirement_version: "REQ-2026-001",
      opportunity_id: "OPP-002",
    }),
    null,
    "E: a different opportunity cannot reuse another opportunity confirmation",
  );
});

test("P0.1 historical customer-level confirmations remain compatible", () => {
  const historical = {
    id: "historical-activity",
    activity_type: "requirement_confirmed",
    metadata: {
      requirement_confirmed: true,
      requirement_version: "REQ-HISTORICAL",
      confirmed_by: "sales@example.com",
      confirmed_at: "2026-08-01T00:00:00.000Z",
      confirmation_source: "human_crm",
    },
  };
  assert.equal(
    findExistingRequirementConfirmation([historical], { requirement_version: "REQ-HISTORICAL" })?.id,
    "historical-activity",
    "D: historical confirmation remains valid at customer level",
  );
  assert.equal(
    latestRequirementConfirmation([historical], { opportunity_id: "OPP-NEW" })?.id,
    "historical-activity",
    "an opportunity-aware gate may safely fall back to a context-free historical confirmation",
  );
});

test("P0.1 opportunity-aware gate never accepts another opportunity confirmation", () => {
  const otherOpportunity = buildRequirementConfirmationActivity({
    customer_id: "customer-1",
    site: "cappuccinobag",
    requirement_version: "REQ-2026-001",
    opportunity_id: "OPP-OTHER",
    confirmed_by: "sales@example.com",
  });
  assert.equal(
    latestRequirementConfirmation([otherOpportunity], { opportunity_id: "OPP-TARGET" }),
    null,
  );
  assert.equal(validateRequirementConfirmationGate({
    current_stage: "replied",
    target_stage: "quoted",
    confirmation: latestRequirementConfirmation([otherOpportunity], { opportunity_id: "OPP-TARGET" }),
  }).allowed, false);
});

test("historical quoted records are not retroactively blocked", () => {
  const result = validateRequirementConfirmationGate({ current_stage: "quoted", target_stage: "quoted" });
  assert.equal(result.allowed, true);
});

test("P0 playbook families and six approved scenarios remain compatible", () => {
  assert.deepEqual(PLAYBOOK_FAMILIES, ["PAD", "BASE", "LEAW", "MEN_TRAVEL"]);
  const p0Scenarios = [
    "NEED_DISCOVERY", "REQUIREMENT_CONFIRMATION", "QUOTATION", "SAMPLE", "NEGOTIATION", "PI_PAYMENT",
  ];
  assert.ok(p0Scenarios.every((scenario) => PLAYBOOK_SCENARIOS.includes(scenario)));
  assert.ok(p0Scenarios.every((scenario) => SALES_PLAYBOOKS.some((item) => item.playbook_id === `PAD-${scenario}`)));
  assert.ok(SALES_PLAYBOOKS.every((item) => item.do_not_do.some((rule) => /outbound communication automatically/i.test(rule))));
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
  assert.match(route, /findExistingRequirementConfirmation/);
  assert.match(route, /reused: true/);
  assert.match(route, /idempotent: true/);
  assert.match(route, /confirmed_by: actor\.user/);
  assert.doesNotMatch(route, /confirmed_by: input\./);
  assert.doesNotMatch(sharedIngest, /customer-intelligence|product-taxonomy|next-best-action|sales-playbooks/);
  if (identity) assert.doesNotMatch(identity, /customer_tier|canonical_type|playbook_id/);
});
