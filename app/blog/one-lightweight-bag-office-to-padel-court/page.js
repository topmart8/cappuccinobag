import { getPadelArticleMetadata, PadelWorkToteArticle } from "../../padel-work-tote-article-template";

const slug = "one-lightweight-bag-office-to-padel-court";
export const metadata = getPadelArticleMetadata(slug);
export default function Page() { return <PadelWorkToteArticle slug={slug} />; }
