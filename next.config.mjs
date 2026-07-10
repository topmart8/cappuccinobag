const redirectPairs = [
  ["/custom-padel-bags.html", "/padel-bags"],
  ["/custom-padel-bag-manufacturer", "/padel-bags"],
  ["/custom-padel-bag-with-shoe-compartment", "/padel-bags"],
  ["/custom-pickleball-bags.html", "/pickleball-bags"],
  ["/custom-pickleball-bag-manufacturer", "/pickleball-bags"],
  ["/custom-pickleball-paddle-bags", "/pickleball-bags"],
  ["/custom-pickleball-paddle-backpack", "/pickleball-bags"],
  ["/custom-tennis-bags.html", "/tennis-bags"],
  ["/custom-tennis-bag-manufacturer", "/tennis-bags"],
  ["/custom-tennis-padel-racket-bags", "/tennis-bags"],
  ["/thermal-tennis-racket-bag", "/tennis-bags"],
  ["/custom-hiking-backpacks.html", "/hiking-backpacks"],
  ["/custom-hiking-backpack-manufacturer", "/hiking-backpacks"],
  ["/custom-hiking-daypacks-outdoor-backpacks", "/hiking-backpacks"],
  ["/lightweight-hiking-daypack-20l-35l", "/hiking-backpacks"],
  ["/custom-travel-bag-luggage-manufacturer", "/travel-bags"],
  ["/custom-travel-backpacks-weekender-bags", "/travel-bags"],
  ["/custom-sports-duffel-bags.html", "/travel-bags"],
  ["/custom-hotel-bags.html", "/hotel-group-custom-bag-project"],
  ["/hotel-group-custom-bag-project-guide", "/hotel-group-custom-bag-project"],
  ["/outdoor-travel-backpack", "/travel-bags"],
  ["/weekend-travel-duffel-bag", "/travel-bags"],
  ["/custom-rfid-wallet-manufacturer", "/wallets-cardholders"],
  ["/rfid-wallets-passport-holders", "/wallets-cardholders"],
  ["/rfid-wallet-passport-holder-manufacturer", "/wallets-cardholders"],
  ["/custom-cardholder-manufacturer", "/wallets-cardholders"],
  ["/rfid-card-holder", "/wallets-cardholders"],
  ["/rfid-passport-holder", "/wallets-cardholders"],
  ["/vegan-leather-wallet", "/wallets-cardholders"],
  ["/eco-tech-smart-bag-manufacturer", "/smart-eco-bags"],
  ["/gps-ready-smart-travel-bag", "/smart-eco-bags"],
  ["/gps-trackable-smart-bag-landing", "/smart-eco-bags"],
  ["/vegan-leather-tech-accessories-manufacturer", "/alcantara-accessories"],
  ["/factory-trust-materials", "/factory"],
  ["/inquiry", "/request-a-quote"],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async redirects() {
    const canonicalRedirects = redirectPairs.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));

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
