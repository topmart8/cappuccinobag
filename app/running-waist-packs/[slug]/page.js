import {
  getRunningProductMetadata,
  getRunningProductStaticParams,
  RunningProductPage,
} from "../../running-product-template";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRunningProductStaticParams();
}

export function generateMetadata({ params }) {
  return getRunningProductMetadata({ params });
}

export default function Page({ params }) {
  return <RunningProductPage params={params} />;
}
