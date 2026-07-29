import { PUBLIC_EMAIL } from "../config/cappuccinobag.config.js";
import { safeClaims } from "../config/protected-claims.js";
import { assertDraftOnlyRecord } from "../config/publishing-rules.js";

export function generatePageDraft(brief) {
  const category = brief.product_category || "Custom Bags";
  return assertDraftOnlyRecord({
    site: "cappuccinobag",
    sku: null,
    slug: brief.recommended_url.replace(/^\/|\/$/g, ""),
    pageType: brief.target_page_type,
    title: brief.recommended_title,
    h1: brief.recommended_h1,
    summary: `A buyer-focused development brief for ${brief.primary_keyword}, covering product structure, materials, branding, sampling, quality control and packaging.`,
    primaryKeyword: brief.primary_keyword,
    supportingKeywords: brief.supporting_keywords,
    category,
    targetMarkets: brief.target_countries,
    materials: brief.material_direction,
    dimensions: "Confirmed after reviewing the intended use, contents and construction.",
    construction: brief.customization_options,
    features: [
      "Structure developed around the buyer's use case",
      "Material, colour and trim options reviewed during sampling",
      "Logo placement and packaging matched to the approved artwork",
    ],
    customizationOptions: brief.customization_options,
    logoOptions: ["embroidery", "woven label", "rubber patch", "heat transfer", "debossing where suitable"],
    colorOptions: ["Buyer-supplied colour references reviewed during material sourcing"],
    samplePolicy: safeClaims.sampleLeadTime,
    moqPolicy: safeClaims.moq,
    productionPolicy: safeClaims.productionLeadTime,
    packagingOptions: ["polybag and carton", "hangtag", "barcode label", "project-specific retail packaging"],
    qualityControl: [
      "Material and component review", "First-piece review", "Construction and function checks",
      "Logo and packing confirmation", "Final inspection before shipment",
    ],
    images: brief.image_tasks.map((type) => ({ type, status: "image_pending" })),
    faq: brief.recommended_faq,
    relatedProducts: brief.recommended_products,
    relatedArticles: brief.recommended_articles,
    seo: {
      title: brief.recommended_title,
      description: brief.recommended_meta_description,
      canonical: brief.canonical,
      robots: "noindex, nofollow",
    },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: brief.recommended_h1,
      description: brief.recommended_meta_description,
      url: brief.canonical,
      isPartOf: { "@type": "WebSite", name: "Cappuccino Bag", url: "https://www.cappuccinobag.com" },
    },
    body: {
      introduction: `Cappuccino Bag supports B2B development of ${brief.primary_keyword} for brands, importers, wholesalers and specialist retailers.`,
      buyerValue: `The development route begins with the intended user, target market, contents, dimensions and brand requirements. Construction is confirmed through sampling rather than assumed from a generic template.`,
      materialAndConstruction: `Material, reinforcement, lining, zipper, hardware and carry-system options are reviewed against the target use case and price direction. ${safeClaims.waterResistance}`,
      oemOdm: "OEM/ODM support can cover product development, sampling, material sourcing, logo customization, packaging customization and quality inspection.",
      sampling: `${safeClaims.prototypeCost} ${safeClaims.sampleLeadTime}`,
      production: safeClaims.productionLeadTime,
      cta: `Send the use case, reference images, target quantity, logo files and packaging needs to ${PUBLIC_EMAIL} for a project review.`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
