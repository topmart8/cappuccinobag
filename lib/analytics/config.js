export const ANALYTICS_SITES = {
  cappuccinobag: {
    label: "Cappuccino Bag",
    searchConsolePropertyEnv: "GSC_CAPPUCCINO_PROPERTY",
    ga4PropertyEnv: "GA4_CAPPUCCINO_PROPERTY_ID",
  },
  novlane: {
    label: "Novlane",
    searchConsolePropertyEnv: "GSC_NOVLANE_PROPERTY",
    ga4PropertyEnv: "GA4_NOVLANE_PROPERTY_ID",
  },
};

export const ANALYTICS_PERIODS = new Set([7, 28, 90]);

export function analyticsSiteConfig(site) {
  const definition = ANALYTICS_SITES[site];
  if (!definition) throw new Error("Unsupported analytics site.");
  return {
    ...definition,
    site,
    searchConsoleProperty: process.env[definition.searchConsolePropertyEnv] || "",
    ga4PropertyId: process.env[definition.ga4PropertyEnv] || "",
  };
}

export function googleAnalyticsConfiguration() {
  const credentials = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  );
  return {
    credentials,
    sites: Object.fromEntries(Object.keys(ANALYTICS_SITES).map((site) => {
      const config = analyticsSiteConfig(site);
      return [site, {
        searchConsole: credentials && Boolean(config.searchConsoleProperty),
        ga4: credentials && Boolean(config.ga4PropertyId),
      }];
    })),
  };
}

export function analyticsDateRange(days = 90, endDelayDays = 3, now = new Date()) {
  const safeDays = ANALYTICS_PERIODS.has(Number(days)) ? Number(days) : 90;
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  end.setUTCDate(end.getUTCDate() - endDelayDays);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - safeDays + 1);
  return {
    days: safeDays,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
