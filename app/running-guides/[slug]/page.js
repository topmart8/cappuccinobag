import {
  getRunningArticleMetadata,
  getRunningArticleStaticParams,
  RunningArticlePage,
} from "../../running-article-template";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRunningArticleStaticParams();
}

export function generateMetadata({ params }) {
  return getRunningArticleMetadata({ params });
}

export default function Page({ params }) {
  return <RunningArticlePage params={params} />;
}
