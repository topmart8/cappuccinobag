import { getHybridProductMetadata, HybridPadelProductPage } from "../../hybrid-padel-product-template";

const slug = "travel-padel-utility-backpack-pdb017";
export const metadata = getHybridProductMetadata(slug);
export default function Page() { return <HybridPadelProductPage slug={slug} />; }
