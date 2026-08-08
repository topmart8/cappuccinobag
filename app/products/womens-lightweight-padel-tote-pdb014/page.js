import { getHybridProductMetadata, HybridPadelProductPage } from "../../hybrid-padel-product-template";

const slug = "womens-lightweight-padel-tote-pdb014";
export const metadata = getHybridProductMetadata(slug);
export default function Page() { return <HybridPadelProductPage slug={slug} />; }
