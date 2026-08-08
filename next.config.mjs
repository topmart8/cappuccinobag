const redirectPairs = [
  ["/custom-padel-bags.html", "/custom-padel-bag-manufacturer"],
  ["/custom-padel-bag-with-shoe-compartment", "/custom-padel-bag-manufacturer"],
  ["/custom-pickleball-bags.html", "/custom-pickleball-paddle-bags"],
  ["/custom-pickleball-bag-manufacturer", "/custom-pickleball-paddle-bags"],
  ["/custom-pickleball-paddle-backpack", "/custom-pickleball-paddle-bags"],
  ["/custom-tennis-bags.html", "/custom-tennis-bag-manufacturer"],
  ["/thermal-tennis-racket-bag", "/custom-tennis-bag-manufacturer"],
  ["/custom-hiking-backpacks.html", "/custom-outdoor-sports-bag-manufacturer"],
  ["/custom-hiking-backpack-manufacturer", "/custom-outdoor-sports-bag-manufacturer"],
  ["/custom-hiking-daypacks-outdoor-backpacks", "/custom-outdoor-sports-bag-manufacturer"],
  ["/lightweight-hiking-daypack-20l-35l", "/custom-outdoor-sports-bag-manufacturer"],
  ["/custom-travel-bag-luggage-manufacturer", "/custom-travel-backpacks-weekender-bags"],
  ["/outdoor-travel-backpack", "/custom-travel-backpacks-weekender-bags"],
  ["/weekend-travel-duffel-bag", "/custom-travel-backpacks-weekender-bags"],
  ["/rfid-passport-holder", "/rfid-wallet-passport-holder-manufacturer"],
  ["/rfid-card-holder", "/rfid-wallet-passport-holder-manufacturer"],
  ["/vegan-leather-wallet", "/vegan-leather-tech-accessories-manufacturer"],
  ["/gps-ready-smart-travel-bag", "/gps-trackable-smart-bag-landing"],
  ["/running-waist-packs-running-belt-bags", "/running-waist-packs"],
  ["/rfq", "/inquiry"],
  ["/custom-convertible-padel-backpack-duffel", "/products/multi-functional-sports-backpack"],
  ["/resources/outdoor-multifunctional-bag-manufacturing-guide", "/outdoor-multifunctional-bag-manufacturing-guide"],
  ["/resources/custom-tennis-bag-guide", "/custom-tennis-bag-guide"],
  ["/resources/pickleball-bag-customization-guide", "/pickleball-bag-customization-guide"],
  ["/resources/hiking-backpack-customization-guide", "/hiking-backpack-customization-guide"],
  ["/resources/quality-inspection-guide", "/quality-inspection-guide"],
  ["/resources/moq-sampling-faq", "/moq-sampling-faq"],
  ["/custom-sports-duffel-bags.html", "/custom-outdoor-sports-bag-manufacturer"],
  ["/custom-hotel-bags.html", "/custom-travel-backpacks-weekender-bags"],
];

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.clarity.ms https://c.bing.com",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.clarity.ms https://*.clarity.ms https://c.bing.com https://vitals.vercel-insights.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async redirects() {
    const canonicalRedirects = redirectPairs.flatMap(([source, destination]) => {
      const trailingSource = source.endsWith("/") ? source : `${source}/`;

      return [
        { source, destination, statusCode: 301 },
        { source: trailingSource, destination, statusCode: 301 },
      ];
    });

    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "cappuccinobag.com" }],
        destination: "https://www.cappuccinobag.com/:path*",
        permanent: true,
      },
      ...canonicalRedirects,
    ];
  },
  async headers() {
    const headers = [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    if (process.env.VERCEL_ENV === "preview") {
      headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
