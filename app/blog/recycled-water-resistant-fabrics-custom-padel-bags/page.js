import { getPadelArticleMetadata, PadelWorkToteArticle } from "../../padel-work-tote-article-template";

const slug = "recycled-water-resistant-fabrics-custom-padel-bags";
export const metadata = getPadelArticleMetadata(slug);
export default function Page() { return <PadelWorkToteArticle slug={slug} />; }
