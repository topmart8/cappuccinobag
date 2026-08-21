"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsent from "./CookieConsent";
import MicrosoftClarity from "./MicrosoftClarity";
import useAnalyticsConsent from "./useAnalyticsConsent";
import {
  formTypeFrom,
  pageContext,
  sanitizeCurrentBrowserUrl,
  sanitizeUrl,
  saveAnalyticsConsent,
  submissionEventFor,
  trackEvent,
} from "../../lib/analytics/client";

const formStarts = new WeakSet();
const submittedReferences = new Set();

function ctaLocation(element) {
  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  if (element.classList.contains("whatsapp-float") || element.classList.contains("quote-float")) {
    return "floating";
  }
  return pageContext().page_type;
}

function maskForms() {
  document.querySelectorAll("form").forEach((form) => {
    form.setAttribute("data-clarity-mask", "true");
  });
}

export default function AnalyticsProvider({ enabled, gaId, clarityProjectId }) {
  const consent = useAnalyticsConsent();
  const pathname = usePathname();

  useEffect(() => {
    sanitizeCurrentBrowserUrl();
    maskForms();
    const observer = new MutationObserver(maskForms);
    observer.observe(document.body, { childList: true, subtree: true });
    const onConsent = sanitizeCurrentBrowserUrl;
    window.addEventListener("cappuccino:analytics-consent", onConsent);
    return () => {
      observer.disconnect();
      window.removeEventListener("cappuccino:analytics-consent", onConsent);
    };
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !enabled || pathname.startsWith("/crm")) return;
    const context = pageContext(pathname);
    if (context.page_type === "product") trackEvent("product_view", context);
    else if (context.product_category) trackEvent("category_view", context);
  }, [consent, enabled, pathname]);

  useEffect(() => {
    if (window.location.pathname.startsWith("/crm")) return undefined;
    const onInput = (event) => {
      const form = event.target.closest?.("form");
      if (!form || formStarts.has(form)) return;
      formStarts.add(form);
      trackEvent("form_start", { form_type: formTypeFrom(form) });
    };
    const onClick = (event) => {
      const link = event.target.closest?.("a,button");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const text = (link.textContent || link.getAttribute("aria-label") || "").trim().slice(0, 120);
      const params = {
        cta_name: text,
        cta_location: ctaLocation(link),
        ...pageContext(),
      };
      if (/wa\.me|whatsapp/i.test(href)) trackEvent("whatsapp_click", params);
      else if (href.startsWith("mailto:")) trackEvent("email_click", params);
      else if (href.startsWith("tel:")) trackEvent("phone_click", params);
      else if (/catalog|download/i.test(href)) trackEvent("catalog_download", params);
      else if (
        /quote|contact|start your project|send my project|request/i.test(text)
        || /\/(inquiry|rfq|contact)/.test(href)
      ) trackEvent("cta_click", params);
    };
    const onPlay = (event) => {
      trackEvent("video_start", {
        cta_name: event.target.currentSrc?.split("/").at(-1) || "site_video",
      });
    };
    const onEnded = (event) => {
      trackEvent("video_complete", {
        cta_name: event.target.currentSrc?.split("/").at(-1) || "site_video",
      });
    };
    document.addEventListener("input", onInput, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("play", onPlay, true);
    document.addEventListener("ended", onEnded, true);
    window.cappuccinoAnalytics = {
      trackEvent,
      setConsent: saveAnalyticsConsent,
      trackLeadSuccess(formType, reference, params = {}) {
        const dedupeKey = reference || `${formType}:${window.location.pathname}`;
        if (submittedReferences.has(dedupeKey)) return;
        submittedReferences.add(dedupeKey);
        trackEvent(submissionEventFor(formType), { form_type: formType, ...params });
      },
    };
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("ended", onEnded, true);
      delete window.cappuccinoAnalytics;
    };
  }, []);

  const active = enabled && consent === "granted" && !pathname.startsWith("/crm");
  const beforeSend = (event) => {
    const url = sanitizeUrl(event.url, { keepAttribution: false });
    return url ? { ...event, url } : null;
  };

  return (
    <>
      {!pathname.startsWith("/crm") ? <CookieConsent /> : null}
      {active && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      {active && clarityProjectId ? <MicrosoftClarity projectId={clarityProjectId} /> : null}
      {active ? <Analytics mode="production" beforeSend={beforeSend} /> : null}
      {active ? <SpeedInsights beforeSend={beforeSend} /> : null}
    </>
  );
}
