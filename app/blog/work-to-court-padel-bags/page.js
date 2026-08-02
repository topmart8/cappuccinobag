import { getHybridArticleMetadata, HybridPadelArticle } from "../../hybrid-padel-article-template";
const slug = "work-to-court-padel-bags";
export const metadata = getHybridArticleMetadata(slug);
export default function Page() { return <HybridPadelArticle slug={slug} />; }
