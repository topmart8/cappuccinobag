import { leatherCardHolderProducts, leatherHubFaqs } from "../card-holder-data";
import { CardHolderHubPage } from "../card-holder-templates";

export const metadata = {
  title: "Custom Leather Card Holder Manufacturer | OEM Factory",
  description: "Compare full-grain, genuine leather and top-layer cowhide card holders for private-label, custom-logo and retail projects.",
  alternates: { canonical: "https://www.cappuccinobag.com/custom-leather-card-holder" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <CardHolderHubPage title="Custom Leather Card Holder Manufacturer" lead="Source full-grain vegetable-tanned leather, genuine leather and top-layer cowhide card holder directions with clearly separated confirmed and pending specifications." products={leatherCardHolderProducts} faqs={leatherHubFaqs} path="/custom-leather-card-holder" intro="Materials are quoted exactly as identified in the accessible collection title; patterned face materials remain unconfirmed." buyerNote="Use the CAP-CH code to request a material, construction and branding feasibility review." />;
}
