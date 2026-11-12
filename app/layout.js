import "./globals.css";
import "./motion.css";
import { Inter, Montserrat } from "next/font/google";
import BrandWhatsAppButton from "../components/BrandWhatsAppButton";
import AttributionTracker from "../components/AttributionTracker";
import SiteMotion from "../components/SiteMotion";
import AnalyticsProvider from "../components/analytics/AnalyticsProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata = {
  metadataBase: new URL("https://www.cappuccinobag.com"),
  title:
    "OEM/ODM Bag Manufacturer for Outdoor Sports, Travel, Racket Bags, Wallets and Smart Eco-Friendly Bags",
  description:
    "Cappuccino Bag supports global brands with Padel and racket-sports bag OEM/ODM development, followed by outdoor and travel bags, wallets, cardholders and project-specific material options.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "OEM/ODM Bag Manufacturer for Outdoor Sports, Travel, Racket Bags, Wallets and Smart Eco-Friendly Bags",
    description:
      "Cappuccino Bag supports global brands with Padel and racket-sports bag OEM/ODM development, followed by outdoor and travel bags, wallets, cardholders and project-specific material options.",
    url: "https://www.cappuccinobag.com/",
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
      "Cappuccino Bag supports global brands with Padel and racket-sports bag OEM/ODM development, followed by outdoor and travel bags, wallets, cardholders and project-specific material options.",
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
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        <AttributionTracker />
        <AnalyticsProvider
          enabled={analyticsEnabled}
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""}
          clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ""}
        />
        {children}
        <SiteMotion />
        <BrandWhatsAppButton />
      </body>
    </html>
  );
}
