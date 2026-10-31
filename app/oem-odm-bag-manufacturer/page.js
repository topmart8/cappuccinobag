import Script from "next/script";
import { Suspense } from "react";
import DevelopmentBriefEntry from "../../components/DevelopmentBriefEntry";
import { StaticSitePage, generateMetadataForStaticPage } from "../static-site";

const params = { slug: ["oem-odm-bag-manufacturer"] };
export function generateMetadata() {
  return generateMetadataForStaticPage({ params });
}
export default function DevelopmentPage() {
  return <><StaticSitePage params={params} /><Suspense fallback={null}><DevelopmentBriefEntry /></Suspense><Script src="/site/assets/b2b-development.js" strategy="afterInteractive" /></>;
}
