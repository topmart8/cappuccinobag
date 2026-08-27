import { recommendCustomerPriority } from "./customer-intelligence.js";
import { recommendFollowUp } from "./follow-up.js";
import { getHunterQualificationProfile } from "./hunter-qualification-profiles.js";
import { recommendNextBestAction } from "./next-best-action.js";
import { mapProductTaxonomy } from "./product-taxonomy.js";
import { getSalesPlaybook } from "./sales-playbooks.js";
import { evaluateLeadScoreShadow, scoreLead } from "./scoring.js";
import { evaluateCompanyPolicy, validateRequirementConfirmationGate } from "./sales-policy.js";
import { planSalesScript } from "./script-library.js";

export const QUALIFICATION_FACT_STATUSES = Object.freeze(["FACT", "INFERRED", "UNKNOWN"]);
export const QUALIFICATION_FACT_STATES = Object.freeze([
  "UNKNOWN",
  "INFERRED",
  "CUSTOMER_CONFIRMED",
  "HUMAN_CONFIRMED",
  "CONFLICTED",
]);
export const QUALIFICATION_INPUT_SOURCES = Object.freeze([
  "website_inquiry",
  "alibaba_inquiry",
  "manual_crm_entry",
  "email_derived_structured_facts",
  "future_whatsapp_adapter",
  "image_analysis_result",
  "conversation_summary",
]);

export const QUALIFICATION_FACT_FIELDS = Object.freeze([
  "product",
  "quantity",
  "material",
  "dimensions_specification",
  "logo_customization",
  "budget_or_target_price",
  "compliance",
  "sample_requirement",
  "customer_type",
  "company_name",
  "brand_status",
  "website_present",
  "sales_channel_present",
  "country_market",
  "product_family",
  "product_category",
  "estimated_quantity",
  "quantity_band",
  "OEM_or_ODM",
  "development_stage",
  "target_market",
  "timeline",
  "material_interest",
  "customization_need",
  "sample_interest",
  "repeat_order_potential",
  "annual_purchase_potential",
  "strategic_account_signal",
  "million_dollar_potential_signal",
  "buying_intent",
  "price_only_signal",
  "low_quantity_signal",
  "risk_signal",
  "racket_type",
  "racket_capacity",
  "shoe_compartment",
  "ball_tube_or_bottle",
  "backpack_straps",
  "bat_capacity",
  "helmet_or_shoe_compartments",
  "team_branding",
  "player_number",
  "fence_hook_or_wheels",
  "use_case",
  "leather_type",
  "hardware",
  "lining",
  "construction",
  "edge_paint",
  "color_moq",
  "market_positioning",
  "laptop_size",
  "structure",
  "compartments",
  "shoulder_strap",
  "compliance_requirement",
]);

export const QUALIFICATION_TOPICS = Object.freeze({
  product: Object.freeze(["product", "product_category", "product_family"]),
  quantity: Object.freeze(["quantity", "estimated_quantity", "quantity_band"]),
  target_market: Object.freeze(["target_market"]),
  material: Object.freeze(["material", "material_interest", "leather_type"]),
  dimensions_specification: Object.freeze([
    "dimensions_specification", "construction", "structure", "compartments", "laptop_size",
    "racket_capacity", "bat_capacity", "helmet_or_shoe_compartments",
  ]),
  logo_customization: Object.freeze(["logo_customization", "customization_need", "team_branding"]),
  budget_or_target_price: Object.freeze(["budget_or_target_price"]),
  timeline: Object.freeze(["timeline"]),
  compliance: Object.freeze(["compliance", "compliance_requirement"]),
  sample_requirement: Object.freeze(["sample_requirement", "sample_interest"]),
});

const STATUS_VALUES = new Set(QUALIFICATION_FACT_STATUSES);
const STATE_VALUES = new Set(QUALIFICATION_FACT_STATES);
const TRUE_VALUES = new Set([true, "true", "yes", "known", "present", "strong", "high"]);
const CORE_MARKETS = new Set([
  "united states", "usa", "canada", "united kingdom", "uk", "germany", "france",
  "netherlands", "australia", "japan", "south korea", "spain", "italy", "uae",
]);

const PLAYBOOK_BY_FAMILY = Object.freeze({
  RACKET_SPORTS: "PAD",
  TEAM_SPORTS: "BASE",
  LEATHER: "LEAW",
  TRAVEL: "MEN_TRAVEL",
});

const FAMILY_ALIASES = Object.freeze({
  PAD: "RACKET_SPORTS",
  PADEL: "RACKET_SPORTS",
  RACKET_SPORTS: "RACKET_SPORTS",
  BASE: "TEAM_SPORTS",
  BASEBALL: "TEAM_SPORTS",
  TEAM_SPORTS: "TEAM_SPORTS",
  LEAW: "LEATHER",
  LEATHER: "LEATHER",
  MEN_TRAVEL: "TRAVEL",
  TRAVEL: "TRAVEL",
});

const TOPIC_QUESTION_PRIORITY = Object.freeze([
  ["product", "What product or bag type should we evaluate?", "Product identity changes taxonomy, playbook and specification questions."],
  ["quantity", "What first-order quantity or quantity range should we evaluate?", "Quantity materially changes qualification and the next commercial review."],
  ["target_market", "Which destination or selling market is this project for?", "Target market affects product and compliance discovery."],
  ["material", "What requested or preferred material should we evaluate?", "Material direction changes product and compliance discovery."],
  ["dimensions_specification", "What dimensions, construction, compartments or major specifications are required?", "Major specifications are needed before feasibility can be reviewed by a human."],
  ["logo_customization", "What logo, branding, colors, hardware or other customization is required?", "Customization scope changes the product review without creating a commitment."],
  ["budget_or_target_price", "Has the customer supplied a budget or target price for human commercial review?", "A customer-supplied target helps review fit, but AI must not invent or approve a price."],
  ["timeline", "What launch, sample, order or delivery timing is desired?", "Timeline helps prioritize the next human-reviewed action without promising delivery."],
  ["compliance", "What testing, certification or compliance requirements must be reviewed?", "Compliance requests require evidence and human review; they are never guaranteed by AI."],
  ["sample_requirement", "Is a prototype or sample required before the next decision?", "Sample need changes the next safe sales step."],
]);

const GENERIC_QUESTION_PRIORITY = Object.freeze([
  ["company_name", "What company or organization is this project for?", "Company identity is needed to distinguish a business project from personal purchasing."],
  ["customer_type", "What is your role in this project: brand, retailer, distributor, team, hotel group or another buyer type?", "Buyer role changes qualification and the appropriate playbook."],
  ["brand_status", "Is this for your own brand or an established sales program?", "Verified brand context affects strategic review without replacing evidence."],
  ["OEM_or_ODM", "Are you looking for OEM customization, ODM development, or an existing design direction?", "OEM/ODM intent determines the next discovery path."],
  ["development_stage", "What stage is the project at: idea, development, sampling, quotation review or order planning?", "Development stage changes the next decision and urgency."],
]);

const PRODUCT_QUESTIONS = Object.freeze({
  RACKET_SPORTS: Object.freeze([
    ["racket_type", "Which racket sport is this bag for: padel, pickleball or tennis?"],
    ["racket_capacity", "How many rackets should the bag carry?"],
    ["shoe_compartment", "Is a separate shoe compartment required?"],
    ["ball_tube_or_bottle", "Should the layout include space for a ball tube or bottle?"],
    ["backpack_straps", "Are backpack straps required?"],
    ["customization_need", "Which branding or customization points should be reviewed?"],
    ["sample_interest", "Do you need a prototype or sample review before the next decision?"],
  ]),
  TEAM_SPORTS: Object.freeze([
    ["bat_capacity", "How many bats should the bag carry?"],
    ["helmet_or_shoe_compartments", "Are separate helmet or shoe compartments required?"],
    ["team_branding", "What team branding or player identification is required?"],
    ["player_number", "How many players or team sets should the project support?"],
    ["fence_hook_or_wheels", "Does the bag need a fence hook or wheels?"],
    ["use_case", "Is the intended use league, retail, club or team supply?"],
  ]),
  LEATHER: Object.freeze([
    ["leather_type", "Which leather or alternative material should be evaluated?"],
    ["hardware", "What hardware direction is required?"],
    ["lining", "What lining requirement is known?"],
    ["construction", "What construction or silhouette should be evaluated?"],
    ["edge_paint", "Is a specific edge-paint finish required?"],
    ["color_moq", "How many colors or color variants should be reviewed for MOQ feasibility?"],
    ["sample_interest", "Do you require a prototype or sample?"],
    ["market_positioning", "What target retail or market positioning is explicitly planned?"],
  ]),
  TRAVEL: Object.freeze([
    ["use_case", "Is the primary use business, commuting or travel?"],
    ["laptop_size", "What laptop size should the bag accommodate?"],
    ["material_interest", "What material direction should be evaluated?"],
    ["structure", "Should the bag be structured or flexible?"],
    ["compartments", "Which compartments are essential?"],
    ["shoulder_strap", "Is a removable shoulder strap required?"],
  ]),
});

function clean(value, max = 1000) {
  if (value === null || value === undefined || value === "") return null;
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max) || null;
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEvidence(evidence) {
  if (!Array.isArray(evidence)) return [];
  return evidence.slice(0, 20).map((item) => {
    if (typeof item === "string") return { value: clean(item), source: null };
    return {
      value: clean(item?.value || item?.summary),
      source: clean(item?.source, 160),
      observed_at: clean(item?.observed_at, 80),
    };
  }).filter((item) => item.value);
}

function normalizeFact(field, input, defaultSource) {
  const item = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const suppliedState = STATE_VALUES.has(item.state) ? item.state
    : STATE_VALUES.has(item.status) ? item.status : null;
  let status = STATUS_VALUES.has(item.status) ? item.status
    : ["CUSTOMER_CONFIRMED", "HUMAN_CONFIRMED"].includes(suppliedState) ? "FACT"
      : suppliedState === "INFERRED" ? "INFERRED" : "UNKNOWN";
  const rawValue = item.value;
  const value = rawValue === null || rawValue === undefined || rawValue === ""
    ? null
    : typeof rawValue === "string" ? clean(rawValue) : rawValue;
  if (value === null || String(value).toUpperCase() === "UNKNOWN") status = "UNKNOWN";
  const source = clean(item.source || defaultSource, 160);
  let state = suppliedState || (status === "INFERRED" ? "INFERRED"
    : status === "FACT" && /^(manual_crm_entry|human_crm)$/i.test(source || "") ? "HUMAN_CONFIRMED"
      : status === "FACT" ? "CUSTOMER_CONFIRMED" : "UNKNOWN");
  if (status === "UNKNOWN" && state !== "CONFLICTED") state = "UNKNOWN";
  const confidenceDefault = status === "FACT" ? 1 : status === "INFERRED" ? 0.5 : 0;
  return Object.freeze({
    field,
    value: state === "CONFLICTED" ? "CONFLICTED" : status === "UNKNOWN" ? "UNKNOWN" : value,
    status,
    state,
    source,
    confidence: state === "CONFLICTED" || status === "UNKNOWN" ? 0 : clamp(Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : confidenceDefault),
    evidence: Object.freeze(normalizeEvidence(item.evidence)),
  });
}

function inferredFact(field, value, confidence, evidence = []) {
  return normalizeFact(field, {
    value,
    status: value === null || value === undefined || value === "" ? "UNKNOWN" : "INFERRED",
    source: "image_analysis_result",
    confidence,
    evidence,
  }, "image_analysis_result");
}

function featureMatch(values, pattern) {
  const items = Array.isArray(values) ? values : values ? [values] : [];
  return items.find((value) => pattern.test(String(value))) || null;
}

function canonicalFamily(value) {
  return FAMILY_ALIASES[String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_")] || null;
}

export function normalizeImageQualificationResult(imageResult = {}) {
  const confidence = clamp(Number(imageResult.confidence) || 0);
  const visibleFeatures = Array.isArray(imageResult.visible_features)
    ? imageResult.visible_features.map((value) => clean(value, 160)).filter(Boolean)
    : [];
  const likelyMaterials = Array.isArray(imageResult.likely_materials)
    ? imageResult.likely_materials.map((value) => clean(value, 160)).filter(Boolean)
    : [];
  const compartments = Array.isArray(imageResult.compartments)
    ? imageResult.compartments.map((value) => clean(value, 160)).filter(Boolean)
    : [];
  const hardware = Array.isArray(imageResult.hardware)
    ? imageResult.hardware.map((value) => clean(value, 160)).filter(Boolean)
    : [];
  const customizationPoints = Array.isArray(imageResult.customization_points)
    ? imageResult.customization_points.map((value) => clean(value, 160)).filter(Boolean)
    : [];
  const requestedFamily = clean(imageResult.product_family, 120);
  const requestedCategory = clean(imageResult.likely_category, 160);
  const mapping = mapProductTaxonomy({
    product: requestedCategory,
    product_category: requestedCategory,
    product_keywords: requestedFamily ? [requestedFamily] : [],
  });
  const mappedFamily = mapping.canonical_family || canonicalFamily(requestedFamily);
  const mappedCategory = mapping.canonical_type || requestedCategory;
  const allVisible = [...visibleFeatures, ...compartments];

  const inferredFacts = {
    product_family: inferredFact("product_family", mappedFamily, confidence, [requestedFamily || requestedCategory].filter(Boolean)),
    product_category: inferredFact("product_category", mappedCategory, confidence, [requestedCategory].filter(Boolean)),
    material_interest: inferredFact("material_interest", likelyMaterials.length ? likelyMaterials.join(", ") : null, confidence, likelyMaterials),
    compartments: inferredFact("compartments", compartments.length ? compartments.join(", ") : null, confidence, compartments),
    hardware: inferredFact("hardware", hardware.length ? hardware.join(", ") : null, confidence, hardware),
    customization_need: inferredFact("customization_need", customizationPoints.length ? customizationPoints.join(", ") : null, confidence, customizationPoints),
    shoe_compartment: inferredFact("shoe_compartment", featureMatch(allVisible, /shoe compartment/i) ? true : null, confidence, allVisible),
    ball_tube_or_bottle: inferredFact("ball_tube_or_bottle", featureMatch(allVisible, /ball tube|bottle/i) ? true : null, confidence, allVisible),
    backpack_straps: inferredFact("backpack_straps", featureMatch(allVisible, /backpack strap/i) ? true : null, confidence, allVisible),
    shoulder_strap: inferredFact("shoulder_strap", featureMatch(allVisible, /shoulder strap/i) ? true : null, confidence, allVisible),
  };

  return Object.freeze({
    mode: "input_contract_only",
    certainty: "INFERRED",
    product_mapping: Object.freeze({
      ...mapping,
      status: mapping.status === "MAPPED" ? "INFERRED_MAPPING" : "UNMAPPED",
      confidence: Math.min(mapping.confidence || confidence, confidence),
    }),
    visible_features: Object.freeze(visibleFeatures),
    likely_materials: Object.freeze(likelyMaterials),
    compartments: Object.freeze(compartments),
    hardware: Object.freeze(hardware),
    customization_points: Object.freeze(customizationPoints),
    uncertainty: clean(imageResult.uncertainty, 500) || "Image-derived attributes require human verification.",
    confidence,
    inferred_facts: Object.freeze(inferredFacts),
    capability_commitment: false,
  });
}

function factIsKnown(fact) {
  return fact && fact.state !== "CONFLICTED" && fact.status !== "UNKNOWN" && fact.value !== "UNKNOWN";
}

function factValue(facts, field, { factOnly = false } = {}) {
  const fact = facts[field];
  if (!factIsKnown(fact) || (factOnly && fact.status !== "FACT")) return null;
  return fact.value;
}

function factStrength(facts, field) {
  const fact = facts[field];
  if (!factIsKnown(fact)) return 0;
  return fact.status === "FACT" ? fact.confidence : fact.confidence * 0.5;
}

function factIsTrue(facts, field, { factOnly = false } = {}) {
  const value = factValue(facts, field, { factOnly });
  return TRUE_VALUES.has(typeof value === "string" ? value.toLowerCase() : value);
}

function numericValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  const normalized = String(value || "").replace(/[$€£,\s]/g, "").toLowerCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)(m|k)?/);
  if (!match) return null;
  return Number(match[1]) * (match[2] === "m" ? 1000000 : match[2] === "k" ? 1000 : 1);
}

function quantityPoints(value) {
  const amount = numericValue(value);
  if (amount === null) return 0;
  if (amount >= 10000) return 12;
  if (amount >= 1000) return 9;
  if (amount >= 300) return 6;
  if (amount >= 100) return 3;
  if (amount > 0) return 1;
  return 0;
}

function normalizeFactSet(inputFacts = {}, sourceType, imageContract) {
  const result = Object.fromEntries(QUALIFICATION_FACT_FIELDS.map((field) => [
    field,
    normalizeFact(field, inputFacts[field], sourceType),
  ]));
  for (const [field, imageFact] of Object.entries(imageContract?.inferred_facts || {})) {
    if (field in result && !factIsKnown(result[field]) && factIsKnown(imageFact)) result[field] = imageFact;
  }
  const canonicalAliases = [
    ["product", "product_category"],
    ["quantity", "estimated_quantity"],
    ["material", "material_interest"],
    ["logo_customization", "customization_need"],
    ["compliance", "compliance_requirement"],
    ["sample_requirement", "sample_interest"],
  ];
  for (const [canonical, legacy] of canonicalAliases) {
    if (factIsKnown(result[canonical]) && !factIsKnown(result[legacy])) {
      result[legacy] = Object.freeze({ ...result[canonical], field: legacy });
    }
  }
  return Object.freeze(result);
}

function topicFact(topic, fields, facts) {
  const candidates = fields.map((field) => facts[field]).filter(factIsKnown);
  const explicitConflict = fields.map((field) => facts[field]).find((fact) => fact?.state === "CONFLICTED");
  if (explicitConflict) return Object.freeze({ ...explicitConflict, field: topic });
  const humanConfirmed = candidates.filter((fact) => fact.state === "HUMAN_CONFIRMED");
  const customerConfirmed = candidates.filter((fact) => fact.state === "CUSTOMER_CONFIRMED");
  const selected = humanConfirmed[0] || customerConfirmed[0]
    || candidates.sort((left, right) => right.confidence - left.confidence)[0];
  return selected
    ? Object.freeze({ ...selected, field: topic })
    : normalizeFact(topic, null, "qualification_topic_resolution");
}

export function buildQualificationTopics(facts = {}) {
  return Object.freeze(Object.fromEntries(Object.entries(QUALIFICATION_TOPICS).map(([topic, fields]) => [
    topic,
    topicFact(topic, fields, facts),
  ])));
}

function evidenceFromFacts(facts, { factOnly = false } = {}) {
  return Object.values(facts).filter((fact) => (
    factIsKnown(fact) && (!factOnly || fact.status === "FACT")
  )).map((fact) => ({
    type: fact.field,
    value: String(fact.value),
    source: fact.source,
    confidence: fact.confidence,
    status: fact.status,
  }));
}

function buildComponentScores(facts, taxonomy, hunterProfile) {
  const customerQuality = Math.round(clamp(
    factStrength(facts, "customer_type") * 4
      + factStrength(facts, "company_name") * 3
      + factStrength(facts, "website_present") * 3,
    0,
    10,
  ));
  const purchaseQuantity = Math.round(quantityPoints(factValue(facts, "estimated_quantity")) * factStrength(facts, "estimated_quantity"));
  const brandChannelStrength = Math.round(clamp(
    factStrength(facts, "brand_status") * 5
      + factStrength(facts, "sales_channel_present") * 4
      + factStrength(facts, "website_present") * 3,
    0,
    12,
  ));
  const hunterWeight = Number(hunterProfile?.product_weights?.[taxonomy.canonical_family]) || 1;
  const productFit = Math.round(clamp(
    (taxonomy.status === "MAPPED" ? 7 : 0)
      + factStrength(facts, "product_family") * 3,
    0,
    10,
  ) * clamp(hunterWeight, 0.5, 1.2));
  const oemOdmFit = Math.round(clamp(
    factStrength(facts, "OEM_or_ODM") * (/(oem|odm|custom)/i.test(String(factValue(facts, "OEM_or_ODM") || "")) ? 8 : 3),
    0,
    8,
  ));
  const intentValue = String(factValue(facts, "buying_intent") || "");
  const buyingIntent = Math.round(clamp(
    factStrength(facts, "buying_intent") * (/(rfq|sample|order|buy|quotation|development|active|high)/i.test(intentValue) ? 10 : 4),
    0,
    10,
  ));
  const stageValue = String(factValue(facts, "development_stage") || "");
  const developmentStage = Math.round(clamp(
    factStrength(facts, "development_stage") * (/(sample|quotation|order|development|negotiation)/i.test(stageValue) ? 8 : 4),
    0,
    8,
  ));
  const marketValue = String(factValue(facts, "target_market") || factValue(facts, "country_market") || "").toLowerCase();
  const targetMarketFit = Math.round(clamp(
    Math.max(factStrength(facts, "target_market"), factStrength(facts, "country_market"))
      * (CORE_MARKETS.has(marketValue) ? 7 : marketValue ? 4 : 0),
    0,
    7,
  ));
  const repeatPotential = Math.round(clamp(
    factStrength(facts, "repeat_order_potential") * (factIsTrue(facts, "repeat_order_potential") ? 7 : 3),
    0,
    7,
  ));
  const strategicPotential = Math.round(clamp(
    (factIsTrue(facts, "strategic_account_signal") ? 5 * factStrength(facts, "strategic_account_signal") : 0)
      + (factIsTrue(facts, "million_dollar_potential_signal") ? 5 * factStrength(facts, "million_dollar_potential_signal") : 0),
    0,
    10,
  ));
  const knownFacts = Object.values(facts).filter(factIsKnown);
  const confirmedFacts = knownFacts.filter((fact) => fact.status === "FACT");
  const inferredFacts = knownFacts.filter((fact) => fact.status === "INFERRED");
  const evidenceQuality = Math.round(clamp((confirmedFacts.length + inferredFacts.length * 0.35) / 12, 0, 1) * 6);
  let riskAdjustment = 0;
  if (factIsTrue(facts, "risk_signal")) riskAdjustment -= 20;
  if (factIsTrue(facts, "price_only_signal")) riskAdjustment -= confirmedFacts.length < 4 ? 8 : 4;
  if (factIsTrue(facts, "low_quantity_signal")) riskAdjustment -= 5;
  riskAdjustment = Math.max(-30, riskAdjustment);

  return Object.freeze({
    customer_quality: customerQuality,
    purchase_quantity: purchaseQuantity,
    brand_channel_strength: brandChannelStrength,
    product_fit: Math.round(clamp(productFit, 0, 12)),
    oem_odm_fit: oemOdmFit,
    buying_intent: buyingIntent,
    development_stage: developmentStage,
    target_market_fit: targetMarketFit,
    repeat_potential: repeatPotential,
    strategic_potential: strategicPotential,
    evidence_quality: evidenceQuality,
    risk_adjustment: riskAdjustment,
  });
}

function qualificationConfidence(facts) {
  const critical = [
    "customer_type", "company_name", "product_family", "estimated_quantity", "OEM_or_ODM",
    "target_market", "development_stage", "buying_intent",
  ];
  const total = critical.reduce((sum, field) => sum + factStrength(facts, field), 0);
  return Number((total / critical.length).toFixed(2));
}

function missingCriticalFacts(topics) {
  return Object.keys(QUALIFICATION_TOPICS).filter((topic) => !factIsKnown(topics[topic]));
}

function tierRuleInput(score, facts, confidence) {
  const million = factIsTrue(facts, "million_dollar_potential_signal", { factOnly: true });
  const strategic = factIsTrue(facts, "strategic_account_signal", { factOnly: true });
  const strongBrand = facts.brand_status.status === "FACT"
    && /(global|major|enterprise|leading|established|strong)/i.test(String(facts.brand_status.value));
  const strongChannel = facts.sales_channel_present.status === "FACT"
    && ![false, "false", "no"].includes(typeof facts.sales_channel_present.value === "string"
      ? facts.sales_channel_present.value.toLowerCase() : facts.sales_channel_present.value);
  const priceOnly = factIsTrue(facts, "price_only_signal");
  const quantity = numericValue(factValue(facts, "estimated_quantity"));
  if (million && confidence >= 0.6) return "S";
  if ((strategic || (strongBrand && strongChannel)) && confidence >= 0.5) return "A_PLUS";
  if (score >= 68) return "A";
  if (score >= 45) return "B";
  if (score >= 24) return "C";
  if (priceOnly || (quantity !== null && quantity < 100)) return "D";
  return "C";
}

export function recommendNextQualificationQuestion({ facts = {}, topics = buildQualificationTopics(facts), productMapping = {}, hunterProfile = null } = {}) {
  const conflictedTopic = TOPIC_QUESTION_PRIORITY.find(([topic]) => topics[topic]?.state === "CONFLICTED");
  if (conflictedTopic) {
    const [topic] = conflictedTopic;
    return Object.freeze({
      next_question: `The available information for ${topic.replaceAll("_", " ")} conflicts. Which customer- or human-confirmed value should be used?`,
      reason: "Conflicting evidence must be resolved by a human before qualification progresses.",
      missing_fact: topic,
      approval_level: "HUMAN_ONLY",
      mode: "recommendation_only",
    });
  }
  for (const [topic, question, reason] of TOPIC_QUESTION_PRIORITY) {
    if (!factIsKnown(topics[topic])) {
      return Object.freeze({
        next_question: question,
        reason,
        missing_fact: topic,
        approval_level: "DRAFT_HUMAN_APPROVAL",
        mode: "recommendation_only",
      });
    }
  }
  for (const [field, question, reason] of GENERIC_QUESTION_PRIORITY) {
    if (!factIsKnown(facts[field])) {
      return Object.freeze({
        next_question: question,
        reason,
        missing_fact: field,
        approval_level: "DRAFT_HUMAN_APPROVAL",
        mode: "recommendation_only",
      });
    }
  }
  const family = productMapping.canonical_family || factValue(facts, "product_family");
  const profilePriority = hunterProfile?.qualification_questions || [];
  const productQuestions = PRODUCT_QUESTIONS[family] || [];
  const byField = new Map(productQuestions);
  const orderedFields = [
    ...profilePriority.filter((field) => byField.has(field)),
    ...productQuestions.map(([field]) => field),
  ];
  for (const field of [...new Set(orderedFields)]) {
    if (!factIsKnown(facts[field])) {
      return Object.freeze({
        next_question: byField.get(field),
        reason: "This is the minimum product-specific fact most likely to change the next decision.",
        missing_fact: field,
        approval_level: "DRAFT_HUMAN_APPROVAL",
        mode: "recommendation_only",
      });
    }
  }
  return Object.freeze({
    next_question: null,
    reason: "No critical qualification question remains; a human should review the next sales action.",
    missing_fact: null,
    approval_level: "DRAFT_HUMAN_APPROVAL",
    mode: "recommendation_only",
  });
}

function addHours(value, hours) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  return new Date(date.valueOf() + hours * 60 * 60 * 1000).toISOString();
}

function buildHumanSummary(facts, score, tier) {
  const fields = ["company_name", "customer_type", "product_family", "estimated_quantity", "target_market", "development_stage"];
  const grounded = fields.map((field) => {
    const value = factValue(facts, field, { factOnly: true });
    return value === null ? null : `${field}=${clean(value, 160)}`;
  }).filter(Boolean);
  return `Qualification ${score}/100; tier recommendation ${tier || "UNKNOWN"}. ${grounded.length ? grounded.join("; ") : "No confirmed summary facts are available."}`;
}

function recommendHumanHandoff({
  facts,
  qualification,
  customerPriority,
  policy,
  policyContext,
  owner,
  hunterProfile,
  referenceTime,
  conflicts,
  targetStage,
  requirementGate,
  topics,
}) {
  const reasons = [];
  const tier = customerPriority.recommended_tier;
  const strongBrand = facts.brand_status.status === "FACT"
    && /(global|major|enterprise|leading|established|strong|group)/i.test(String(facts.brand_status.value));
  if (["S", "A_PLUS"].includes(tier)) reasons.push(`${tier} account recommendation requires human review.`);
  if (customerPriority.strategic_account === true) reasons.push("Strategic-account potential requires human review.");
  if (customerPriority.million_dollar_potential === true) reasons.push("Million-dollar potential requires human review.");
  if (strongBrand) reasons.push("Verified strong brand or group signal requires human review.");
  if (qualification.qualification_score >= 75) reasons.push("High-value qualification recommendation requires human review.");
  const inferredHighValue = factIsTrue(facts, "strategic_account_signal")
    || factIsTrue(facts, "million_dollar_potential_signal")
    || numericValue(factValue(facts, "annual_purchase_potential")) >= 500000;
  if ((qualification.qualification_score >= 60 || inferredHighValue) && qualification.confidence < 0.5) {
    reasons.push("High-value recommendation has low confidence.");
  }
  if (conflicts) reasons.push("Conflicting evidence requires human resolution.");
  if (factIsTrue(facts, "risk_signal")) reasons.push("Risk signals require human review.");
  if (["quoted", "quotation"].includes(String(targetStage || "").toLowerCase())) {
    reasons.push(requirementGate?.allowed === false
      ? "Quotation is blocked until the P0 Requirement Confirmation Gate is satisfied."
      : "Quotation-stage commercial decisions require human review.");
  }
  if (factIsKnown(topics?.budget_or_target_price)) {
    reasons.push("Customer-supplied budget or target price requires human commercial review.");
  }
  if (policyContext?.commercial_decision === true || policyContext?.quotation_request === true) {
    reasons.push("Commercial or quotation decisions require human review.");
  }
  if (policyContext?.price_request === true || policyContext?.price_commitment === true) {
    reasons.push("Price decisions require human review.");
  }
  if (!policy.allowed) reasons.push(policy.reason);
  if (policyContext?.complaint === true) reasons.push("Customer complaints require human review.");
  const required = reasons.length > 0;
  const urgent = !policy.allowed || factIsTrue(facts, "risk_signal");
  return Object.freeze({
    handoff_required: required,
    handoff_reason: Object.freeze(reasons),
    recommended_owner: owner || hunterProfile?.recommended_owner || (required ? "sales_manager" : null),
    priority: urgent ? "URGENT" : required ? "HIGH" : "NORMAL",
    due_at: required ? addHours(referenceTime, urgent ? 4 : 24) : null,
    summary_for_human: buildHumanSummary(facts, qualification.qualification_score, tier),
    mode: "recommendation_only",
  });
}

function readOnlyContext(input) {
  const lead = input.lead || {};
  return Object.freeze({
    customer_id: input.customer_id ?? lead.customer_id ?? null,
    inquiry_id: input.inquiry_id ?? lead.inquiry_id ?? null,
    source: input.source ?? lead.source ?? lead.source_channel ?? null,
    utm_source: lead.utm_source ?? null,
    utm_campaign: lead.utm_campaign ?? null,
    alibaba_reference: lead.alibaba_reference ?? null,
    mode: "read_only_passthrough",
  });
}

export function qualifySalesOpportunity(input = {}) {
  const sourceType = QUALIFICATION_INPUT_SOURCES.includes(input.source_type)
    ? input.source_type
    : "manual_crm_entry";
  const imageContract = input.image_analysis
    ? normalizeImageQualificationResult(input.image_analysis)
    : null;
  const facts = normalizeFactSet(input.facts, sourceType, imageContract);
  const topics = buildQualificationTopics(facts);
  const taxonomy = mapProductTaxonomy({
    product: factValue(topics, "product"),
    product_category: factValue(facts, "product_category") || factValue(topics, "product"),
    product_keywords: [factValue(facts, "product_family")].filter(Boolean),
  });
  const declaredFamily = canonicalFamily(factValue(facts, "product_family"));
  const productMapping = taxonomy.status === "MAPPED" ? taxonomy
    : imageContract?.product_mapping?.canonical_family ? imageContract.product_mapping
      : declaredFamily ? Object.freeze({
        ...taxonomy,
        status: facts.product_family.status === "FACT" ? "DECLARED_FAMILY" : "INFERRED_MAPPING",
        canonical_family: declaredFamily,
        canonical_type: factValue(facts, "product_category"),
        confidence: facts.product_family.confidence,
        mapping_rule_id: "QUALIFICATION_DECLARED_FAMILY",
      }) : taxonomy;
  const hunterProfile = getHunterQualificationProfile(input.hunter_profile_id);
  const components = buildComponentScores(facts, productMapping, hunterProfile);
  const qualificationScore = clamp(
    Object.values(components).reduce((sum, value) => sum + value, 0),
    0,
    100,
  );
  const confidence = qualificationConfidence(facts);
  const qualificationBand = confidence < 0.2 ? "INSUFFICIENT_EVIDENCE"
    : qualificationScore >= 70 ? "HIGH"
      : qualificationScore >= 45 ? "MEDIUM"
        : qualificationScore >= 24 ? "LOW" : "WEAK";
  const qualification = Object.freeze({
    mode: "recommendation_only",
    qualification_score: qualificationScore,
    qualification_band: qualificationBand,
    component_scores: components,
    evidence: Object.freeze(evidenceFromFacts(facts)),
    confidence,
    missing_critical_facts: Object.freeze(missingCriticalFacts(topics)),
    operational_source_of_truth: "scoreLead",
  });

  const tierInput = tierRuleInput(qualificationScore, facts, confidence);
  const confirmedEvidence = evidenceFromFacts(facts, { factOnly: true });
  const customerPriority = recommendCustomerPriority({
    customer: input.customer || {},
    signals: {
      customer_tier: tierInput,
      strategic_account: factIsTrue(facts, "strategic_account_signal", { factOnly: true })
        || (facts.brand_status.status === "FACT" && facts.sales_channel_present.status === "FACT"
          && /(global|major|enterprise|leading|established|strong)/i.test(String(facts.brand_status.value))),
      million_dollar_potential: factIsTrue(facts, "million_dollar_potential_signal", { factOnly: true }),
      brand_level: factValue(facts, "brand_status", { factOnly: true }),
      annual_purchase_potential: factValue(facts, "annual_purchase_potential", { factOnly: true }),
      product_family: productMapping.canonical_family || factValue(facts, "product_family"),
      sales_stage: factValue(facts, "development_stage"),
    },
    evidence: confirmedEvidence,
    confidence,
    human_override: input.human_override || {},
  });

  const lead = input.lead || {};
  const operationalScore = scoreLead(lead);
  const shadowScore = evaluateLeadScoreShadow(lead, { priority: customerPriority });
  const playbookFamily = PLAYBOOK_BY_FAMILY[productMapping.canonical_family] || null;
  const policyContext = { ...(input.policy_context || {}) };
  const companyPolicy = evaluateCompanyPolicy(policyContext);
  const requirementGate = validateRequirementConfirmationGate({
    current_stage: input.current_stage || lead.stage || factValue(facts, "development_stage"),
    target_stage: input.target_stage,
    confirmation: input.requirement_confirmation,
  });
  const playbook = playbookFamily ? getSalesPlaybook(playbookFamily, "QUALIFICATION") : null;
  const scriptPlaybookFamily = facts.product_family.status === "FACT" || facts.product_category.status === "FACT"
    ? playbookFamily
    : null;
  const knownInformation = Object.fromEntries(Object.entries(facts)
    .filter(([, fact]) => fact.status === "FACT")
    .map(([field, fact]) => [field, fact.value]));
  const scriptPlan = planSalesScript({
    ...policyContext,
    playbook_family: scriptPlaybookFamily,
    scenario: "QUALIFICATION",
    known_information: knownInformation,
    customer_name: factValue(facts, "company_name", { factOnly: true }),
    product_family: factValue(facts, "product_family", { factOnly: true }),
    country_market: factValue(facts, "country_market", { factOnly: true }),
    customer_tier: customerPriority.recommended_tier,
    conversation_history: input.conversation_history,
  });
  const nextQuestion = recommendNextQualificationQuestion({ facts, topics, productMapping, hunterProfile });
  const nextBestAction = recommendNextBestAction({
    ...policyContext,
    stage: input.current_stage || lead.stage || factValue(facts, "development_stage") || "new",
    target_stage: input.target_stage,
    requirement_confirmation: input.requirement_confirmation,
    playbook_family: playbookFamily,
    customer_tier: customerPriority.recommended_tier,
    owner: input.owner || lead.owner,
    risk_level: factIsTrue(facts, "risk_signal") ? "high" : lead.risk_level,
  });
  const followUp = recommendFollowUp({
    ...policyContext,
    scenario: "NEW_INQUIRY",
    playbook_family: scriptPlaybookFamily,
    customer_tier: customerPriority.recommended_tier,
    strategic_value: customerPriority.strategic_value,
    sales_stage: input.current_stage || lead.stage || "new",
    owner: input.owner || lead.owner,
    trigger_at: input.reference_time,
  });
  const handoff = recommendHumanHandoff({
    facts,
    qualification,
    customerPriority,
    policy: companyPolicy,
    policyContext,
    owner: input.owner || lead.owner,
    hunterProfile,
    referenceTime: input.reference_time,
    conflicts: input.conflicting_evidence === true
      || Object.values(topics).some((topic) => topic.state === "CONFLICTED"),
    targetStage: input.target_stage,
    requirementGate,
    topics,
  });

  return Object.freeze({
    mode: "recommendation_only",
    contract_version: "BUILD_02_A1_V1",
    source_type: sourceType,
    facts,
    qualification_topics: topics,
    image_qualification: imageContract,
    product_mapping: productMapping,
    hunter_profile: hunterProfile,
    qualification,
    customer_priority: customerPriority,
    operational_lead_score: operationalScore,
    shadow_score: shadowScore,
    playbook: playbook ? Object.freeze({ playbook_id: playbook.playbook_id, version: playbook.version }) : null,
    script_plan: scriptPlan,
    requirement_gate: requirementGate,
    next_best_action: nextBestAction,
    next_question: nextQuestion,
    follow_up: followUp,
    human_handoff: handoff,
    source_context: readOnlyContext(input),
    integration_targets: Object.freeze({
      activities: "read_only_context",
      tasks: "recommendation_target_only",
      drafts: "human_review_only",
      crm_authorization: "required_for_any_future_write",
    }),
    safety: Object.freeze({
      outbound: "disabled",
      persistence: "none",
      migration_required: false,
      production_write: false,
      approval_level: "DRAFT_HUMAN_APPROVAL",
      policy_priority: "COMPANY_POLICY>RISK_RULE>QUALIFICATION_RULE>SALES_STAGE_RULE>PLAYBOOK>AI_RECOMMENDATION",
    }),
  });
}
