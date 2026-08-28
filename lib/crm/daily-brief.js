import { applyOwnerScope } from "./scope.js";
import { recommendCustomerPriority } from "./customer-intelligence.js";
import { recommendFollowUp } from "./follow-up.js";
import { recommendNextBestAction } from "./next-best-action.js";
import { mapProductTaxonomy } from "./product-taxonomy.js";
import { scoreLead } from "./scoring.js";
import { planSalesScript } from "./script-library.js";
import { supabaseRequest } from "./supabase.js";
import { qualifyWebsiteInquiry } from "./website-qualification-adapter.js";
import { qualifyWhatsAppInquiry } from "./whatsapp-qualification-adapter.js";

export const DAILY_BRIEF_LIFECYCLE_AVAILABILITY = Object.freeze({
  quote: "NOT_AVAILABLE",
  sample: "NOT_AVAILABLE",
  order: "NOT_AVAILABLE",
  payment: "NOT_AVAILABLE",
  repeat_order: "NOT_AVAILABLE",
});

export const DAILY_BRIEF_SAFETY = Object.freeze({
  mode: "DERIVED_RUNTIME_ONLY",
  persistence: "none",
  task_write: "disabled",
  email_auto_send: 0,
  whatsapp_auto_send: 0,
  website_auto_reply: 0,
  safe_auto: "HARD_DISABLED",
});

const CLOSED_STAGES = new Set(["won", "lost"]);
const PLAYBOOK_FAMILY = Object.freeze({
  RACKET_SPORTS: "PAD",
  TEAM_SPORTS: "BASE",
  LEATHER: "LEAW",
  TRAVEL: "MEN_TRAVEL",
});

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function latestDate(values) {
  const dates = values.map(validDate).filter(Boolean);
  return dates.length ? new Date(Math.max(...dates.map((date) => date.valueOf()))) : null;
}

function daysBetween(earlier, later) {
  const start = validDate(earlier);
  const end = validDate(later);
  if (!start || !end) return null;
  return Math.max(0, (end.valueOf() - start.valueOf()) / 86400000);
}

function confidenceLabel(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "UNKNOWN";
  if (Number(value) >= 0.75) return "HIGH";
  if (Number(value) >= 0.45) return "MEDIUM";
  return "LOW";
}

function groupBy(rows, field) {
  const grouped = new Map();
  for (const row of rows || []) {
    const key = row?.[field];
    if (!key) continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  return grouped;
}

function mostRecent(rows) {
  return [...(rows || [])].sort((a, b) => (
    (validDate(b.updated_at || b.created_at)?.valueOf() || 0)
      - (validDate(a.updated_at || a.created_at)?.valueOf() || 0)
  ))[0] || null;
}

function qualificationFor(inquiry, customer, messages = []) {
  if (!inquiry) return null;
  try {
    if (inquiry.site === "cappuccinobag" && inquiry.source_channel === "website") {
      return qualifyWebsiteInquiry({ inquiry, customer }).qualification;
    }
    if (inquiry.site === "cappuccinobag" && inquiry.source_channel === "whatsapp") {
      return qualifyWhatsAppInquiry({ inquiry, customer, messages }).qualification;
    }
  } catch {
    return null;
  }
  return null;
}

function qualificationState(qualification) {
  if (!qualification) return { gaps: [], conflicts: [], nextQuestion: null };
  const topics = qualification.qualification_topics || {};
  return {
    gaps: Object.entries(topics).filter(([, topic]) => topic?.state === "UNKNOWN").map(([topic]) => topic),
    conflicts: Object.entries(topics).filter(([, topic]) => topic?.state === "CONFLICTED").map(([topic]) => topic),
    nextQuestion: qualification.next_question?.next_question || null,
  };
}

function channelFor(customer, inquiry) {
  if (inquiry?.source_channel === "whatsapp" && (inquiry.whatsapp || customer.whatsapp_phone)) return "WHATSAPP_DRAFT";
  if (inquiry?.email || customer.email) return "EMAIL_DRAFT";
  return "MANUAL_REVIEW";
}

function taskState(tasks, now) {
  const open = (tasks || []).filter((task) => ["open", "doing"].includes(task.status));
  const day = now.toISOString().slice(0, 10);
  const overdue = open.filter((task) => validDate(task.due_at) && validDate(task.due_at) < now);
  const dueToday = open.filter((task) => (
    String(task.due_at || "").slice(0, 10) === day && validDate(task.due_at) >= now
  ));
  return { open, overdue, dueToday };
}

export function evaluateDealHealth({
  reference_time,
  last_activity_at,
  last_customer_reply_at,
  stage,
  qualification_gaps = [],
  conflicts = [],
  overdue_tasks = [],
  activity_count = 0,
} = {}) {
  const now = validDate(reference_time) || new Date();
  const inactivityDays = daysBetween(last_activity_at, now);
  const replyDays = daysBetween(last_customer_reply_at, now);
  const riskFlags = [];
  const reasons = [];
  const positive = [];

  if (overdue_tasks.length) {
    riskFlags.push("FOLLOW_UP_OVERDUE", "HUMAN_ACTION_OVERDUE");
    reasons.push(`${overdue_tasks.length} canonical task(s) are overdue.`);
  }
  if (conflicts.length) {
    riskFlags.push("QUALIFICATION_CONFLICT");
    reasons.push(`Qualification evidence conflicts on ${conflicts.join(", ")}.`);
  }
  if (qualification_gaps.length) {
    riskFlags.push("QUALIFICATION_GAP");
    reasons.push(`${qualification_gaps.length} qualification topic(s) remain UNKNOWN.`);
  }
  if (!CLOSED_STAGES.has(String(stage || "").toLowerCase()) && inactivityDays !== null && inactivityDays >= 14) {
    riskFlags.push("STALE_STAGE");
    reasons.push(`No recorded CRM activity for ${Math.floor(inactivityDays)} days.`);
  }
  if (replyDays !== null && replyDays >= 7) {
    riskFlags.push("NO_RECENT_REPLY");
    reasons.push(`No recorded customer reply for ${Math.floor(replyDays)} days.`);
  }
  if (!activity_count && inactivityDays !== null && inactivityDays >= 7) {
    riskFlags.push("LOW_ENGAGEMENT");
    reasons.push("No recent canonical activity is available.");
  }
  if (inactivityDays !== null && inactivityDays < 7) positive.push("Recent CRM activity is recorded.");
  if (!overdue_tasks.length) positive.push("No overdue canonical task is recorded.");
  if (!conflicts.length) positive.push("No qualification conflict is recorded.");

  const uniqueFlags = [...new Set(riskFlags)];
  let state = "UNKNOWN";
  if (last_activity_at || overdue_tasks.length || qualification_gaps.length || conflicts.length) {
    if (conflicts.length && overdue_tasks.length || overdue_tasks.length >= 2) state = "CRITICAL";
    else if (overdue_tasks.length || conflicts.length || uniqueFlags.includes("STALE_STAGE") || uniqueFlags.includes("NO_RECENT_REPLY")) state = "AT_RISK";
    else if (qualification_gaps.length || uniqueFlags.includes("LOW_ENGAGEMENT")) state = "WATCH";
    else state = "HEALTHY";
  }
  if (state !== "UNKNOWN" && !reasons.length) {
    reasons.push("No supported V1 execution-risk threshold is currently met.");
  }

  const evidenceCount = [last_activity_at, last_customer_reply_at, activity_count > 0, overdue_tasks.length > 0, qualification_gaps.length > 0]
    .filter(Boolean).length;
  return Object.freeze({
    state,
    risk_flags: Object.freeze(uniqueFlags),
    reasons: Object.freeze(state === "UNKNOWN" ? ["Insufficient verified execution evidence."] : reasons),
    positive_signals: Object.freeze(positive),
    confidence: confidenceLabel(evidenceCount / 5),
    closing_probability: "NOT_AVAILABLE",
  });
}

function priorityScore({ operationalScore, dealHealth, taskInfo, qualificationInfo, lastActivityAt, now, handoff }) {
  const recencyDays = daysBetween(lastActivityAt, now);
  let points = Math.min(20, operationalScore.final / 5);
  if (recencyDays !== null && recencyDays <= 7) points += 25;
  else if (recencyDays !== null && recencyDays <= 30) points += 12;
  if (taskInfo.overdue.length) points += 35 + Math.min(10, taskInfo.overdue.length * 3);
  if (qualificationInfo.conflicts.length) points += 30;
  if (qualificationInfo.gaps.length) points += Math.min(20, qualificationInfo.gaps.length * 2);
  if (handoff?.handoff_required) points += 10;
  if (dealHealth.state === "CRITICAL") points += 15;
  else if (dealHealth.state === "AT_RISK") points += 8;
  return points;
}

function reasonToday({ taskInfo, qualificationInfo, dealHealth, lastActivityAt, now }) {
  const reasons = [];
  if (taskInfo.overdue.length) reasons.push(`${taskInfo.overdue.length} overdue human task(s)`);
  if (qualificationInfo.conflicts.length) reasons.push("qualification conflict needs resolution");
  if (qualificationInfo.nextQuestion) reasons.push("one safe qualification question is ready");
  const recencyDays = daysBetween(lastActivityAt, now);
  if (recencyDays !== null && recencyDays <= 7) reasons.push("recent customer/opportunity activity");
  if (["AT_RISK", "CRITICAL"].includes(dealHealth.state)) reasons.push(`deal health is ${dealHealth.state}`);
  return reasons.length ? reasons.join("; ") : "No strong time-sensitive signal was verified.";
}

function productLabel(customer, inquiry) {
  return inquiry?.product || inquiry?.product_category || customer.product_keywords?.[0] || "UNKNOWN";
}

function scriptDraft(customer, inquiry, qualification) {
  if (qualification?.script_plan?.status === "DRAFT_ONLY") return qualification.script_plan;
  const taxonomy = mapProductTaxonomy({
    product: inquiry?.product,
    product_category: inquiry?.product_category,
    product_keywords: customer.product_keywords,
  });
  return planSalesScript({
    playbook_family: PLAYBOOK_FAMILY[taxonomy.canonical_family],
    scenario: "FIRST_CONTACT",
    customer_name: inquiry?.name || customer.name,
    product_family: taxonomy.canonical_family,
    country_market: inquiry?.country || customer.country,
    known_information: {
      company: inquiry?.company || customer.company,
      country_market: inquiry?.country || null,
      product_interest: productLabel(customer, inquiry) === "UNKNOWN" ? null : productLabel(customer, inquiry),
    },
  });
}

function normalizedAction(nba, channel, draft, confidence) {
  return Object.freeze({
    action: nba.action,
    why: nba.reason,
    when: nba.due_date || "NOW",
    recommended_channel: channel,
    human_required: true,
    draft_available: draft?.status === "DRAFT_ONLY" && Boolean(draft.draft),
    confidence,
    execution: "HUMAN_ONLY",
  });
}

function humanActionUrgency(item) {
  let urgency = 0;
  if (item.conflicts.length) urgency += 100;
  if (item.risk_flags.includes("HUMAN_ACTION_OVERDUE")) urgency += 90;
  if (item.deal_health.state === "CRITICAL") urgency += 80;
  if (item.human_handoff?.handoff_required) urgency += 70;
  if (item.deal_health.state === "AT_RISK") urgency += 50;
  if (item.next_question) urgency += 30;
  return urgency;
}

export function generateDailySalesBrief({ customers = [], inquiries = [], activities = [], tasks = [], messages = [], reference_time } = {}) {
  const now = validDate(reference_time) || new Date();
  const inquiryByCustomer = groupBy(inquiries.filter((row) => row.is_demo !== true), "customer_id");
  const activityByCustomer = groupBy(activities, "customer_id");
  const taskByCustomer = groupBy(tasks, "customer_id");
  const messageByInquiry = groupBy(messages, "inquiry_id");
  const candidates = [];

  for (const customer of customers.filter((row) => row.is_demo !== true)) {
    const inquiry = mostRecent(inquiryByCustomer.get(customer.id));
    const customerActivities = activityByCustomer.get(customer.id) || [];
    const customerTasks = taskByCustomer.get(customer.id) || [];
    const taskInfo = taskState(customerTasks, now);
    const qualification = qualificationFor(inquiry, customer, messageByInquiry.get(inquiry?.id) || []);
    const qualificationInfo = qualificationState(qualification);
    const lead = { ...customer, ...(inquiry || {}), score_override: customer.score_override ?? null };
    const operationalScore = scoreLead(lead);
    const priorityRecommendation = qualification?.customer_priority || recommendCustomerPriority({
      customer,
      signals: { sales_stage: inquiry?.stage || customer.stage },
      evidence: [],
    });
    const lastActivity = latestDate([
      customer.updated_at,
      customer.last_customer_message_at,
      customer.last_business_message_at,
      inquiry?.updated_at,
      inquiry?.created_at,
      ...customerActivities.map((activity) => activity.created_at),
    ]);
    const dealHealth = evaluateDealHealth({
      reference_time: now,
      last_activity_at: lastActivity,
      last_customer_reply_at: customer.last_customer_message_at,
      stage: inquiry?.stage || customer.stage,
      qualification_gaps: qualificationInfo.gaps,
      conflicts: qualificationInfo.conflicts,
      overdue_tasks: taskInfo.overdue,
      activity_count: customerActivities.length,
    });
    const nba = qualification?.next_best_action || recommendNextBestAction({
      stage: inquiry?.stage || customer.stage || "new",
      owner: inquiry?.owner || customer.owner,
      risk_level: inquiry?.risk_level,
      customer_tier: priorityRecommendation.recommended_tier,
    });
    const followUp = qualification?.follow_up || recommendFollowUp({
      scenario: "NEW_INQUIRY",
      stage: inquiry?.stage || customer.stage || "new",
      owner: inquiry?.owner || customer.owner,
      trigger_at: inquiry?.created_at || customer.created_at,
      customer_tier: priorityRecommendation.recommended_tier,
    });
    const draft = scriptDraft(customer, inquiry, qualification);
    const channel = channelFor(customer, inquiry);
    const evidenceCount = [inquiry, customerActivities.length > 0, taskInfo.open.length > 0, qualification].filter(Boolean).length;
    const confidence = confidenceLabel(evidenceCount / 4);
    const handoff = qualification?.human_handoff || null;
    const score = priorityScore({
      operationalScore,
      dealHealth,
      taskInfo,
      qualificationInfo,
      lastActivityAt: lastActivity,
      now,
      handoff,
    });
    const actionable = Boolean(
      !CLOSED_STAGES.has(String(inquiry?.stage || customer.stage || "").toLowerCase())
      && (taskInfo.overdue.length || taskInfo.dueToday.length || qualificationInfo.conflicts.length
        || handoff?.handoff_required
        || (lastActivity && daysBetween(lastActivity, now) <= 30)),
    );

    candidates.push({
      customer,
      inquiry,
      taskInfo,
      qualification,
      qualificationInfo,
      operationalScore,
      priorityRecommendation,
      lastActivity,
      dealHealth,
      nba,
      followUp,
      draft,
      channel,
      confidence,
      handoff,
      activityCount: customerActivities.length,
      priorityScore: score,
      actionable,
    });
  }

  const priorityCustomers = candidates
    .filter((candidate) => candidate.actionable)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10)
    .map((candidate, index) => Object.freeze({
      rank: index + 1,
      customer_id: candidate.customer.id,
      inquiry_id: candidate.inquiry?.id || null,
      customer_name: candidate.inquiry?.name || candidate.customer.name || "UNKNOWN",
      company: candidate.inquiry?.company || candidate.customer.company || "UNKNOWN",
      product: productLabel(candidate.customer, candidate.inquiry),
      market: candidate.inquiry?.country || candidate.customer.country || "UNKNOWN",
      stage: candidate.inquiry?.stage || candidate.customer.stage || "UNKNOWN",
      lead_score: candidate.operationalScore.final,
      lead_score_source: candidate.customer.score_override !== null && candidate.customer.score_override !== undefined
        ? "score_override" : "scoreLead",
      customer_tier: candidate.priorityRecommendation.recommended_tier || "UNKNOWN",
      deal_health: candidate.dealHealth,
      why_today: reasonToday({
        taskInfo: candidate.taskInfo,
        qualificationInfo: candidate.qualificationInfo,
        dealHealth: candidate.dealHealth,
        lastActivityAt: candidate.lastActivity,
        now,
      }),
      risk_flags: candidate.dealHealth.risk_flags,
      qualification_gaps: Object.freeze(candidate.qualificationInfo.gaps),
      conflicts: Object.freeze(candidate.qualificationInfo.conflicts),
      next_question: candidate.qualificationInfo.nextQuestion,
      next_best_action: normalizedAction(candidate.nba, candidate.channel, candidate.draft, candidate.confidence),
      follow_up: Object.freeze({ ...candidate.followUp, write_enabled: false }),
      recommended_channel: candidate.channel,
      recommended_draft: candidate.draft?.status === "DRAFT_ONLY" ? candidate.draft.draft : null,
      script_mode: candidate.draft?.status || "NOT_AVAILABLE",
      human_action: candidate.nba.action,
      human_handoff: candidate.handoff,
      confidence: candidate.confidence,
      evidence: Object.freeze([
        candidate.inquiry && `inquiry:${candidate.inquiry.id}`,
        candidate.lastActivity && `last_activity:${candidate.lastActivity.toISOString()}`,
        candidate.taskInfo.open.length && `canonical_tasks:${candidate.taskInfo.open.length}`,
      ].filter(Boolean)),
      lifecycle: DAILY_BRIEF_LIFECYCLE_AVAILABILITY,
      priority_score_internal: Number(candidate.priorityScore.toFixed(2)),
    }));

  const followupsDue = candidates.flatMap((candidate) => (
    [...candidate.taskInfo.overdue, ...candidate.taskInfo.dueToday].map((task) => Object.freeze({
      task_id: task.id,
      customer_id: candidate.customer.id,
      inquiry_id: task.inquiry_id || candidate.inquiry?.id || null,
      title: task.title,
      due_at: task.due_at,
      priority: task.priority,
      status: task.status,
      task_system: "tasks",
      write_enabled: false,
    }))
  ));

  const qualificationAttention = priorityCustomers.filter((item) => (
    item.qualification_gaps.length || item.conflicts.length || item.human_handoff?.handoff_required
  )).map((item) => Object.freeze({
    customer_id: item.customer_id,
    inquiry_id: item.inquiry_id,
    gaps: item.qualification_gaps,
    conflicts: item.conflicts,
    next_question: item.next_question,
    handoff: item.human_handoff,
    mode: "recommendation_only",
  }));

  const reactivation = candidates.filter((candidate) => {
    const inactiveDays = daysBetween(candidate.lastActivity, now);
    const meaningfulHistory = Boolean(candidate.inquiry || candidate.activityCount > 0);
    const valuable = candidate.operationalScore.final >= 60
      || ["S", "A_PLUS", "A"].includes(candidate.priorityRecommendation.recommended_tier);
    return inactiveDays !== null && inactiveDays >= 45 && meaningfulHistory && valuable
      && !candidate.taskInfo.open.length && !CLOSED_STAGES.has(String(candidate.inquiry?.stage || candidate.customer.stage).toLowerCase());
  }).sort((a, b) => b.operationalScore.final - a.operationalScore.final).slice(0, 5).map((candidate) => Object.freeze({
    classification: "REACTIVATION_CANDIDATE",
    customer_id: candidate.customer.id,
    customer: candidate.customer.company || candidate.customer.name || "UNKNOWN",
    last_activity: candidate.lastActivity?.toISOString() || "UNKNOWN",
    why_reactivate: "Meaningful CRM history is inactive for at least 45 days and current verified value signals justify human review.",
    available_evidence: Object.freeze([
      candidate.inquiry && `inquiry:${candidate.inquiry.id}`,
      `lead_score:${candidate.operationalScore.final}`,
      candidate.priorityRecommendation.recommended_tier && `tier:${candidate.priorityRecommendation.recommended_tier}`,
    ].filter(Boolean)),
    next_best_action: Object.freeze({ action: "REACTIVATE", human_required: true, execution: "HUMAN_ONLY" }),
    recommended_draft: candidate.draft?.status === "DRAFT_ONLY" ? candidate.draft.draft : null,
    script_mode: candidate.draft?.status || "NOT_AVAILABLE",
    confidence: candidate.confidence,
    repeat_order_status: "NOT_AVAILABLE",
  }));

  const dealsAtRisk = priorityCustomers.filter((item) => ["AT_RISK", "CRITICAL"].includes(item.deal_health.state));
  const todayTopActions = [...priorityCustomers]
    .sort((a, b) => humanActionUrgency(b) - humanActionUrgency(a)
      || b.priority_score_internal - a.priority_score_internal)
    .slice(0, 5).map((item, index) => Object.freeze({
    rank: index + 1,
    customer_rank: item.rank,
    customer_id: item.customer_id,
    action: item.human_action,
    why: item.why_today,
    urgency_score_internal: humanActionUrgency(item),
    human_required: true,
    automatic_execution: false,
  }));

  return Object.freeze({
    generated_at: now.toISOString(),
    priority_customers: Object.freeze(priorityCustomers),
    deals_at_risk: Object.freeze(dealsAtRisk),
    followups_due: Object.freeze(followupsDue),
    qualification_attention: Object.freeze(qualificationAttention),
    reactivation_opportunities: Object.freeze(reactivation),
    today_top_actions: Object.freeze(todayTopActions),
    executive_summary: Object.freeze({
      actionable_customers: priorityCustomers.length,
      at_risk_deals: dealsAtRisk.length,
      overdue_followups: followupsDue.filter((task) => validDate(task.due_at) < now).length,
      qualification_issues: qualificationAttention.length,
      reactivation_candidates: reactivation.length,
      human_actions_today: todayTopActions.length,
    }),
    lifecycle_availability: DAILY_BRIEF_LIFECYCLE_AVAILABILITY,
    safety: DAILY_BRIEF_SAFETY,
  });
}

export async function loadDailySalesBrief(actor, { reference_time } = {}) {
  const [customers, inquiries, activities, tasks] = await Promise.all([
    supabaseRequest(applyOwnerScope("customers?select=*&is_demo=eq.false&order=updated_at.desc&limit=500", actor)),
    supabaseRequest(applyOwnerScope("inquiries?select=*&is_demo=eq.false&order=updated_at.desc&limit=500", actor)),
    supabaseRequest(applyOwnerScope("activities?select=*&order=created_at.desc&limit=500", actor)),
    supabaseRequest(applyOwnerScope("tasks?select=*&status=in.(open,doing)&order=due_at.asc.nullslast&limit=500", actor)),
  ]);
  const whatsappInquiryIds = inquiries
    .filter((inquiry) => inquiry.site === "cappuccinobag" && inquiry.source_channel === "whatsapp")
    .map((inquiry) => inquiry.id)
    .filter(Boolean)
    .slice(0, 100);
  let messages = [];
  if (whatsappInquiryIds.length) {
    const inquiryFilter = whatsappInquiryIds.map(encodeURIComponent).join(",");
    const conversations = await supabaseRequest(
      `conversations?select=id,inquiry_id&inquiry_id=in.(${inquiryFilter})&order=updated_at.desc&limit=500`,
    ).catch(() => []);
    const inquiryByConversation = new Map(conversations.map((row) => [row.id, row.inquiry_id]));
    const conversationIds = conversations.map((row) => row.id).filter(Boolean).slice(0, 100);
    if (conversationIds.length) {
      const conversationFilter = conversationIds.map(encodeURIComponent).join(",");
      const rows = await supabaseRequest(
        `messages?select=id,conversation_id,direction,body,provider_timestamp,created_at&conversation_id=in.(${conversationFilter})&order=created_at.asc&limit=500`,
      ).catch(() => []);
      messages = rows.map((row) => ({ ...row, inquiry_id: inquiryByConversation.get(row.conversation_id) || null }));
    }
  }
  return generateDailySalesBrief({ customers, inquiries, activities, tasks, messages, reference_time });
}
