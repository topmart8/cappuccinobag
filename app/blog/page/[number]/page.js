import { BuyerGuides, guideMetadata, guidePages } from "../../buyer-guides";
export const dynamicParams = false;
export function generateStaticParams() {
  return guidePages.slice(1).map((number) => ({ number: String(number) }));
}
export async function generateMetadata({ params }) {
  const { number } = await params;
  return guideMetadata(Number(number));
}
export default async function BlogArchivePage({ params }) {
  const { number } = await params;
  return <BuyerGuides page={Number(number)} />;
}
