import {
  generateMetadataForStaticPage,
  StaticSitePage,
} from "./static-site";

export const revalidate = 86400;

export async function generateMetadata() {
  return generateMetadataForStaticPage({ params: { slug: [] } });
}

export default function HomePage() {
  return <StaticSitePage params={{ slug: [] }} />;
}