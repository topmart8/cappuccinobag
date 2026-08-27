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

export const SUPPORTED_INCOTERMS = Object.freeze(["EXW", "FOB", "DDP"]);

const CLEARED_PAYMENT_STATUSES = new Set(["received", "cleared"]);
const VALIDATED_PAYMENT_SOURCES = new Set(["bank", "platform", "alibaba"]);
const HUMAN_ONLY_POLICY_FLAGS = Object.freeze([
  ["major_discount", "Major discount requires human approval."],
  ["moq_exception", "MOQ exceptions require human approval."],
  ["special_payment_terms", "Special payment terms require human approval."],
  ["refund", "Refund decisions require human approval."],
  ["compensation", "Compensation decisions require human approval."],
  ["compliance_commitment", "Compliance commitments require human approval."],
  ["production_exception", "Production exceptions require human approval."],
  ["production_before_payment", "Production cannot start before validated payment."],
  ["production_before_validated_payment", "Production cannot start before validated payment."],
  ["ddp_without_validation", "DDP requires logistics validation."],
  ["ddp_without_logistics_confirmation", "DDP requires logistics validation."],
  ["strategic_account_commitment", "Strategic-account commitments require human approval."],
  ["strategic_account_commercial_commitment", "Strategic-account commitments require human approval."],
  ["strategic_commercial_commitment", "Strategic-account commitments require human approval."],
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

function normalizedToken(value) {
  return cleanContextValue(value, 80)?.toLowerCase().replace(/[\s-]+/g, "_") || null;
}

export function evaluateValidatedPayment(context = {}) {
  const candidates = [
    { source: "bank", status: context.bank_payment_status },
    { source: "platform", status: context.platform_payment_status },
    { source: "alibaba", status: context.alibaba_payment_status },
    {
      source: normalizedToken(context.payment_validation_source || context.payment_source),
      status: context.payment_status,
    },
  ];
  const validated = candidates.find(({ source, status }) => (
    VALIDATED_PAYMENT_SOURCES.has(source)
    && CLEARED_PAYMENT_STATUSES.has(normalizedToken(status))
  ));

  if (validated) {
    return {
      validated: true,
      status: "PAYMENT_VALIDATED",
      source: validated.source,
      reason: "Bank, platform or Alibaba status confirms the payment as received or cleared.",
    };
  }
  return {
    validated: false,
    status: "PAYMENT_PENDING_VERIFICATION",
    source: null,
    reason: "Screenshots, payment advice, verbal statements and promises do not validate payment.",
  };
}

function paymentContext(context, prefix) {
  return {
    payment_status: context[`${prefix}_payment_status`] || context[`${prefix}_status`],
    payment_validation_source: context[`${prefix}_validation_source`],
    bank_payment_status: context[`${prefix}_bank_payment_status`],
    platform_payment_status: context[`${prefix}_platform_payment_status`],
    alibaba_payment_status: context[`${prefix}_alibaba_payment_status`],
  };
}

const PRODUCTION_SEQUENCE = Object.freeze([
  "REQUIREMENT_CONFIRMED",
  "PI_CONFIRMED",
  "DEPOSIT_VALIDATED",
  "PRODUCTION_AUTHORIZED",
  "PRODUCTION",
  "QC_PASSED",
  "BALANCE_VALIDATED",
  "SHIPMENT_AUTHORIZED",
  "SHIPMENT",
]);

export function evaluateProductionSequence(context = {}) {
  const requestedStep = normalizedToken(
    context.production_step || context.requested_action || context.target_stage,
  )?.toUpperCase() || null;
  const requestedIndex = PRODUCTION_SEQUENCE.indexOf(requestedStep);
  if (requestedIndex < 0) {
    return { allowed: true, code: null, reason: null, requested_step: requestedStep };
  }

  const deposit = context.deposit_required === false
    ? { validated: true }
    : evaluateValidatedPayment(paymentContext(context, "deposit"));
  const balance = context.balance_required === false
    ? { validated: true }
    : evaluateValidatedPayment(paymentContext(context, "balance"));
  const gates = [
    ["REQUIREMENT_CONFIRMED", isRequirementConfirmed(context.requirement_confirmation)],
    ["PI_CONFIRMED", context.pi_confirmed === true || context.commercial_terms_confirmed === true],
    ["DEPOSIT_VALIDATED", deposit.validated],
    ["PRODUCTION_AUTHORIZED", context.production_authorized === true],
    ["PRODUCTION", context.production_started === true || normalizedToken(context.production_status) === "production"],
    ["QC_PASSED", context.qc_passed === true],
    ["BALANCE_VALIDATED", balance.validated],
    ["SHIPMENT_AUTHORIZED", context.shipment_authorized === true],
  ];
  for (let index = 0; index < requestedIndex; index += 1) {
    const [gate, passed] = gates[index];
    if (!passed) {
      return {
        allowed: false,
        code: `${gate}_REQUIRED`,
        reason: `${gate} must be verified before ${requestedStep}.`,
        requested_step: requestedStep,
      };
    }
  }
  return { allowed: true, code: null, reason: null, requested_step: requestedStep };
}

export function evaluateConfidentialityUse(context = {}) {
  const confidential = [
    "nda", "technical_pack", "design", "artwork", "prototype", "confidential_attachments",
  ].some((field) => context[field] === true) || context.confidential === true;
  const publicUse = [
    "public_geo_content", "public_case_study", "public_script_training", "public_content_use",
  ].some((field) => context[field] === true);
  const approved = context.public_use_human_approved === true || context.anonymized === true;
  return {
    confidential,
    public_use_requested: publicUse,
    public_content_eligible: !confidential || !publicUse || approved,
    requires_human_review: confidential && publicUse && !approved,
    reason: confidential && publicUse && !approved
      ? "Confidential customer material requires anonymization or explicit human approval before public reuse."
      : null,
  };
}

export function evaluateCompanyPolicy(context = {}) {
  for (const [flag, reason] of HUMAN_ONLY_POLICY_FLAGS) {
    if (context[flag] === true) {
      return { allowed: false, code: flag.toUpperCase(), reason, approval_level: "HUMAN_ONLY" };
    }
  }

  const incoterm = cleanContextValue(context.incoterm || context.requested_incoterm, 20)?.toUpperCase();
  if (incoterm && !SUPPORTED_INCOTERMS.includes(incoterm)) {
    return {
      allowed: false,
      code: "UNSUPPORTED_INCOTERM",
      reason: "Incoterms outside EXW, FOB and DDP require human approval.",
      approval_level: "HUMAN_ONLY",
    };
  }
  if (incoterm === "DDP") {
    return {
      allowed: false,
      code: context.logistics_validated === true
        ? "DDP_HUMAN_APPROVAL_REQUIRED"
        : "DDP_LOGISTICS_VALIDATION_REQUIRED",
      reason: context.logistics_validated === true
        ? "DDP remains a human-only commercial commitment after logistics validation."
        : "DDP requires logistics validation and human approval before commitment.",
      approval_level: "HUMAN_ONLY",
    };
  }

  const confidentiality = evaluateConfidentialityUse(context);
  if (confidentiality.requires_human_review) {
    return {
      allowed: false,
      code: "CONFIDENTIAL_PUBLIC_USE_REVIEW_REQUIRED",
      reason: confidentiality.reason,
      approval_level: "HUMAN_ONLY",
    };
  }

  const production = evaluateProductionSequence(context);
  if (!production.allowed) {
    return {
      allowed: false,
      code: production.code,
      reason: production.reason,
      approval_level: "HUMAN_ONLY",
    };
  }
  return { allowed: true, code: null, reason: null, approval_level: null };
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
  const explicitOpportunityId = cleanContextValue(opportunity_id);
  return {
    requirement_version: cleanContextValue(requirement_version),
    inquiry_id: reusableInquiryId,
    opportunity_id: explicitOpportunityId || reusableInquiryId,
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
