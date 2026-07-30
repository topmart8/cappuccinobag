import "./globals.css";
import BrandWhatsAppButton from "../components/BrandWhatsAppButton";
import AttributionTracker from "../components/AttributionTracker";
import AnalyticsProvider from "../components/analytics/AnalyticsProvider";

export const metadata = {
  metadataBase: new URL("https://www.cappuccinobag.com"),
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
  const analyticsEnabled =
    process.env.VERCEL_ENV === "production"
    && process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false";
  return (
    <html lang="en">
      <body>
        <AttributionTracker />
        <AnalyticsProvider
          enabled={analyticsEnabled}
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""}
          clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ""}
        />
        {children}
        <BrandWhatsAppButton />
      </body>
    </html>
  );
}
