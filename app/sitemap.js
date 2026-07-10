import fs from "node:fs";
import path from "node:path";

const baseUrl = "https://www.cappuccinobag.com";
const siteRoot = path.join(process.cwd(), "public", "site");

const legacyRoutes = [
  { path: "/about-us/", priority: 0.9 },
  { path: "/custom-cardholder-manufacturer/", priority: 0.88 },
  { path: "/custom-hiking-backpacks.html", priority: 0.88 },
  { path: "/custom-hiking-daypacks-outdoor-backpacks/", priority: 0.9 },
  { path: "/custom-hotel-bags.html", priority: 0.86 },
  { path: "/custom-padel-bags.html", priority: 0.88 },
  { path: "/custom-pickleball-bags.html", priority: 0.88 },
  { path: "/custom-pickleball-paddle-bags/", priority: 0.9 },
  { path: "/custom-rfid-wallet-manufacturer/", priority: 0.88 },
  { path: "/custom-sports-duffel-bags.html", priority: 0.86 },
  { path: "/custom-tennis-bags.html", priority: 0.88 },
  { path: "/custom-tennis-padel-racket-bags/", priority: 0.95 },
  { path: "/cycling-bags-bike-bags/", priority: 0.86 },
  { path: "/factory-trust-materials/", priority: 0.82 },
  { path: "/faq/", priority: 0.82 },
  { path: "/hotel-group-custom-bag-project-guide/", priority: 0.82 },
  { path: "/oem-odm-functional-bag-manufacturer-faq/", priority: 0.86 },
  { path: "/rfid-wallets-passport-holders/", priority: 0.86 },
  { path: "/running-waist-packs-running-belt-bags/", priority: 0.86 },
];

const highPriorityRoutes = new Set([
  "/",
  "/custom-tennis-padel-racket-bags/",
  "/custom-hiking-daypack-landing/",
  "/custom-outdoor-multifunctional-bag-manufacturer/",
  "/custom-travel-backpacks-weekender-bags/",
  "/rfid-wallet-passport-holder-manufacturer/",
  "/eco-tech-smart-bag-manufacturer/",
  "/download-catalog/",
  "/contact/",
  "/inquiry/",
]);

const resourceRoutes = new Set([
  "/resources/",
  "/bag-hardware-customization/",
  "/card-holder-customization-guide/",
  "/custom-tennis-bag-guide/",
  "/eco-tech-bag-material-guide/",
  "/gps-trackable-bag-guide/",
  "/hiking-backpack-customization-guide/",
  "/hotel-group-custom-bag-project-guide/",
  "/logo-customization-guide/",
  "/moq-sampling-faq/",
  "/mountaineering-backpack-manufacturing-guide/",
  "/outdoor-multifunctional-bag-manufacturing-guide/",
  "/outdoor-sports-bag-manufacturing-guide/",
  "/padel-bag-design-guide/",
  "/pickleball-bag-customization-guide/",
  "/private-label-packaging-guide/",
  "/quality-inspection-guide/",
  "/rfid-wallet-customization-guide/",
  "/sustainable-bag-wallet-materials-guide/",
  "/travel-bag-luggage-customization-guide/",
  "/wallet-materials-guide/",
]);

function listSiteRoutes(dir = siteRoot, prefix = "") {
  if (!fs.existsSync(dir)) return [];

  const routes = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      const slug = prefix ? `${prefix}/${entry.name}` : entry.name;
      const nestedRoutes = listSiteRoutes(entryPath, slug);

      return fs.existsSync(path.join(entryPath, "index.html"))
        ? [slug, ...nestedRoutes]
        : nestedRoutes;
    });

  return fs.existsSync(path.join(siteRoot, "index.html")) && !prefix
    ? ["", ...routes]
    : routes;
}

function normalizeRoute(route) {
  if (!route || route === "/") return "/";
  if (route.endsWith(".html")) return route.startsWith("/") ? route : `/${route}`;

  const pathname = route.startsWith("/") ? route : `/${route}`;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function routePriority(pathname) {
  if (highPriorityRoutes.has(pathname)) return pathname === "/" ? 1.0 : 0.95;
  if (resourceRoutes.has(pathname)) return 0.78;
  if (pathname.includes("-landing/")) return 0.9;
  if (pathname.includes("manufacturer/")) return 0.88;
  return 0.82;
}

function getRoutes() {
  const routeMap = new Map([["/", 1.0]]);

  for (const route of legacyRoutes) {
    routeMap.set(normalizeRoute(route.path), route.priority);
  }

  for (const route of listSiteRoutes()) {
    const pathname = normalizeRoute(route);
    routeMap.set(pathname, Math.max(routeMap.get(pathname) || 0, routePriority(pathname)));
  }

  return Array.from(routeMap, ([path, priority]) => ({ path, priority })).sort((a, b) =>
    a.path.localeCompare(b.path)
  );
}

export default function sitemap() {
  return getRoutes().map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
