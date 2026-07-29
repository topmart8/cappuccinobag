import { PUBLIC_EMAIL } from "../config/cappuccinobag.config.js";
import { findProhibitedClaims } from "../config/prohibited-claims.js";

const otherBrand = /\bnovlane\b/i;
const wrongEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const riskyNumbers = /\b(?:factory|employees?|machines?|capacity|lead time|MOQ|minimum order)\D{0,20}\d+/gi;
const weakLanguage = /\b(premium|high quality|leading|best|perfect)\b/gi;

function score(base, deductions) {
  return Math.max(0, Math.min(100, base - deductions));
}

export function reviewContent(content, existingPages = []) {
  const text = typeof content === "string" ? content : JSON.stringify(content);
  const emails = text.match(wrongEmail) || [];
  const invalidEmails = emails.filter((email) => email.toLowerCase() !== PUBLIC_EMAIL);
  const prohibited = findProhibitedClaims(text);
  const numericClaims = text.match(riskyNumbers) || [];
  const brandViolations = otherBrand.test(text) ? ["Novlane brand reference"] : [];
  const title = content?.seo?.title || content?.title || "";
  const description = content?.seo?.description || content?.meta_description || "";
  const h1 = content?.h1 || "";
  const duplicateMatches = existingPages.filter((page) =>
    page.title === title || page.h1 === h1 || page.meta_description === description
  );
  const languageFlags = text.match(weakLanguage) || [];
  const missingBuyerSections = [
    ["materials", content?.materials],
    ["customization", content?.customizationOptions],
    ["MOQ", content?.moqPolicy],
    ["sampling", content?.samplePolicy],
    ["production", content?.productionPolicy],
    ["packaging", content?.packagingOptions],
    ["quality control", content?.qualityControl],
    ["RFQ next step", text.includes("/inquiry/") || text.includes(PUBLIC_EMAIL)],
  ].filter(([, present]) => !present).map(([name]) => name);
  const factualRisk = prohibited.length + numericClaims.length + invalidEmails.length;
  const hallucinationRisk = Math.min(100, prohibited.length * 20 + numericClaims.length * 12);
  const duplicateRisk = Math.min(100, duplicateMatches.length * 35);
  const result = {
    factualAccuracy: score(100, factualRisk * 18),
    seoQuality: score(100,
      (!title || title.length < 30 || title.length > 65 ? 15 : 0)
      + (!description || description.length < 90 || description.length > 165 ? 15 : 0)
      + (!h1 ? 20 : 0)
      + (!content?.seo?.canonical ? 15 : 0)
      + (!content?.jsonLd ? 10 : 0)),
    buyerValue: score(100, missingBuyerSections.length * 8),
    brandConsistency: score(100, brandViolations.length * 80 + invalidEmails.length * 50),
    languageQuality: score(100, languageFlags.length * 4),
    duplicateRisk,
    hallucinationRisk,
    finalScore: 0,
    decision: "",
    requiredChanges: [],
    layers: {
      factual: { prohibited, numericClaims, invalidEmails },
      seo: { titleLength: title.length, descriptionLength: description.length, hasH1: Boolean(h1) },
      buyerValue: { missingSections: missingBuyerSections },
      brand: { violations: brandViolations },
      language: { flags: languageFlags },
      duplicate: { matchingUrls: duplicateMatches.map((page) => page.url) },
      hallucination: { riskSignals: [...prohibited, ...numericClaims] },
    },
  };
  result.finalScore = Math.round(
    result.factualAccuracy * 0.22 + result.seoQuality * 0.18 + result.buyerValue * 0.18
    + result.brandConsistency * 0.17 + result.languageQuality * 0.15
    + (100 - result.duplicateRisk) * 0.05 + (100 - result.hallucinationRisk) * 0.05,
  );
  result.requiredChanges = [
    ...invalidEmails.map((email) => `Replace unauthorized public email: ${email}`),
    ...prohibited.map(() => "Remove or substantiate prohibited commercial claim."),
    ...numericClaims.map((claim) => `Human verification required for numeric claim: ${claim}`),
    ...brandViolations.map(() => "Remove content from another brand."),
    ...missingBuyerSections.map((section) => `Add buyer information: ${section}.`),
  ];
  if (factualRisk > 0 || hallucinationRisk > 10 || brandViolations.length || invalidEmails.length) {
    result.decision = "manual_review_required";
  } else if (result.finalScore >= 90) result.decision = "approve_for_human_review";
  else if (result.finalScore >= 80) result.decision = "revise_automatically";
  else if (result.finalScore >= 70) result.decision = "manual_review_required";
  else result.decision = "reject_and_rewrite";
  return result;
}
