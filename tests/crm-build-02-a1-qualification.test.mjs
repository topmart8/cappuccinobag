import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  HUNTER_QUALIFICATION_PROFILES,
  getHunterQualificationProfile,
} from "../lib/crm/hunter-qualification-profiles.js";
import {
  QUALIFICATION_FACT_STATUSES,
  QUALIFICATION_INPUT_SOURCES,
  normalizeImageQualificationResult,
  qualifySalesOpportunity,
  recommendNextQualificationQuestion,
} from "../lib/crm/qualification.js";
import { recommendFollowUp } from "../lib/crm/follow-up.js";
import { evaluateLeadScoreShadow, scoreLead } from "../lib/crm/scoring.js";
import { validateRequirementConfirmationGate } from "../lib/crm/sales-policy.js";

const fact = (value, source = "manual_crm_entry", confidence = 1, evidence = ["human verified"]) => ({
  value,
  status: "FACT",
  source,
  confidence,
  evidence,
});

const inferred = (value, confidence = 0.7) => ({
  value,
  status: "INFERRED",
  source: "conversation_summary",
  confidence,
  evidence: ["model inference"],
});

function decisionFacts(overrides = {}) {
  return {
    product_family: fact("RACKET_SPORTS"),
    product_category: fact("Padel Bag"),
    estimated_quantity: fact(1200),
    company_name: fact("Verified Buyer Ltd"),
    customer_type: fact("brand"),
    brand_status: fact("established brand"),
    sales_channel_present: fact(true),
    OEM_or_ODM: fact("OEM"),
    target_market: fact("Germany"),
    development_stage: fact("development"),
    timeline: fact("Q4 launch decision"),
    buying_intent: fact("sample development"),
    ...overrides,
  };
}

test("qualification contract supports only FACT, INFERRED and UNKNOWN across approved sources", () => {
  assert.deepEqual(QUALIFICATION_FACT_STATUSES, ["FACT", "INFERRED", "UNKNOWN"]);
  assert.deepEqual(QUALIFICATION_INPUT_SOURCES, [
    "website_inquiry", "alibaba_inquiry", "manual_crm_entry",
    "email_derived_structured_facts", "future_whatsapp_adapter",
    "image_analysis_result", "conversation_summary",
  ]);
});

test("A: known facts are not asked again and only one next question is selected", () => {
  const result = qualifySalesOpportunity({ facts: decisionFacts() });
  assert.notEqual(result.next_question.missing_fact, "estimated_quantity");
  assert.equal(result.next_question.missing_fact, "racket_type");
  assert.equal(typeof result.next_question.next_question, "string");
  assert.equal(result.next_question.approval_level, "DRAFT_HUMAN_APPROVAL");
});

test("B: unknown and untyped values remain UNKNOWN", () => {
  const result = qualifySalesOpportunity({
    facts: {
      company_name: { value: "UNKNOWN", status: "UNKNOWN" },
      target_market: "United States",
    },
  });
  assert.equal(result.facts.company_name.status, "UNKNOWN");
  assert.equal(result.facts.company_name.value, "UNKNOWN");
  assert.equal(result.facts.target_market.status, "UNKNOWN");
  assert.equal(result.facts.target_market.value, "UNKNOWN");
});

test("C: inferred data is preserved as INFERRED and never promoted to FACT", () => {
  const result = qualifySalesOpportunity({
    facts: { company_name: inferred("Likely Brand Group", 0.8) },
  });
  assert.equal(result.facts.company_name.status, "INFERRED");
  assert.equal(result.facts.company_name.confidence, 0.8);
  assert.equal(result.customer_priority.evidence.some((item) => item.value === "Likely Brand Group"), false);
});

test("D: image result maps product as inferred without making a capability commitment", () => {
  const image = normalizeImageQualificationResult({
    likely_category: "padel bag",
    visible_features: ["separate shoe compartment", "backpack straps"],
    likely_materials: ["polyester-like woven fabric"],
    compartments: ["racket compartment"],
    customization_points: ["front logo area"],
    uncertainty: "Material composition cannot be confirmed from the image.",
    confidence: 0.82,
  });
  assert.equal(image.certainty, "INFERRED");
  assert.equal(image.product_mapping.canonical_family, "RACKET_SPORTS");
  assert.equal(image.product_mapping.status, "INFERRED_MAPPING");
  assert.equal(image.inferred_facts.shoe_compartment.status, "INFERRED");
  assert.equal(image.capability_commitment, false);

  const result = qualifySalesOpportunity({ source_type: "image_analysis_result", image_analysis: {
    likely_category: "padel bag",
    visible_features: ["separate shoe compartment", "backpack straps"],
    confidence: 0.82,
  } });
  assert.equal(result.next_question.missing_fact, "estimated_quantity");
  assert.doesNotMatch(result.next_question.next_question, /can make|yes/i);
  assert.equal(result.script_plan.draft, null, "image inference alone cannot ground a customer script");
});

test("E: quantity changes the qualification recommendation without changing scoreLead", () => {
  const low = qualifySalesOpportunity({ facts: decisionFacts({ estimated_quantity: fact(50) }) });
  const high = qualifySalesOpportunity({ facts: decisionFacts({ estimated_quantity: fact(10000) }) });
  assert.ok(high.qualification.qualification_score > low.qualification.qualification_score);
  assert.equal(high.operational_lead_score.final, low.operational_lead_score.final);
  assert.equal(high.qualification.operational_source_of_truth, "scoreLead");
});

test("F: first-order quantity alone does not create a strategic tier", () => {
  const result = qualifySalesOpportunity({
    facts: { estimated_quantity: fact(10000) },
  });
  assert.ok(!["S", "A_PLUS"].includes(result.customer_priority.recommended_tier));
  assert.equal(result.customer_priority.strategic_account, false);
  assert.equal(result.customer_priority.million_dollar_potential, false);
});

test("G: verified strong brand and channel evidence raises strategic recommendation", () => {
  const result = qualifySalesOpportunity({ facts: decisionFacts({
    brand_status: fact("Global major brand"),
    sales_channel_present: fact(true),
  }) });
  assert.equal(result.customer_priority.recommended_tier, "A_PLUS");
  assert.equal(result.customer_priority.strategic_account, true);
  assert.equal(result.human_handoff.handoff_required, true);
});

test("H: low quantity plus strong strategic evidence does not automatically become D", () => {
  const result = qualifySalesOpportunity({ facts: decisionFacts({
    estimated_quantity: fact(50),
    low_quantity_signal: fact(true),
    strategic_account_signal: fact(true),
  }) });
  assert.equal(result.customer_priority.recommended_tier, "A_PLUS");
  assert.notEqual(result.customer_priority.recommended_tier, "D");
});

test("I: price-only, low-evidence personal demand is downgraded", () => {
  const result = qualifySalesOpportunity({ facts: {
    customer_type: fact("personal purchase"),
    product_family: fact("RACKET_SPORTS"),
    product_category: fact("Padel Bag"),
    estimated_quantity: fact(1),
    price_only_signal: fact(true),
    low_quantity_signal: fact(true),
  } });
  assert.equal(result.customer_priority.recommended_tier, "D");
  assert.equal(result.qualification.qualification_band, "WEAK");
  assert.ok(result.qualification.component_scores.risk_adjustment < 0);
});

test("J: S and A_PLUS recommendations require human handoff", () => {
  const sResult = qualifySalesOpportunity({ facts: decisionFacts({
    million_dollar_potential_signal: fact(true),
    annual_purchase_potential: fact("1m"),
  }) });
  assert.equal(sResult.customer_priority.recommended_tier, "S");
  assert.equal(sResult.human_handoff.handoff_required, true);
  assert.match(sResult.human_handoff.handoff_reason.join(" "), /S account|Million-dollar/);

  const aPlus = qualifySalesOpportunity({ facts: decisionFacts({ strategic_account_signal: fact(true) }) });
  assert.equal(aPlus.customer_priority.recommended_tier, "A_PLUS");
  assert.equal(aPlus.human_handoff.handoff_required, true);
});

test("K: high-value low-confidence evidence triggers human review", () => {
  const result = qualifySalesOpportunity({ facts: {
    million_dollar_potential_signal: inferred(true, 0.9),
    annual_purchase_potential: inferred("1m", 0.8),
  } });
  assert.equal(result.customer_priority.million_dollar_potential, false, "inference is not promoted into tier truth");
  assert.equal(result.human_handoff.handoff_required, true);
  assert.match(result.human_handoff.handoff_reason.join(" "), /low confidence/i);
});

test("L: product-specific next-question selection works across all product families", () => {
  const cases = [
    ["RACKET_SPORTS", "racket_type"],
    ["TEAM_SPORTS", "bat_capacity"],
    ["LEATHER", "leather_type"],
    ["TRAVEL", "use_case"],
  ];
  for (const [family, expectedField] of cases) {
    const result = qualifySalesOpportunity({ facts: decisionFacts({
      product_family: fact(family),
      product_category: { value: "UNKNOWN", status: "UNKNOWN" },
    }) });
    assert.equal(result.product_mapping.canonical_family, family);
    assert.equal(result.next_question.missing_fact, expectedField);
  }
});

test("M: existing scoreLead and score_override remain authoritative and input is not mutated", () => {
  const lead = {
    customer_id: "customer-existing",
    country: "Germany",
    email: "buyer@example.com",
    product_category: "Padel Bag",
    quantity: "500",
    source: "website",
    score_override: 61,
  };
  const before = structuredClone(lead);
  const expected = scoreLead(lead);
  const result = qualifySalesOpportunity({ lead, facts: decisionFacts() });
  assert.deepEqual(lead, before);
  assert.deepEqual(result.operational_lead_score, expected);
  assert.equal(result.operational_lead_score.final, 61);
  assert.equal(result.shadow_score.operational_source_of_truth, "existing_score");
});

test("N: existing shadow score implementation is reused unchanged", () => {
  const lead = { country: "Germany", product_category: "Padel Bag", score_override: 55 };
  const result = qualifySalesOpportunity({ lead, facts: decisionFacts() });
  assert.deepEqual(
    result.shadow_score,
    evaluateLeadScoreShadow(lead, { priority: result.customer_priority }),
  );
  assert.equal(result.shadow_score.mode, "shadow_only");
});

test("O: P0 Requirement Confirmation Gate remains authoritative", () => {
  const result = qualifySalesOpportunity({
    facts: decisionFacts(),
    current_stage: "replied",
    target_stage: "quoted",
  });
  const existing = validateRequirementConfirmationGate({ current_stage: "replied", target_stage: "quoted" });
  assert.deepEqual(result.requirement_gate, existing);
  assert.equal(result.requirement_gate.allowed, false);
});

test("P: existing Follow-up recommendation is reused and remains task-only", () => {
  const result = qualifySalesOpportunity({ facts: decisionFacts(), reference_time: "2026-08-27T00:00:00.000Z" });
  const existing = recommendFollowUp({
    scenario: "NEW_INQUIRY",
    playbook_family: "PAD",
    customer_tier: result.customer_priority.recommended_tier,
    strategic_value: result.customer_priority.strategic_value,
    sales_stage: "new",
    trigger_at: "2026-08-27T00:00:00.000Z",
  });
  assert.deepEqual(result.follow_up, existing);
  assert.equal(result.follow_up.task_system, "tasks");
  assert.equal(result.follow_up.mode, "recommendation_only");
});

test("Q: qualification modules have no outbound, persistence, route or environment dependency", async () => {
  const source = await readFile(new URL("../lib/crm/qualification.js", import.meta.url), "utf8");
  const profiles = await readFile(new URL("../lib/crm/hunter-qualification-profiles.js", import.meta.url), "utf8");
  for (const moduleSource of [source, profiles]) {
    assert.doesNotMatch(moduleSource, /fetch\s*\(|sendCloudMessage|sendEmail|resend\s*\(|supabase(Request|From)?|process\.env|follow_up_tasks|NextResponse|NextRequest/);
  }
  const result = qualifySalesOpportunity({ facts: decisionFacts() });
  assert.equal(result.safety.outbound, "disabled");
  assert.equal(result.safety.persistence, "none");
  assert.equal(result.safety.production_write, false);
  assert.equal(result.integration_targets.tasks, "recommendation_target_only");
});

test("R: Hunter profiles are shared-engine configuration, not separate systems", () => {
  assert.deepEqual(Object.keys(HUNTER_QUALIFICATION_PROFILES), ["HUNTER_01", "PADEL_02", "ECO_03", "HOTEL_04"]);
  for (const [id, profile] of Object.entries(HUNTER_QUALIFICATION_PROFILES)) {
    assert.equal(getHunterQualificationProfile(id), profile);
    assert.equal(profile.mode, "qualification_profile_only");
    assert.ok(profile.shared_components.includes("qualification_engine"));
    assert.ok(profile.shared_components.includes("crm"));
    assert.ok(profile.shared_components.includes("tasks"));
    assert.ok(profile.shared_components.includes("company_policy"));
  }
  const result = qualifySalesOpportunity({ hunter_profile_id: "PADEL_02", facts: decisionFacts() });
  assert.equal(result.hunter_profile.profile_id, "PADEL_02");
  assert.equal(result.contract_version, "BUILD_02_A1_V1");
});

test("S: customer IDs, source, UTM and Alibaba references remain read-only and untouched", () => {
  const input = {
    customer_id: "customer-123",
    inquiry_id: "inquiry-456",
    source: "alibaba",
    source_type: "alibaba_inquiry",
    lead: {
      customer_id: "customer-123",
      inquiry_id: "inquiry-456",
      source: "alibaba",
      utm_source: "partner",
      utm_campaign: "fall-2026",
      alibaba_reference: "ALI-RFQ-789",
    },
    facts: decisionFacts(),
  };
  const before = structuredClone(input);
  const result = qualifySalesOpportunity(input);
  assert.deepEqual(input, before);
  assert.deepEqual(result.source_context, {
    customer_id: "customer-123",
    inquiry_id: "inquiry-456",
    source: "alibaba",
    utm_source: "partner",
    utm_campaign: "fall-2026",
    alibaba_reference: "ALI-RFQ-789",
    mode: "read_only_passthrough",
  });
});

test("Company Policy outranks qualification, playbook and script recommendations", () => {
  const result = qualifySalesOpportunity({
    facts: decisionFacts(),
    policy_context: { major_discount: true },
  });
  assert.equal(result.script_plan.status, "BLOCKED_BY_COMPANY_POLICY");
  assert.equal(result.script_plan.draft, null);
  assert.equal(result.next_best_action.action, "ESCALATE_HUMAN_APPROVAL");
  assert.equal(result.next_best_action.approval_level, "HUMAN_ONLY");
  assert.equal(result.human_handoff.handoff_required, true);
});

test("scripts use confirmed facts only and do not invent commercial commitments", () => {
  const result = qualifySalesOpportunity({ facts: decisionFacts({
    company_name: inferred("Unverified Company Name"),
    material_interest: { value: "UNKNOWN", status: "UNKNOWN" },
  }) });
  assert.equal(result.script_plan.status, "DRAFT_ONLY");
  assert.doesNotMatch(result.script_plan.draft, /Unverified Company Name/);
  assert.doesNotMatch(result.script_plan.draft, /\$|guaranteed|we can make|approved price|confirmed MOQ|DDP included/i);
  assert.equal(result.script_plan.approval_level, "DRAFT_HUMAN_APPROVAL");
});

test("human tier override remains authoritative while policy-level high-value review remains visible", () => {
  const result = qualifySalesOpportunity({
    facts: decisionFacts({ million_dollar_potential_signal: fact(true) }),
    human_override: { customer_tier: "B", strategic_value: "STANDARD" },
  });
  assert.equal(result.customer_priority.recommended_tier, "B");
  assert.equal(result.customer_priority.strategic_value, "STANDARD");
  assert.equal(result.human_handoff.handoff_required, true);
});

test("next-question helper never asks a known image-derived structure again", () => {
  const result = qualifySalesOpportunity({
    image_analysis: {
      likely_category: "padel bag",
      visible_features: ["shoe compartment", "backpack straps"],
      confidence: 0.9,
    },
    facts: decisionFacts({
      product_family: { value: "UNKNOWN", status: "UNKNOWN" },
      product_category: { value: "UNKNOWN", status: "UNKNOWN" },
      racket_type: fact("padel"),
      racket_capacity: fact(2),
    }),
  });
  const direct = recommendNextQualificationQuestion({
    facts: result.facts,
    productMapping: result.product_mapping,
  });
  assert.notEqual(direct.missing_fact, "shoe_compartment");
  assert.notEqual(direct.missing_fact, "backpack_straps");
  assert.equal(direct.missing_fact, "ball_tube_or_bottle");
});
