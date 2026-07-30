"use client";

import { useSyncExternalStore } from "react";
import { readAnalyticsConsent } from "../../lib/analytics/client";

function subscribe(callback) {
  window.addEventListener("cappuccino:analytics-consent", callback);
  return () => window.removeEventListener("cappuccino:analytics-consent", callback);
}

export default function useAnalyticsConsent() {
  return useSyncExternalStore(subscribe, readAnalyticsConsent, () => "loading");
}
