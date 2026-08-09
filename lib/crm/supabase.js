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

async function findCustomer(email, whatsapp) {
  const filter = email
    ? `email_normalized=eq.${encodeURIComponent(email)}`
    : `whatsapp_phone=eq.${encodeURIComponent(whatsapp || "")}`;
  const existing = await supabaseRequest(`customers?select=*&${filter}&limit=1`);
  return existing?.[0] || null;
}

async function updateCustomer(existing, input, whatsapp) {
  const updated = await supabaseRequest(`customers?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      site: existing.site || input.site,
      brand: existing.brand || input.brand,
      source_channel: existing.source_channel || input.source_channel || "website",
      name: input.name || existing.name,
      company: input.company || existing.company,
      country: input.country || existing.country,
      language: input.language || existing.language || "en",
      phone: input.phone || existing.phone,
      whatsapp_phone: whatsapp || existing.whatsapp_phone,
    },
    prefer: "return=representation",
  });
  return updated[0];
}

export async function findOrCreateCustomer(input) {
  const email = String(input.email || "").trim().toLowerCase() || null;
  const whatsapp = normalizePhone(input.whatsapp || input.phone);
  const existing = await findCustomer(email, whatsapp);
  if (existing) return updateCustomer(existing, input, whatsapp);

  try {
    const created = await supabaseRequest("customers", {
      method: "POST",
      body: {
        site: input.site,
        brand: input.brand,
        source_channel: input.source_channel || "website",
        email,
        email_normalized: email,
        whatsapp_phone: whatsapp,
        name: input.name || null,
        company: input.company || null,
        phone: input.phone || null,
        country: input.country || null,
        language: input.language || "en",
      },
      prefer: "return=representation",
    });
    return created[0];
  } catch (error) {
    const raced = await findCustomer(email, whatsapp).catch(() => null);
    if (raced) return updateCustomer(raced, input, whatsapp);
    throw error;
  }
}

export async function createInquiry(input) {
  const customer = await findOrCreateCustomer(input);
  const rows = await supabaseRequest("inquiries", {
    method: "POST",
    body: { ...input, customer_id: customer.id },
    prefer: "return=representation",
  });
  return { customer, inquiry: rows[0] };
}

export async function findInquiryBySubmissionId(submissionId) {
  const rows = await supabaseRequest(
    `inquiries?select=*&submission_id=eq.${encodeURIComponent(submissionId)}&limit=1`,
  );
  return rows?.[0] || null;
}

export async function createInquiryIdempotent(input) {
  const existing = await findInquiryBySubmissionId(input.submission_id);
  if (existing) return { customer: null, inquiry: existing, idempotent: true };

  const customer = await findOrCreateCustomer(input);
  const rows = await supabaseRequest("inquiries?on_conflict=submission_id", {
    method: "POST",
    body: { ...input, customer_id: customer.id },
    prefer: "resolution=ignore-duplicates,return=representation",
  });
  if (rows?.[0]) return { customer, inquiry: rows[0], idempotent: false };

  const duplicate = await findInquiryBySubmissionId(input.submission_id);
  if (!duplicate) throw new Error("Inquiry could not be saved idempotently.");
  return { customer: null, inquiry: duplicate, idempotent: true };
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
