import {
  evaluateCompanyPolicy,
  mapCanonicalStage,
  validateRequirementConfirmationGate,
} from "./sales-policy.js";
import { getSalesPlaybook } from "./sales-playbooks.js";

const HUMAN_ONLY_POLICIES = Object.freeze([
  ["major_discount", "Major discount requires human approval."],
  ["special_payment_terms", "Special payment terms require human approval."],
  ["production_before_payment", "Production cannot start before validated payment."],
  ["ddp_without_validation", "DDP requires logistics validation."],
  ["refund", "Refund decisions require human approval."],
  ["compensation", "Compensation decisions require human approval."],
  ["strategic_account_commitment", "Strategic-account commitments require human approval."],
  ["moq_exception", "MOQ exceptions require human approval."],
]);

function output(action, reason, context, approval_level) {
  return {
    action,
    reason,
    owner: context.owner || context.assigned_owner || null,
    due_date: context.due_date || context.next_follow_up || null,
    approval_level,
  };
}

function scenarioFor(context, canonicalStage) {
  if (["LEAD", "QUALIFIED"].includes(canonicalStage)) return "NEED_DISCOVERY";
  if (canonicalStage === "DISCOVERY") {
    return context.requirement_confirmation ? "QUOTATION" : "REQUIREMENT_CONFIRMATION";
  }
  if (["REQUIREMENT_CONFIRMED", "QUOTATION"].includes(canonicalStage)) return "QUOTATION";
  if (canonicalStage === "SAMPLE") return "SAMPLE";
  if (canonicalStage === "NEGOTIATION") return "NEGOTIATION";
  if (canonicalStage === "PI_PAYMENT") return "PI_PAYMENT";
  return null;
}

export function recommendNextBestAction(context = {}) {
  if (
    context.do_not_prospect
    || context.duplicate_review
    || context.duplicate_of
    || ["blocked", "supplier_non_buyer"].includes(context.relationship_status)
  ) {
    return output("STOP_OUTREACH_AND_REVIEW", "Company policy blocks outreach for this customer.", context, "HUMAN_ONLY");
  }

  const companyPolicy = evaluateCompanyPolicy(context);
  if (!companyPolicy.allowed) {
    return output("ESCALATE_HUMAN_APPROVAL", companyPolicy.reason, context, "HUMAN_ONLY");
  }

  for (const [flag, reason] of HUMAN_ONLY_POLICIES) {
    if (context[flag]) return output("ESCALATE_HUMAN_APPROVAL", reason, context, "HUMAN_ONLY");
  }

  if (context.risk_level === "high") {
    return output("HUMAN_RISK_REVIEW", "High-risk records require human review.", context, "HUMAN_ONLY");
  }

  const gate = validateRequirementConfirmationGate({
    current_stage: context.current_stage || context.stage,
    target_stage: context.target_stage,
    confirmation: context.requirement_confirmation,
  });
  if (!gate.allowed) {
    return output("CONFIRM_REQUIREMENTS", gate.reason, context, "DRAFT_HUMAN_APPROVAL");
  }

  const canonicalStage = mapCanonicalStage(context.current_stage || context.stage).canonical_stage
    || String(context.canonical_stage || "").toUpperCase();
  const scenario = scenarioFor(context, canonicalStage);
  const playbook = scenario ? getSalesPlaybook(context.playbook_family, scenario) : null;
  if (playbook) {
    return output(
      playbook.recommended_actions[0],
      `${playbook.playbook_id} v${playbook.version}: ${playbook.objective}`,
      context,
      playbook.approval_level,
    );
  }

  if (context.ai_recommendation) {
    return output(
      "REVIEW_AI_RECOMMENDATION",
      `AI recommendation requires human review: ${String(context.ai_recommendation).slice(0, 500)}`,
      context,
      "DRAFT_HUMAN_APPROVAL",
    );
  }

  return output("REVIEW_OPPORTUNITY", "No approved P0 playbook rule matched.", context, "AUTO");
}
