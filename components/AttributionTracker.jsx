"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sanitizeUrl } from "../lib/analytics/client";

const firstKey = "cappuccino_first_touch";
const currentKey = "cappuccino_current_visit";
const maxAgeSeconds = 90 * 24 * 60 * 60;

function sourceSnapshot() {
  const params = new URLSearchParams(window.location.search);
  return {
    site: "cappuccinobag",
    landing_page: sanitizeUrl(window.location.href),
    visit_time: new Date().toISOString(),
    referrer: sanitizeUrl(document.referrer),
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    gclid: params.get("gclid") || "",
    msclkid: params.get("msclkid") || "",
  };
}

export default function AttributionTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname?.startsWith("/crm")) return;
    try {
      const snapshot = sourceSnapshot();
      const existing = JSON.parse(window.localStorage.getItem(firstKey) || "null");
      const existingTime = Date.parse(existing?.first_visit_time || existing?.visit_time || "");
      const expired = !Number.isFinite(existingTime) || Date.now() - existingTime > maxAgeSeconds * 1000;
      if (!existing || expired) {
        const first = {
          ...snapshot,
          first_landing_page: snapshot.landing_page,
          first_visit_time: snapshot.visit_time,
        };
        delete first.landing_page;
        delete first.visit_time;
        const value = JSON.stringify(first);
        window.localStorage.setItem(firstKey, value);
        document.cookie = `${firstKey}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax; Secure`;
      }
      const hasCampaign = snapshot.utm_source || snapshot.utm_medium || snapshot.utm_campaign
        || snapshot.gclid || snapshot.msclkid;
      const savedCurrent = JSON.parse(window.sessionStorage.getItem(currentKey) || "null");
      const current = !savedCurrent || hasCampaign ? snapshot : savedCurrent;
      window.sessionStorage.setItem(currentKey, JSON.stringify(current));
      window.localStorage.setItem(currentKey, JSON.stringify(current));
    } catch {}
  }, [pathname]);
  return null;
}
