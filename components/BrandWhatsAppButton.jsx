"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function BrandWhatsAppButton() {
  const pathname = usePathname();
  const [href, setHref] = useState("https://wa.me/8613928715568?text=Hello%20Cappuccino%20Bag.%20Source%3A%20CAP-OUT");
  useEffect(() => {
    if (pathname?.startsWith("/crm") || pathname?.startsWith("/inquiry")) return;
    let active = true;
    const title = document.querySelector("h1")?.textContent?.trim() || "Cappuccino Bag products";
    const code = /padel|pickleball|tennis/i.test(title) ? "CAP-PDL" : /travel/i.test(title) ? "CAP-TRV" : "CAP-OUT";
    const nextHref = `https://wa.me/8613928715568?text=${encodeURIComponent(`Hello Cappuccino Bag, I am interested in ${title}. I visited: ${window.location.href.slice(0, 700)}. Source: ${code}`)}`;
    queueMicrotask(() => {
      if (active) setHref(nextHref);
    });
    return () => { active = false; };
  }, [pathname]);
  useEffect(() => {
    const pageSelector = ".padel-bags-page,.padel-product-page,.pdb001-page,.hybrid-product-page,.padel-manufacturer-page,.buyer-resources-page,.padel-factory-proof-page";
    const blockerSelector = ".hero-actions,.quote-section,.padel-product-rfq,.hybrid-rfq,.cp-cta,.site-footer";
    let frame = 0;
    const update = () => {
      frame = 0;
      const padelPage = document.querySelector(pageSelector);
      const active = Boolean(padelPage)
        && window.matchMedia("(max-width: 700px)").matches
        && window.scrollY > window.innerHeight * 0.6;
      const obstructed = Boolean(padelPage) && [...document.querySelectorAll(blockerSelector)]
        .some((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.bottom > 0 && bounds.top < window.innerHeight;
        });
      document.body.classList.toggle("padel-controls-active", active);
      document.body.classList.toggle("padel-controls-obstructed", obstructed);
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      document.body.classList.remove("padel-controls-active", "padel-controls-obstructed");
    };
  }, [pathname]);
  if (pathname?.startsWith("/crm") || pathname?.startsWith("/inquiry")) return null;
  return <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Contact Cappuccino Bag on WhatsApp"><span className="whatsapp-icon">☎</span><span className="whatsapp-pulse" /></a>;
}
