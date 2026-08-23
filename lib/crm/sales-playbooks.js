import { APPROVAL_LEVELS } from "./sales-policy.js";

export const PLAYBOOK_FAMILIES = Object.freeze(["PAD", "BASE", "LEAW", "MEN_TRAVEL"]);
export const PLAYBOOK_SCENARIOS = Object.freeze([
  "NEED_DISCOVERY",
  "REQUIREMENT_CONFIRMATION",
  "QUOTATION",
  "SAMPLE",
  "NEGOTIATION",
  "PI_PAYMENT",
]);

const FAMILY_CONFIG = Object.freeze({
  PAD: {
    product_family: "RACKET_SPORTS",
    required_information: ["racket_capacity", "shoe_compartment", "material", "quantity", "branding"],
  },
  BASE: {
    product_family: "TEAM_SPORTS",
    required_information: ["equipment_load", "bag_format", "material", "quantity", "team_branding"],
  },
  LEAW: {
    product_family: "LEATHER",
    required_information: ["leather_type", "dimensions", "lining", "hardware", "quantity", "branding"],
  },
  MEN_TRAVEL: {
    product_family: "TRAVEL",
    required_information: ["use_case", "capacity", "material", "carry_system", "quantity", "branding"],
  },
});

const SCENARIO_CONFIG = Object.freeze({
  NEED_DISCOVERY: {
    sales_stage: "DISCOVERY",
    objective: "Collect the minimum verified requirements for the project.",
    recommended_actions: ["REQUEST_MISSING_REQUIREMENTS"],
    exit_condition: "Minimum product and commercial requirements are documented.",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  REQUIREMENT_CONFIRMATION: {
    sales_stage: "DISCOVERY",
    objective: "Obtain an explicit human-recorded customer confirmation.",
    recommended_actions: ["CONFIRM_REQUIREMENT_VERSION"],
    exit_condition: "requirement_confirmed is true for a named version.",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  QUOTATION: {
    sales_stage: "REQUIREMENT_CONFIRMED",
    objective: "Prepare a human-reviewed quotation from confirmed requirements.",
    recommended_actions: ["PREPARE_QUOTATION_DRAFT"],
    exit_condition: "An approved quotation is recorded by the existing process.",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  SAMPLE: {
    sales_stage: "SAMPLE",
    objective: "Confirm sample scope, fee, approval and next checkpoint.",
    recommended_actions: ["REVIEW_SAMPLE_REQUIREMENTS"],
    exit_condition: "Sample outcome or revision requirements are recorded.",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  NEGOTIATION: {
    sales_stage: "NEGOTIATION",
    objective: "Keep negotiation inside approved commercial policy.",
    recommended_actions: ["REVIEW_NEGOTIATION_TERMS"],
    exit_condition: "Terms are approved, rejected or returned for requirement confirmation.",
    approval_level: "DRAFT_HUMAN_APPROVAL",
  },
  PI_PAYMENT: {
    sales_stage: "PI_PAYMENT",
    objective: "Verify approved PI and payment status before production.",
    recommended_actions: ["VERIFY_PI_AND_PAYMENT"],
    exit_condition: "Payment is validated by an authorized human workflow.",
    approval_level: "HUMAN_ONLY",
  },
});

export const SALES_PLAYBOOKS = Object.freeze(PLAYBOOK_FAMILIES.flatMap((family) => (
  PLAYBOOK_SCENARIOS.map((scenario) => {
    const familyConfig = FAMILY_CONFIG[family];
    const scenarioConfig = SCENARIO_CONFIG[scenario];
    return Object.freeze({
      playbook_id: `${family}-${scenario}`,
      product_family: familyConfig.product_family,
      sales_stage: scenarioConfig.sales_stage,
      scenario,
      objective: scenarioConfig.objective,
      required_information: Object.freeze([...familyConfig.required_information]),
      recommended_actions: Object.freeze([...scenarioConfig.recommended_actions]),
      recommended_script: null,
      do_not_do: Object.freeze([
        "Do not invent price, MOQ, payment terms, production approval or DDP commitments.",
        "Do not send outbound communication automatically.",
      ]),
      exit_condition: scenarioConfig.exit_condition,
      approval_level: APPROVAL_LEVELS.includes(scenarioConfig.approval_level)
        ? scenarioConfig.approval_level
        : "HUMAN_ONLY",
      version: "1.0.0",
    });
  })
)));

export function getSalesPlaybook(family, scenario) {
  return SALES_PLAYBOOKS.find((item) => item.playbook_id === `${family}-${scenario}`) || null;
}
