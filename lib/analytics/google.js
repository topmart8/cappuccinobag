import { GoogleAuth } from "google-auth-library";
import { analyticsSiteConfig } from "./config.js";

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

function serviceAccountCredentials() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("Google service account is not configured.");
  }
  return { client_email: clientEmail, private_key: privateKey };
}

async function accessToken() {
  const auth = new GoogleAuth({ credentials: serviceAccountCredentials(), scopes: SCOPES });
  const client = await auth.getClient();
  const result = await client.getAccessToken();
  const token = typeof result === "string" ? result : result?.token;
  if (!token) throw new Error("Google access token could not be created.");
  return token;
}

async function googlePost(url, body, token) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = data?.error?.message || `Google API request failed (${response.status}).`;
    throw new Error(reason);
  }
  return data;
}

export function normalizeGscRows(rows = [], dimensions = []) {
  return rows.map((row) => ({
    ...Object.fromEntries(dimensions.map((dimension, index) => [dimension, row.keys?.[index] || ""])),
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    ctr: Number(row.ctr || 0),
    position: Number(row.position || 0),
  }));
}

export function normalizeGa4Rows(report = {}) {
  const dimensions = report.dimensionHeaders?.map((item) => item.name) || [];
  const metrics = report.metricHeaders?.map((item) => item.name) || [];
  return (report.rows || []).map((row) => ({
    ...Object.fromEntries(dimensions.map((name, index) => [name, row.dimensionValues?.[index]?.value || ""])),
    ...Object.fromEntries(metrics.map((name, index) => [name, Number(row.metricValues?.[index]?.value || 0)])),
  }));
}

async function searchConsoleQuery(property, token, range, dimensions, rowLimit = 25000) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
  const report = await googlePost(url, {
    startDate: range.startDate,
    endDate: range.endDate,
    dimensions,
    type: "web",
    dataState: "final",
    aggregationType: dimensions.includes("page") ? "auto" : "byProperty",
    rowLimit,
  }, token);
  return normalizeGscRows(report.rows, dimensions);
}

export async function fetchSearchConsoleReports(site, range) {
  const config = analyticsSiteConfig(site);
  if (!config.searchConsoleProperty) throw new Error(`${config.searchConsolePropertyEnv} is not configured.`);
  const token = await accessToken();
  const [daily, queries, pages] = await Promise.all([
    searchConsoleQuery(config.searchConsoleProperty, token, range, ["date"]),
    searchConsoleQuery(config.searchConsoleProperty, token, range, ["query"], 250),
    searchConsoleQuery(config.searchConsoleProperty, token, range, ["page"], 250),
  ]);
  return { daily, queries, pages };
}

export async function fetchGa4Report(site, range) {
  const config = analyticsSiteConfig(site);
  if (!config.ga4PropertyId) throw new Error(`${config.ga4PropertyEnv} is not configured.`);
  const token = await accessToken();
  const report = await googlePost(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(config.ga4PropertyId)}:runReport`,
    {
      dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "engagedSessions" },
      ],
      limit: "10000",
      keepEmptyRows: false,
    },
    token,
  );
  return normalizeGa4Rows(report).map((row) => ({
    date: `${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6, 8)}`,
    sessions: row.sessions,
    active_users: row.activeUsers,
    engaged_sessions: row.engagedSessions,
  }));
}
