const baseUrl = "https://cappuccinobag.com";

const routes = [
  { path: "/", priority: 1.0 },
  { path: "/about-us/", priority: 0.9 },
  { path: "/faq/", priority: 0.86 },
  { path: "/blog/company-bio/", priority: 0.75 },
  { path: "/oem-odm-functional-bag-manufacturer-faq/", priority: 0.9 },
  { path: "/custom-tennis-padel-racket-bags/", priority: 0.95 },
  { path: "/custom-pickleball-paddle-bags/", priority: 0.95 },
  { path: "/custom-hiking-daypacks-outdoor-backpacks/", priority: 0.95 },
  { path: "/custom-rfid-wallet-manufacturer/", priority: 0.9 },
  { path: "/custom-cardholder-manufacturer/", priority: 0.9 },
  { path: "/rfid-wallets-passport-holders/", priority: 0.88 },
  { path: "/hotel-group-custom-bag-project-guide/", priority: 0.88 },
  { path: "/custom-padel-bags.html", priority: 0.9 },
  { path: "/custom-pickleball-bags.html", priority: 0.9 },
  { path: "/custom-tennis-bags.html", priority: 0.9 },
  { path: "/custom-hiking-backpacks.html", priority: 0.9 },
  { path: "/custom-sports-duffel-bags.html", priority: 0.9 },
  { path: "/custom-hotel-bags.html", priority: 0.9 },
  { path: "/resources/outdoor-multifunctional-bag-manufacturing-guide/", priority: 0.78 },
  { path: "/resources/custom-tennis-bag-guide/", priority: 0.78 },
  { path: "/resources/pickleball-bag-customization-guide/", priority: 0.78 },
  { path: "/resources/hiking-backpack-customization-guide/", priority: 0.78 },
  { path: "/resources/quality-inspection-guide/", priority: 0.78 },
  { path: "/resources/moq-sampling-faq/", priority: 0.78 },
  { path: "/factory-trust-materials/", priority: 0.82 },
];

export default function sitemap() {
  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
