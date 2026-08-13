import { getTechGiftArticleMetadata, TechGiftArticlePage } from "../../tech-gift-article-template";
const slug = "one-stop-oem-solution-for-custom-corporate-gift-sets";
export const metadata = getTechGiftArticleMetadata(slug);
export default function Page() { return <TechGiftArticlePage slug={slug} />; }
