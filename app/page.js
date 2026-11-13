import Link from "next/link";
import {
  generateMetadataForStaticPage,
  StaticSitePage,
} from "./static-site";

export const revalidate = 86400;

export async function generateMetadata() {
  return generateMetadataForStaticPage({ params: { slug: [] } });
}

export default function HomePage() {
  return <>
    <aside data-seasonal="canton-fair-2026" aria-label="Padel discovery and Guangzhou sourcing appointments" style={{ padding: "108px 24px 20px", background: "#fff5e9", color: "#3d2a1d", textAlign: "center", lineHeight: 1.6 }}>
      <nav aria-label="Featured category" style={{ marginBottom: 12 }}><Link href="/racket-sports/padel-bags" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "8px 18px", border: "1px solid #57432b", borderRadius: 6, background: "#57432b", color: "#fff", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 4 }}>Explore Padel Bags</Link></nav>
      <strong>Visiting Guangzhou during the 140th Canton Fair?</strong>{" "}We are not exhibiting in 2026. <Link href="/blog/canton-fair-custom-bag-factory-visit-guangzhou" style={{ textDecoration: "underline", fontWeight: 700 }}>Plan a custom bag factory visit</Link> — arrangements require team confirmation.
    </aside>
    <StaticSitePage params={{ slug: [] }} />
  </>;
}