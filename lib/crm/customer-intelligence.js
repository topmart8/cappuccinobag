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

const STRATEGIC_VALUES = new Set(["EXCEPTIONAL", "HIGH", "MEDIUM", "STANDARD", "LOW", "UNKNOWN"]);
const CLOSING_URGENCY_VALUES = new Set(["U1_NOW", "U2_ACTIVE", "U3_DEVELOPING", "U4_NURTURE", "UNKNOWN"]);

function numericAmount(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  const normalized = String(value || "").replace(/[$€£,\s]/g, "").toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(m|k)?$/);
  if (!match) return null;
  const multiplier = match[2] === "m" ? 1000000 : match[2] === "k" ? 1000 : 1;
  return Number(match[1]) * multiplier;
}

function urgencyFromStage(stage) {
  const value = String(stage || "").trim().toLowerCase();
  if (["payment_pending", "order_confirmed"].includes(value)) return "U1_NOW";
  if (["quoted", "quotation", "sample", "sample_discussion", "negotiation"].includes(value)) return "U2_ACTIVE";
  if (["contacted", "replied", "discovery", "requirements_confirmed"].includes(value)) return "U3_DEVELOPING";
  if (["new", "qualified", "won", "repeat_order"].includes(value)) return "U4_NURTURE";
  return "UNKNOWN";
}

function valueOrOverride(value, override, validator = () => true) {
  return override !== null && override !== undefined && validator(override) ? override : value;
}

export function recommendCustomerPriority({
  customer = {},
  signals = {},
  evidence = [],
  confidence = null,
  human_override = {},
} = {}) {
  const million = signals.million_dollar_potential === true || customer.million_dollar_potential === true;
  const strategic = signals.strategic_account === true || customer.strategic_account === true;
  const brandLevel = cleanText(signals.brand_level ?? customer.brand_level);
  const companySize = cleanText(signals.company_size ?? customer.company_size);
  const annualPotential = cleanText(signals.annual_purchase_potential ?? customer.annual_purchase_potential);
  const productFamily = cleanText(signals.product_family ?? customer.product_family);
  const annualAmount = numericAmount(annualPotential);
  const normalizedEvidence = normalizeEvidence(evidence);
  const reasons = [];
  let points = 0;

  if (million) {
    points += 5;
    reasons.push("Million-dollar potential was supplied as a recommendation signal.");
  }
  if (strategic) {
    points += 4;
    reasons.push("Strategic-account status was supplied as a recommendation signal.");
  }
  if (brandLevel && /(global|major|enterprise|leading|large)/i.test(brandLevel)) {
    points += 3;
    reasons.push("Verified brand-level input indicates a major brand context.");
  }
  if (companySize && /(large|enterprise|group|global)/i.test(companySize)) {
    points += 3;
    reasons.push("Verified company-size input indicates a large group or enterprise.");
  }
  if (annualAmount !== null && annualAmount >= 1000000) {
    points += 5;
    reasons.push("Annual purchase potential is at least one million in the supplied numeric estimate.");
  } else if (annualAmount !== null && annualAmount >= 500000) {
    points += 3;
    reasons.push("Annual purchase potential is high in the supplied numeric estimate.");
  } else if (annualAmount !== null && annualAmount >= 100000) {
    points += 2;
    reasons.push("Annual purchase potential is material in the supplied numeric estimate.");
  }
  if (productFamily) {
    points += 1;
    reasons.push("A compatible product family is known.");
  }

  const majorBrand = Boolean(brandLevel && /(global|major|enterprise|leading|large)/i.test(brandLevel));
  const largeGroup = Boolean(companySize && /(large|enterprise|group|global)/i.test(companySize));
  const strongStrategicSignal = million || strategic || annualAmount >= 1000000 || majorBrand || largeGroup;
  const meaningfulSignals = [
    million,
    strategic,
    majorBrand,
    largeGroup,
    annualAmount !== null && annualAmount >= 100000,
    Boolean(productFamily),
  ].filter(Boolean).length;
  const hasEvidence = normalizedEvidence.length > 0;
  const suppliedTier = TIER_VALUES.has(signals.customer_tier) ? signals.customer_tier : null;
  const evidenceSafeSuppliedTier = suppliedTier === "S" && !hasEvidence ? null : suppliedTier;
  const derivedTier = evidenceSafeSuppliedTier || (
    strongStrategicSignal && hasEvidence ? "S"
      : points >= 5 && meaningfulSignals >= 2 && hasEvidence ? "A_PLUS"
        : points >= 3 ? "A"
          : points >= 1 ? "B"
            : hasEvidence ? "C" : null
  );
  const derivedStrategicValue = derivedTier === "S" ? "EXCEPTIONAL"
    : derivedTier === "A_PLUS" ? "HIGH"
      : points >= 3 ? "MEDIUM"
        : points >= 1 ? "STANDARD"
          : "UNKNOWN";
  const explicitUrgency = CLOSING_URGENCY_VALUES.has(signals.closing_urgency)
    ? signals.closing_urgency
    : null;
  const derivedUrgency = explicitUrgency || urgencyFromStage(signals.sales_stage || customer.stage);
  const evidenceSignals = [million, strategic, brandLevel, companySize, annualPotential, productFamily]
    .filter(Boolean).length + normalizedEvidence.length;
  const derivedConfidence = confidence === null || confidence === undefined
    ? Math.min(0.95, evidenceSignals ? 0.25 + evidenceSignals * 0.1 : 0)
    : normalizeConfidence(confidence);

  const effectiveTier = valueOrOverride(derivedTier, human_override.customer_tier, (value) => TIER_VALUES.has(value));
  const effectiveStrategicValue = valueOrOverride(
    derivedStrategicValue,
    human_override.strategic_value,
    (value) => STRATEGIC_VALUES.has(value),
  );
  const effectiveUrgency = valueOrOverride(
    derivedUrgency,
    human_override.closing_urgency,
    (value) => CLOSING_URGENCY_VALUES.has(value),
  );

  return {
    mode: "recommendation_only",
    recommended_tier: effectiveTier,
    strategic_value: effectiveStrategicValue,
    closing_urgency: effectiveUrgency,
    million_dollar_potential: valueOrOverride(million, human_override.million_dollar_potential),
    strategic_account: valueOrOverride(strategic, human_override.strategic_account),
    brand_level: valueOrOverride(brandLevel, cleanText(human_override.brand_level)),
    annual_purchase_potential: valueOrOverride(annualPotential, cleanText(human_override.annual_purchase_potential)),
    product_family: productFamily,
    evidence: normalizedEvidence,
    confidence: derivedConfidence,
    reason: reasons.length
      ? `${reasons.join(" ")}${strongStrategicSignal && !hasEvidence ? " Strategic classification is capped until supporting evidence is attached." : ""}`
      : "Insufficient verified evidence; keep priority unknown until reviewed.",
    human_override: {
      customer_tier: TIER_VALUES.has(human_override.customer_tier) ? human_override.customer_tier : null,
      strategic_value: STRATEGIC_VALUES.has(human_override.strategic_value) ? human_override.strategic_value : null,
      closing_urgency: CLOSING_URGENCY_VALUES.has(human_override.closing_urgency) ? human_override.closing_urgency : null,
    },
  };
}
