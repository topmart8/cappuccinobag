import { cardHolderProducts } from "../../card-holder-data";
import { CardHolderProductPage, getCardHolderProductMetadata } from "../../card-holder-templates";

export function generateStaticParams() { return cardHolderProducts.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return getCardHolderProductMetadata(slug);
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <CardHolderProductPage slug={slug} />;
}
