import { ANALYTICS_SITES, analyticsDateRange, analyticsSiteConfig } from "./config.js";
import { fetchGa4Report, fetchSearchConsoleReports } from "./google.js";
import { supabaseRequest } from "../crm/supabase.js";

function mergeDaily(site, gscRows = [], ga4Rows = []) {
  const rows = new Map();
  const get = (date) => {
    if (!rows.has(date)) {
      rows.set(date, {
        site,
        source: "google",
        owner: "system",
        metric_date: date,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        sessions: 0,
        active_users: 0,
        engaged_sessions: 0,
      });
    }
    return rows.get(date);
  };
  for (const row of gscRows) {
    Object.assign(get(row.date), {
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    });
  }
  for (const row of ga4Rows) {
    Object.assign(get(row.date), row);
  }
  return [...rows.values()].sort((a, b) => a.metric_date.localeCompare(b.metric_date));
}

function searchRows(site, range, type, rows) {
  return rows.map((row) => ({
    site,
    source: "gsc",
    owner: "system",
    snapshot_date: range.endDate,
    range_start: range.startDate,
    range_end: range.endDate,
    dimension_type: type,
    dimension_value: row[type],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

async function writeSyncRun(input) {
  await supabaseRequest("analytics_sync_runs", {
    method: "POST",
    body: input,
    prefer: "return=minimal",
  });
}

export async function syncSiteAnalytics(site, { days = 90 } = {}) {
  const range = analyticsDateRange(days);
  const config = analyticsSiteConfig(site);
  const startedAt = new Date().toISOString();
  const [gscResult, ga4Result] = await Promise.allSettled([
    config.searchConsoleProperty
      ? fetchSearchConsoleReports(site, range)
      : Promise.reject(new Error(`${config.searchConsolePropertyEnv} is not configured.`)),
    config.ga4PropertyId
      ? fetchGa4Report(site, range)
      : Promise.reject(new Error(`${config.ga4PropertyEnv} is not configured.`)),
  ]);
  const gsc = gscResult.status === "fulfilled" ? gscResult.value : { daily: [], queries: [], pages: [] };
  const ga4 = ga4Result.status === "fulfilled" ? ga4Result.value : [];
  const daily = mergeDaily(site, gsc.daily, ga4);
  const errors = [
    gscResult.status === "rejected" ? `GSC: ${gscResult.reason.message}` : "",
    ga4Result.status === "rejected" ? `GA4: ${ga4Result.reason.message}` : "",
  ].filter(Boolean);

  if (!daily.length) {
    await writeSyncRun({
      site, source: "google", owner: "system", status: "failed",
      range_start: range.startDate, range_end: range.endDate, row_count: 0,
      error_message: errors.join(" | "), started_at: startedAt, finished_at: new Date().toISOString(),
    });
    throw new Error(errors.join(" | ") || "Google returned no analytics data.");
  }

  await supabaseRequest("analytics_daily?on_conflict=site,metric_date", {
    method: "POST",
    body: daily,
    prefer: "resolution=merge-duplicates,return=minimal",
  });

  const dimensions = [
    ...searchRows(site, range, "query", gsc.queries),
    ...searchRows(site, range, "page", gsc.pages),
  ];
  if (dimensions.length) {
    await supabaseRequest(
      `analytics_search_rows?site=eq.${site}&snapshot_date=eq.${range.endDate}`,
      { method: "DELETE", prefer: "return=minimal" },
    );
    await supabaseRequest("analytics_search_rows?on_conflict=site,snapshot_date,dimension_type,dimension_value", {
      method: "POST",
      body: dimensions,
      prefer: "resolution=merge-duplicates,return=minimal",
    });
  }

  await writeSyncRun({
    site, source: "google", owner: "system", status: errors.length ? "partial" : "completed",
    range_start: range.startDate, range_end: range.endDate,
    row_count: daily.length + dimensions.length, error_message: errors.join(" | ") || null,
    started_at: startedAt, finished_at: new Date().toISOString(),
  });
  return {
    site,
    status: errors.length ? "partial" : "completed",
    range,
    dailyRows: daily.length,
    searchRows: dimensions.length,
    errors,
  };
}

export async function syncAllAnalytics(options) {
  const results = await Promise.allSettled(
    Object.keys(ANALYTICS_SITES).map((site) => syncSiteAnalytics(site, options)),
  );
  return results.map((result, index) => ({
    site: Object.keys(ANALYTICS_SITES)[index],
    ...(result.status === "fulfilled"
      ? result.value
      : { status: "failed", error: result.reason.message }),
  }));
}

export { mergeDaily };
