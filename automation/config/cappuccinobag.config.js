export const SITE = "cappuccinobag";
export const SITE_URL = "https://www.cappuccinobag.com";
export const PUBLIC_EMAIL = "info@cappuccinobag.net";

export const cappuccinoConfig = Object.freeze({
  site: SITE,
  brand: "Cappuccino Bag",
  positioning: "Custom Bag Manufacturer in China",
  siteUrl: SITE_URL,
  publicEmail: PUBLIC_EMAIL,
  defaultBranch: "main",
  mode: "draft_only",
  autoPublish: false,
  autoMerge: false,
  internalLinkAutoInsert: false,
  imageAutoGenerate: false,
  imageAutoPublish: false,
  targetMarkets: [
    "United Kingdom", "Netherlands", "Germany", "Spain", "Poland",
    "Czech Republic", "United States", "Australia", "Southeast Asia",
  ],
});

export function assertSafeAutomationEnvironment(env = process.env) {
  const errors = [];
  if ((env.AUTOMATION_MODE || "draft_only") !== "draft_only") errors.push("AUTOMATION_MODE must be draft_only.");
  for (const key of [
    "CONTENT_AUTO_PUBLISH", "CONTENT_AUTO_MERGE", "INTERNAL_LINK_AUTO_INSERT",
    "IMAGE_AUTO_GENERATE", "IMAGE_AUTO_PUBLISH",
  ]) {
    if (String(env[key] || "false").toLowerCase() === "true") errors.push(`${key} must be false.`);
  }
  if ((env.GITHUB_OWNER || "topmart8") !== "topmart8") errors.push("GITHUB_OWNER must be topmart8.");
  if ((env.GITHUB_REPO || "cappuccinobag") !== "cappuccinobag") errors.push("GITHUB_REPO must be cappuccinobag.");
  if ((env.GITHUB_DEFAULT_BRANCH || "main") !== "main") errors.push("GITHUB_DEFAULT_BRANCH must be main.");
  return { ok: errors.length === 0, errors };
}
