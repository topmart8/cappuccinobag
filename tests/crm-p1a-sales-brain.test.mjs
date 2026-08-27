import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  recommendCustomerPriority,
} from "../lib/crm/customer-intelligence.js";
import {
  FOLLOW_UP_SCENARIOS,
  FOLLOW_UP_TASK_TARGET,
  recommendFollowUp,
} from "../lib/crm/follow-up.js";
import { mapProductTaxonomy } from "../lib/crm/product-taxonomy.js";
import {
  PLAYBOOK_FAMILIES,
  PLAYBOOK_SCENARIOS,
  SALES_PLAYBOOKS,
  getSalesPlaybook,
} from "../lib/crm/sales-playbooks.js";
import { evaluateLeadScoreShadow, scoreLead } from "../lib/crm/scoring.js";
import {
  DECISION_PRIORITY,
  evaluateCompanyPolicy,
  evaluateConfidentialityUse,
  evaluateProductionSequence,
  evaluateValidatedPayment,
  validateRequirementConfirmationGate,
} from "../lib/crm/sales-policy.js";
import { planSalesScript } from "../lib/crm/script-library.js";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("P1A upgrades the one existing playbook registry to four families and sixteen scenarios", () => {
  assert.deepEqual(PLAYBOOK_FAMILIES, ["PAD", "BASE", "LEAW", "MEN_TRAVEL"]);
  assert.equal(PLAYBOOK_SCENARIOS.length, 16);
  assert.equal(SALES_PLAYBOOKS.length, 64);
  const required = [
    "objective", "entry_condition", "required_information", "recommended_actions",
    "recommended_script", "objection_handling", "do_not_do", "exit_condition",
    "next_stage", "approval_level", "version",
  ];
  assert.ok(SALES_PLAYBOOKS.every((playbook) => required.every((field) => field in playbook)));
  assert.ok(SALES_PLAYBOOKS.every((playbook) => playbook.recommended_script.version === "1.1.0"));
});

test("playbook selection keeps product families distinct without creating taxonomy records", () => {
  const cases = [
    ["PAD", "RACKET_SPORTS", "PADEL_BAG"],
    ["BASE", "TEAM_SPORTS", "BASEBALL_BAG"],
    ["LEAW", "LEATHER", "WOMENS_LEATHER_HANDBAG"],
    ["MEN_TRAVEL", "TRAVEL", "WEEKENDER"],
  ];
  for (const [family, canonicalFamily, product] of cases) {
    const playbook = getSalesPlaybook(family, "NEED_DISCOVERY");
    assert.equal(playbook.product_family, canonicalFamily);
    const mapping = mapProductTaxonomy({ product_category: product.replaceAll("_", " ") });
    assert.equal(mapping.canonical_family, canonicalFamily);
  }
});

test("customer priority recognizes evidence-backed strategic and million-dollar potential despite a small first order", () => {
  const result = recommendCustomerPriority({
    customer: { stage: "qualified" },
    signals: {
      million_dollar_potential: true,
      strategic_account: true,
      brand_level: "Global major brand",
      company_size: "Large group",
      annual_purchase_potential: "1m",
      product_family: "PAD",
      first_order_quantity: 50,
    },
    evidence: [
      { type: "buyer_plan", value: "Verified multi-market annual program", source: "human_crm" },
    ],
  });
  assert.equal(result.mode, "recommendation_only");
  assert.equal(result.recommended_tier, "S");
  assert.equal(result.strategic_value, "EXCEPTIONAL");
  assert.equal(result.million_dollar_potential, true);
  assert.equal(result.strategic_account, true);
  assert.match(result.reason, /Million-dollar potential/);
});

test("customer priority human override wins and unknown facts remain unknown", () => {
  const overridden = recommendCustomerPriority({
    signals: {
      million_dollar_potential: true,
      strategic_account: true,
      annual_purchase_potential: "1m",
      closing_urgency: "U1_NOW",
    },
    evidence: [{ value: "Verified account plan" }],
    human_override: {
      customer_tier: "B",
      strategic_value: "STANDARD",
      closing_urgency: "U3_DEVELOPING",
      million_dollar_potential: false,
      strategic_account: false,
    },
  });
  assert.equal(overridden.recommended_tier, "B");
  assert.equal(overridden.strategic_value, "STANDARD");
  assert.equal(overridden.closing_urgency, "U3_DEVELOPING");
  assert.equal(overridden.million_dollar_potential, false);
  assert.equal(overridden.strategic_account, false);

  const unknown = recommendCustomerPriority();
  assert.equal(unknown.recommended_tier, null);
  assert.equal(unknown.strategic_value, "UNKNOWN");
  assert.equal(unknown.closing_urgency, "UNKNOWN");
  assert.equal(unknown.brand_level, null);
  assert.equal(unknown.annual_purchase_potential, null);
  assert.match(unknown.reason, /Insufficient verified evidence/);
});

test("S and million-dollar recommendations require attached evidence", () => {
  const withoutEvidence = recommendCustomerPriority({
    signals: {
      customer_tier: "S",
      million_dollar_potential: true,
      strategic_account: true,
      annual_purchase_potential: "1m",
      product_family: "PAD",
    },
  });
  assert.notEqual(withoutEvidence.recommended_tier, "S");
  assert.match(withoutEvidence.reason, /capped until supporting evidence/i);

  const withEvidence = recommendCustomerPriority({
    signals: {
      million_dollar_potential: true,
      annual_purchase_potential: "1m",
      product_family: "PAD",
    },
    evidence: [{ type: "account_plan", value: "Verified annual sourcing plan", source: "human_crm" }],
  });
  assert.equal(withEvidence.recommended_tier, "S");
  assert.ok(withEvidence.confidence > 0);
});

test("shadow evaluation preserves existing scoreLead and score_override as operational truth", () => {
  const lead = {
    company: "Verified Buyer Group",
    country: "Germany",
    email: "buyer@example.com",
    website: "example.com",
    product_category: "Padel Bag",
    product_keywords: ["padel bag"],
    quantity: "50",
    annual_purchase_potential: "1m",
    stage: "qualified",
    score_override: 61,
  };
  const before = structuredClone(lead);
  const existing = scoreLead(lead);
  const shadow = evaluateLeadScoreShadow(lead, {
    priority: recommendCustomerPriority({
      signals: { million_dollar_potential: true, product_family: "PAD" },
      evidence: [{ value: "Verified annual program" }],
    }),
  });
  assert.deepEqual(lead, before);
  assert.equal(existing.final, 61);
  assert.equal(shadow.existing_score, existing.final);
  assert.equal(shadow.operational_source_of_truth, "existing_score");
  assert.equal(shadow.difference, shadow.shadow_score - existing.final);
  assert.equal(Object.keys(shadow.component_scores).length, 7);
  assert.equal("score" in shadow, false);
});

test("script planner uses verified facts, keeps unknown data open and does not fabricate commercial facts", () => {
  const result = planSalesScript({
    playbook_family: "PAD",
    scenario: "NEED_DISCOVERY",
    customer_name: "Alex",
    product_family: "Padel Bag",
    country_market: "Spain",
    buyer_state: "evaluating",
    conversation_history: [
      { verified: true, summary: "Buyer requested a custom padel bag concept" },
      { verified: false, summary: "Buyer has a hidden one-million-unit budget" },
    ],
    known_information: { target_market: "Spain" },
  });
  assert.equal(result.status, "DRAFT_ONLY");
  assert.match(result.draft, /Alex/);
  assert.match(result.draft, /Spain/);
  assert.match(result.draft, /custom padel bag concept/);
  assert.doesNotMatch(result.draft, /one-million-unit budget/);
  assert.ok(result.unknowns.includes("quantity"));
  assert.equal(result.unknown_information.find((item) => item.field === "quantity")?.value, "UNKNOWN");
  assert.equal(result.unknown_information.find((item) => item.field === "quantity")?.resolution, "ASK_CUSTOMER");
  assert.equal(result.unknown_information.find((item) => item.field === "material")?.resolution, "FACTORY_CONFIRMATION_REQUIRED");
  assert.equal(result.approval_level, "DRAFT_HUMAN_APPROVAL");
});

test("quotation script cannot bypass the unchanged P0 Requirement Confirmation Gate", () => {
  const blocked = planSalesScript({
    playbook_family: "PAD",
    scenario: "QUOTATION",
    sales_stage: "replied",
  });
  assert.equal(blocked.status, "BLOCKED_BY_REQUIREMENT_GATE");
  assert.equal(blocked.draft, null);
  assert.equal(blocked.approval_level, "HUMAN_ONLY");
});

test("all seven follow-up scenarios are recommendation-only and target existing tasks", () => {
  assert.equal(FOLLOW_UP_SCENARIOS.length, 7);
  assert.equal(FOLLOW_UP_TASK_TARGET, "tasks");
  for (const scenario of FOLLOW_UP_SCENARIOS) {
    const result = recommendFollowUp({
      scenario,
      playbook_family: "PAD",
      customer_tier: "A_PLUS",
      strategic_value: "HIGH",
      closing_urgency: "U2_ACTIVE",
      sales_stage: scenario === "QUOTATION_FOLLOW_UP" ? "replied" : "sample",
      next_follow_up: "2026-08-25T09:00:00.000Z",
      requirement_confirmation: scenario === "QUOTATION_FOLLOW_UP"
        ? { requirement_confirmed: true, requirement_version: "REQ-1" }
        : null,
    });
    for (const field of [
      "trigger", "reason", "customer_tier", "strategic_value", "closing_urgency",
      "sales_stage", "next_action", "recommended_script", "due_date", "approval_level",
    ]) assert.ok(field in result, `${scenario} is missing ${field}`);
    assert.equal(result.mode, "recommendation_only");
    assert.equal(result.task_system, "tasks");
    assert.ok(["DRAFT_HUMAN_APPROVAL", "HUMAN_ONLY"].includes(result.approval_level));
  }
});

test("follow-up policy exceptions are HUMAN_ONLY and the module has no outbound sender or parallel task system", async () => {
  const result = recommendFollowUp({
    scenario: "NEW_INQUIRY",
    playbook_family: "PAD",
    customer_tier: "S",
    strategic_account_commercial_commitment: true,
  });
  assert.equal(result.approval_level, "HUMAN_ONLY");
  const moduleSource = await source("lib/crm/follow-up.js");
  assert.doesNotMatch(moduleSource, /sendCloudMessage|resend\(|follow_up_tasks|fetch\(/);
  assert.match(moduleSource, /FOLLOW_UP_TASK_TARGET = "tasks"/);
});

test("follow-up cadence respects explicit customer timing and S/A_PLUS always remain human-reviewed", () => {
  const result = recommendFollowUp({
    scenario: "NEW_INQUIRY",
    playbook_family: "PAD",
    customer_tier: "S",
    trigger_at: "2026-08-24T00:00:00.000Z",
    customer_requested_follow_up_at: "2026-09-01T00:00:00.000Z",
  });
  assert.equal(result.due_window.earliest, "2026-08-25T00:00:00.000Z");
  assert.equal(result.due_window.latest, "2026-08-26T00:00:00.000Z");
  assert.equal(result.due_date, "2026-09-01T00:00:00.000Z");
  assert.ok(["DRAFT_HUMAN_APPROVAL", "HUMAN_ONLY"].includes(result.approval_level));
});

test("validated payment requires cleared bank, platform or Alibaba status", () => {
  const screenshot = evaluateValidatedPayment({
    payment_status: "received",
    payment_validation_source: "customer_screenshot",
  });
  assert.equal(screenshot.validated, false);
  assert.equal(screenshot.status, "PAYMENT_PENDING_VERIFICATION");

  const cleared = evaluateValidatedPayment({ platform_payment_status: "cleared" });
  assert.equal(cleared.validated, true);
  assert.equal(cleared.source, "platform");

  const followUp = recommendFollowUp({
    scenario: "PI_PAYMENT_FOLLOW_UP",
    playbook_family: "PAD",
    payment_status: "received",
    payment_validation_source: "customer_screenshot",
  });
  assert.equal(followUp.next_action, "VERIFY_PAYMENT_STATUS");
  assert.equal(followUp.payment_validation.status, "PAYMENT_PENDING_VERIFICATION");
});

test("production sequence cannot bypass requirement, PI, cleared deposit, authorization, QC or balance", () => {
  const base = {
    requested_action: "PRODUCTION",
    requirement_confirmation: { requirement_confirmed: true, requirement_version: "REQ-1" },
    pi_confirmed: true,
    deposit_platform_payment_status: "cleared",
  };
  assert.equal(evaluateProductionSequence(base).code, "PRODUCTION_AUTHORIZED_REQUIRED");
  assert.equal(evaluateProductionSequence({ ...base, production_authorized: true }).allowed, true);

  const shipment = evaluateProductionSequence({
    ...base,
    requested_action: "SHIPMENT",
    production_authorized: true,
    production_started: true,
    qc_passed: true,
    balance_bank_payment_status: "received",
    shipment_authorized: true,
  });
  assert.equal(shipment.allowed, true);

  const notCleared = evaluateProductionSequence({
    ...base,
    requested_action: "SHIPMENT",
    production_authorized: true,
    production_started: true,
    qc_passed: true,
    balance_payment_status: "received",
    balance_validation_source: "customer_screenshot",
    shipment_authorized: true,
  });
  assert.equal(notCleared.code, "BALANCE_VALIDATED_REQUIRED");
});

test("Company Policy outranks playbook and keeps DDP human-only after validation", () => {
  assert.deepEqual(DECISION_PRIORITY, [
    "COMPANY_POLICY", "RISK_RULE", "SALES_STAGE_RULE", "PLAYBOOK", "AI_RECOMMENDATION",
  ]);
  assert.equal(evaluateCompanyPolicy({ compliance_commitment: true }).approval_level, "HUMAN_ONLY");
  assert.equal(evaluateCompanyPolicy({ incoterm: "CIF" }).code, "UNSUPPORTED_INCOTERM");
  assert.equal(evaluateCompanyPolicy({ incoterm: "DDP" }).code, "DDP_LOGISTICS_VALIDATION_REQUIRED");
  const validatedDdp = evaluateCompanyPolicy({ incoterm: "DDP", logistics_validated: true });
  assert.equal(validatedDdp.allowed, false);
  assert.equal(validatedDdp.code, "DDP_HUMAN_APPROVAL_REQUIRED");
  assert.equal(validatedDdp.approval_level, "HUMAN_ONLY");

  const blocked = planSalesScript({
    playbook_family: "PAD",
    scenario: "NEGOTIATION",
    major_discount: true,
  });
  assert.equal(blocked.status, "BLOCKED_BY_COMPANY_POLICY");
  assert.equal(blocked.draft, null);
  assert.equal(blocked.approval_level, "HUMAN_ONLY");
});

test("NDA and confidential customer material cannot enter public content without approval or anonymization", () => {
  const blocked = evaluateConfidentialityUse({
    nda: true,
    technical_pack: true,
    public_geo_content: true,
  });
  assert.equal(blocked.public_content_eligible, false);
  assert.equal(blocked.requires_human_review, true);

  const script = planSalesScript({
    playbook_family: "PAD",
    scenario: "NEED_DISCOVERY",
    nda: true,
    public_case_study: true,
    conversation_history: [{ verified: true, confidential: true, summary: "Secret unreleased design" }],
  });
  assert.equal(script.status, "BLOCKED_BY_COMPANY_POLICY");
  assert.equal(script.draft, null);

  assert.equal(evaluateConfidentialityUse({
    prototype: true,
    public_case_study: true,
    anonymized: true,
  }).public_content_eligible, true);
  const anonymized = planSalesScript({
    playbook_family: "PAD",
    scenario: "NEED_DISCOVERY",
    customer_name: "Confidential Brand",
    prototype: true,
    public_case_study: true,
    anonymized: true,
    conversation_history: [{ verified: true, confidential: true, summary: "Secret unreleased design" }],
  });
  assert.equal(anonymized.status, "DRAFT_ONLY");
  assert.doesNotMatch(anonymized.draft, /Confidential Brand|Secret unreleased design/);
});

test("P0 Requirement Gate implementation and historical behavior remain unchanged", async () => {
  assert.equal(validateRequirementConfirmationGate({ current_stage: "replied", target_stage: "quoted" }).allowed, false);
  assert.equal(validateRequirementConfirmationGate({ current_stage: "quoted", target_stage: "quoted" }).allowed, true);
  const policySource = await source("lib/crm/sales-policy.js");
  assert.match(policySource, /mapping_version: "P0_V1"/);
});

test("P1A adds no migration, persistence or route-level script library", async () => {
  const [leadRoute, inquiryRoute] = await Promise.all([
    source("app/api/crm/leads/[id]/route.js"),
    source("app/api/crm/inquiries/[id]/route.js"),
  ]);
  assert.doesNotMatch(leadRoute, /script-library|recommendCustomerPriority|evaluateLeadScoreShadow|recommendFollowUp/);
  assert.doesNotMatch(inquiryRoute, /script-library|recommendCustomerPriority|evaluateLeadScoreShadow|recommendFollowUp/);
});
