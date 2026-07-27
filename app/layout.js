import "./globals.css";
import BrandWhatsAppButton from "../components/BrandWhatsAppButton";
import AttributionTracker from "../components/AttributionTracker";

export const metadata = {
  metadataBase: new URL("https://cappuccinobag.com"),
  title:
    "OEM/ODM Bag Manufacturer for Outdoor Sports, Travel, Racket Bags, Wallets and Smart Eco-Friendly Bags",
  description:
    "Cappuccino Bag is an OEM/ODM bag manufacturer specializing in outdoor sports bags, travel backpacks, racket bags, wallets, cardholders, and smart eco-friendly bags for global brands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "OEM/ODM Bag Manufacturer for Outdoor Sports, Travel, Racket Bags, Wallets and Smart Eco-Friendly Bags",
    description:
      "Cappuccino Bag is an OEM/ODM bag manufacturer specializing in outdoor sports bags, travel backpacks, racket bags, wallets, cardholders, and smart eco-friendly bags for global brands.",
    url: "https://cappuccinobag.com/",
    siteName: "Cappuccino Bag",
    images: [
      {
        url: "/assets/cappuccino-racquet-bag-lifestyle.jpg",
        width: 1672,
        height: 941,
        alt: "Cappuccino Bag racket bags and outdoor sports bag manufacturing scene",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "OEM/ODM Bag Manufacturer for Outdoor Sports, Travel, Racket Bags, Wallets and Smart Eco-Friendly Bags",
    description:
      "Cappuccino Bag is an OEM/ODM bag manufacturer specializing in outdoor sports bags, travel backpacks, racket bags, wallets, cardholders, and smart eco-friendly bags for global brands.",
    images: ["/assets/cappuccino-racquet-bag-lifestyle.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/site/assets/cappuccino-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><AttributionTracker />{children}<BrandWhatsAppButton /></body>
    </html>
  );
}
