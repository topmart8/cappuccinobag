"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { applyBriefEntry } from "../lib/brief-entry.mjs";

export default function DevelopmentBriefEntry() {
  const search = useSearchParams().toString();
  useEffect(() => {
    applyBriefEntry(document.querySelector('[data-development-brief]'), search);
  }, [search]);
  return null;
}
