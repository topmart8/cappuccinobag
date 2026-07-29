import { PUBLIC_EMAIL, SITE_URL } from "../config/cappuccinobag.config.js";
import { safeClaims } from "../config/protected-claims.js";
import { slugify } from "../lib/slug.js";

function titleCase(value) {
  return String(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function generateContentBrief(keywordRecord, context = {}) {
  const keyword = keywordRecord.normalized_keyword || keywordRecord.keyword;
  const slug = slugify(keyword);
  const targetUrl = keywordRecord.target_url || `/${slug}/`;
  const pageType = keywordRecord.target_page_type || "landing_page";
  const category = keywordRecord.target_category || "manual_review";
  const existing = context.existingPages?.find((page) => page.url === targetUrl);
  return {
    task_id: `brief-${slug}`,
    site: "cappuccinobag",
    status: "manual_review",
    primary_keyword: keyword,
    supporting_keywords: [
      `${keyword} China`, `${category.split(" / ")[0]} OEM`, `${category.split(" / ")[0]} private label`,
    ].map((item) => item.toLowerCase()),
    keyword_cluster: category,
    search_intent: keywordRecord.search_intent,
    buyer_stage: keywordRecord.buyer_stage,
    target_countries: context.targetCountries || ["United Kingdom", "Germany", "United States", "Australia"],
    target_page_type: existing ? "existing_page_optimization" : pageType,
    recommended_url: existing?.url || targetUrl,
    recommended_title: `${titleCase(keyword)} | OEM/ODM Cappuccino Bag`,
    recommended_h1: titleCase(keyword),
    recommended_meta_description: `Develop ${keyword} with material, structure, logo, sampling, quality-control and packaging options for private-label B2B projects.`,
    page_goal: "Help qualified B2B buyers evaluate a custom development route and submit a detailed RFQ.",
    recommended_word_count: pageType === "buyer_guide" ? 1600 : 1100,
    content_outline: [
      "Buyer use case and product positioning", "Construction and functional options",
      "Material and logo choices", "OEM/ODM sampling workflow", "Quality-control checkpoints",
      "Packaging choices", "Safe MOQ and lead-time guidance", "FAQ and RFQ next step",
    ],
    product_category: category,
    material_direction: ["high-density polyester", "recycled-material options", "coated fabric options"],
    customization_options: ["structure", "colour", "logo process", "lining", "hardware", "packaging"],
    buyer_questions: [
      "What is the target use case and market?", "What quantity range is being evaluated?",
      "Which product dimensions and compartments are required?", "Which logo and packaging route is preferred?",
    ],
    recommended_faq: [
      { question: "What is the MOQ?", answer: safeClaims.moq },
      { question: "How long does sampling take?", answer: safeClaims.sampleLeadTime },
      { question: "Can recycled materials be reviewed?", answer: safeClaims.certification },
    ],
    internal_links: [
      "/factory-trust-materials/", "/inquiry/", "/contact/",
      context.categoryUrl || "/#products", context.articleUrl || "/resources/",
    ],
    recommended_products: context.relatedProducts || [],
    recommended_articles: context.relatedArticles || [],
    factory_proof_link: "/factory-trust-materials/",
    rfq_cta: { label: "Request a project review", href: "/inquiry/" },
    whatsapp_cta: { label: "Discuss the brief on WhatsApp", href: "https://wa.me/8613928715568" },
    image_tasks: ["hero", "front", "interior", "material_detail", "logo_detail", "lifestyle"],
    factual_risks: [
      "Final MOQ, price, sample cost and lead time require human confirmation.",
      "Material certifications and performance claims require batch-specific evidence.",
      "Only approved real product images may represent final construction.",
    ],
    human_confirmation_required: [
      "dimensions and capacity", "materials", "MOQ", "prototype cost",
      "sample lead time", "production lead time", "certifications",
    ],
    public_contact: PUBLIC_EMAIL,
    canonical: new URL(targetUrl, SITE_URL).href,
  };
}
