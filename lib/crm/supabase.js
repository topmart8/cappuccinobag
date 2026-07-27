function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("CRM storage is not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function supabaseRequest(path, { method = "GET", body, prefer, headers = {} } = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
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

export async function findOrCreateCustomer(input) {
  const email = String(input.email || "").trim().toLowerCase() || null;
  const whatsapp = normalizePhone(input.whatsapp || input.phone);
  const filter = email
    ? `email_normalized=eq.${encodeURIComponent(email)}`
    : `whatsapp_phone=eq.${encodeURIComponent(whatsapp || "")}`;
  const existing = await supabaseRequest(`customers?select=*&${filter}&limit=1`);
  if (existing?.[0]) {
    const updated = await supabaseRequest(`customers?id=eq.${existing[0].id}`, {
      method: "PATCH",
      body: {
        name: input.name || existing[0].name,
        company: input.company || existing[0].company,
        country: input.country || existing[0].country,
        language: input.language || existing[0].language || "en",
        phone: input.phone || existing[0].phone,
        whatsapp_phone: whatsapp || existing[0].whatsapp_phone,
      },
      prefer: "return=representation",
    });
    return updated[0];
  }
  const created = await supabaseRequest("customers", {
    method: "POST",
    body: {
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

