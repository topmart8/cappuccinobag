import { planSalesScript } from "./script-library.js";
import { evaluateCompanyPolicy, evaluateValidatedPayment } from "./sales-policy.js";

export const FOLLOW_UP_TASK_TARGET = "tasks";
export const FOLLOW_UP_SCENARIOS = Object.freeze([
  "NEW_INQUIRY",
  "QUOTATION_FOLLOW_UP",
  "SAMPLE_FOLLOW_UP",
  "SAMPLE_DELIVERED_FEEDBACK",
  "PI_PAYMENT_FOLLOW_UP",
  "DELIVERY_FEEDBACK",
  "REPEAT_ORDER_REMINDER",
]);

const CONFIG = Object.freeze({
  NEW_INQUIRY: {
    playbook_scenario: "FIRST_CONTACT",
    trigger: "A new inquiry exists without a later handled/replied activity.",
    reason: "Review the new inquiry and prepare a human-approved first response.",
    next_action: "REVIEW_NEW_INQUIRY",
    cadence_hours: [24, 48],
  },
  QUOTATION_FOLLOW_UP: {
    playbook_scenario: "QUOTATION",
    trigger: "A valid quotation activity exists without a later buyer decision.",
    reason: "Request feedback on the reviewed quotation and unresolved terms.",
    next_action: "REVIEW_QUOTATION_FOLLOW_UP",
    cadence_hours: [48, 72],
  },
  SAMPLE_FOLLOW_UP: {
    playbook_scenario: "SAMPLE",
    trigger: "A sample checkpoint is due without a later completion activity.",
    reason: "Confirm the verified sample milestone and next checkpoint.",
    next_action: "REVIEW_SAMPLE_CHECKPOINT",
    cadence_hours: null,
  },
  SAMPLE_DELIVERED_FEEDBACK: {
    playbook_scenario: "SAMPLE_FEEDBACK",
    trigger: "Verified sample delivery exists without later structured feedback.",
    reason: "Request structured sample approval or revision feedback.",
    next_action: "REQUEST_SAMPLE_FEEDBACK_DRAFT",
    cadence_hours: [24, 48],
  },
  PI_PAYMENT_FOLLOW_UP: {
    playbook_scenario: "PI_PAYMENT",
    trigger: "An approved PI exists and a human-set payment checkpoint is due.",
    reason: "A human must verify PI and payment facts before any reminder.",
    next_action: "REVIEW_PI_PAYMENT_STATUS",
    cadence_hours: [48, 72],
  },
  DELIVERY_FEEDBACK: {
    playbook_scenario: "DELIVERY",
    trigger: "Verified delivery exists without a later receipt or issue activity.",
    reason: "Request evidence-based delivery feedback through a reviewed draft.",
    next_action: "REQUEST_DELIVERY_FEEDBACK_DRAFT",
    cadence_hours: null,
  },
  REPEAT_ORDER_REMINDER: {
    playbook_scenario: "REPEAT_ORDER",
    trigger: "Completed delivery history and a human-set repeat-order reminder are due.",
    reason: "Review verified history before preparing a repeat-order reminder.",
    next_action: "REVIEW_REPEAT_ORDER_OPPORTUNITY",
    cadence_hours: [168, 336],
  },
});

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

function requiresHumanOnly(context) {
  return HUMAN_ONLY_FLAGS.some((flag) => context[flag] === true)
    || context.risk_level === "high"
    || (context.customer_tier === "S" && context.strategic_account_commercial_commitment === true);
}

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function recommendDueDate(context, cadenceHours) {
  const existing = validDate(context.due_date || context.next_follow_up);
  const triggerAt = validDate(context.trigger_at || context.activity_at || context.created_at);
  const customerTiming = validDate(
    context.customer_requested_follow_up_at || context.customer_timing_at || context.defer_until,
  );
  const cadenceStart = triggerAt && cadenceHours
    ? new Date(triggerAt.valueOf() + cadenceHours[0] * 60 * 60 * 1000)
    : null;
  const candidates = [existing, cadenceStart, customerTiming].filter(Boolean);
  if (!candidates.length) return null;
  return new Date(Math.max(...candidates.map((date) => date.valueOf()))).toISOString();
}

function dueWindow(context, cadenceHours) {
  const triggerAt = validDate(context.trigger_at || context.activity_at || context.created_at);
  if (!triggerAt || !cadenceHours) return null;
  return {
    earliest: new Date(triggerAt.valueOf() + cadenceHours[0] * 60 * 60 * 1000).toISOString(),
    latest: new Date(triggerAt.valueOf() + cadenceHours[1] * 60 * 60 * 1000).toISOString(),
  };
}

export function recommendFollowUp(context = {}) {
  const scenario = FOLLOW_UP_SCENARIOS.includes(context.scenario) ? context.scenario : null;
  const config = scenario ? CONFIG[scenario] : null;
  if (!config) {
    return {
      trigger: "unknown",
      reason: "A supported follow-up scenario is required.",
      customer_tier: context.customer_tier || null,
      strategic_value: context.strategic_value || "UNKNOWN",
      closing_urgency: context.closing_urgency || "UNKNOWN",
      sales_stage: context.sales_stage || context.stage || null,
      next_action: "REQUEST_HUMAN_REVIEW",
      recommended_script: null,
      due_date: context.due_date || context.next_follow_up || null,
      approval_level: "HUMAN_ONLY",
      task_system: FOLLOW_UP_TASK_TARGET,
      mode: "recommendation_only",
    };
  }

  if (
    context.do_not_prospect
    || context.opted_out
    || context.duplicate_review
    || context.duplicate_of
    || ["blocked", "supplier_non_buyer"].includes(context.relationship_status)
  ) {
    return {
      trigger: config.trigger,
      reason: "Company Policy or suppression state blocks follow-up.",
      customer_tier: context.customer_tier || null,
      strategic_value: context.strategic_value || "UNKNOWN",
      closing_urgency: context.closing_urgency || "UNKNOWN",
      sales_stage: context.sales_stage || context.stage || null,
      next_action: "STOP_OUTREACH_AND_REVIEW",
      recommended_script: null,
      due_date: null,
      approval_level: "HUMAN_ONLY",
      task_system: FOLLOW_UP_TASK_TARGET,
      mode: "recommendation_only",
    };
  }

  const companyPolicy = evaluateCompanyPolicy(context);
  const paymentValidation = scenario === "PI_PAYMENT_FOLLOW_UP"
    ? evaluateValidatedPayment(context)
    : null;

  const script = planSalesScript({
    ...context,
    scenario: config.playbook_scenario,
  });
  const approvalLevel = !companyPolicy.allowed || requiresHumanOnly(context)
    ? "HUMAN_ONLY"
    : "DRAFT_HUMAN_APPROVAL";
  const policyBlocked = !companyPolicy.allowed;
  const paymentPending = paymentValidation && !paymentValidation.validated;

  return {
    trigger: context.trigger || config.trigger,
    reason: policyBlocked
      ? companyPolicy.reason
      : script.status === "BLOCKED_BY_REQUIREMENT_GATE" ? script.reason
        : paymentPending ? paymentValidation.reason
          : config.reason,
    customer_tier: context.customer_tier || null,
    strategic_value: context.strategic_value || "UNKNOWN",
    closing_urgency: context.closing_urgency || "UNKNOWN",
    sales_stage: context.sales_stage || context.stage || null,
    next_action: policyBlocked
      ? "ESCALATE_HUMAN_APPROVAL"
      : script.status === "BLOCKED_BY_REQUIREMENT_GATE" ? "CONFIRM_REQUIREMENTS"
        : paymentPending ? "VERIFY_PAYMENT_STATUS"
          : config.next_action,
    recommended_script: policyBlocked ? null : script.draft,
    due_date: recommendDueDate(context, config.cadence_hours),
    due_window: dueWindow(context, config.cadence_hours),
    payment_validation: paymentValidation,
    approval_level: script.approval_level === "HUMAN_ONLY" ? "HUMAN_ONLY" : approvalLevel,
    task_system: FOLLOW_UP_TASK_TARGET,
    mode: "recommendation_only",
  };
}
