import { getHybridProductMetadata, HybridPadelProductPage } from "../../hybrid-padel-product-template";

const slug = "weekend-padel-carryall-pdb016";
export const metadata = getHybridProductMetadata(slug);
export default function Page() { return <HybridPadelProductPage slug={slug} />; }
