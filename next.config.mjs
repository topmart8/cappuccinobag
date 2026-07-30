const redirectPairs = [
  ["/custom-padel-bag-with-shoe-compartment", "/custom-padel-bags.html"],
  ["/custom-pickleball-paddle-backpack", "/custom-pickleball-paddle-bags/"],
  ["/thermal-tennis-racket-bag", "/custom-tennis-padel-racket-bags/"],
  ["/lightweight-hiking-daypack-20l-35l", "/custom-hiking-daypacks-outdoor-backpacks/"],
  ["/outdoor-travel-backpack", "/custom-travel-backpacks-weekender-bags/"],
  ["/weekend-travel-duffel-bag", "/custom-travel-backpacks-weekender-bags/"],
  ["/rfid-passport-holder", "/rfid-wallet-passport-holder-manufacturer/"],
  ["/rfid-card-holder", "/rfid-wallet-passport-holder-manufacturer/"],
  ["/vegan-leather-wallet", "/vegan-leather-tech-accessories-manufacturer/"],
  ["/gps-ready-smart-travel-bag", "/gps-trackable-smart-bag-landing/"],
  ["/running-waist-packs-running-belt-bags", "/running-waist-packs/"],
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
  skipTrailingSlashRedirect: true,
  async redirects() {
    const canonicalRedirects = redirectPairs.flatMap(([source, destination]) => {
      const trailingSource = source.endsWith("/") ? source : `${source}/`;

      return [
        { source, destination, permanent: true },
        { source: trailingSource, destination, permanent: true },
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
