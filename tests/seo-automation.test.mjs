import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  assignCategories, assignPageType, classifyIntent, deduplicateKeywords,
  detectCannibalization, normalizeKeyword, processKeyword, scoreKeyword,
} from "../automation/keywords/pipeline.js";
import { slugify } from "../automation/lib/slug.js";
import { generateContentBrief } from "../automation/content/generate-content-brief.js";
import { generatePageDraft } from "../automation/content/generate-page-draft.js";
import { reviewContent } from "../automation/review/review-content.js";
import { safeClaims } from "../automation/config/protected-claims.js";
import { assertSafeAutomationEnvironment } from "../automation/config/cappuccinobag.config.js";
import { canPublishPage } from "../automation/config/publishing-rules.js";
import {
  auditInternalLinks, recommendInternalLinks, validateAnchorDistribution,
} from "../automation/internal-links/audit.js";
import {
  createImageJob, generateAltText, imageFilename, validateImageJobs,
} from "../automation/images/image-jobs.js";

const root = process.cwd();

test("keyword normalization standardizes punctuation, spacing and simple plurals", () => {
  assert.equal(normalizeKeyword("  Custom—Padel   Bags Manufacturer!!! "), "custom-padel bag manufacturer");
});

test("keyword deduplication preserves the first original form", () => {
  const rows = deduplicateKeywords(["Custom Padel Bags", "custom padel bag", "Custom Tennis Bag"]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].keyword, "Custom Padel Bags");
});

test("keyword score stays in range and rewards commercial intent", () => {
  const commercial = scoreKeyword({ keyword: "custom padel bag manufacturer", search_volume: 500, keyword_difficulty: 30 });
  const informational = scoreKeyword({ keyword: "padel bag guide", search_volume: 500, keyword_difficulty: 30 });
  assert.ok(commercial.opportunity_score >= informational.opportunity_score);
  assert.ok(commercial.opportunity_score >= 0 && commercial.opportunity_score <= 100);
});

test("commercial intent and buyer stage are identified", () => {
  const row = processKeyword({ keyword: "OEM racket sports bag factory" });
  assert.equal(classifyIntent(row.keyword), "supplier_selection");
  assert.equal(row.buyer_stage, "supplier_shortlisting");
});

test("product categories and page type are assigned conservatively", () => {
  assert.deepEqual(assignCategories("custom running waist pack supplier"), ["Running", "Waist Packs"]);
  assert.equal(assignPageType("unknown ornamental object", ["manual_review"]).target_page_type, "manual_review");
});

test("existing-page matching prioritizes optimization over page creation", () => {
  const result = assignPageType("custom padel bag manufacturer", ["Padel"], [{
    url: "/custom-padel-bag-manufacturer/", title: "Custom Padel Bag Manufacturer", h1: "Custom Padel Bag Manufacturer",
  }]);
  assert.equal(result.target_page_type, "existing_page_optimization");
});

test("existing-page matching ignores generic manufacturer terms", () => {
  const result = assignPageType("custom tennis bag manufacturer", ["Tennis"], [
    { url: "/custom-cardholder-manufacturer/", title: "Custom Cardholder Manufacturer" },
    { url: "/custom-tennis-bag-manufacturer/", title: "Custom Tennis Bag Manufacturer" },
  ]);
  assert.equal(result.target_url, "/custom-tennis-bag-manufacturer/");
});

test("supplier keywords prefer commercial pages over guides", () => {
  const result = assignPageType("custom hiking backpack manufacturer", ["Hiking", "Backpacks"], [
    { url: "/resources/hiking-backpack-customization-guide/", title: "Hiking Backpack Guide" },
    { url: "/custom-hiking-backpack-manufacturer/", title: "Custom Hiking Backpack Manufacturer" },
  ]);
  assert.equal(result.target_url, "/custom-hiking-backpack-manufacturer/");
});

test("keyword competition detection returns a manual recommendation", () => {
  const conflicts = detectCannibalization([
    { url: "/a/", title: "Custom Padel Bag Manufacturer" },
    { url: "/b/", h1: "Custom Padel Bag Manufacturer" },
  ]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].recommended_action, "optimize_existing_page");
});

test("slug generation is deterministic and URL safe", () => {
  assert.equal(slugify("RFID Wallet Manufacturer China"), "rfid-wallet-manufacturer-china");
});

test("content schema contains SEO, buyer and JSON-LD fields", () => {
  const brief = generateContentBrief(processKeyword({ keyword: "custom tennis bag manufacturer" }));
  const draft = generatePageDraft(brief);
  for (const key of ["site", "slug", "pageType", "title", "h1", "materials", "faq", "seo", "jsonLd"]) {
    assert.ok(draft[key], `missing ${key}`);
  }
  assert.equal(draft.status, "manual_review");
  assert.equal(draft.seo.robots, "noindex, nofollow");
  assert.doesNotThrow(() => JSON.stringify(draft.jsonLd));
});

test("seven-layer content review detects prohibited claims", () => {
  const review = reviewContent({
    title: "Custom Bag Manufacturer", h1: "Custom Bag Manufacturer",
    seo: { title: "Custom Bag Manufacturer in China for Private Label Buyers", description: "A".repeat(120), canonical: "https://www.cappuccinobag.com/custom-bag/" },
    body: "Guaranteed lowest price. MOQ is 100. Contact sales@example.com.",
    jsonLd: { "@context": "https://schema.org" },
  });
  assert.ok(review.hallucinationRisk > 10);
  assert.equal(review.decision, "manual_review_required");
  assert.ok(review.layers.factual.invalidEmails.length);
});

test("MOQ and lead-time safe expressions avoid unsupported promises", () => {
  assert.match(safeClaims.moq, /depends on/i);
  assert.match(safeClaims.productionLeadTime, /confirmed after/i);
  assert.doesNotMatch(`${safeClaims.moq} ${safeClaims.productionLeadTime}`, /\bguaranteed\b/i);
});

test("public mailto and form delivery email remain consistent", () => {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.name.endsWith(".html")) files.push(target);
    }
  }
  walk(path.join(root, "public"));
  const destinations = files.flatMap((file) => {
    const text = fs.readFileSync(file, "utf8");
    return [...text.matchAll(/(?:mailto:|formsubmit\.co\/ajax\/)([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)].map((match) => match[1].toLowerCase());
  });
  assert.ok(destinations.length > 0);
  assert.deepEqual([...new Set(destinations)], ["info@cappuccinobag.net"]);
});

test("brand boundary rejects Novlane content", () => {
  const review = reviewContent({ title: "Novlane handbag story", h1: "Novlane", seo: {}, body: "Luxury handbag lifestyle." });
  assert.ok(review.layers.brand.violations.length);
  assert.equal(review.decision, "manual_review_required");
});

test("internal-link recommendations include factory proof and RFQ", () => {
  const suggestions = recommendInternalLinks({ url: "/draft/", title: "Custom Padel Bag" }, []);
  assert.ok(suggestions.some((item) => item.target_url === "/factory-trust-materials/"));
  assert.ok(suggestions.some((item) => item.target_url === "/inquiry/"));
  assert.ok(suggestions.every((item) => item.status === "manual_review"));
});

test("anchor-text distribution flags excess exact matches", () => {
  const result = validateAnchorDistribution([
    { anchor_text: "custom bag", primary_keyword: "custom bag" },
    { anchor_text: "custom bag", primary_keyword: "custom bag" },
  ]);
  assert.equal(result.ok, false);
});

test("orphan and 404-style inventory checks find missing relationships", () => {
  const result = auditInternalLinks([
    { url: "/", links: [{ href: "/known/", text: "Known" }, { href: "/missing/", text: "Missing" }] },
    { url: "/known/", links: [] },
    { url: "/orphan/", links: [] },
  ]);
  assert.ok(result.broken.some((item) => item.target_url === "/missing/"));
  assert.ok(result.orphans.some((item) => item.url === "/orphan/"));
});

test("image naming, alt text and task validation are deterministic", () => {
  assert.equal(imageFilename("Custom Padel Backpack", "zipper_detail"), "custom-padel-backpack-zipper-detail.webp");
  assert.ok(generateAltText("custom padel backpack", "front").length <= 150);
  const job = createImageJob({ keyword: "custom padel backpack", category: "Padel", type: "lifestyle", ratio: "16:9" });
  assert.match(job.disclosure, /Concept visualization/);
  assert.equal(validateImageJobs([job]).ok, true);
});

test("sitemap and metadata implementations target the canonical host", () => {
  const sitemap = fs.readFileSync(path.join(root, "app/sitemap.js"), "utf8");
  const layout = fs.readFileSync(path.join(root, "app/layout.js"), "utf8");
  assert.match(sitemap, /https:\/\/www\.cappuccinobag\.com/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /canonical/);
});

test("draft_only safety gate blocks publish and auto merge", () => {
  const environment = {
    AUTOMATION_MODE: "draft_only", CONTENT_AUTO_PUBLISH: "false",
    CONTENT_AUTO_MERGE: "false", INTERNAL_LINK_AUTO_INSERT: "false",
    IMAGE_AUTO_GENERATE: "false", IMAGE_AUTO_PUBLISH: "false",
    GITHUB_OWNER: "topmart8", GITHUB_REPO: "cappuccinobag", GITHUB_DEFAULT_BRANCH: "main",
  };
  assert.equal(assertSafeAutomationEnvironment(environment).ok, true);
  assert.equal(canPublishPage("manual_review", environment), false);
  assert.equal(canPublishPage("approved", environment), false);
});

test("unimplemented task-specific automation commands fail closed", () => {
  for (const command of ["content", "review", "images", "publish"]) {
    const result = spawnSync(process.execPath, ["automation/cli.js", command], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, AUTOMATION_MODE: "draft_only" },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /requires an approved task-specific implementation; no action was taken/);
  }
});

test("keyword and brief workflows remain manual-only", () => {
  for (const workflow of ["keyword-research.yml", "content-briefs.yml"]) {
    const source = fs.readFileSync(path.join(root, ".github", "workflows", workflow), "utf8");
    assert.doesNotMatch(source, /^\s*schedule:/m);
    assert.match(source, /^\s*workflow_dispatch:/m);
  }
});
