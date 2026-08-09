import {
  attributionFrom,
  clean,
  ingestSharedInquiry,
} from "./shared-ingest.js";

export { attributionFrom, clean };

// Compatibility wrapper for existing server callers. All writes are owned by shared-ingest.
export async function saveWebsiteInquiry(site, raw, uploadedFiles = []) {
  raw.product_category = raw.product_category || raw.product_needed || raw.product || "";
  const siteSource = site === "cappuccinobag" ? "cappuccino" : site;
  return ingestSharedInquiry({ siteSource, raw, uploadedFiles });
}
