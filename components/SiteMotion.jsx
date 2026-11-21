"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const cardSelector = [
  ".home-buyer-grid > article",
  ".home-featured-grid > article",
  ".products-directory-grid > article",
  ".case-grid > article",
  ".padel-related-grid > article",
  ".padel-accessory-grid > article",
  ".alc-product-card",
  ".product-card",
  ".category-card",
].join(", ");

const revealSelector = [
  cardSelector,
  ".section-heading",
  ".section-head",
  ".padel-product-heading",
  ".home-proof-layout",
  ".home-material-note",
  ".home-project-cta .inquiry-copy",
  ".process-step",
].join(", ");

export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/crm")) return;
    if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let seen = new WeakSet();
    const cards = new Set();
    const animations = new Map();
    let frame = 0;

    function stopAnimations() {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (preference.matches || document.hidden || target.contains(document.activeElement)) return;

        const siblings = Array.from(target.parentElement.children).filter((element) => element.matches(revealSelector));
        const delay = Math.min(Math.max(siblings.indexOf(target), 0), 3) * 45;
        // Content is visible by default; only entering elements get a finite animation.
        const animation = target.animate(
          [{ opacity: 0.35, translate: "0 18px" }, { opacity: 1, translate: "0 0" }],
          { duration: 520, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
        );
        animations.set(target, animation);
        animation.onfinish = () => animations.delete(target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

    function scan() {
      frame = 0;
      document.querySelectorAll("main").forEach((main) => {
        main.querySelectorAll(cardSelector).forEach((card) => {
          if (cards.has(card)) return;
          card.setAttribute("data-motion-card", "");
          cards.add(card);
        });
        if (preference.matches) return;
        main.querySelectorAll(revealSelector).forEach((element) => {
          if (seen.has(element) || element.parentElement.closest(revealSelector)) return;
          seen.add(element);
          // Never fade out the initial viewport, hero image, or restored scroll position.
          if (element.getBoundingClientRect().top < window.innerHeight) return;
          observer.observe(element);
        });
      });
    }

    function scheduleScan() {
      if (!frame) frame = requestAnimationFrame(scan);
    }

    function onPreferenceChange() {
      if (preference.matches) {
        observer.disconnect();
        stopAnimations();
        seen = new WeakSet();
      } else {
        scheduleScan();
      }
    }

    function onFocus(event) {
      animations.forEach((animation, element) => {
        if (element.contains(event.target)) {
          animation.cancel();
          animations.delete(element);
        }
      });
    }

    function onVisibilityChange() {
      if (document.hidden) stopAnimations();
    }

    // Async server content and client navigation may arrive after the first effect.
    const mutations = new MutationObserver(scheduleScan);
    mutations.observe(document.body, { childList: true, subtree: true });
    preference.addEventListener("change", onPreferenceChange);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    scan();

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      stopAnimations();
      cards.forEach((card) => card.removeAttribute("data-motion-card"));
      preference.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);

  return null;
}
