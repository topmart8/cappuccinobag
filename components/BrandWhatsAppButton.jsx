"use client";

import { useEffect, useState } from "react";

export default function BrandWhatsAppButton() {
  const [href, setHref] = useState("https://wa.me/8613928715568?text=Hello%20Cappuccino%20Bag.%20Source%3A%20CAP-OUT");
  useEffect(() => {
    const title = document.querySelector("h1")?.textContent?.trim() || "Cappuccino Bag products";
    const code = /padel|pickleball|tennis/i.test(title) ? "CAP-PDL" : /travel/i.test(title) ? "CAP-TRV" : "CAP-OUT";
    setHref(`https://wa.me/8613928715568?text=${encodeURIComponent(`Hello Cappuccino Bag, I am interested in ${title}. I visited: ${window.location.href.slice(0, 700)}. Source: ${code}`)}`);
  }, []);
  return <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Contact Cappuccino Bag on WhatsApp"><span className="whatsapp-icon">☎</span><span className="whatsapp-pulse" /></a>;
}

