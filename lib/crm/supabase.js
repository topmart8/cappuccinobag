import {
  classifyCustomer,
  identityCandidates,
  suppressionCandidates,
} from "./identity.js";

function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("CRM storage is not configured.");
  const normalizedUrl = url.replace(/\/$/, "");
  const expectedProjectRef = process.env.CRM_EXPECTED_SUPABASE_PROJECT_REF?.trim();
  if (expectedProjectRef) {
    const actualHost = new URL(normalizedUrl).hostname;
    if (actualHost !== `${expectedProjectRef}.supabase.co`) {
      throw new Error("CRM Supabase project does not match the configured project ref.");
    }
  }
  return { url: normalizedUrl, key };
}

export async function supabaseRequest(path, { method = "GET", body, prefer, headers = {} } = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.hint || `Supabase request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

export function normalizePhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return `+${digits}`;
}

function identityFilter(candidates) {
  const clauses = [];
  if (candidates.email) clauses.push(`email_normalized.eq.${encodeURIComponent(candidates.email)}`);
  if (candidates.phone) clauses.push(`phone_normalized.eq.${encodeURIComponent(candidates.phone)}`);
  if (candidates.whatsapp) clauses.push(`whatsapp_phone.eq.${encodeURIComponent(candidates.whatsapp)}`);
  if (candidates.domain) clauses.push(`domain.eq.${encodeURIComponent(candidates.domain)}`);
  if (candidates.company) clauses.push(`company_normalized.eq.${encodeURIComponent(candidates.company)}`);
  return clauses.length ? `or=(${clauses.join(",")})` : "";
}

function strongMatchMethod(customer, candidates) {
  if (candidates.email && customer.email_normalized === candidates.email) return "email";
  if (candidates.whatsapp && customer.whatsapp_phone === candidates.whatsapp) return "whatsapp";
  if (candidates.phone && customer.phone_normalized === candidates.phone) return "phone";
  if (candidates.domain && customer.domain === candidates.domain) return "domain";
  if (candidates.website && customer.website_normalized === candidates.website) return "website";
  return null;
}

export async function findSuppressionMatch(input) {
  for (const [matchType, normalizedValue] of suppressionCandidates(input)) {
    const rows = await supabaseRequest(
      `crm_suppressions?select=*&active=eq.true&match_type=eq.${matchType}`
      + `&normalized_value=eq.${encodeURIComponent(normalizedValue)}&limit=1`,
    );
    if (rows?.[0]) return rows[0];
  }
  return null;
}

export async function resolveCustomerIdentity(input) {
  const candidates = identityCandidates(input);
  const filter = identityFilter(candidates);
  const customers = filter
    ? await supabaseRequest(`customers?select=*&${filter}&limit=5`)
    : [];
  const strongCustomers = customers.filter((item) => strongMatchMethod(item, candidates));
  const customer = strongCustomers[0] || null;
  const identityConflict = new Set(strongCustomers.map((item) => item.id)).size > 1;
  const possibleCustomer = customer ? null : customers.find(
    (item) => candidates.company && item.company_normalized === candidates.company,
  ) || null;
  const suppression = await findSuppressionMatch(input);
  return {
    candidates,
    customer: customer || possibleCustomer,
    possibleCustomer: identityConflict ? customer : possibleCustomer,
    matchMethod: identityConflict
      ? "identity_conflict_review"
      : customer ? strongMatchMethod(customer, candidates) : possibleCustomer ? "company_review" : null,
    suppression,
  };
}

export async function resolveOrCreateCustomer(input) {
  const candidates = identityCandidates(input);
  const result = await supabaseRequest("rpc/crm_resolve_customer", {
    method: "POST",
    body: {
      p_input: {
        site: input.site,
        brand: input.brand,
        source_channel: input.source_channel || "website",
        source: input.source || "website",
        owner: input.owner || null,
        assigned_owner: input.assigned_owner || null,
        email: candidates.email || null,
        email_normalized: candidates.email || null,
        phone: input.phone || null,
        phone_normalized: candidates.phone || null,
        whatsapp_phone: candidates.whatsapp || null,
        name: input.name || null,
        contact_normalized: candidates.contact || null,
        company: input.company || null,
        company_normalized: candidates.company || null,
        website: input.company_website || input.website || null,
        website_normalized: candidates.website || null,
        domain: candidates.domain || null,
        country: input.country || null,
        language: input.language || "en",
      },
    },
  });
  if (!result?.customer?.id) throw new Error("Customer identity resolution failed.");
  return {
    candidates,
    customer: result.customer,
    possibleCustomer: result.duplicate_review ? result.customer : null,
    matchMethod: result.match_method,
    duplicateReview: Boolean(result.duplicate_review),
    suppression: result.suppression_id ? { id: result.suppression_id } : null,
    created: Boolean(result.created),
  };
}

export async function findOrCreateCustomer(input) {
  return (await resolveOrCreateCustomer(input)).customer;
}

export async function createInquiry(input) {
  const resolved = await resolveOrCreateCustomer(input);
  const customer = resolved.customer;
  const identityStatus = resolved.suppression
    ? "blocked"
    : resolved.duplicateReview ? "duplicate_review" : classifyCustomer(resolved.created ? null : customer, {
      suppressed: Boolean(resolved.suppression),
    });
  const rows = await supabaseRequest("inquiries", {
    method: "POST",
    body: {
      ...input,
      customer_id: customer.id,
      identity_status: identityStatus,
      identity_match_method: resolved.matchMethod,
      suppression_id: resolved.suppression?.id || null,
    },
    prefer: "return=representation",
  });
  return { customer, inquiry: rows[0], identityStatus, matchMethod: resolved.matchMethod };
}

export async function findInquiryBySubmissionId(submissionId) {
  const rows = await supabaseRequest(
    `inquiries?select=*&submission_id=eq.${encodeURIComponent(submissionId)}&limit=1`,
  );
  return rows?.[0] || null;
}

export async function createInquiryIdempotent(input) {
  const existing = await findInquiryBySubmissionId(input.submission_id);
  if (existing) {
    return { customer: null, inquiry: existing, idempotent: true, identityStatus: "duplicate" };
  }

  const resolved = await resolveOrCreateCustomer(input);
  const customer = resolved.customer;
  const identityStatus = resolved.suppression
    ? "blocked"
    : resolved.duplicateReview ? "duplicate_review" : classifyCustomer(resolved.created ? null : customer, {
      suppressed: Boolean(resolved.suppression),
    });
  const rows = await supabaseRequest("inquiries?on_conflict=submission_id", {
    method: "POST",
    body: {
      ...input,
      customer_id: customer.id,
      identity_status: identityStatus,
      identity_match_method: resolved.matchMethod,
      suppression_id: resolved.suppression?.id || null,
    },
    prefer: "resolution=ignore-duplicates,return=representation",
  });
  if (rows?.[0]) {
    return {
      customer,
      inquiry: rows[0],
      idempotent: false,
      identityStatus,
      matchMethod: resolved.matchMethod,
    };
  }

  const duplicate = await findInquiryBySubmissionId(input.submission_id);
  if (!duplicate) throw new Error("Inquiry could not be saved idempotently.");
  return { customer: null, inquiry: duplicate, idempotent: true, identityStatus: "duplicate" };
}

export async function evaluateOutboundEligibility(input) {
  const resolved = await resolveCustomerIdentity(input);
  if (resolved.suppression) {
    return { allowed: false, reason: "suppressed", customer: resolved.customer };
  }
  const customer = resolved.customer;
  if (["company_review", "identity_conflict_review"].includes(resolved.matchMethod)) {
    return { allowed: false, reason: "duplicate_review", customer };
  }
  if (!customer) return { allowed: true, reason: "new_prospect", customer: null };
  const status = classifyCustomer(customer);
  if (["existing_customer", "old_customer", "blocked", "supplier_non_buyer"].includes(status)) {
    return { allowed: false, reason: status, customer };
  }
  const inquiries = await supabaseRequest(
    `inquiries?select=id,stage&customer_id=eq.${encodeURIComponent(customer.id)}&limit=1`,
  );
  if (inquiries.length) return { allowed: false, reason: "previous_inquiry", customer };
  return { allowed: false, reason: "duplicate_prospect", customer };
}

export async function storageUpload(bucket, path, file) {
  const { url, key } = config();
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!response.ok) throw new Error("File upload failed.");
  return path;
}

export async function createStorageSignedUrl(bucket, path, expiresIn = 300) {
  const { url, key } = config();
  const safeBucket = String(bucket || "");
  const safePath = String(path || "");
  if (!/^[a-z0-9-]{1,80}$/.test(safeBucket) || !safePath || safePath.length > 1000) {
    throw new Error("Invalid attachment path.");
  }
  const segments = safePath.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Invalid attachment path.");
  }
  const encodedPath = segments.map(encodeURIComponent).join("/");
  const response = await fetch(`${url}/storage/v1/object/sign/${safeBucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: Math.max(60, Math.min(900, Number(expiresIn) || 300)) }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.signedURL) throw new Error("Signed attachment URL could not be created.");
  return new URL(data.signedURL, url).toString();
}
