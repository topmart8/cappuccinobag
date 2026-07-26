import {
  generateMetadataForStaticPage,
  generateStaticParamsForStaticPages,
  StaticSitePage,
} from "../static-site";

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return generateStaticParamsForStaticPages();
}

export async function generateMetadata({ params }) {
  return generateMetadataForStaticPage({ params });
}

export default function StaticSlugPage({ params }) {
  return <StaticSitePage params={params} />;
}