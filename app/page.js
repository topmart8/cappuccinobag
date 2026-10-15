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
    <aside data-seasonal="canton-fair-2026" aria-label="Guangzhou sourcing appointments" style={{ padding: "14px 24px", background: "#fff5e9", color: "#3d2a1d", textAlign: "center", lineHeight: 1.6 }}>
      <strong>Visiting Guangzhou during the 140th Canton Fair?</strong>{" "}We are not exhibiting in 2026. <a href="/blog/canton-fair-custom-bag-factory-visit-guangzhou" style={{ textDecoration: "underline", fontWeight: 700 }}>Plan a custom bag factory visit</a> — arrangements require team confirmation.
    </aside>
    <StaticSitePage params={{ slug: [] }} />
  </>;
}