import { getSalesPlaybook } from "./sales-playbooks.js";
import {
  evaluateCompanyPolicy,
  evaluateConfidentialityUse,
  validateRequirementConfirmationGate,
} from "./sales-policy.js";

const HUMAN_ONLY_FLAGS = Object.freeze([
  "major_discount",
  "special_payment_terms",
  "refund",
  "compensation",
  "moq_exception",
  "production_before_validated_payment",
  "ddp_without_logistics_confirmation",
  "strategic_account_commercial_commitment",
]);

function clean(value, max = 500) {
  if (value === null || value === undefined || value === "") return null;
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max) || null;
}

function known(value) {
  return value !== null && value !== undefined && value !== "" && value !== "unknown";
}

const FACTORY_CONFIRMATION_FIELDS = new Set([
  "approved_price_basis", "approved_moq", "moq_policy", "material", "leather_type",
  "lead_time", "production_timing", "certification", "logistics_scope", "logistics_validation",
  "carton_weight_volume", "payment_terms", "approved_credit_policy", "approved_schedule",
]);

function verifiedHistory(history, publicUse = false) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => (
      item?.verified === true
      && clean(item?.summary)
      && (!publicUse || item?.confidential !== true)
    ))
    .slice(-3)
    .map((item) => clean(item.summary, 500));
}

function approvalFor(playbook, context) {
  if (!evaluateCompanyPolicy(context).allowed) return "HUMAN_ONLY";
  if (HUMAN_ONLY_FLAGS.some((flag) => context[flag] === true)) return "HUMAN_ONLY";
  if (context.risk_level === "high") return "HUMAN_ONLY";
  if (context.customer_tier === "S" && context.strategic_commercial_commitment === true) return "HUMAN_ONLY";
  return playbook.approval_level === "AUTO" ? "DRAFT_HUMAN_APPROVAL" : playbook.approval_level;
}

function unknownResolution(field) {
  return {
    field,
    value: "UNKNOWN",
    resolution: FACTORY_CONFIRMATION_FIELDS.has(field)
      ? "FACTORY_CONFIRMATION_REQUIRED"
      : "ASK_CUSTOMER",
  };
}

export function planSalesScript(context = {}) {
  const playbook = getSalesPlaybook(context.playbook_family, context.scenario);
  if (!playbook) {
    return {
      status: "NEEDS_CONTEXT",
      draft: null,
      facts_used: [],
      unknowns: ["playbook_family", "scenario"].filter((field) => !known(context[field])),
      approval_level: "DRAFT_HUMAN_APPROVAL",
      reason: "A valid existing playbook family and scenario are required.",
      version: "1.0.0",
    };
  }

  const companyPolicy = evaluateCompanyPolicy(context);
  if (!companyPolicy.allowed) {
    return {
      status: "BLOCKED_BY_COMPANY_POLICY",
      draft: null,
      facts_used: [],
      unknowns: [],
      unknown_information: [],
      approval_level: "HUMAN_ONLY",
      reason: companyPolicy.reason,
      policy_code: companyPolicy.code,
      playbook_id: playbook.playbook_id,
      version: "1.1.0",
    };
  }

  if (context.scenario === "QUOTATION") {
    const gate = validateRequirementConfirmationGate({
      current_stage: context.sales_stage || context.stage,
      target_stage: "quoted",
      confirmation: context.requirement_confirmation,
    });
    if (!gate.allowed) {
      return {
        status: "BLOCKED_BY_REQUIREMENT_GATE",
        draft: null,
        facts_used: [],
        unknowns: ["requirement_confirmation"],
        unknown_information: [unknownResolution("requirement_confirmation")],
        approval_level: "HUMAN_ONLY",
        reason: gate.reason,
        playbook_id: playbook.playbook_id,
        version: "1.1.0",
      };
    }
  }

  const information = context.known_information && typeof context.known_information === "object"
    ? context.known_information
    : {};
  const unknowns = playbook.required_information.filter((field) => !known(information[field]));
  const confidentiality = evaluateConfidentialityUse(context);
  const publicUse = confidentiality.public_use_requested;
  const history = verifiedHistory(context.conversation_history, publicUse);
  const name = publicUse && context.anonymized === true ? null : clean(context.customer_name, 120);
  const product = clean(context.product_label || context.product_family || playbook.product_family, 160);
  const market = clean(context.country_market || context.country, 120);
  const opening = name ? `Hello ${name},` : "Hello,";
  const projectLine = product
    ? `We are reviewing your ${product} project${market ? ` for ${market}` : ""}.`
    : "We are reviewing your custom bag project.";
  const historyLine = history.length ? `Based on the verified project history: ${history.join("; ")}.` : null;
  const missingLine = unknowns.length
    ? `Could you please confirm ${unknowns.slice(0, 3).join(", ")}?`
    : playbook.recommended_script.next_step_prompt;
  const draft = [
    opening,
    "",
    projectLine,
    historyLine,
    playbook.recommended_script.objective_prompt,
    missingLine,
  ].filter((line) => line !== null).join("\n");

  return {
    status: "DRAFT_ONLY",
    draft,
    facts_used: [
      name && { field: "customer_name", value: name },
      product && { field: "product_family", value: product },
      market && { field: "country_market", value: market },
      ...history.map((value) => ({ field: "verified_history", value })),
    ].filter(Boolean),
    unknowns,
    unknown_information: unknowns.map(unknownResolution),
    buyer_state: clean(context.buyer_state, 80) || "unknown",
    objection: clean(context.objection, 120) || "unknown",
    approval_level: approvalFor(playbook, context),
    reason: `${playbook.playbook_id} v${playbook.version}`,
    playbook_id: playbook.playbook_id,
    script_key: playbook.recommended_script.script_key,
    version: playbook.recommended_script.version,
    confidentiality,
  };
}
