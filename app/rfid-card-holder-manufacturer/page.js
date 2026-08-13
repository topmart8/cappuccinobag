import { rfidCardHolderProducts, rfidHubFaqs } from "../card-holder-data";
import { CardHolderHubPage } from "../card-holder-templates";

export const metadata = {
  title: "RFID Card Holder Manufacturer | Custom OEM Wallets",
  description: "Compare six source-verified RFID leather card holders for custom-logo, private-label, retail and business gift programs.",
  alternates: { canonical: "https://www.cappuccinobag.com/rfid-card-holder-manufacturer" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <CardHolderHubPage title="RFID Card Holder Manufacturer" lead="Compare six card holder structures whose public source titles explicitly identify RFID blocking, including flat sleeves, snap-tab, pull-tab, ID-window, money-clip and printed formats." products={rfidCardHolderProducts} faqs={rfidHubFaqs} path="/rfid-card-holder-manufacturer" intro="RFID wording is product-specific; no universal test standard is assumed." buyerNote="Designed for brands, retailers, promotional gift companies and corporate sourcing teams." />;
}
