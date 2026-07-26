import {
  getProductMetadata,
  getProductStaticParams,
  PadelProductPage,
} from "../../padel-product-template";

const categorySlug = "padel-bags";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProductStaticParams(categorySlug);
}

export function generateMetadata({ params }) {
  return getProductMetadata({ params, categorySlug });
}

export default function Page({ params }) {
  return <PadelProductPage params={params} categorySlug={categorySlug} />;
}
