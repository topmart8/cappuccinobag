export const APPROVAL_LEVELS = Object.freeze([
  "AUTO",
  "DRAFT_HUMAN_APPROVAL",
  "HUMAN_ONLY",
]);

export const DECISION_PRIORITY = Object.freeze([
  "COMPANY_POLICY",
  "RISK_RULE",
  "SALES_STAGE_RULE",
  "PLAYBOOK",
  "AI_RECOMMENDATION",
]);

const STAGE_MAP = Object.freeze({
  new: "LEAD",
  new_inquiry: "LEAD",
  qualified: "QUALIFIED",
  contacted: "DISCOVERY",
  replied: "DISCOVERY",
  requirements_confirmed: "REQUIREMENT_CONFIRMED",
  quoted: "QUOTATION",
  quotation: "QUOTATION",
  sample: "SAMPLE",
  sample_discussion: "SAMPLE",
  sample_payment_pending: "SAMPLE",
  sample_production: "SAMPLE",
  sample_sent: "SAMPLE",
  waiting_sample_feedback: "SAMPLE",
  negotiation: "NEGOTIATION",
  bulk_order_negotiation: "NEGOTIATION",
  payment_pending: "PI_PAYMENT",
  order_confirmed: "PI_PAYMENT",
  production: "PRODUCTION",
  shipped: "SHIPPING_DELIVERY",
  won: "WON_REPEAT",
  lost: "LOST",
});

export function mapCanonicalStage(stage) {
  const raw_stage = String(stage || "").trim();
  return {
    raw_stage: raw_stage || null,
    canonical_stage: STAGE_MAP[raw_stage.toLowerCase()] || null,
    mapping_version: "P0_V1",
  };
}

export function isRequirementConfirmed(confirmation) {
  const metadata = confirmation?.metadata || confirmation || {};
  return metadata.requirement_confirmed === true && Boolean(metadata.requirement_version);
}

export function latestRequirementConfirmation(activities = []) {
  return activities.find((activity) => (
    activity?.activity_type === "requirement_confirmed" && isRequirementConfirmed(activity)
  )) || null;
}

export function validateRequirementConfirmationGate({ current_stage, target_stage, confirmation } = {}) {
  const target = mapCanonicalStage(target_stage).canonical_stage
    || String(target_stage || "").trim().toUpperCase();
  const enteringQuotation = target === "QUOTATION"
    && mapCanonicalStage(current_stage).canonical_stage !== "QUOTATION";
  if (enteringQuotation && !isRequirementConfirmed(confirmation)) {
    return {
      allowed: false,
      code: "REQUIREMENT_CONFIRMATION_REQUIRED",
      reason: "Requirement confirmation is required before quotation.",
    };
  }
  return { allowed: true, code: null, reason: null };
}

export function buildRequirementConfirmationActivity({
  customer_id,
  site,
  owner,
  requirement_version,
  confirmed_by,
  confirmed_at = new Date().toISOString(),
} = {}) {
  const version = String(requirement_version || "").replace(/\0/g, "").trim().slice(0, 120);
  if (!customer_id || !site || !version) {
    throw new Error("customer_id, site and requirement_version are required.");
  }
  return {
    customer_id,
    site,
    source: "crm",
    owner: owner || confirmed_by || null,
    activity_type: "requirement_confirmed",
    title: "客户需求已人工确认",
    body: `Requirement version: ${version}`,
    metadata: {
      requirement_confirmed: true,
      requirement_version: version,
      confirmed_by: confirmed_by || owner || null,
      confirmed_at,
      confirmation_source: "human_crm",
    },
  };
}
