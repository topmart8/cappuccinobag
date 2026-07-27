import {
  getRunningCollectionMetadata,
  getRunningCollectionStaticParams,
  RunningCollectionPage,
} from "../../running-collection-template";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRunningCollectionStaticParams();
}

export function generateMetadata({ params }) {
  return getRunningCollectionMetadata({ params });
}

export default function Page({ params }) {
  return <RunningCollectionPage params={params} />;
}
