import { buildDedupeCandidates, scoreLead } from "./scoring.js";

export const importFields = [
  "company", "name", "country", "industry", "website", "email", "phone", "whatsapp",
  "facebook_url", "instagram_url", "linkedin_url", "product_keywords", "source_url",
  "stage", "tags", "notes", "next_follow_up",
];

const STAGES = new Set(["new", "qualified", "contacted", "replied", "quoted", "sample", "negotiation", "won", "lost"]);

function text(value, max = 1000) {
  return String(value ?? "").replace(/\0/g, "").trim().slice(0, max);
}

function list(value) {
  return text(value, 2000).split(/[;,|]/).map((item) => item.trim()).filter(Boolean).slice(0, 30);
}

export function normalizeImportRow(raw = {}, context = {}) {
  const stage = text(raw.stage, 30).toLowerCase();
  const normalized = {
    site: context.site === "novlane" ? "novlane" : "cappuccinobag",
    brand: context.site === "novlane" ? "Novlane" : "Cappuccino Bag",
    source: text(context.source || "csv", 80),
    source_channel: "manual",
    owner: text(context.owner, 180) || null,
    assigned_owner: text(context.owner, 180) || null,
    company: text(raw.company, 180) || null,
    name: text(raw.name, 120) || null,
    country: text(raw.country, 120) || null,
    industry: text(raw.industry, 160) || null,
    website: text(raw.website, 500) || null,
    email: text(raw.email, 180).toLowerCase() || null,
    email_normalized: text(raw.email, 180).toLowerCase() || null,
    phone: text(raw.phone, 80) || null,
    whatsapp_phone: text(raw.whatsapp, 80) || null,
    facebook_url: text(raw.facebook_url, 500) || null,
    instagram_url: text(raw.instagram_url, 500) || null,
    linkedin_url: text(raw.linkedin_url, 500) || null,
    product_keywords: list(raw.product_keywords),
    source_url: text(raw.source_url, 1200) || null,
    stage: STAGES.has(stage) ? stage : "new",
    tags: list(raw.tags),
    notes: text(raw.notes, 5000) || null,
    next_follow_up: text(raw.next_follow_up, 80) || null,
    is_demo: false,
  };
  const identifiers = buildDedupeCandidates({
    ...normalized,
    whatsapp: normalized.whatsapp_phone,
  });
  normalized.phone = identifiers.phone ? `+${identifiers.phone}` : normalized.phone;
  normalized.whatsapp_phone = identifiers.whatsapp ? `+${identifiers.whatsapp}` : normalized.whatsapp_phone;
  const errors = [];
  if (!normalized.company && !normalized.name) errors.push("公司名或联系人至少填写一项");
  if (!identifiers.email && !identifiers.phone && !identifiers.whatsapp && !identifiers.domain) {
    errors.push("邮箱、电话、WhatsApp 或公司网站至少填写一项");
  }
  if (normalized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) errors.push("邮箱格式错误");
  if (normalized.next_follow_up && Number.isNaN(Date.parse(normalized.next_follow_up))) errors.push("下次跟进时间格式错误");
  const scored = scoreLead({
    ...normalized,
    whatsapp: normalized.whatsapp_phone,
  });
  return {
    normalized: { ...normalized, domain: identifiers.domain || null, score: scored.final },
    identifiers,
    errors,
    score_reasons: scored.reasons,
  };
}

export function mapImportRow(raw, mapping = {}) {
  return Object.fromEntries(
    Object.entries(mapping)
      .filter(([, destination]) => importFields.includes(destination))
      .map(([source, destination]) => [destination, raw[source]]),
  );
}
