import { getPadelArticleMetadata, PadelWorkToteArticle } from "../../padel-work-tote-article-template";

const slug = "multi-pocket-organization-padel-commuter-bag";
export const metadata = getPadelArticleMetadata(slug);
export default function Page() { return <PadelWorkToteArticle slug={slug} />; }
