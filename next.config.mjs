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
];

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
};

export default nextConfig;
