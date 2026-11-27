import { padelBuyerReading, padelGuide } from "./padel-buyer-reading.js";

export const padelBackpackCollection = "/racket-sports/padel-backpacks";

// SKU attributes are scoped to the available evidence. Review topics are not verified features.
export const padelCatalog = {
  PDB001: {
    label: "PDB001 work tote backpack",
    href: "/products/padel-work-tote-backpack-pdb001",
    family: "Backpack / tote",
    use: ["commute", "court"],
    observed: [["racket", "Racket storage visible in physical sample photos"]],
    reviewTopics: ["organization"],
  },
  PDB014: {
    label: "PDB014 Court Chic Tote",
    href: "/products/womens-lightweight-padel-tote-pdb014",
    family: "Tote",
    use: ["commute", "court"],
    observed: [],
    reviewTopics: ["racket", "logo"],
  },
  PDB015: {
    label: "PDB015 commuter tote",
    href: "/products/work-court-padel-commuter-tote-pdb015",
    family: "Tote",
    use: ["commute", "court"],
    observed: [],
    reviewTopics: ["racket", "organization"],
  },
  PDB016: {
    label: "PDB016 Weekend Match Carryall",
    href: "/products/weekend-padel-carryall-pdb016",
    family: "Duffel",
    use: ["travel", "court"],
    observed: [],
    reviewTopics: ["shoe", "racket"],
  },
  PDB017: {
    label: "PDB017 Court Transit Backpack",
    href: "/products/travel-padel-utility-backpack-pdb017",
    family: "Backpack",
    use: ["travel", "court"],
    observed: [],
    reviewTopics: ["shoe", "racket", "bottle", "logo"],
  },
  S005: {
    label: "S005 reflective-lined racket sleeve",
    href: "/padel-accessories/custom-padel-racket-sleeve",
    family: "Racket sleeve",
    use: ["court"],
    observed: [["reflective-lining", "Reflective lining visible in a sample-photo reference; thermal performance untested"]],
    reviewTopics: ["racket", "fabric"],
  },
};

export function getPadelCatalogGuides(sku) {
  const entry = padelCatalog[sku];
  if (!entry) return [];
  const ranked = padelBuyerReading.map((article) => ({
    article,
    score: article.tags.filter((tag) => entry.reviewTopics.includes(tag)).length,
  })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  if (entry.observed.some(([tag]) => tag === "reflective-lining")) {
    const materials = padelBuyerReading.find(({ slug }) => slug === "recycled-water-resistant-materials-padel-bags");
    return [[materials.href, "Review lining materials and thermal-claim limits"], [padelGuide, "Plan a Padel development brief"]];
  }
  return ranked.slice(0, 2).map(({ article }) => [article.href, article.title]);
}

export function rankComparablePadelProducts(sku, models) {
  const current = padelCatalog[sku];
  if (!current) return models;
  const score = (item) => {
    const entry = padelCatalog[item.model];
    if (!entry) return 0;
    return entry.use.filter((use) => current.use.includes(use)).length
      + entry.observed.filter(([tag]) => current.observed.some(([knownTag]) => tag === knownTag)).length;
  };
  return [...models].sort((a, b) => score(b) - score(a));
}
