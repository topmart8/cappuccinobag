"use client";

import { useEffect } from "react";

const key = "cappuccino_first_touch";

export default function AttributionTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const first = {
      site: "cappuccinobag",
      first_landing_page: window.location.href,
      first_visit_time: new Date().toISOString(),
      referrer: document.referrer || "",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      gclid: params.get("gclid") || "",
      msclkid: params.get("msclkid") || "",
    };
    try {
      if (!window.localStorage.getItem(key)) {
        const value = JSON.stringify(first);
        window.localStorage.setItem(key, value);
        document.cookie = `${key}=${encodeURIComponent(value)}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
      }
    } catch {}
  }, []);
  return null;
}

