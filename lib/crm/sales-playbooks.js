import { APPROVAL_LEVELS } from "./sales-policy.js";

export const PLAYBOOK_FAMILIES = Object.freeze(["PAD", "BASE", "LEAW", "MEN_TRAVEL"]);
export const PLAYBOOK_SCENARIOS = Object.freeze([
  "FIRST_CONTACT", "QUALIFICATION", "NEED_DISCOVERY", "REQUIREMENT_CONFIRMATION",
  "QUOTATION", "PRICE_OBJECTION", "MOQ_OBJECTION", "SAMPLE_FEE_OBJECTION",
  "SHIPPING_OBJECTION", "SAMPLE", "SAMPLE_FEEDBACK", "NEGOTIATION", "CLOSING",
  "PI_PAYMENT", "DELIVERY", "REPEAT_ORDER",
]);

const FAMILY_CONFIG = Object.freeze({
  PAD: {
    product_family: "RACKET_SPORTS",
    product_types: ["PADEL_BAG"],
    required_information: [
      "bag_format", "racket_capacity", "shoe_compartment", "material",
      "quantity", "branding", "target_market",
    ],
    discovery_prompt: "Confirm racket format, storage layout, material, branding and intended market.",
  },
  BASE: {
    product_family: "TEAM_SPORTS",
    product_types: ["BASEBALL_BAG"],
    required_information: [
      "player_or_team_use", "equipment_load", "bag_format", "material",
      "quantity", "team_branding", "target_market",
    ],
    discovery_prompt: "Confirm equipment load, team use, carry format, reinforcement and branding.",
  },
  LEAW: {
    product_family: "LEATHER",
    product_types: ["WOMENS_LEATHER_HANDBAG"],
    required_information: [
      "silhouette", "leather_type", "dimensions", "lining", "hardware",
      "color", "quantity", "branding",
    ],
    discovery_prompt: "Confirm silhouette, leather, construction, lining, hardware, color and positioning.",
  },
  MEN_TRAVEL: {
    product_family: "TRAVEL",
    product_types: ["MENS_BAG", "WEEKENDER", "DUFFEL", "TRAVEL_BACKPACK"],
    required_information: [
      "product_subtype", "use_case", "capacity", "dimensions", "material",
      "carry_system", "compartments", "quantity", "branding",
    ],
    discovery_prompt: "Confirm the exact subtype, use case, capacity, organization, carry system and branding.",
  },
});

function script(script_key, objective_prompt, next_step_prompt) {
  return Object.freeze({
    script_key,
    objective_prompt,
    next_step_prompt,
    personalization_fields: Object.freeze([
      "customer_tier", "product_family", "buyer_state", "country_market", "verified_history", "objection",
    ]),
    unknown_value_rule: "Keep unknown facts unknown and ask the customer or request factory confirmation.",
    version: "1.1.0",
  });
}

const SCENARIO_CONFIG = Object.freeze({
  FIRST_CONTACT: {
    sales_stage: "LEAD",
    objective: "Establish relevant, evidence-safe contact and one clear next question.",
    entry_condition: "A new identified lead or inquiry has no substantive sales reply.",
    required_information: ["buyer_identity", "company", "country_market", "product_interest"],
    recommended_actions: ["VERIFY_CONTACT_CONTEXT", "PREPARE_FIRST_CONTACT_DRAFT"],
    recommended_script: script("FIRST_CONTACT_V1", "Acknowledge the verified product context without assuming buyer facts.", "Ask one useful qualification question."),
    objection_handling: ["Acknowledge uncertainty and offer a low-effort way to clarify the project."],
    exit_condition: "The buyer engages, is moved to nurture, or is disqualified by a human.",
    next_stage: "QUALIFICATION",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  QUALIFICATION: {
    sales_stage: "QUALIFIED",
    objective: "Confirm buyer, company and project fit without fabricating missing firmographic data.",
    entry_condition: "First contact or an inbound brief exists, but qualification is incomplete.",
    required_information: ["buyer_role", "company_type", "project_status", "quantity_band", "decision_timing"],
    recommended_actions: ["VERIFY_BUYER_AND_PROJECT", "RECORD_QUALIFICATION_GAPS"],
    recommended_script: script("QUALIFICATION_V1", "Explain why a few project facts are needed.", "Ask for the smallest missing qualification facts."),
    objection_handling: ["Explain the purpose of qualification questions without judging lead quality."],
    exit_condition: "Minimum qualification facts are recorded or the lead is deferred by a human.",
    next_stage: "NEED_DISCOVERY",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  NEED_DISCOVERY: {
    sales_stage: "DISCOVERY",
    objective: "Collect the minimum verified product and commercial requirements.",
    entry_condition: "A qualified project does not yet have a complete requirement brief.",
    required_information: ["intended_use", "quantity", "branding", "target_market", "target_timing"],
    recommended_actions: ["REQUEST_MISSING_REQUIREMENTS"],
    recommended_script: script("NEED_DISCOVERY_V1", "Group the highest-value missing product questions.", "Ask the customer to confirm or mark unknown requirements."),
    objection_handling: ["Offer bounded choices when the buyer cannot specify a technical detail."],
    exit_condition: "Minimum product and commercial requirements are documented.",
    next_stage: "REQUIREMENT_CONFIRMATION",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  REQUIREMENT_CONFIRMATION: {
    sales_stage: "DISCOVERY",
    objective: "Obtain explicit human-recorded confirmation for a named requirement version.",
    entry_condition: "A named requirement version is ready for customer confirmation.",
    required_information: ["requirement_version", "product_scope", "quantity", "material", "branding", "unresolved_items"],
    recommended_actions: ["CONFIRM_REQUIREMENT_VERSION"],
    recommended_script: script("REQUIREMENT_CONFIRMATION_V1", "Summarize only verified requirements and unresolved items.", "Request explicit confirmation or corrections."),
    objection_handling: ["Record changes as a new version instead of silently changing a confirmed version."],
    exit_condition: "The existing P0 requirement confirmation is valid for the named version.",
    next_stage: "QUOTATION",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  QUOTATION: {
    sales_stage: "REQUIREMENT_CONFIRMED",
    objective: "Prepare a human-reviewed quotation only from confirmed requirements and approved policy.",
    entry_condition: "The unchanged P0 Requirement Confirmation Gate passes.",
    required_information: ["requirement_version", "approved_price_basis", "moq_policy", "payment_terms", "logistics_scope", "validity"],
    recommended_actions: ["PREPARE_QUOTATION_DRAFT", "REQUEST_HUMAN_QUOTATION_REVIEW"],
    recommended_script: script("QUOTATION_V1", "Summarize confirmed scope and clearly identify assumptions.", "Ask the buyer to review the approved quotation and open points."),
    objection_handling: ["Route price, MOQ, sample-fee and shipping objections to their approved scenarios."],
    exit_condition: "An approved quotation is recorded by the existing human process.",
    next_stage: "NEGOTIATION",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  PRICE_OBJECTION: {
    sales_stage: "NEGOTIATION",
    objective: "Diagnose the price gap and protect value within approved commercial policy.",
    entry_condition: "The buyer objects to a quotation price or requests a reduction.",
    required_information: ["quoted_scope", "quantity", "specification_drivers", "buyer_target_basis"],
    recommended_actions: ["DIAGNOSE_PRICE_GAP", "PREPARE_APPROVED_OPTIONS"],
    recommended_script: script("PRICE_OBJECTION_V1", "Acknowledge the concern and explain verified scope or cost drivers.", "Ask which approved scope or volume lever matters most."),
    objection_handling: ["Never grant or imply a major discount without human approval."],
    exit_condition: "The buyer selects an approved path or the exception is escalated.",
    next_stage: "NEGOTIATION",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  MOQ_OBJECTION: {
    sales_stage: "NEGOTIATION",
    objective: "Resolve a quantity mismatch without bypassing MOQ policy.",
    entry_condition: "The buyer requests a quantity below the approved MOQ.",
    required_information: ["requested_quantity", "approved_moq", "sku_split", "market_test_objective", "repeat_potential"],
    recommended_actions: ["EXPLAIN_MOQ_BASIS", "ESCALATE_MOQ_EXCEPTION"],
    recommended_script: script("MOQ_OBJECTION_V1", "Explain verified MOQ drivers and approved alternatives.", "Ask whether a compliant option meets the test objective."),
    objection_handling: ["Any MOQ exception remains HUMAN_ONLY."],
    exit_condition: "A compliant option is accepted or a human records the exception decision.",
    next_stage: "SAMPLE",
    approval_level: "HUMAN_ONLY",
  },
  SAMPLE_FEE_OBJECTION: {
    sales_stage: "SAMPLE",
    objective: "Explain sample economics using only approved fee and credit policy.",
    entry_condition: "The buyer challenges sample, tooling or courier fees.",
    required_information: ["sample_scope", "fee_components", "courier_scope", "approved_credit_policy"],
    recommended_actions: ["EXPLAIN_SAMPLE_FEE", "REVIEW_SAMPLE_OPTIONS"],
    recommended_script: script("SAMPLE_FEE_OBJECTION_V1", "Provide an evidence-based fee explanation.", "Ask which approved sample path the buyer wants reviewed."),
    objection_handling: ["Refunds, credits and compensation remain HUMAN_ONLY."],
    exit_condition: "An approved sample path is accepted or declined.",
    next_stage: "SAMPLE",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  SHIPPING_OBJECTION: {
    sales_stage: "NEGOTIATION",
    objective: "Clarify logistics scope without unvalidated freight, DDP or delivery commitments.",
    entry_condition: "The buyer questions freight, Incoterms, DDP or delivery timing.",
    required_information: ["destination", "shipment_scope", "carton_weight_volume", "incoterm", "logistics_validation"],
    recommended_actions: ["COLLECT_LOGISTICS_FACTS", "REQUEST_LOGISTICS_VALIDATION"],
    recommended_script: script("SHIPPING_OBJECTION_V1", "Separate product scope from logistics facts that still need validation.", "Request destination and shipment inputs for human logistics review."),
    objection_handling: ["DDP without logistics confirmation remains HUMAN_ONLY."],
    exit_condition: "A validated logistics basis is accepted or escalated.",
    next_stage: "NEGOTIATION",
    approval_level: "HUMAN_ONLY",
  },
  SAMPLE: {
    sales_stage: "SAMPLE",
    objective: "Control sample scope, approval evidence and the next checkpoint.",
    entry_condition: "An approved sample path and requirement version exist.",
    required_information: ["requirement_version", "sample_type", "material", "branding", "fee_status", "review_criteria"],
    recommended_actions: ["REVIEW_SAMPLE_REQUIREMENTS", "SET_SAMPLE_CHECKPOINT"],
    recommended_script: script("SAMPLE_V1", "Restate the verified sample purpose and review criteria.", "Confirm the next evidence or feedback checkpoint."),
    objection_handling: ["Do not treat sample creation or silence as bulk-production approval."],
    exit_condition: "The sample outcome or revision requirements are recorded.",
    next_stage: "SAMPLE_FEEDBACK",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  SAMPLE_FEEDBACK: {
    sales_stage: "SAMPLE",
    objective: "Convert verified sample feedback into approval, revision or a new requirement version.",
    entry_condition: "Sample delivery or buyer feedback is verified.",
    required_information: ["delivery_evidence", "reviewer", "feedback_items", "approval_or_revision"],
    recommended_actions: ["REQUEST_STRUCTURED_SAMPLE_FEEDBACK", "CLASSIFY_SAMPLE_CHANGES"],
    recommended_script: script("SAMPLE_FEEDBACK_V1", "Request structured feedback tied to the sample objective.", "Ask the buyer to identify approved and revision items."),
    objection_handling: ["A material scope change returns to requirement confirmation."],
    exit_condition: "Approval, revision brief or closure is recorded.",
    next_stage: "NEGOTIATION",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  NEGOTIATION: {
    sales_stage: "NEGOTIATION",
    objective: "Resolve open commercial terms inside approved policy.",
    entry_condition: "A valid quotation exists and commercial discussion is active.",
    required_information: ["open_terms", "decision_criteria", "stakeholders", "timing", "approved_concessions"],
    recommended_actions: ["REVIEW_NEGOTIATION_TERMS", "ESCALATE_POLICY_EXCEPTIONS"],
    recommended_script: script("NEGOTIATION_V1", "Recap verified agreed and open points.", "Propose one approved next decision."),
    objection_handling: ["No unauthorized discount, payment, MOQ or logistics commitment."],
    exit_condition: "Terms are approved, rejected or returned for requirement confirmation.",
    next_stage: "CLOSING",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  CLOSING: {
    sales_stage: "NEGOTIATION",
    objective: "Secure an explicit next commitment without manufacturing urgency.",
    entry_condition: "The buyer signals readiness and only bounded blockers remain.",
    required_information: ["final_scope", "decision_owner", "open_blockers", "pi_readiness"],
    recommended_actions: ["CONFIRM_CLOSING_CHECKLIST", "REQUEST_PI_AUTHORIZATION"],
    recommended_script: script("CLOSING_V1", "Recap the verified decision checklist.", "Ask for the next explicit buyer authorization."),
    objection_handling: ["Do not imply production reservation or guaranteed timing."],
    exit_condition: "The buyer authorizes PI preparation or a human records the blocker.",
    next_stage: "PI_PAYMENT",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  PI_PAYMENT: {
    sales_stage: "PI_PAYMENT",
    objective: "Verify approved PI and cleared bank, platform or Alibaba payment status before production authorization.",
    entry_condition: "The commercial package is approved and PI/payment action is requested.",
    required_information: ["approved_pi", "verified_bank_details", "payer", "amount", "payment_status", "production_authorization"],
    recommended_actions: ["VERIFY_PI_AND_CLEARED_PAYMENT", "REQUEST_PRODUCTION_AUTHORIZATION"],
    recommended_script: script("PI_PAYMENT_V1", "Reference only the approved PI and verified payment facts.", "Request human verification of the next payment step."),
    objection_handling: ["Screenshots, payment advice and verbal promises remain PAYMENT_PENDING_VERIFICATION; special terms and production exceptions are HUMAN_ONLY."],
    exit_condition: "Commercial terms/PI and required deposit are validated, then an authorized human records production authorization.",
    next_stage: "PRODUCTION_CONFIRMATION",
    approval_level: "HUMAN_ONLY",
  },
  DELIVERY: {
    sales_stage: "SHIPPING_DELIVERY",
    objective: "Coordinate evidence-based delivery communication.",
    entry_condition: "Production is authorized, QC has passed, required balance is validated, shipment is authorized and a verified milestone exists.",
    required_information: ["approved_schedule", "qc_status", "shipment_mode", "tracking_documents", "logistics_validation"],
    recommended_actions: ["REVIEW_DELIVERY_STATUS", "PREPARE_DELIVERY_UPDATE"],
    recommended_script: script("DELIVERY_V1", "Share only verified shipment or delivery status.", "Confirm the next evidence-based checkpoint."),
    objection_handling: ["Refund, compensation and unvalidated DDP commitments remain HUMAN_ONLY."],
    exit_condition: "Delivery is confirmed or an issue is escalated.",
    next_stage: "REPEAT_ORDER",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  REPEAT_ORDER: {
    sales_stage: "WON_REPEAT",
    objective: "Reopen a relevant opportunity using verified project history.",
    entry_condition: "Prior delivery is complete and a human-approved reminder window is due.",
    required_information: ["prior_product_scope", "delivery_outcome", "feedback", "reorder_timing", "changed_requirements"],
    recommended_actions: ["REVIEW_ACCOUNT_HISTORY", "PREPARE_REPEAT_ORDER_DRAFT"],
    recommended_script: script("REPEAT_ORDER_V1", "Reference only verified prior-project facts.", "Ask whether replenishment or changed requirements should enter discovery."),
    objection_handling: ["Do not assume a reorder or unchanged specification."],
    exit_condition: "A new need enters discovery or the reminder is deferred by a human.",
    next_stage: "NEED_DISCOVERY",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
});

const COMMON_DO_NOT_DO = Object.freeze([
  "Do not invent customer facts, quantity, budget, brand scale, price, MOQ, payment terms, production approval, logistics or delivery commitments.",
  "Do not send outbound communication automatically.",
  "Do not bypass the Requirement Confirmation Gate or self-confirm requirements.",
  "Do not treat screenshots, payment advice, verbal statements or promises as validated payment.",
  "Do not bypass Requirement Confirmed → PI Confirmed → Deposit Validated → Production Authorized → Production → QC Passed → Balance Validated → Shipment Authorized → Shipment.",
  "Do not commit DDP without logistics validation or unsupported Incoterms without human approval.",
  "Do not reuse NDA, technical-pack, design, artwork, prototype or confidential attachment content publicly without anonymization or explicit human approval.",
]);

export const SALES_PLAYBOOKS = Object.freeze(PLAYBOOK_FAMILIES.flatMap((family) => (
  PLAYBOOK_SCENARIOS.map((scenario) => {
    const familyConfig = FAMILY_CONFIG[family];
    const scenarioConfig = SCENARIO_CONFIG[scenario];
    return Object.freeze({
      playbook_id: `${family}-${scenario}`,
      playbook_family: family,
      product_family: familyConfig.product_family,
      product_types: Object.freeze([...familyConfig.product_types]),
      sales_stage: scenarioConfig.sales_stage,
      scenario,
      objective: scenarioConfig.objective,
      entry_condition: scenarioConfig.entry_condition,
      required_information: Object.freeze([
        ...new Set([...familyConfig.required_information, ...scenarioConfig.required_information]),
      ]),
      recommended_actions: Object.freeze([...scenarioConfig.recommended_actions]),
      recommended_script: scenarioConfig.recommended_script,
      objection_handling: Object.freeze([...scenarioConfig.objection_handling]),
      do_not_do: COMMON_DO_NOT_DO,
      exit_condition: scenarioConfig.exit_condition,
      next_stage: scenarioConfig.next_stage,
      approval_level: APPROVAL_LEVELS.includes(scenarioConfig.approval_level)
        ? scenarioConfig.approval_level
        : "HUMAN_ONLY",
      family_discovery_prompt: familyConfig.discovery_prompt,
      version: "1.2.0",
    });
  })
)));

export function getSalesPlaybook(family, scenario) {
  return SALES_PLAYBOOKS.find((item) => item.playbook_id === `${family}-${scenario}`) || null;
}
