export const CUSTOMER_TIERS = Object.freeze(["S", "A_PLUS", "A", "B", "C", "D"]);

const TIER_VALUES = new Set(CUSTOMER_TIERS);
const BOOLEAN_RECOMMENDATIONS = new Set([true, false, "unknown", null]);
const PROFILE_FIELDS = Object.freeze([
  "customer_tier",
  "strategic_account",
  "million_dollar_potential",
  "brand_level",
  "company_size",
  "estimated_revenue_band",
  "annual_purchase_potential",
]);

function cleanText(value, max = 240) {
  if (value === null || value === undefined || value === "") return null;
  return String(value).replace(/\0/g, "").trim().slice(0, max) || null;
}

function normalizeProfile(input = {}) {
  const result = {
    customer_tier: TIER_VALUES.has(input.customer_tier) ? input.customer_tier : null,
    strategic_account: BOOLEAN_RECOMMENDATIONS.has(input.strategic_account)
      ? input.strategic_account
      : null,
    million_dollar_potential: BOOLEAN_RECOMMENDATIONS.has(input.million_dollar_potential)
      ? input.million_dollar_potential
      : null,
    brand_level: cleanText(input.brand_level),
    company_size: cleanText(input.company_size),
    estimated_revenue_band: cleanText(input.estimated_revenue_band),
    annual_purchase_potential: cleanText(input.annual_purchase_potential),
  };
  return Object.fromEntries(PROFILE_FIELDS.map((field) => [field, result[field]]));
}

function normalizeEvidence(evidence) {
  if (!Array.isArray(evidence)) return [];
  return evidence.slice(0, 50).map((item) => {
    if (typeof item === "string") return { type: "note", value: cleanText(item, 1000) };
    return {
      type: cleanText(item?.type, 80) || "other",
      value: cleanText(item?.value, 1000),
      source: cleanText(item?.source, 240),
      observed_at: cleanText(item?.observed_at, 80),
    };
  }).filter((item) => item.value);
}

function normalizeConfidence(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
}

export function buildCustomerIntelligenceRecommendation({
  customer = {},
  recommendation = {},
  evidence = [],
  confidence = 0,
  source = null,
  human_override = {},
} = {}) {
  const recommended = normalizeProfile(recommendation);
  const override = normalizeProfile(human_override);
  const effective = Object.fromEntries(PROFILE_FIELDS.map((field) => [
    field,
    override[field] !== null ? override[field] : recommended[field],
  ]));

  return {
    mode: "recommendation_only",
    customer_id: customer.id || null,
    recommended,
    effective,
    evidence: normalizeEvidence(evidence),
    confidence: normalizeConfidence(confidence),
    source: cleanText(source || customer.source || customer.source_channel, 240),
    human_override: override,
  };
}
