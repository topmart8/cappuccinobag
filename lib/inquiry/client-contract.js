import { sanitizeUrl } from "../analytics/client.js";

const FIRST_TOUCH_KEY = "cappuccino_first_touch";
const CURRENT_VISIT_KEY = "cappuccino_current_visit";

function readStoredJson(storage, key) {
  try {
    return JSON.parse(storage?.getItem(key) || "null") || {};
  } catch {
    return {};
  }
}

export function createSubmissionGuard(createId = () => globalThis.crypto.randomUUID()) {
  let inFlight = false;
  let submissionId = "";

  return {
    begin() {
      if (inFlight) return null;
      inFlight = true;
      submissionId ||= createId();
      return submissionId;
    },
    finish({ success = false } = {}) {
      if (success) submissionId = "";
      inFlight = false;
    },
    currentSubmissionId() {
      return submissionId;
    },
  };
}
export function readInquiryAttribution(browser = globalThis.window, now = () => new Date()) {
  const href = browser?.location?.href || "https://www.cappuccinobag.com/";
  const currentUrl = sanitizeUrl(href);
  const query = new URL(href, "https://www.cappuccinobag.com").searchParams;
  const localStorage = browser?.localStorage;
  const first = readStoredJson(localStorage, FIRST_TOUCH_KEY);
  const current = {
    ...readStoredJson(localStorage, CURRENT_VISIT_KEY),
    ...readStoredJson(browser?.sessionStorage, CURRENT_VISIT_KEY),
  };
  const documentReferrer = sanitizeUrl(browser?.document?.referrer || "");
  const currentValue = (key) => current[key] || query.get(key) || "";

  return {
    first_landing_page: first.first_landing_page || first.landing_page || currentUrl,
    first_visit_time: first.first_visit_time || first.visit_time || now().toISOString(),
    referrer: first.referrer || documentReferrer,
    utm_source: first.utm_source || "",
    utm_medium: first.utm_medium || "",
    utm_campaign: first.utm_campaign || "",
    utm_content: first.utm_content || "",
    utm_term: first.utm_term || "",
    gclid: first.gclid || "",
    msclkid: first.msclkid || "",
    current_page_url: currentUrl,
    current_referrer: current.referrer || documentReferrer,
    current_utm_source: currentValue("utm_source"),
    current_utm_medium: currentValue("utm_medium"),
    current_utm_campaign: currentValue("utm_campaign"),
    current_utm_content: currentValue("utm_content"),
    current_utm_term: currentValue("utm_term"),
    current_gclid: currentValue("gclid"),
    current_msclkid: currentValue("msclkid"),
    submit_time: now().toISOString(),
    device: /Mobi|Android/i.test(browser?.navigator?.userAgent || "") ? "mobile" : "desktop",
  };
}

export function buildPadelInquiryPayload(fields, attribution, submissionId) {
  const product = String(fields.product_type || "").trim();
  const detail = (value) => String(value || "").trim() || "Not specified";

  return {
    ...fields,
    ...attribution,
    submission_id: submissionId,
    product_category: "Padel Bags",
    product,
    target_price: String(fields.target_price_range || "").trim(),
    target_delivery_date: String(fields.bulk_delivery_deadline || "").trim(),
    message: [
      `Reference / design notes: ${detail(fields.reference_notes)}`,
      `Target price range: ${detail(fields.target_price_range)}`,
      `Shoe compartment: ${detail(fields.shoe_compartment)}`,
      `Racket sleeves: ${detail(fields.racket_sleeve_quantity)}`,
      `Sample deadline: ${detail(fields.sample_deadline)}`,
      `Bulk delivery deadline: ${detail(fields.bulk_delivery_deadline)}`,
    ].join("\n"),
  };
}
