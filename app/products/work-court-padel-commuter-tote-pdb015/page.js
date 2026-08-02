import { getHybridProductMetadata, HybridPadelProductPage } from "../../hybrid-padel-product-template";

const slug = "work-court-padel-commuter-tote-pdb015";
export const metadata = getHybridProductMetadata(slug);
export default function Page() { return <HybridPadelProductPage slug={slug} />; }
