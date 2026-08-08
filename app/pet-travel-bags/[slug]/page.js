import { getPetCategoryMetadata, PetCategoryPage } from "../../pet-travel-category-template";
import { getPetProductMetadata, PetProductPage } from "../../pet-travel-product-template";
import { petCategoryMap, petProductMap } from "../../pet-travel-data";

export const dynamicParams = false;
export function generateStaticParams() { return [...Object.keys(petCategoryMap), ...Object.keys(petProductMap)].map((slug) => ({ slug })); }
export async function generateMetadata({ params }) { const { slug } = await params; return petProductMap[slug] ? getPetProductMetadata(slug) : getPetCategoryMetadata(slug); }
export default async function Page({ params }) { const { slug } = await params; return petProductMap[slug] ? <PetProductPage slug={slug} /> : <PetCategoryPage slug={slug} />; }
