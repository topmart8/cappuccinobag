import { getPadelArticleMetadata, PadelWorkToteArticle } from "../../padel-work-tote-article-template";

const slug = "how-to-choose-office-to-court-padel-bag";
export const metadata = getPadelArticleMetadata(slug);
export default function Page() { return <PadelWorkToteArticle slug={slug} />; }
