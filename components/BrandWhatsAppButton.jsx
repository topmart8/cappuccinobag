"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function BrandWhatsAppButton() {
  const pathname = usePathname();
  const anchorRef = useRef(null);
  useEffect(() => {
    if (pathname?.startsWith("/crm")) return;
    const title = document.querySelector("h1")?.textContent?.trim() || "Cappuccino Bag products";
    const code = /padel|pickleball|tennis/i.test(title) ? "CAP-PDL" : /travel/i.test(title) ? "CAP-TRV" : "CAP-OUT";
    if (anchorRef.current) {
      anchorRef.current.href = `https://wa.me/8613928715568?text=${encodeURIComponent(`Hello Cappuccino Bag, I am interested in ${title}. I visited: ${window.location.href.slice(0, 700)}. Source: ${code}`)}`;
    }
  }, [pathname]);
  if (pathname?.startsWith("/crm")) return null;
  return <a ref={anchorRef} className="whatsapp-float" href="https://wa.me/8613928715568?text=Hello%20Cappuccino%20Bag.%20Source%3A%20CAP-OUT" target="_blank" rel="noopener noreferrer" aria-label="Contact Cappuccino Bag on WhatsApp"><span className="whatsapp-icon">☎</span><span className="whatsapp-pulse" /></a>;
}
