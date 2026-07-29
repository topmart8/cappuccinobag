import { applyOwnerScope } from "./auth.js";
import { demoActivities, demoLeads } from "./demo.js";
import { supabaseRequest } from "./supabase.js";

const SITES = new Set(["all", "cappuccinobag", "novlane"]);
const STAGES = new Set(["all", "new", "qualified", "contacted", "replied", "quoted", "sample", "negotiation", "won", "lost"]);

function safe(value, fallback, allowed) {
  return allowed.has(value) ? value : fallback;
}

function add(path, expression) {
  return `${path}${path.includes("?") ? "&" : "?"}${expression}`;
}

export function normalizeFilters(input = {}) {
  return {
    site: safe(String(input.site || "all"), "all", SITES),
    stage: safe(String(input.stage || "all"), "all", STAGES),
    country: String(input.country || "").trim().slice(0, 100),
    industry: String(input.industry || "").trim().slice(0, 120),
    product: String(input.product || "").trim().slice(0, 120),
    source: String(input.source || "").trim().slice(0, 80),
    owner: String(input.owner || "").trim().slice(0, 160),
    contact: ["email", "phone", "whatsapp"].includes(input.contact) ? input.contact : "",
    q: String(input.q || "").trim().slice(0, 160),
    demo: String(input.demo || "") === "1",
  };
}

function customersQuery(filters, actor) {
  let path = "customers?select=*&order=created_at.desc&limit=500";
  if (filters.site !== "all") path = add(path, `site=eq.${filters.site}`);
  if (filters.stage !== "all") path = add(path, `stage=eq.${filters.stage}`);
  if (filters.country) path = add(path, `country=ilike.*${encodeURIComponent(filters.country)}*`);
  if (filters.industry) path = add(path, `industry=ilike.*${encodeURIComponent(filters.industry)}*`);
  if (filters.source) path = add(path, `source=eq.${encodeURIComponent(filters.source)}`);
  if (filters.owner) path = add(path, `owner=eq.${encodeURIComponent(filters.owner)}`);
  if (filters.contact === "email") path = add(path, "email=not.is.null");
  if (filters.contact === "phone") path = add(path, "phone=not.is.null");
  if (filters.contact === "whatsapp") path = add(path, "whatsapp_phone=not.is.null");
  if (filters.q) {
    const term = encodeURIComponent(`*${filters.q}*`);
    path = add(path, `or=(company.ilike.${term},name.ilike.${term},email.ilike.${term},website.ilike.${term})`);
  }
  return applyOwnerScope(path, actor);
}

function includesProduct(lead, product) {
  if (!product) return true;
  const haystack = [
    ...(lead.product_keywords || []),
    lead.notes,
    lead.industry,
  ].join(" ").toLowerCase();
  return haystack.includes(product.toLowerCase());
}

export async function loadCrmDashboard(filters, actor) {
  if (filters.demo) {
    const leads = demoLeads
      .filter((item) => filters.site === "all" || item.site === filters.site)
      .filter((item) => filters.stage === "all" || item.stage === filters.stage)
      .filter((item) => includesProduct(item, filters.product));
    return { leads, activities: demoActivities, tasks: [], inquiries: [], configured: false, error: "" };
  }

  try {
    const [leads, activities, tasks, inquiries] = await Promise.all([
      supabaseRequest(customersQuery(filters, actor)),
      supabaseRequest(applyOwnerScope("activities?select=*&order=created_at.desc&limit=12", actor)),
      supabaseRequest(applyOwnerScope("tasks?select=*&status=in.(open,doing)&order=due_at.asc&limit=50", actor)),
      supabaseRequest(applyOwnerScope("inquiries?select=id,site,stage,source,product_category,country,created_at&order=created_at.desc&limit=500", actor)),
    ]);
    return {
      leads: leads.filter((item) => includesProduct(item, filters.product)),
      activities,
      tasks,
      inquiries,
      configured: true,
      error: "",
    };
  } catch (error) {
    return { leads: [], activities: [], tasks: [], inquiries: [], configured: false, error: error.message };
  }
}

export function summarizeDashboard(data) {
  const today = new Date().toISOString().slice(0, 10);
  const all = [...data.leads];
  const stages = Object.fromEntries(
    ["new", "qualified", "contacted", "replied", "quoted", "sample", "negotiation", "won", "lost"]
      .map((stage) => [stage, all.filter((item) => item.stage === stage).length]),
  );
  return {
    total: all.length,
    today: all.filter((item) => String(item.created_at || "").startsWith(today)).length,
    pending: all.filter((item) => item.next_follow_up && new Date(item.next_follow_up) <= new Date()).length,
    ...stages,
  };
}
