import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://cappuccinobag.com"),
  title: "Custom Outdoor & Racquet Sports Bag Manufacturer in China | Cappuccino Bags",
  description:
    "OEM/ODM padel bags, pickleball bags, tennis bags, hiking backpacks, sports duffels, hotel custom bags, travel bags, and private-label bag manufacturing in China.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Custom Outdoor & Racquet Sports Bag Manufacturer in China",
    description:
      "OEM/ODM padel bags, pickleball bags, tennis bags, hiking backpacks, sports duffels, hotel custom bags, travel bags, and private-label bag manufacturing in China.",
    url: "https://cappuccinobag.com/",
    siteName: "Cappuccino Bags",
    images: [
      {
        url: "/assets/hero-sports-bag-manufacturer.png",
        width: 1672,
        height: 941,
        alt: "Custom outdoor and racquet sports bag manufacturing hero image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Outdoor & Racquet Sports Bag Manufacturer in China",
    description:
      "OEM/ODM padel bags, pickleball bags, tennis bags, hiking backpacks, sports duffels, hotel custom bags, travel bags, and private-label bag manufacturing in China.",
    images: ["/assets/hero-sports-bag-manufacturer.png"],
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
