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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanContextValue(value, max = 120) {
  if (value === null || value === undefined || value === "") return null;
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max) || null;
}

export function normalizeRequirementConfirmationContext({
  requirement_version,
  opportunity_id,
  inquiry_id,
  product_family,
  product_category,
} = {}) {
  const existingInquiryId = cleanContextValue(inquiry_id);
  const reusableInquiryId = existingInquiryId && UUID.test(existingInquiryId)
    ? existingInquiryId
    : null;
  return {
    requirement_version: cleanContextValue(requirement_version),
    inquiry_id: reusableInquiryId,
    opportunity_id: reusableInquiryId || cleanContextValue(opportunity_id),
    product_family: cleanContextValue(product_family || product_category),
  };
}

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

function activityOpportunityId(activity) {
  return cleanContextValue(activity?.metadata?.opportunity_id || activity?.inquiry_id);
}

export function findExistingRequirementConfirmation(activities = [], context = {}) {
  const normalized = normalizeRequirementConfirmationContext(context);
  if (!normalized.requirement_version) return null;
  return activities.find((activity) => {
    if (activity?.activity_type !== "requirement_confirmed" || !isRequirementConfirmed(activity)) return false;
    if (cleanContextValue(activity.metadata.requirement_version) !== normalized.requirement_version) return false;
    return normalized.opportunity_id
      ? activityOpportunityId(activity) === normalized.opportunity_id
      : true;
  }) || null;
}

export function latestRequirementConfirmation(activities = [], context = {}) {
  const normalized = normalizeRequirementConfirmationContext(context);
  const confirmed = activities.filter((activity) => (
    activity?.activity_type === "requirement_confirmed" && isRequirementConfirmed(activity)
  ));
  if (!normalized.opportunity_id) return confirmed[0] || null;
  return confirmed.find((activity) => activityOpportunityId(activity) === normalized.opportunity_id)
    || confirmed.find((activity) => activityOpportunityId(activity) === null)
    || null;
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
  opportunity_id,
  inquiry_id,
  product_family,
  product_category,
  confirmed_by,
  confirmed_at = new Date().toISOString(),
} = {}) {
  const context = normalizeRequirementConfirmationContext({
    requirement_version,
    opportunity_id,
    inquiry_id,
    product_family,
    product_category,
  });
  if (!customer_id || !site || !context.requirement_version) {
    throw new Error("customer_id, site and requirement_version are required.");
  }
  return {
    customer_id,
    ...(context.inquiry_id ? { inquiry_id: context.inquiry_id } : {}),
    site,
    source: "crm",
    owner: owner || confirmed_by || null,
    activity_type: "requirement_confirmed",
    title: "客户需求已人工确认",
    body: `Requirement version: ${context.requirement_version}`,
    metadata: {
      requirement_confirmed: true,
      requirement_version: context.requirement_version,
      opportunity_id: context.opportunity_id,
      product_family: context.product_family,
      confirmed_by: confirmed_by || owner || null,
      confirmed_at,
      confirmation_source: "human_crm",
    },
  };
}
