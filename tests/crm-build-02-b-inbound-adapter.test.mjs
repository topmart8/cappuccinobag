import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ingestSharedInquiry, mapSharedInquiryPayload } from "../lib/crm/shared-ingest.js";
import {
  WEBSITE_QUALIFICATION_OUTPUT_CLASSIFICATION,
  buildWebsiteQualificationInput,
  isCanonicalCappuccinoWebsiteInquiry,
  qualifyWebsiteInquiry,
} from "../lib/crm/website-qualification-adapter.js";

const SUBMISSION_ID = "33333333-3333-4333-8333-333333333333";

function websiteRaw() {
  return {
    submission_id: SUBMISSION_ID,
    name: "Priya Buyer",
    company: "UK Padel Supply Ltd",
    email: "priya@example.com",
    product: "Custom Padel Bag",
    product_category: "Custom Padel Bag",
    quantity: "500",
    target_market: "UK",
    logo_method: "Custom logo required",
    message: "Sample requirement: Yes",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "uk-padel-rfq",
    referrer: "https://www.google.com/",
    gclid: "gclid-02-b",
  };
}

function canonicalWebsiteInquiry(overrides = {}) {
  const mapped = mapSharedInquiryPayload("cappuccino", websiteRaw());
  return {
    ...mapped,
    id: "inquiry-02-b",
    customer_id: "customer-02-b",
    inquiry_number: "CAP-20260828-0001",
    stage: "new",
    owner: "sales@example.com",
    ...overrides,
  };
}

test("BUILD 02-B selects only the canonical Cappuccino website inquiry path", () => {
  assert.equal(isCanonicalCappuccinoWebsiteInquiry(canonicalWebsiteInquiry()), true);
  assert.equal(isCanonicalCappuccinoWebsiteInquiry({ site: "novlane", source_channel: "website" }), false);
  assert.equal(isCanonicalCappuccinoWebsiteInquiry({ site: "cappuccinobag", source_channel: "whatsapp" }), false);
  assert.throws(
    () => buildWebsiteQualificationInput({ inquiry: { site: "novlane", source_channel: "website" } }),
    /only the canonical Cappuccino website inquiry path/,
  );
});

test("website adapter preserves canonical identity, source and attribution", () => {
  const input = buildWebsiteQualificationInput({
    inquiry: canonicalWebsiteInquiry(),
    customer: {
      id: "customer-02-b",
      customer_number: "CUS-0002",
      score_override: 72,
      website: "https://ukpadelsupply.example",
    },
  });
  assert.equal(input.customer_id, "customer-02-b");
  assert.equal(input.inquiry_id, "inquiry-02-b");
  assert.equal(input.source_type, "website_inquiry");
  assert.equal(input.lead.utm_source, "google");
  assert.equal(input.lead.utm_campaign, "uk-padel-rfq");
  assert.equal(input.lead.referrer, "https://www.google.com/");
  assert.equal(input.lead.gclid, "gclid-02-b");
  assert.equal(input.lead.score_override, 72);
});

test("required website RFQ flows through shared ingest, Qualification and Sales Brain without new persistence", async () => {
  let canonicalWorkflowWrites = 0;
  let internalNotificationRuns = 0;
  const saved = await ingestSharedInquiry({
    siteSource: "cappuccino",
    raw: websiteRaw(),
  }, {
    findExisting: async () => null,
    createDraft: async () => ({
      lead_score: 58,
      intent: "product_inquiry",
      risk_level: "low",
      human_review_required: false,
      customer_summary: "UK Padel Supply Ltd requested 500 custom padel bags.",
      recommended_action: "Review the qualification recommendation.",
      reply_body: "Draft for human review only.",
      model: "rules-test",
    }),
    createStored: async (input) => ({
      customer: {
        id: "customer-02-b",
        customer_number: "CUS-0002",
        score_override: 72,
        stage: "new",
        website: "https://ukpadelsupply.example",
      },
      inquiry: {
        ...input,
        id: "inquiry-02-b",
        customer_id: "customer-02-b",
        inquiry_number: "CAP-20260828-0001",
        stage: "new",
        owner: "sales@example.com",
      },
      idempotent: false,
    }),
    persistWorkflow: async () => { canonicalWorkflowWrites += 1; },
    deliverEmails: async () => { internalNotificationRuns += 1; return "sent"; },
    setEmailStatus: async () => {},
  });

  const result = qualifyWebsiteInquiry({
    inquiry: saved.inquiry,
    customer: saved.customer,
  });
  const qualification = result.qualification;

  assert.equal(saved.customer.id, "customer-02-b");
  assert.equal(saved.inquiry.id, "inquiry-02-b");
  assert.equal(canonicalWorkflowWrites, 1, "existing canonical workflow remains intact");
  assert.equal(internalNotificationRuns, 1, "existing internal notification remains intact");
  assert.equal(result.adapter, "BUILD_02_B_CAPPUCCINO_WEBSITE_V1");
  assert.equal(result.mode, "read_compute_return");
  assert.equal(result.intake_context.customer_id, "customer-02-b");
  assert.equal(result.intake_context.inquiry_id, "inquiry-02-b");
  assert.equal(qualification.contract_version, "BUILD_02_A1_V1");
  assert.equal(qualification.source_type, "website_inquiry");
  assert.equal(qualification.facts.product.value, "Custom Padel Bag");
  assert.equal(qualification.facts.estimated_quantity.value, "500");
  assert.equal(qualification.facts.target_market.value, "UK");
  assert.equal(qualification.facts.logo_customization.value, "Custom logo required");
  assert.equal(qualification.facts.sample_requirement.value, "Yes");
  assert.equal(qualification.facts.product.state, "CUSTOMER_CONFIRMED");

  for (const field of [
    "material", "dimensions_specification", "budget_or_target_price", "timeline", "compliance",
  ]) {
    assert.equal(qualification.facts[field].status, "UNKNOWN", `${field} must remain UNKNOWN`);
  }

  assert.equal(qualification.next_question.missing_fact, "material");
  assert.match(qualification.next_question.next_question, /material/i);
  assert.equal(qualification.operational_lead_score.final, 72);
  assert.equal(qualification.shadow_score.mode, "shadow_only");
  assert.equal(qualification.shadow_score.operational_source_of_truth, "existing_score");
  assert.equal(qualification.human_handoff.mode, "recommendation_only");
  assert.equal(qualification.integration_targets.tasks, "recommendation_target_only");
  assert.equal(qualification.safety.outbound, "disabled");
  assert.equal(qualification.safety.persistence, "none");
  assert.equal(result.safety.task_persistence, "blocked");
  assert.equal(result.safety.next_question, "recommendation_only");
  assert.equal(result.safety.migration_required, false);
});

test("output handling is classified without inventing a persistence destination", () => {
  assert.deepEqual(WEBSITE_QUALIFICATION_OUTPUT_CLASSIFICATION, {
    source_context: "EXISTING_FIELD",
    operational_lead_score: "EXISTING_FIELD",
    facts: "DERIVED_RUNTIME",
    qualification_topics: "DERIVED_RUNTIME",
    qualification: "DERIVED_RUNTIME",
    customer_priority: "DERIVED_RUNTIME",
    shadow_score: "DERIVED_RUNTIME",
    next_best_action: "DERIVED_RUNTIME",
    next_question: "DERIVED_RUNTIME",
    script_plan: "DERIVED_RUNTIME",
    human_handoff: "ACTIVITY_CANDIDATE",
    follow_up: "TASK_CANDIDATE",
    historical_qualification_snapshot: "FUTURE_SCHEMA_REQUIRED",
  });
});

test("adapter and CRM surface contain no sender, Supabase write or task persistence", async () => {
  const adapter = await readFile(
    new URL("../lib/crm/website-qualification-adapter.js", import.meta.url),
    "utf8",
  );
  const page = await readFile(
    new URL("../app/crm/inquiries/[id]/page.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(adapter, /supabaseRequest|sendCloudMessage|resend|fetch\s*\(|follow_up_tasks/);
  assert.doesNotMatch(adapter, /method:\s*["'](?:POST|PATCH|PUT|DELETE)["']/);
  assert.match(page, /只读计算 · 不发送消息 · 不创建任务/);
  assert.match(page, /isCanonicalCappuccinoWebsiteInquiry/);
});
