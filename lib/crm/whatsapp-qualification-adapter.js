import { qualifySalesOpportunity } from "./qualification.js";

const SOURCE_TYPE = "future_whatsapp_adapter";
const PLACEHOLDER_VALUES = new Set([
  "", "-", "--", "—", "n/a", "na", "none", "not specified", "null", "other", "tbd", "unknown", "undefined",
]);

export const WHATSAPP_QUALIFICATION_OUTPUT_CLASSIFICATION = Object.freeze({
  source_context: "EXISTING_FIELD",
  messages: "EXISTING_FIELD",
  facts: "DERIVED_RUNTIME",
  qualification_topics: "DERIVED_RUNTIME",
  qualification: "DERIVED_RUNTIME",
  operational_lead_score: "EXISTING_FIELD",
  shadow_score: "DERIVED_RUNTIME",
  next_question: "DERIVED_RUNTIME",
  human_handoff: "ACTIVITY_CANDIDATE",
  follow_up: "TASK_CANDIDATE",
  media_qualification: "DEFERRED",
  historical_qualification_snapshot: "FUTURE_SCHEMA_REQUIRED",
});

function clean(value, max = 4000) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(/\0/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  return normalized && !PLACEHOLDER_VALUES.has(normalized.toLowerCase()) ? normalized : null;
}

function inboundMessages(inquiry, messages) {
  const seen = new Set();
  const result = [];
  for (const message of Array.isArray(messages) ? messages : []) {
    if (message?.direction !== "inbound") continue;
    const body = clean(message.body);
    if (!body || seen.has(body)) continue;
    seen.add(body);
    result.push(Object.freeze({
      id: message.id || null,
      body,
      observed_at: message.provider_timestamp || message.created_at || null,
    }));
  }
  const initial = clean(inquiry.message);
  if (!result.length && initial) {
    result.push(Object.freeze({ id: null, body: initial, observed_at: inquiry.created_at || null }));
  }
  return result;
}

function productFrom(text) {
  const products = [
    ["Padel Bag", "padel"],
    ["Pickleball Bag", "pickleball"],
    ["Tennis Bag", "tennis"],
    ["Baseball Bag", "baseball"],
    ["Hockey Bag", "hockey"],
    ["Travel Bag", "travel"],
    ["Duffel Bag", "duff(?:el|le)"],
    ["Weekender Bag", "weekend(?:er)?"],
    ["Backpack", "backpack"],
    ["Leather Bag", "leather"],
  ];
  for (const [label, token] of products) {
    const beforeBag = new RegExp(`\\b${token}\\b[^.!?\\n]{0,32}\\bbags?\\b`, "i");
    const afterBag = new RegExp(`\\bbags?\\b[^.!?\\n]{0,24}\\b${token}\\b`, "i");
    if (beforeBag.test(text) || afterBag.test(text) || label === "Backpack" && /\bbackpacks?\b/i.test(text)) return label;
  }
  return null;
}

function quantityFrom(text) {
  const match = text.match(/\b(\d{1,3}(?:,\d{3})+|\d{1,7})\s+(?:[a-z-]+\s+){0,3}(?:pcs?|pieces?|units?|bags?)\b/i);
  if (!match) return null;
  const prefix = text.slice(Math.max(0, match.index - 24), match.index).toLowerCase();
  if (/(?:price|budget|usd|eur|gbp|rmb|\$|€|£)\s*$/.test(prefix)) return null;
  return match[1].replace(/,/g, "");
}

const MARKET_ALIASES = Object.freeze([
  ["United Kingdom", /^(?:the\s+)?(?:uk|u\.k\.|united kingdom|britain)\b/i],
  ["United States", /^(?:the\s+)?(?:us|u\.s\.|usa|united states)\b/i],
  ["Germany", /^germany\b/i],
  ["France", /^france\b/i],
  ["Canada", /^canada\b/i],
  ["Australia", /^australia\b/i],
  ["Netherlands", /^(?:the\s+)?netherlands\b/i],
  ["Spain", /^spain\b/i],
  ["Italy", /^italy\b/i],
  ["Japan", /^japan\b/i],
  ["South Korea", /^(?:south korea|korea)\b/i],
  ["United Arab Emirates", /^(?:the\s+)?(?:uae|united arab emirates)\b/i],
]);

function canonicalMarket(value) {
  const candidate = clean(value, 80);
  if (!candidate) return null;
  return MARKET_ALIASES.find(([, pattern]) => pattern.test(candidate))?.[0] || null;
}

function targetMarketFrom(text) {
  const patterns = [
    /\b(?:target|destination|selling)\s+market\s*(?:is|:|=)?\s+([^,.!?;]{2,80})/i,
    /\b(?:sell|selling|distribute|distributing)\s+(?:mainly\s+|primarily\s+)?(?:in|to)\s+([^,.!?;]{2,80})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const market = canonicalMarket(match?.[1]);
    if (market) return market;
  }
  return null;
}

function materialFrom(text) {
  const materials = [
    ["Recycled polyester", /\brecycled polyester\b/i],
    ["Polyester", /\bpolyester\b/i],
    ["Nylon", /\bnylon\b/i],
    ["Genuine leather", /\bgenuine leather\b/i],
    ["Vegan leather", /\bvegan leather\b/i],
    ["PU leather", /\bpu leather\b/i],
    ["Canvas", /\bcanvas\b/i],
    ["EVA", /\beva\b/i],
  ];
  return materials.find(([, pattern]) => pattern.test(text))?.[0] || null;
}

function dimensionsFrom(text) {
  const match = text.match(/\b(\d+(?:\.\d+)?\s*(?:cm|mm|in|inch(?:es)?)?\s*[x×]\s*\d+(?:\.\d+)?\s*(?:cm|mm|in|inch(?:es)?)?(?:\s*[x×]\s*\d+(?:\.\d+)?\s*(?:cm|mm|in|inch(?:es)?)?)?)/i);
  return clean(match?.[1], 120);
}

function logoFrom(text) {
  if (/\b(?:no|without)\s+(?:custom\s+)?logo\b/i.test(text)) return "Not required";
  if (/\b(?:our|custom|printed|embroidered|embossed)\s+logo\b|\blogo\s+(?:required|needed|customization)\b/i.test(text)) return "Required";
  return null;
}

function targetPriceFrom(text) {
  const match = text.match(/\b(?:target price|target cost|budget)\s*(?:(?:is|of|:|=)\s*)?(?:(?:around|about)\s*)?((?:usd|us\$|eur|gbp|rmb|\$|€|£)\s*\d+(?:\.\d+)?(?:\s*(?:each|per\s+(?:piece|unit)))?)/i);
  return clean(match?.[1], 120);
}

function timelineFrom(text) {
  const match = text.match(/\b(?:need(?:ed)?|deliver(?:y)?|launch|ready)\s+(?:them\s+|it\s+)?(?:by|before|in)\s+([^,.!?;]{2,80})/i);
  return clean(match?.[1], 120);
}

function complianceFrom(text) {
  const standards = text.match(/\b(?:reach|rohs|cpsia|prop(?:osition)?\s*65|ce|grs|bsci|sedex)\b/gi);
  if (standards?.length) return [...new Set(standards.map((item) => item.toUpperCase()))].join(", ");
  if (/\b(?:compliance|certification|testing)\s+(?:is\s+)?(?:required|needed)\b/i.test(text)) return "Compliance review required";
  return null;
}

function sampleFrom(text) {
  if (/\b(?:no|without)\s+(?:a\s+)?sample\b/i.test(text)) return "Not required";
  if (/\b(?:need|want|require|request)(?:ing)?\s+(?:a\s+)?(?:prototype|sample)\b|\b(?:prototype|sample)\s+(?:is\s+)?(?:required|needed)\b/i.test(text)) return "Required";
  return null;
}

const EXTRACTORS = Object.freeze({
  product: productFrom,
  quantity: quantityFrom,
  target_market: targetMarketFrom,
  material: materialFrom,
  dimensions_specification: dimensionsFrom,
  logo_customization: logoFrom,
  budget_or_target_price: targetPriceFrom,
  timeline: timelineFrom,
  compliance: complianceFrom,
  sample_requirement: sampleFrom,
});

function normalizedComparison(field, value) {
  if (field === "quantity") return String(value).replace(/\D/g, "");
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function directFact(field, observations) {
  if (!observations.length) return undefined;
  const distinct = new Map();
  for (const observation of observations) {
    distinct.set(normalizedComparison(field, observation.value), observation.value);
  }
  const evidence = observations.map((observation) => Object.freeze({
    value: `Customer WhatsApp message: "${observation.message.body.slice(0, 320)}"`,
    source: "whatsapp_message",
    observed_at: observation.message.observed_at,
  }));
  if (distinct.size > 1) {
    return Object.freeze({
      value: "CONFLICTED",
      status: "UNKNOWN",
      state: "CONFLICTED",
      source: SOURCE_TYPE,
      confidence: 0,
      evidence: Object.freeze(evidence),
    });
  }
  return Object.freeze({
    value: observations.at(-1).value,
    status: "FACT",
    state: "CUSTOMER_CONFIRMED",
    source: SOURCE_TYPE,
    confidence: 1,
    evidence: Object.freeze(evidence),
  });
}

function aliasFacts(facts) {
  const result = { ...facts };
  if (facts.quantity) result.estimated_quantity = facts.quantity;
  if (facts.target_market) result.country_market = facts.target_market;
  if (facts.material) result.material_interest = facts.material;
  if (facts.logo_customization) result.customization_need = facts.logo_customization;
  if (facts.compliance) result.compliance_requirement = facts.compliance;
  if (facts.sample_requirement) result.sample_interest = facts.sample_requirement;
  return result;
}

export function isCanonicalCappuccinoWhatsAppInquiry(inquiry = {}) {
  return inquiry.site === "cappuccinobag" && inquiry.source_channel === "whatsapp";
}

export function buildWhatsAppQualificationInput({ inquiry = {}, customer = {}, messages = [] } = {}) {
  if (!isCanonicalCappuccinoWhatsAppInquiry(inquiry)) {
    throw new Error("BUILD 02-C supports only the canonical Cappuccino WhatsApp inquiry path.");
  }
  const directMessages = inboundMessages(inquiry, messages);
  const facts = {};
  for (const [field, extractor] of Object.entries(EXTRACTORS)) {
    const observations = directMessages
      .map((message) => ({ value: extractor(message.body), message }))
      .filter((item) => item.value !== null && item.value !== undefined);
    const fact = directFact(field, observations);
    if (fact) facts[field] = fact;
  }
  const aliasedFacts = aliasFacts(facts);
  const directProduct = facts.product?.state === "CUSTOMER_CONFIRMED" ? facts.product.value : null;
  const lead = {
    ...customer,
    ...inquiry,
    customer_id: inquiry.customer_id || customer.id || null,
    inquiry_id: inquiry.id || null,
    source: inquiry.source || inquiry.source_channel || customer.source || null,
    score_override: customer.score_override ?? inquiry.score_override ?? null,
    product_keywords: directProduct
      ? [directProduct]
      : Array.isArray(customer.product_keywords) ? customer.product_keywords : [],
    whatsapp: inquiry.whatsapp || customer.whatsapp_phone || null,
    website: customer.website || customer.company_website || null,
  };
  return Object.freeze({
    customer_id: lead.customer_id,
    inquiry_id: lead.inquiry_id,
    source: lead.source,
    source_type: SOURCE_TYPE,
    lead: Object.freeze(lead),
    customer: Object.freeze({ ...customer }),
    facts: Object.freeze(aliasedFacts),
    current_stage: inquiry.stage || customer.stage || "new",
    owner: inquiry.owner || inquiry.assigned_owner || customer.owner || null,
    conversation_history: directMessages.map((message) => message.body).join("\n"),
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

export function qualifyWhatsAppInquiry(context = {}) {
  const input = buildWhatsAppQualificationInput(context);
  return Object.freeze({
    adapter: "BUILD_02_C_CAPPUCCINO_WHATSAPP_V1",
    mode: "read_compute_return",
    intake_context: Object.freeze({
      customer_id: input.customer_id,
      inquiry_id: input.inquiry_id,
      source: input.source,
      source_type: input.source_type,
      site: input.lead.site,
      owner: input.owner,
      stage: input.current_stage,
      message_scope: "same_inquiry_inbound_only",
    }),
    qualification: qualifySalesOpportunity(input),
    output_classification: WHATSAPP_QUALIFICATION_OUTPUT_CLASSIFICATION,
    safety: Object.freeze({
      outbound: "disabled",
      persistence: "none",
      task_persistence: "blocked",
      next_question: "recommendation_only",
      media_qualification: "deferred",
      migration_required: false,
      production_write: false,
    }),
  });
}
