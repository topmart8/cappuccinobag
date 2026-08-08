import { getHybridArticleMetadata, HybridPadelArticle } from "../../hybrid-padel-article-template";
const slug = "from-desk-to-court-cappuccino-padel-collection";
export const metadata = getHybridArticleMetadata(slug);
export default function Page() { return <HybridPadelArticle slug={slug} />; }
