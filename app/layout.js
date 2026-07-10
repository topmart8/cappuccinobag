import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.cappuccinobag.com"),
  title:
    "Custom Outdoor & Racquet Sports Bag Manufacturer in China | Cappuccino Bag",
  description:
    "OEM/ODM padel bags, pickleball bags, tennis bags, hiking backpacks, travel bags, RFID wallets and smart eco-friendly bags for global brands and importers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Custom Outdoor & Racquet Sports Bag Manufacturer in China | Cappuccino Bag",
    description:
      "OEM/ODM padel bags, pickleball bags, tennis bags, hiking backpacks, travel bags, RFID wallets and smart eco-friendly bags for global brands and importers.",
    url: "https://www.cappuccinobag.com",
    siteName: "Cappuccino Bags",
    images: [
      {
        url: "/assets/chatgpt-hero-racquet-lifestyle.jpg",
        width: 1672,
        height: 941,
        alt: "Cappuccino Bags racket bags and outdoor sports bag manufacturing scene",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Custom Outdoor & Racquet Sports Bag Manufacturer in China | Cappuccino Bag",
    description:
      "OEM/ODM padel bags, pickleball bags, tennis bags, hiking backpacks, travel bags, RFID wallets and smart eco-friendly bags for global brands and importers.",
    images: ["/assets/chatgpt-hero-racquet-lifestyle.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
