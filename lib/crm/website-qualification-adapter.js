import { qualifySalesOpportunity } from "./qualification.js";

export const WEBSITE_QUALIFICATION_OUTPUT_CLASSIFICATION = Object.freeze({
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

function clean(value, max = 4000) {
  if (value === null || value === undefined || value === "") return null;
  return String(value).replace(/\0/g, "").trim().slice(0, max) || null;
}

const PLACEHOLDER_VALUES = new Set([
  "-", "—", "n/a", "na", "none", "not applicable", "null", "other", "tbd", "unknown", "undefined",
]);

function evidenceValue(value) {
  const normalized = clean(value);
  return normalized && !PLACEHOLDER_VALUES.has(normalized.toLowerCase()) ? normalized : null;
}

function messageValue(message, labels) {
  const lines = String(message || "").split(/\r?\n/);
  for (const label of labels) {
    const prefix = `${label.toLowerCase()}:`;
    const line = lines.find((candidate) => candidate.trim().toLowerCase().startsWith(prefix));
    if (line) return clean(line.trim().slice(prefix.length));
  }
  return null;
}

function customerConfirmedFact(value, field) {
  const normalized = evidenceValue(value);
  if (!normalized) return undefined;
  return Object.freeze({
    value: normalized,
    status: "FACT",
    state: "CUSTOMER_CONFIRMED",
    source: "website_inquiry",
    confidence: 1,
    evidence: Object.freeze([{
      value: `Customer supplied ${field} in the website inquiry.`,
      source: "website_inquiry",
    }]),
  });
}

function compactFacts(entries) {
  return Object.fromEntries(entries.filter(([, value]) => value !== undefined));
}

export function isCanonicalCappuccinoWebsiteInquiry(inquiry = {}) {
  return inquiry.site === "cappuccinobag" && inquiry.source_channel === "website";
}

export function buildWebsiteQualificationInput({ inquiry = {}, customer = {} } = {}) {
  if (!isCanonicalCappuccinoWebsiteInquiry(inquiry)) {
    throw new Error("BUILD 02-B supports only the canonical Cappuccino website inquiry path.");
  }

  const targetMarket = evidenceValue(inquiry.target_market)
    || evidenceValue(messageValue(inquiry.message, ["Target market"]));
  const dimensions = evidenceValue(inquiry.dimensions_specification || inquiry.target_dimensions)
    || evidenceValue(messageValue(inquiry.message, ["Dimensions/specification", "Target dimensions"]));
  const sampleRequirement = evidenceValue(inquiry.sample_requirement || inquiry.sample_interest)
    || evidenceValue(messageValue(inquiry.message, ["Sample requirement", "Sample"]));
  const compliance = evidenceValue(inquiry.compliance || inquiry.compliance_requirement)
    || evidenceValue(messageValue(inquiry.message, ["Compliance requirement", "Compliance"]));
  const timeline = evidenceValue(inquiry.timeline || inquiry.target_delivery_date)
    || evidenceValue(messageValue(inquiry.message, ["Timeline", "Target delivery date"]));
  const directProduct = evidenceValue(inquiry.product);
  const productCategory = evidenceValue(inquiry.product_category);
  const product = directProduct || productCategory;
  const quantity = evidenceValue(inquiry.quantity);
  const material = evidenceValue(inquiry.material);
  const logo = evidenceValue(inquiry.logo_method);
  const customization = evidenceValue(inquiry.customization);
  const targetPrice = evidenceValue(inquiry.target_price);
  const companyName = evidenceValue(inquiry.company);
  const countryMarket = targetMarket || evidenceValue(inquiry.country);

  const facts = compactFacts([
    ["product", customerConfirmedFact(product, "product")],
    ["product_category", customerConfirmedFact(productCategory, "product category")],
    ["quantity", customerConfirmedFact(quantity, "quantity")],
    ["estimated_quantity", customerConfirmedFact(quantity, "quantity")],
    ["target_market", customerConfirmedFact(targetMarket, "target market")],
    ["country_market", customerConfirmedFact(countryMarket, "country or target market")],
    ["material", customerConfirmedFact(material, "material")],
    ["material_interest", customerConfirmedFact(material, "material")],
    ["dimensions_specification", customerConfirmedFact(dimensions, "dimensions or specification")],
    ["logo_customization", customerConfirmedFact(logo, "logo method")],
    ["customization_need", customerConfirmedFact(customization || logo, "customization")],
    ["budget_or_target_price", customerConfirmedFact(targetPrice, "target price")],
    ["timeline", customerConfirmedFact(timeline, "timeline")],
    ["compliance", customerConfirmedFact(compliance, "compliance requirement")],
    ["compliance_requirement", customerConfirmedFact(compliance, "compliance requirement")],
    ["sample_requirement", customerConfirmedFact(sampleRequirement, "sample requirement")],
    ["sample_interest", customerConfirmedFact(sampleRequirement, "sample requirement")],
    ["company_name", customerConfirmedFact(companyName, "company name")],
  ]);

  const lead = {
    ...customer,
    ...inquiry,
    customer_id: inquiry.customer_id || customer.id || null,
    inquiry_id: inquiry.id || null,
    source: inquiry.source || inquiry.source_channel || customer.source || null,
    score_override: customer.score_override ?? inquiry.score_override ?? null,
    product_keywords: Array.isArray(customer.product_keywords) && customer.product_keywords.length
      ? customer.product_keywords
      : product ? [product] : [],
    whatsapp: inquiry.whatsapp || customer.whatsapp_phone || null,
    website: customer.website || customer.company_website || null,
  };

  return Object.freeze({
    customer_id: lead.customer_id,
    inquiry_id: lead.inquiry_id,
    source: lead.source,
    source_type: "website_inquiry",
    lead: Object.freeze(lead),
    customer: Object.freeze({ ...customer }),
    facts: Object.freeze(facts),
    current_stage: inquiry.stage || customer.stage || "new",
    owner: inquiry.owner || inquiry.assigned_owner || customer.owner || null,
    conversation_history: clean(inquiry.message),
    human_override: Object.freeze({
      customer_tier: customer.customer_tier ?? null,
      strategic_account: customer.strategic_account ?? null,
      million_dollar_potential: customer.million_dollar_potential ?? null,
      strategic_value: customer.strategic_value ?? null,
      closing_urgency: customer.closing_urgency ?? null,
      brand_level: customer.brand_level ?? null,
      annual_purchase_potential: customer.annual_purchase_potential ?? null,
    }),
  });
}

export function qualifyWebsiteInquiry(context = {}) {
  const input = buildWebsiteQualificationInput(context);
  const qualification = qualifySalesOpportunity(input);
  const lead = input.lead;
  return Object.freeze({
    adapter: "BUILD_02_B_CAPPUCCINO_WEBSITE_V1",
    mode: "read_compute_return",
    intake_context: Object.freeze({
      customer_id: input.customer_id,
      inquiry_id: input.inquiry_id,
      source: input.source,
      source_type: input.source_type,
      site: lead.site,
      owner: input.owner,
      stage: input.current_stage,
      referrer: lead.referrer ?? null,
      utm_source: lead.utm_source ?? null,
      utm_medium: lead.utm_medium ?? null,
      utm_campaign: lead.utm_campaign ?? null,
      gclid: lead.gclid ?? null,
      msclkid: lead.msclkid ?? null,
      alibaba_reference: lead.alibaba_reference ?? null,
    }),
    qualification,
    output_classification: WEBSITE_QUALIFICATION_OUTPUT_CLASSIFICATION,
    safety: Object.freeze({
      outbound: "disabled",
      persistence: "none",
      task_persistence: "blocked",
      next_question: "recommendation_only",
      migration_required: false,
      production_write: false,
    }),
  });
}
