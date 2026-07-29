function normalizeUrl(value, baseUrl = "https://www.cappuccinobag.com") {
  try {
    const url = new URL(value, baseUrl);
    if (url.origin !== new URL(baseUrl).origin) return null;
    return `${url.pathname.replace(/\/+/g, "/")}${url.search}`;
  } catch {
    return null;
  }
}

export function buildPageIndex(pages = []) {
  const urls = new Set(pages.map((page) => normalizeUrl(page.url)).filter(Boolean));
  return pages.map((page) => {
    const links = (page.links || []).map((link) => ({
      ...link, normalized: normalizeUrl(link.href || link.url),
    })).filter((link) => link.normalized);
    return {
      ...page, links, inbound_internal_links: 0,
      outbound_internal_links: new Set(links.map((link) => link.normalized)).size,
      page_depth: (normalizeUrl(page.url)?.split("/").filter(Boolean).length || 0),
      published_status: page.status || "published",
    };
  }).map((page, _, indexed) => ({
    ...page,
    inbound_internal_links: indexed.reduce(
      (count, source) => count + (source.links.some((link) => link.normalized === normalizeUrl(page.url)) ? 1 : 0), 0,
    ),
    known_url: urls.has(normalizeUrl(page.url)),
  }));
}

export function auditInternalLinks(pages = []) {
  const index = buildPageIndex(pages);
  const known = new Set(index.map((page) => normalizeUrl(page.url)));
  const broken = [];
  const duplicates = [];
  for (const page of index) {
    const counts = new Map();
    for (const link of page.links) {
      if (!known.has(link.normalized) && !link.normalized.startsWith("/inquiry")) {
        broken.push({
          issue: "internal_link_not_in_inventory", url: page.url, target_url: link.normalized,
          severity: "high", recommendation: "Verify the route or update the link after human review.",
          auto_fixable: false, human_review_required: true,
        });
      }
      const key = `${link.normalized}|${String(link.text || "").toLowerCase()}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const [key, count] of counts) {
      if (count > 2) duplicates.push({
        issue: "repeated_anchor_target", url: page.url, detail: key, count,
        severity: "medium", recommendation: "Reduce repeated links in the same page.",
        auto_fixable: false, human_review_required: true,
      });
    }
  }
  const orphans = index.filter((page) =>
    page.url !== "/" && page.inbound_internal_links === 0 && !/robots|sitemap/.test(page.url)
  ).map((page) => ({
    issue: "orphan_page", url: page.url, severity: "high",
    recommendation: "Add a contextual link from a relevant category, product or guide page.",
    auto_fixable: false, human_review_required: true,
  }));
  return { index, broken, orphans, duplicates };
}

function sharedTerms(left = "", right = "") {
  const ignored = new Set(["custom", "manufacturer", "bag", "bags", "cappuccino", "china"]);
  const a = new Set(left.toLowerCase().split(/\W+/).filter((token) => token.length > 3 && !ignored.has(token)));
  return right.toLowerCase().split(/\W+/).filter((token) => a.has(token)).length;
}

export function recommendInternalLinks(source, pages = []) {
  const sourceText = `${source.title || ""} ${source.h1 || ""} ${source.primary_keyword || ""} ${source.category || ""}`;
  const candidates = pages
    .filter((target) => normalizeUrl(target.url) !== normalizeUrl(source.url))
    .map((target) => {
      const targetText = `${target.title || ""} ${target.h1 || ""} ${target.primary_keyword || ""} ${target.category || ""}`;
      const relevance = Math.min(100, 40 + sharedTerms(sourceText, targetText) * 15);
      return {
        site: "cappuccinobag", source_url: source.url, target_url: target.url,
        anchor_text: target.primary_keyword || target.h1 || target.title,
        reason: "Topical overlap and buyer-journey support.",
        relevance_score: relevance, status: "manual_review",
      };
    }).filter((item) => item.relevance_score >= 55)
    .sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 6);
  const required = [
    ["/factory-trust-materials/", "factory proof"],
    ["/inquiry/", "project RFQ"],
    ["/contact/", "contact Cappuccino Bag"],
  ];
  for (const [target_url, anchor_text] of required) {
    if (!candidates.some((item) => item.target_url === target_url) && source.url !== target_url) {
      candidates.push({
        site: "cappuccinobag", source_url: source.url, target_url, anchor_text,
        reason: "Required B2B trust or conversion path.", relevance_score: 80, status: "manual_review",
      });
    }
  }
  return candidates;
}

export function validateAnchorDistribution(suggestions = []) {
  const exact = suggestions.filter((item) =>
    String(item.anchor_text).toLowerCase() === String(item.primary_keyword || "").toLowerCase()
  ).length;
  const ratio = suggestions.length ? exact / suggestions.length : 0;
  return { exactMatchRatio: ratio, ok: ratio <= 0.3, recommended: "20–30% exact, ~30% partial, 40–50% natural/brand." };
}
