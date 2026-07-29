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
