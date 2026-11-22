import { BuyerGuides, guideMetadata } from "./buyer-guides";
export const metadata = guideMetadata(1);
export default function BlogPage() {
  return <BuyerGuides page={1} />;
}
