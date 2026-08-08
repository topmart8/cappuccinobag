import { getHybridArticleMetadata, HybridPadelArticle } from "../../hybrid-padel-article-template";
const slug = "choosing-the-right-padel-bag-style";
export const metadata = getHybridArticleMetadata(slug);
export default function Page() { return <HybridPadelArticle slug={slug} />; }
