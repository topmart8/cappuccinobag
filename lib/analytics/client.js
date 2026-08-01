const CONSENT_KEY = "cappuccino_analytics_consent";
const SENSITIVE_QUERY_KEYS = new Set([
  "name", "email", "phone", "whatsapp", "address", "message", "company",
  "contact", "contact_person", "full_name", "first_name", "last_name",
]);
const ALLOWED_PARAMS = new Set([
  "site", "site_domain", "page_path", "page_title", "page_type",
  "product_category", "product_slug", "product_name", "cta_name",
  "cta_location", "form_type", "lead_source", "utm_source", "utm_medium",
  "utm_campaign", "utm_content", "utm_term", "gclid_present",
  "msclkid_present", "device_type", "language", "country_code",
  "referrer_domain",
]);

export function sanitizeUrl(value, { keepAttribution = true } = {}) {
  try {
    const url = new URL(value, "https://www.cappuccinobag.com");
    for (const key of [...url.searchParams.keys()]) {
      const normalized = key.toLowerCase();
      const parameterValue = url.searchParams.get(key) || "";
      const allowedAttribution = keepAttribution
        && (/^utm_/.test(normalized) || normalized === "gclid" || normalized === "msclkid");
      if (
        SENSITIVE_QUERY_KEYS.has(normalized)
        || (!allowedAttribution && /(name|mail|phone|whats|address|message|company)/i.test(normalized))
        || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(parameterValue)
        || /^\+?[\d\s().-]{7,}$/.test(parameterValue)
      ) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeCurrentBrowserUrl() {
  const clean = sanitizeUrl(window.location.href);
  if (clean && clean !== window.location.href) {
    window.history.replaceState(window.history.state, "", clean);
  }
  return clean;
}

export function readAnalyticsConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    return "unset";
  }
}

export function saveAnalyticsConsent(value) {
  const normalized = value === "granted" ? "granted" : "denied";
  try {
    window.localStorage.setItem(CONSENT_KEY, normalized);
    document.cookie = `${CONSENT_KEY}=${normalized}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
  } catch {}
  window.dispatchEvent(new CustomEvent("cappuccino:analytics-consent", { detail: normalized }));
}

export function pageContext(pathname = window.location.pathname) {
  const path = pathname || "/";
  const segments = path.split("/").filter(Boolean);
  const slug = segments.at(-1) || "homepage";
  const rules = [
    ["padel", "padel"], ["pickleball", "pickleball"], ["tennis", "tennis"],
    ["pet-travel", "pet-travel"], ["hiking", "hiking"], ["outdoor", "outdoor"], ["travel", "travel"],
    ["running", "running"], ["rfid", "rfid-wallet"], ["passport", "passport-holder"],
    ["eco", "smart-eco"], ["factory", "factory-proof"], ["blog", "blog"],
  ];
  const category = rules.find(([needle]) => path.includes(needle))?.[1] || "";
  let pageType = path === "/" ? "homepage" : category || "other";
  if (
    path.startsWith("/products/")
    || path.startsWith("/padel-bags/")
    || path.startsWith("/running-waist-packs/")
    || (path.startsWith("/pet-travel-bags/") && path.split("/").filter(Boolean).length > 1)
  ) pageType = "product";
  if (path.startsWith("/inquiry") || path.startsWith("/rfq")) pageType = "rfq";
  if (path.startsWith("/contact")) pageType = "contact";
  return {
    page_type: pageType,
    product_category: category,
    product_slug: pageType === "product" ? slug : "",
  };
}

function referrerDomain(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function safeEventParams(input = {}) {
  const base = {
    site: "cappuccino",
    site_domain: "cappuccinobag.com",
    page_path: window.location.pathname,
    page_title: document.title,
    language: document.documentElement.lang || navigator.language || "en",
    device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    referrer_domain: referrerDomain(document.referrer),
    ...pageContext(),
  };
  const output = {};
  for (const [key, rawValue] of Object.entries({ ...base, ...input })) {
    if (!ALLOWED_PARAMS.has(key) || rawValue === undefined || rawValue === null || rawValue === "") continue;
    output[key] = typeof rawValue === "boolean" ? rawValue : String(rawValue).slice(0, 180);
  }
  return output;
}

export function trackEvent(name, params = {}) {
  if (readAnalyticsConsent() !== "granted" || typeof window.gtag !== "function") return false;
  window.gtag("event", name, safeEventParams(params));
  if (process.env.NODE_ENV !== "production") {
    window.__cappuccinoAnalyticsEvents = [
      ...(window.__cappuccinoAnalyticsEvents || []),
      name,
    ].slice(-20);
  }
  return true;
}

export function trackPageView() {
  return trackEvent("page_view", {
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

export function formTypeFrom(form) {
  const value = String(form?.dataset?.form || form?.getAttribute?.("name") || "").toLowerCase();
  if (value.includes("sample")) return "sample_request";
  if (value.includes("contact")) return "contact";
  if (value.includes("product")) return "product_inquiry";
  return "rfq";
}

export function submissionEventFor(formType) {
  return {
    sample_request: "sample_request_submit",
    contact: "contact_submit",
    product_inquiry: "product_inquiry_submit",
    rfq: "rfq_submit",
  }[formType] || "rfq_submit";
}

export { CONSENT_KEY };
