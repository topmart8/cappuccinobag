import { categoryRules, commercialTerms, excludedTerms, singularRules } from "../config/keyword-rules.js";
import { slugify } from "../lib/slug.js";

const productPattern = /\b(bag|backpack|waist pack|belt|wallet|holder|duffel|duffle|pouch|racket|racquet)\b/i;

export function normalizeKeyword(value = "") {
  let normalized = String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/[^\p{L}\p{N}\s&/+.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, replacement] of singularRules) normalized = normalized.replace(pattern, replacement);
  return normalized;
}

export function deduplicateKeywords(rows = []) {
  const byKeyword = new Map();
  for (const input of rows) {
    const row = typeof input === "string" ? { keyword: input } : input;
    const normalized_keyword = normalizeKeyword(row.keyword || row.query);
    if (!normalized_keyword || byKeyword.has(normalized_keyword)) continue;
    byKeyword.set(normalized_keyword, { ...row, keyword: row.keyword || row.query, normalized_keyword });
  }
  return [...byKeyword.values()];
}

export function classifyIntent(keyword) {
  const value = normalizeKeyword(keyword);
  if (excludedTerms.some((term) => value.includes(term))) return "irrelevant";
  if (/\b(quote|buy|order|bulk|wholesale|moq)\b/.test(value)) return "transactional";
  if (/\b(manufacturer|factory|supplier|oem|odm|private label)\b/.test(value)) return "supplier_selection";
  if (/\b(vs|versus|compare|comparison)\b/.test(value)) return "comparison";
  if (/\b(how|guide|what|why|materials?)\b/.test(value)) return "informational";
  if (/\b(custom|prototype|sample)\b/.test(value)) return "commercial";
  return productPattern.test(value) ? "product_research" : "irrelevant";
}

export function classifyBuyerStage(keyword, intent = classifyIntent(keyword)) {
  const value = normalizeKeyword(keyword);
  if (/\b(quote|quotation|bulk order)\b/.test(value)) return "quotation";
  if (/\b(sample|prototype)\b/.test(value)) return "sampling";
  if (["supplier_selection", "transactional"].includes(intent)) return "supplier_shortlisting";
  if (["commercial", "product_research", "comparison"].includes(intent)) return "product_research";
  return "awareness";
}

export function assignCategories(keyword) {
  const categories = categoryRules.filter(([, pattern]) => pattern.test(keyword)).map(([name]) => name);
  return categories.length ? categories : ["manual_review"];
}

export function assignPageType(keyword, categories, existingPages = []) {
  const value = normalizeKeyword(keyword);
  const generic = new Set([
    "custom", "manufacturer", "factory", "supplier", "china", "private",
    "label", "bags", "bag", "oem", "odm", "sports",
  ]);
  const tokens = value.split(/[^a-z0-9]+/).filter((token) => token.length > 3 && !generic.has(token));
  const similar = existingPages.map((page) => {
    const pageUrl = String(page.url || "").toLowerCase();
    const haystack = new Set(`${pageUrl} ${page.title || ""} ${page.h1 || ""}`
      .toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const matches = tokens.filter((token) => haystack.has(token)).length;
    const score = tokens.length ? matches / tokens.length : 0;
    const commercialBoost = /\b(manufacturer|factory|supplier|oem|odm)\b/.test(value)
      && /manufacturer|factory|landing|oem|odm/.test(pageUrl) ? 0.35 : 0;
    const editorialPenalty = /\/blog\/|\/resources\/|guide/.test(pageUrl) ? 0.45 : 0;
    return { page, score, matches, rank: score + commercialBoost - editorialPenalty };
  }).filter((candidate) =>
    candidate.matches > 0 && candidate.score >= (tokens.length === 1 ? 1 : 0.6)
  ).sort((left, right) => right.rank - left.rank)[0]?.page;
  if (similar) return { target_page_type: "existing_page_optimization", target_url: similar.url };
  if (categories.includes("manual_review")) return { target_page_type: "manual_review", target_url: null };
  if (/\b(recycled|material|fabric|eco)\b/.test(value)) return { target_page_type: "material_page", target_url: null };
  if (/\b(compare|vs|versus)\b/.test(value)) return { target_page_type: "comparison", target_url: null };
  if (/\b(guide|how|what|why)\b/.test(value)) return { target_page_type: "buyer_guide", target_url: null };
  if (/\b(manufacturer|factory|supplier|private label|oem|odm)\b/.test(value)) {
    return { target_page_type: categories.length > 1 ? "landing_page" : "category_page", target_url: null };
  }
  return { target_page_type: "product_page", target_url: null };
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

export function scoreKeyword(row) {
  const keyword = normalizeKeyword(row.keyword || row.normalized_keyword);
  const intent = classifyIntent(keyword);
  if (intent === "irrelevant") return { opportunity_score: 0, priority: "reject_or_archive" };
  const commercial = clamp(
    commercialTerms.reduce((score, term) => score + (keyword.includes(term) ? 13 : 0), 35),
  );
  const businessFit = productPattern.test(keyword) ? 90 : 40;
  const searchDemand = clamp(row.search_volume ? Math.log10(Number(row.search_volume) + 1) * 25 : 45);
  const rankingOpportunity = clamp(row.ranking_opportunity_score ?? (row.average_position ? 100 - Number(row.average_position) * 2 : 60));
  const competitionReverse = clamp(row.keyword_difficulty == null ? 55 : 100 - Number(row.keyword_difficulty));
  const inquiryValue = ["supplier_selection", "transactional"].includes(intent) ? 90 : 65;
  const opportunity_score = clamp(
    searchDemand * 0.2 + commercial * 0.25 + businessFit * 0.25
    + rankingOpportunity * 0.15 + competitionReverse * 0.1 + inquiryValue * 0.05,
  );
  const priority = opportunity_score >= 90 ? "critical_priority"
    : opportunity_score >= 80 ? "high_priority"
      : opportunity_score >= 65 ? "medium_priority"
        : opportunity_score >= 40 ? "low_priority" : "reject_or_archive";
  return {
    search_demand_score: searchDemand, commercial_intent_score: commercial,
    business_fit_score: businessFit, ranking_opportunity_score: rankingOpportunity,
    competition_reverse_score: competitionReverse, conversion_value_score: inquiryValue,
    opportunity_score, priority,
  };
}

export function processKeyword(row, existingPages = []) {
  const keyword = row.keyword || row.query || "";
  const normalized_keyword = normalizeKeyword(keyword);
  const search_intent = classifyIntent(normalized_keyword);
  const categories = assignCategories(normalized_keyword);
  const page = assignPageType(normalized_keyword, categories, existingPages);
  const scores = scoreKeyword({ ...row, normalized_keyword });
  const slug = slugify(normalized_keyword);
  return {
    site: "cappuccinobag", keyword, normalized_keyword,
    language: row.language || "en", country: row.country || "global",
    source: row.source || "manual", search_volume: Number(row.search_volume) || null,
    keyword_difficulty: Number(row.keyword_difficulty) || null,
    cpc: Number(row.cpc) || null, search_intent,
    buyer_stage: classifyBuyerStage(normalized_keyword, search_intent),
    target_category: categories.join(" / "), ...page,
    target_url: page.target_url || `/${slug}/`, ...scores,
    status: categories.includes("manual_review") || search_intent === "irrelevant"
      ? "manual_review" : "manual_review",
  };
}

export function processKeywords(rows, existingPages = []) {
  return deduplicateKeywords(rows).map((row) => processKeyword(row, existingPages));
}

export function toSeoKeywordRow(record) {
  const fields = [
    "site", "keyword", "normalized_keyword", "language", "country", "source",
    "search_volume", "keyword_difficulty", "cpc", "commercial_intent_score",
    "search_intent", "buyer_stage", "business_fit_score", "ranking_opportunity_score",
    "conversion_value_score", "opportunity_score", "target_category",
    "target_page_type", "target_url", "status",
  ];
  return Object.fromEntries(fields.map((field) => [field, record[field]]));
}

export function parseKeywordCsv(csv = "", source = "csv") {
  const lines = String(csv).replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((item) => normalizeKeyword(item).replace(/ /g, "_"));
  const keywordIndex = headers.findIndex((item) => ["keyword", "query", "search_term"].includes(item));
  if (keywordIndex === -1) return lines.map((keyword) => ({ keyword, source }));
  return lines.slice(1).map((line) => {
    const cells = line.match(/("([^"]|"")*"|[^,]*)/g)?.filter((value, index) => index % 2 === 0) || [];
    const row = Object.fromEntries(headers.map((header, index) => [
      header,
      String(cells[index] || "").replace(/^"|"$/g, "").replace(/""/g, '"').trim(),
    ]));
    return { ...row, keyword: row.keyword || row.query || row.search_term, source };
  }).filter((row) => row.keyword);
}

export function detectCannibalization(pages = []) {
  const conflicts = [];
  for (let left = 0; left < pages.length; left += 1) {
    for (let right = left + 1; right < pages.length; right += 1) {
      const a = pages[left];
      const b = pages[right];
      const keywordA = normalizeKeyword(a.primary_keyword || a.h1 || a.title);
      const keywordB = normalizeKeyword(b.primary_keyword || b.h1 || b.title);
      if (!keywordA || !keywordB) continue;
      const tokens = new Set(keywordA.split(" ").filter((token) => token.length > 3));
      const overlap = keywordB.split(" ").filter((token) => tokens.has(token)).length / Math.max(tokens.size, 1);
      if (keywordA === keywordB || overlap >= 0.8) {
        conflicts.push({
          keyword: keywordA, current_url: a.url, competing_url: b.url,
          conflict_type: keywordA === keywordB ? "same_primary_keyword" : "similar_title_or_h1",
          severity: keywordA === keywordB ? "high" : "medium",
          recommended_action: "optimize_existing_page",
        });
      }
    }
  }
  return conflicts;
}
