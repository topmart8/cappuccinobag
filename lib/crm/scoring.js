import { mapProductTaxonomy } from "./product-taxonomy.js";

const CORE_MARKETS = new Set([
  "united states", "usa", "canada", "united kingdom", "uk", "germany",
  "france", "netherlands", "australia", "japan", "south korea",
]);

const TRUSTED_SOURCES = new Set(["website", "referral", "trade_show", "existing_customer"]);

function digits(value = "") {
  return String(value).replace(/\D/g, "");
}

function quantityScore(value = "") {
  const match = String(value).replace(/,/g, "").match(/\d+/);
  const amount = match ? Number(match[0]) : 0;
  if (amount >= 1000) return 18;
  if (amount >= 300) return 14;
  if (amount >= 100) return 10;
  if (amount > 0) return 5;
  return 0;
}

export function normalizeDomain(website = "") {
  try {
    const input = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    return new URL(input).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function scoreLead(lead = {}) {
  let score = 8;
  const reasons = [];
  const country = String(lead.country || "").trim().toLowerCase();
  if (CORE_MARKETS.has(country)) {
    score += 12;
    reasons.push("核心市场 +12");
  } else if (country) {
    score += 6;
    reasons.push("国家信息完整 +6");
  }

  const keywords = Array.isArray(lead.product_keywords)
    ? lead.product_keywords
    : String(lead.product_keywords || lead.product_category || "").split(/[;,|]/);
  if (keywords.some((item) => String(item).trim())) {
    score += 16;
    reasons.push("产品匹配 +16");
  }

  const contacts = [
    /\S+@\S+\.\S+/.test(String(lead.email || "")),
    digits(lead.phone).length >= 7,
    digits(lead.whatsapp).length >= 7,
  ].filter(Boolean).length;
  score += contacts * 7;
  if (contacts) reasons.push(`联系方式 ${contacts}/3 +${contacts * 7}`);

  const volume = quantityScore(lead.quantity || lead.moq);
  score += volume;
  if (volume) reasons.push(`数量/MOQ +${volume}`);

  if (normalizeDomain(lead.website || lead.company_website)) {
    score += 10;
    reasons.push("公司网站 +10");
  }

  if (TRUSTED_SOURCES.has(String(lead.source || lead.source_channel || "").toLowerCase())) {
    score += 8;
    reasons.push("可信来源 +8");
  }

  const automatic = Math.max(0, Math.min(100, score));
  const override = lead.score_override !== null && lead.score_override !== undefined && lead.score_override !== "" && Number.isFinite(Number(lead.score_override))
    ? Math.max(0, Math.min(100, Number(lead.score_override)))
    : null;
  return { automatic, final: override ?? automatic, reasons };
}

export function buildDedupeCandidates(lead = {}) {
  const email = String(lead.email || "").trim().toLowerCase();
  const phone = digits(lead.phone);
  const whatsapp = digits(lead.whatsapp);
  const domain = normalizeDomain(lead.website || lead.company_website);
  return { email, phone, whatsapp, domain };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function amount(value = "") {
  const normalized = String(value).replace(/[$€£,\s]/g, "").toLowerCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)(m|k)?/);
  if (!match) return 0;
  const multiplier = match[2] === "m" ? 1000000 : match[2] === "k" ? 1000 : 1;
  return Number(match[1]) * multiplier;
}

function shadowQuantityScore(value) {
  const quantity = amount(value);
  if (quantity >= 5000) return 12;
  if (quantity >= 1000) return 10;
  if (quantity >= 300) return 8;
  if (quantity >= 100) return 5;
  if (quantity > 0) return 2;
  return 0;
}

function annualPotentialScore(value) {
  const annual = amount(value);
  if (annual >= 1000000) return 8;
  if (annual >= 500000) return 6;
  if (annual >= 100000) return 4;
  if (annual > 0) return 2;
  return 0;
}

function buyingIntentScore(lead) {
  const stage = String(lead.stage || lead.sales_stage || "").toLowerCase();
  const stageScore = {
    new: 2,
    qualified: 5,
    contacted: 7,
    replied: 10,
    requirements_confirmed: 13,
    quoted: 15,
    sample: 16,
    negotiation: 18,
    payment_pending: 20,
    order_confirmed: 20,
  }[stage] || 0;
  const explicitIntent = String(lead.intent || "").toLowerCase();
  return clamp(stageScore + (/(rfq|quotation|sample|order|buy)/.test(explicitIntent) ? 2 : 0), 0, 20);
}

function strategicScore(lead, priority) {
  let score = 0;
  const tier = priority?.recommended_tier || lead.customer_tier;
  score += { S: 12, A_PLUS: 10, A: 7, B: 3, C: 1, D: 0 }[tier] || 0;
  if (priority?.million_dollar_potential === true || lead.million_dollar_potential === true) score += 3;
  if (priority?.strategic_account === true || lead.strategic_account === true) score += 3;
  return clamp(score, 0, 15);
}

export function evaluateLeadScoreShadow(lead = {}, { priority = null } = {}) {
  const existing = scoreLead(lead);
  const country = String(lead.country || "").trim().toLowerCase();
  const companyValue = clamp(
    (lead.company ? 3 : 0)
      + (normalizeDomain(lead.website || lead.company_website) ? 5 : 0)
      + (CORE_MARKETS.has(country) ? 4 : country ? 2 : 0)
      + (/(large|enterprise|group|global|major)/i.test(`${lead.company_size || ""} ${lead.brand_level || ""}`) ? 3 : 0),
    0,
    15,
  );
  const purchasePotential = clamp(
    shadowQuantityScore(lead.quantity || lead.moq)
      + annualPotentialScore(lead.annual_purchase_potential),
    0,
    20,
  );
  const taxonomy = mapProductTaxonomy(lead);
  const productInputs = Array.isArray(lead.product_keywords)
    ? lead.product_keywords.filter((item) => String(item).trim()).length
    : String(lead.product_keywords || lead.product_category || lead.product || "").trim() ? 1 : 0;
  const productFit = clamp((taxonomy.status === "MAPPED" ? 10 : 0) + (productInputs ? 5 : 0), 0, 15);
  const buyingIntent = buyingIntentScore(lead);
  const contacts = [
    /\S+@\S+\.\S+/.test(String(lead.email || "")),
    digits(lead.phone).length >= 7,
    digits(lead.whatsapp || lead.whatsapp_phone).length >= 7,
  ].filter(Boolean).length;
  const engagement = clamp(
    contacts * 2
      + (Number(lead.activity_count) > 0 ? Math.min(4, Number(lead.activity_count)) : 0)
      + (["replied", "sample", "negotiation", "won"].includes(String(lead.stage || "").toLowerCase()) ? 5 : 0),
    0,
    15,
  );
  const strategicValue = strategicScore(lead, priority);
  let riskAdjustment = 0;
  if (lead.do_not_prospect || lead.duplicate_review || lead.duplicate_of) riskAdjustment -= 30;
  if (["blocked", "supplier_non_buyer"].includes(lead.relationship_status)) riskAdjustment -= 30;
  if (lead.risk_level === "high") riskAdjustment -= 20;
  else if (lead.risk_level === "medium") riskAdjustment -= 8;
  riskAdjustment = clamp(riskAdjustment, -30, 0);

  const component_scores = Object.freeze({
    company_value: companyValue,
    purchase_potential: purchasePotential,
    product_fit: productFit,
    buying_intent: buyingIntent,
    engagement,
    strategic_value: strategicValue,
    risk_adjustment: riskAdjustment,
  });
  const shadowScore = clamp(
    companyValue + purchasePotential + productFit + buyingIntent + engagement + strategicValue + riskAdjustment,
    0,
    100,
  );
  const evidenceLanes = [companyValue, purchasePotential, productFit, buyingIntent, engagement, strategicValue]
    .filter((value) => value > 0).length;
  const difference = shadowScore - existing.final;

  return {
    mode: "shadow_only",
    existing_score: existing.final,
    existing_automatic: existing.automatic,
    shadow_score: shadowScore,
    component_scores,
    difference,
    recommendation: Math.abs(difference) >= 20
      ? "Review the score difference with a human before any future calibration."
      : "Continue shadow comparison; the existing score remains operational.",
    confidence: Number((evidenceLanes / 6).toFixed(2)),
    operational_source_of_truth: "existing_score",
  };
}
