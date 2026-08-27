const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "yahoo.com", "qq.com", "163.com", "126.com", "proton.me",
]);

export function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

export function normalizePhoneIdentity(value = "") {
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : "";
}

export function normalizeDomainIdentity(value = "") {
  try {
    const raw = String(value).trim();
    if (!raw) return "";
    const input = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(input).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function normalizeCompanyIdentity(value = "") {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function corporateEmailDomain(email) {
  const domain = normalizeEmail(email).split("@")[1] || "";
  return domain && !FREE_EMAIL_DOMAINS.has(domain) ? domain : "";
}

export function identityCandidates(input = {}) {
  const email = normalizeEmail(input.email || input.contact_email);
  const phone = normalizePhoneIdentity(input.phone || input.telephone);
  const whatsapp = normalizePhoneIdentity(input.whatsapp || input.whats_app || input.whatsapp_phone);
  const website = normalizeDomainIdentity(input.company_website || input.website);
  const domain = website || corporateEmailDomain(email);
  const company = normalizeCompanyIdentity(input.company || input.company_name);
  const contact = normalizeCompanyIdentity(input.name || input.contact_name || input.customer_name);
  return { email, phone, whatsapp, website, domain, company, contact };
}

export function suppressionCandidates(input = {}) {
  const candidates = identityCandidates(input);
  return [
    ["email", candidates.email],
    ["phone", candidates.phone],
    ["whatsapp", candidates.whatsapp],
    ["domain", candidates.domain],
    ["website", candidates.website],
    ["company", candidates.company],
    ["contact_person", candidates.contact],
  ].filter(([, value]) => value);
}

export function classifyCustomer(customer, { duplicate = false, suppressed = false } = {}) {
  if (duplicate) return "duplicate";
  if (customer?.duplicate_review) return "duplicate_review";
  if (
    suppressed
    || customer?.do_not_prospect
    || customer?.do_not_contact
    || customer?.relationship_status === "blocked"
  ) {
    return "blocked";
  }
  if (customer?.is_existing_customer) return "existing_customer";
  if (customer?.stage === "won") return "existing_customer";
  if (customer?.relationship_status === "existing_customer") return "existing_customer";
  if (customer?.relationship_status === "old_customer") return "old_customer";
  if (customer?.relationship_status === "supplier_non_buyer") return "supplier_non_buyer";
  return customer ? "existing_lead" : "new_lead";
}
