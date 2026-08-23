const RULES = Object.freeze([
  { family: "RACKET_SPORTS", type: "PADEL_BAG", patterns: [/\bpadel\b/, /\bpdb0\d{2}\b/] },
  { family: "RACKET_SPORTS", type: "TENNIS_BAG", patterns: [/\btennis\b/] },
  { family: "RACKET_SPORTS", type: "PICKLEBALL_BAG", patterns: [/\bpickleball\b/, /\bpickle ball\b/] },
  { family: "TEAM_SPORTS", type: "BASEBALL_BAG", patterns: [/\bbaseball\b/, /\bbat bag\b/] },
  { family: "TEAM_SPORTS", type: "HOCKEY_BAG", patterns: [/\bhockey\b/] },
  { family: "LEATHER", type: "WOMENS_LEATHER_HANDBAG", patterns: [/\bwomen'?s leather\b/, /\bleather handbag\b/, /\bladies leather\b/] },
  { family: "LEATHER", type: "MENS_LEATHER_BAG", patterns: [/\bmen'?s leather\b/, /\bleather briefcase\b/] },
  { family: "TRAVEL", type: "WEEKENDER", patterns: [/\bweekender\b/, /\bweekend bag\b/] },
  { family: "TRAVEL", type: "TRAVEL_BACKPACK", patterns: [/\btravel backpack\b/] },
  { family: "TRAVEL", type: "DUFFEL", patterns: [/\bduffel\b/, /\bduffle\b/] },
]);

function clean(value) {
  return String(value ?? "").replace(/\0/g, "").trim();
}

function uniqueKeywords(value) {
  const items = Array.isArray(value) ? value : clean(value).split(/[;,|]/);
  return [...new Set(items.map((item) => clean(item)).filter(Boolean))];
}

export function mapProductTaxonomy({ product = null, product_category = null, product_keywords = [] } = {}) {
  const raw = {
    product: clean(product) || null,
    product_category: clean(product_category) || null,
    product_keywords: uniqueKeywords(product_keywords),
  };
  const haystack = [raw.product, raw.product_category, ...raw.product_keywords]
    .filter(Boolean).join(" ").toLowerCase();
  const rule = RULES.find((candidate) => candidate.patterns.some((pattern) => pattern.test(haystack)));

  if (!rule) {
    return {
      status: "UNMAPPED",
      canonical_family: null,
      canonical_type: null,
      confidence: 0,
      mapping_rule_id: null,
      raw,
    };
  }

  return {
    status: "MAPPED",
    canonical_family: rule.family,
    canonical_type: rule.type,
    confidence: 1,
    mapping_rule_id: `P0_${rule.family}_${rule.type}`,
    raw,
  };
}
