import {
  ANALYTICS_PERIODS,
  ANALYTICS_SITES,
  analyticsDateRange,
  googleAnalyticsConfiguration,
} from "./config.js";
import { applyOwnerScope } from "../crm/scope.js";
import { supabaseRequest } from "../crm/supabase.js";

export function normalizeAnalyticsFilters(input = {}) {
  const site = Object.hasOwn(ANALYTICS_SITES, input.site) ? input.site : "all";
  const days = ANALYTICS_PERIODS.has(Number(input.days)) ? Number(input.days) : 28;
  return { site, days };
}

function aggregateRows(rows) {
  const summary = {
    clicks: 0, impressions: 0, sessions: 0, active_users: 0,
    engaged_sessions: 0, inquiries: 0, weighted_position: 0,
  };
  for (const row of rows) {
    const impressions = Number(row.impressions || 0);
    summary.clicks += Number(row.clicks || 0);
    summary.impressions += impressions;
    summary.sessions += Number(row.sessions || 0);
    summary.active_users += Number(row.active_users || 0);
    summary.engaged_sessions += Number(row.engaged_sessions || 0);
    summary.weighted_position += Number(row.position || 0) * impressions;
  }
  return {
    ...summary,
    ctr: summary.impressions ? summary.clicks / summary.impressions : 0,
    position: summary.impressions ? summary.weighted_position / summary.impressions : 0,
  };
}

export function summarizeAnalytics(rows, inquiries) {
  const bySite = Object.fromEntries(Object.keys(ANALYTICS_SITES).map((site) => {
    const summary = aggregateRows(rows.filter((row) => row.site === site));
    summary.inquiries = inquiries.filter((item) => item.site === site).length;
    summary.conversion_rate = summary.sessions ? summary.inquiries / summary.sessions : 0;
    return [site, summary];
  }));
  const total = aggregateRows(rows);
  total.inquiries = inquiries.length;
  total.conversion_rate = total.sessions ? total.inquiries / total.sessions : 0;
  return { total, bySite };
}

function mergeTrend(rows, inquiries) {
  const dates = new Map();
  for (const row of rows) {
    const current = dates.get(row.metric_date) || {
      date: row.metric_date, clicks: 0, impressions: 0, sessions: 0, inquiries: 0,
    };
    current.clicks += Number(row.clicks || 0);
    current.impressions += Number(row.impressions || 0);
    current.sessions += Number(row.sessions || 0);
    dates.set(row.metric_date, current);
  }
  for (const inquiry of inquiries) {
    const date = String(inquiry.submit_time || inquiry.created_at || "").slice(0, 10);
    if (!date) continue;
    const current = dates.get(date) || { date, clicks: 0, impressions: 0, sessions: 0, inquiries: 0 };
    current.inquiries += 1;
    dates.set(date, current);
  }
  return [...dates.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function loadAnalyticsDashboard(filters, actor) {
  const range = analyticsDateRange(filters.days);
  const since = range.startDate;
  const siteFilter = filters.site === "all" ? "" : `&site=eq.${filters.site}`;
  try {
    const [daily, inquiries, searchRows, syncRuns] = await Promise.all([
      supabaseRequest(`analytics_daily?select=*&metric_date=gte.${since}${siteFilter}&order=metric_date.asc&limit=1000`),
      supabaseRequest(applyOwnerScope(
        `inquiries?select=id,site,submit_time,created_at,first_landing_page,current_page_url&created_at=gte.${since}T00:00:00Z&created_at=lte.${range.endDate}T23:59:59Z${siteFilter}&order=created_at.asc&limit=5000`,
        actor,
      )),
      supabaseRequest(`analytics_search_rows?select=*&range_start=lte.${since}${siteFilter}&order=snapshot_date.desc,clicks.desc&limit=1000`),
      supabaseRequest(`analytics_sync_runs?select=*&order=created_at.desc&limit=10${siteFilter}`),
    ]);
    const newestSnapshot = new Map();
    for (const row of searchRows) {
      if (!newestSnapshot.has(row.site)) newestSnapshot.set(row.site, row.snapshot_date);
    }
    const currentSearchRows = searchRows.filter((row) => newestSnapshot.get(row.site) === row.snapshot_date);
    return {
      configured: true,
      error: "",
      range,
      configuration: googleAnalyticsConfiguration(),
      daily,
      inquiries,
      trend: mergeTrend(daily, inquiries),
      summary: summarizeAnalytics(daily, inquiries),
      queries: currentSearchRows.filter((row) => row.dimension_type === "query").slice(0, 50),
      pages: currentSearchRows.filter((row) => row.dimension_type === "page").slice(0, 50),
      syncRuns,
    };
  } catch (error) {
    return {
      configured: false,
      error: error.message,
      range,
      configuration: googleAnalyticsConfiguration(),
      daily: [],
      inquiries: [],
      trend: [],
      summary: summarizeAnalytics([], []),
      queries: [],
      pages: [],
      syncRuns: [],
    };
  }
}
