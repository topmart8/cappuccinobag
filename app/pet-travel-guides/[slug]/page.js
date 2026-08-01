import { petArticleMetadata, petArticleStaticParams, PetTravelArticlePage } from "../../pet-travel-article-template";
export const dynamicParams = false;
export function generateStaticParams() { return petArticleStaticParams(); }
export function generateMetadata({ params }) { return petArticleMetadata({ params }); }
export default function Page({ params }) { return <PetTravelArticlePage params={params} />; }
