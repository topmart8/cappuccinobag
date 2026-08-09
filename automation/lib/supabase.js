function getConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export async function seoSupabaseRequest(path, options = {}) {
  const config = getConfig();
  if (!config) return { skipped: true, reason: "Supabase is not configured." };
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${config.key}`,
      apikey: config.key,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    cache: "no-store",
  });
  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase request failed (${response.status}).`);
  return data;
}

export async function saveSeoRows(table, rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  return seoSupabaseRequest(table, {
    method: "POST",
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}
