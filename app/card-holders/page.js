import { CardHolderCollectionPage } from "../card-holder-templates";

export const metadata = {
  title: "Custom Card Holder Manufacturer | Cappuccino Bag",
  description: "Compare eight source-verified leather and RFID card holder models for custom-logo, private-label and corporate gift projects.",
  alternates: { canonical: "https://www.cappuccinobag.com/card-holders" },
  openGraph: { title: "Custom Card Holder Manufacturer | Cappuccino Bag", description: "Compare eight source-verified leather and RFID card holder models for custom projects.", url: "https://www.cappuccinobag.com/card-holders", type: "website" },
  robots: { index: true, follow: true },
};

export default function Page() { return <CardHolderCollectionPage />; }
