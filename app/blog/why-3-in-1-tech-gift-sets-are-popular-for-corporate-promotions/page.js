import { getTechGiftArticleMetadata, TechGiftArticlePage } from "../../tech-gift-article-template";
const slug = "why-3-in-1-tech-gift-sets-are-popular-for-corporate-promotions";
export const metadata = getTechGiftArticleMetadata(slug);
export default function Page() { return <TechGiftArticlePage slug={slug} />; }
