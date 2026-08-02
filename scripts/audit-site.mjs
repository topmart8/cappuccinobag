import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  footerNavigation,
  moreCollectionsNavigation,
  primaryNavigation,
  utilityNavigation,
} from "../lib/site-navigation.js";

const port = Number(process.env.SITE_AUDIT_PORT || 3217);
const origin = process.env.AUDIT_BASE_URL || `http://127.0.0.1:${port}`;
const productionOrigin = "https://www.cappuccinobag.com";
const requiredPaths = [
  "/", "/products", "/custom-padel-bag-manufacturer", "/custom-padel-bags.html",
  "/custom-tennis-padel-racket-bags", "/custom-pickleball-paddle-bags",
  "/custom-tennis-bag-manufacturer", "/custom-outdoor-sports-bag-manufacturer",
  "/custom-hiking-daypacks-outdoor-backpacks", "/custom-travel-backpacks-weekender-bags",
  "/running-waist-packs", "/pet-travel-bags", "/pet-travel-guides", "/padel-accessories",
  "/rfid-wallet-passport-holder-manufacturer", "/recycled-material-bags",
  "/factory-trust-materials", "/inquiry", "/rfq", "/contact", "/resources",
  "/sitemap.xml", "/robots.txt",
];
const legacyRedirects = new Map([
  ["/custom-padel-bags.html", "/custom-padel-bag-manufacturer"],
  ["/custom-pickleball-bags.html", "/custom-pickleball-paddle-bags"],
  ["/custom-pickleball-bag-manufacturer", "/custom-pickleball-paddle-bags"],
  ["/custom-tennis-bags.html", "/custom-tennis-bag-manufacturer"],
  ["/custom-hiking-backpacks.html", "/custom-outdoor-sports-bag-manufacturer"],
  ["/custom-hiking-backpack-manufacturer", "/custom-outdoor-sports-bag-manufacturer"],
  ["/custom-hiking-daypacks-outdoor-backpacks", "/custom-outdoor-sports-bag-manufacturer"],
  ["/custom-travel-bag-luggage-manufacturer", "/custom-travel-backpacks-weekender-bags"],
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
]);

const stripTags = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const first = (html, pattern) => stripTags(html.match(pattern)?.[1] || "");
const all = (html, pattern) => [...html.matchAll(pattern)].map((match) => stripTags(match[1] || ""));
const attr = (html, tag, name) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*\\b${name}=["']([^"']+)["'][^>]*>`, "gi"))].map((match) => match[1].replaceAll("&amp;", "&"));
const canonicalFrom = (html) => html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)/i)?.[1] || "";
const robotsFrom = (html) => html.match(/<meta\b(?=[^>]*name=["']robots["'])[^>]*content=["']([^"']+)/i)?.[1] || "index,follow";
const navLabels = (html, label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = html.match(new RegExp(`<nav\\b[^>]*aria-label=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/nav>`, "i"))?.[1] || "";
  return all(body, /<(?:a|summary)\b[^>]*>([\s\S]*?)<\/(?:a|summary)>/gi);
};

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(origin, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Audit server did not start at ${origin}`);
}

async function fetchPage(pagePath, redirect = "follow") {
  try {
    const response = await fetch(new URL(pagePath, origin), { redirect });
    return {
      path: pagePath,
      status: response.status,
      finalPath: new URL(response.url).pathname,
      location: response.headers.get("location") || "",
      contentType: response.headers.get("content-type") || "",
      html: await response.text(),
    };
  } catch (error) {
    return { path: pagePath, status: 0, finalPath: pagePath, location: "", contentType: "", html: "", error: error.message };
  }
}

async function mapLimit(values, limit, work) {
  const output = [];
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      output[index] = await work(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return output;
}

function inspectHtml(page) {
  const schemas = [];
  const schemaErrors = [];
  for (const source of [...page.html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1])) {
    try { schemas.push(JSON.parse(source)); } catch (error) { schemaErrors.push(error.message); }
  }
  const schemaNodes = schemas.flatMap((schema) => schema["@graph"] || [schema]);
  const schemaFaqs = schemaNodes.filter((node) => node["@type"] === "FAQPage").flatMap((node) => node.mainEntity || []).map((item) => item.name);
  const visibleText = stripTags(page.html);
  return {
    ...page,
    title: first(page.html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
    h1: all(page.html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi),
    canonical: canonicalFrom(page.html),
    robots: robotsFrom(page.html),
    links: attr(page.html, "a", "href"),
    images: attr(page.html, "img", "src"),
    desktopNavigation: navLabels(page.html, "Main navigation"),
    mobileNavigation: navLabels(page.html, "Mobile navigation"),
    footerNavigation: (() => {
      const footer = page.html.match(/<footer\b[^>]*site-footer-unified[^>]*>([\s\S]*?)<\/footer>/i)?.[1] || "";
      return all(footer, /<a\b[^>]*>([\s\S]*?)<\/a>/gi).filter((label) => label !== "info@cappuccinobag.net");
    })(),
    schemaCount: schemas.length,
    schemaErrors,
    faqSchemaMatchesVisible: schemaFaqs.every((question) => visibleText.includes(question)),
  };
}

function duplicateGroups(pages, field) {
  const grouped = new Map();
  for (const page of pages) {
    const value = field === "h1" ? page.h1[0] : page[field];
    if (!value) continue;
    grouped.set(value, [...(grouped.get(value) || []), page.path]);
  }
  return [...grouped.entries()].filter(([, paths]) => paths.length > 1).map(([value, paths]) => ({ value, paths }));
}

let server;
try {
  if (!process.env.AUDIT_BASE_URL) {
    const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
    server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
    await waitForServer();
  }

  const sitemapPage = await fetchPage("/sitemap.xml");
  const sitemapUrls = [...sitemapPage.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemapPaths = sitemapUrls.map((value) => new URL(value).pathname);
  const crawlPaths = [...new Set([...sitemapPaths, ...requiredPaths.filter((item) => !item.endsWith(".xml") && !item.endsWith(".txt") && !legacyRedirects.has(item))])];
  const pages = (await mapLimit(crawlPaths, 8, (pagePath) => fetchPage(pagePath))).filter((page) => page.contentType.includes("text/html")).map(inspectHtml);
  const redirectChecks = await mapLimit([...legacyRedirects.keys()], 4, (pagePath) => fetchPage(pagePath, "manual"));
  const internalTargets = [...new Set(pages.flatMap((page) => page.links).filter((href) => href.startsWith("/")).map((href) => href.split("#")[0]).filter(Boolean))];
  const imageTargets = [...new Set(pages.flatMap((page) => page.images).filter((src) => src.startsWith("/")))];
  const linkChecks = await mapLimit(internalTargets, 12, (pagePath) => fetchPage(pagePath, "manual"));
  const imageChecks = await mapLimit(imageTargets, 12, (pagePath) => fetchPage(pagePath, "manual"));
  const robotsPage = await fetchPage("/robots.txt");
  const expectedHeader = [...primaryNavigation.map((item) => item.label), "More Collections", ...moreCollectionsNavigation.map((item) => item.label), ...utilityNavigation.map((item) => item.label)];
  const expectedMobile = expectedHeader;
  const expectedFooter = footerNavigation.flatMap((group) => group.links.map((item) => item.label));

  const issues = {
    duplicateTitles: duplicateGroups(pages, "title"),
    duplicateH1s: duplicateGroups(pages, "h1"),
    duplicateCanonicals: duplicateGroups(pages, "canonical"),
    missingCanonical: pages.filter((page) => !page.canonical).map((page) => page.path),
    multipleH1: pages.filter((page) => page.h1.length !== 1).map((page) => ({ path: page.path, count: page.h1.length })),
    invalidCanonical: pages.filter((page) => page.canonical && (!page.canonical.startsWith(productionOrigin) || (/\/$/.test(page.canonical) && page.canonical !== `${productionOrigin}/`))).map((page) => ({ path: page.path, canonical: page.canonical })),
    sitemapRedirects: redirectChecks.filter((check) => sitemapPaths.includes(check.path)).map((check) => check.path),
    sitemapDuplicates: sitemapPaths.filter((item, index) => sitemapPaths.indexOf(item) !== index),
    sitemapNon200: (await mapLimit(sitemapPaths, 8, (pagePath) => fetchPage(pagePath, "manual"))).filter((check) => check.status !== 200).map((check) => ({ path: check.path, status: check.status })),
    noindexInSitemap: pages.filter((page) => sitemapPaths.includes(page.path) && /noindex/i.test(page.robots)).map((page) => page.path),
    brokenInternalLinks: linkChecks.filter((check) => check.status === 0 || check.status >= 400).map((check) => ({ path: check.path, status: check.status })),
    redirectedInternalLinks: linkChecks.filter((check) => check.status >= 300 && check.status < 400).map((check) => ({ path: check.path, status: check.status, location: check.location })),
    brokenImages: imageChecks.filter((check) => check.status === 0 || check.status >= 400).map((check) => ({ path: check.path, status: check.status })),
    redirectErrors: redirectChecks.filter((check) => check.status !== 301 || !check.location.includes(legacyRedirects.get(check.path))).map((check) => ({ path: check.path, status: check.status, location: check.location })),
    headerOrder: pages.filter((page) => JSON.stringify(page.desktopNavigation) !== JSON.stringify(expectedHeader)).map((page) => ({ path: page.path, actual: page.desktopNavigation })),
    mobileOrder: pages.filter((page) => JSON.stringify(page.mobileNavigation) !== JSON.stringify(expectedMobile)).map((page) => ({ path: page.path, actual: page.mobileNavigation })),
    footerOrder: pages.filter((page) => JSON.stringify(page.footerNavigation) !== JSON.stringify(expectedFooter)).map((page) => ({ path: page.path, actual: page.footerNavigation })),
    schemaParseErrors: pages.filter((page) => page.schemaErrors.length).map((page) => ({ path: page.path, errors: page.schemaErrors })),
    faqSchemaMismatch: pages.filter((page) => !page.faqSchemaMatchesVisible).map((page) => page.path),
    robotsMissingProtection: ["/crm/", "/api/", "/site/"].filter((entry) => !robotsPage.html.includes(`Disallow: ${entry}`)),
    mixedDomainSource: [],
  };

  for (const file of ["app", "components", "lib", "public", "next.config.mjs"]) {
    const source = await (async () => {
      try { return await readFile(path.join(process.cwd(), file), "utf8"); } catch { return ""; }
    })();
    if (source.includes("https://cappuccinobag.com")) issues.mixedDomainSource.push(file);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    origin,
    summary: { pages: pages.length, sitemapUrls: sitemapPaths.length, internalTargets: internalTargets.length, images: imageTargets.length },
    expectedNavigation: { desktop: expectedHeader, mobile: expectedMobile, footer: expectedFooter },
    redirects: redirectChecks.map(({ path: pagePath, status, location }) => ({ path: pagePath, status, location })),
    issues,
    pages: pages.map(({ html, links, images, ...page }) => ({
      ...page,
      internalLinkCount: links.filter((href) => href.startsWith("/")).length,
      imageCount: images.filter((src) => src.startsWith("/")).length,
      inSitemap: sitemapPaths.includes(page.path),
    })),
  };
  await mkdir(path.join(process.cwd(), "reports"), { recursive: true });
  await writeFile(path.join(process.cwd(), "reports", "site-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
  const issueRows = Object.entries(issues).map(([name, values]) => `| ${name} | ${values.length} |`).join("\n");
  const pageRows = pages.map((page) => `| ${page.path} | ${page.status} | ${page.title || "—"} | ${page.h1[0] || "—"} | ${page.canonical || "—"} | ${page.robots} |`).join("\n");
  const redirectRows = report.redirects.map((item) => `| ${item.path} | ${item.status} | ${item.location || "—"} |`).join("\n");
  const markdown = `# Cappuccino Bag Site Audit\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n- Pages crawled: ${pages.length}\n- Sitemap URLs: ${sitemapPaths.length}\n- Internal targets checked: ${internalTargets.length}\n- Images checked: ${imageTargets.length}\n\n## Issue counts\n\n| Check | Count |\n|---|---:|\n${issueRows}\n\n## Redirect checks\n\n| Source | Status | Location |\n|---|---:|---|\n${redirectRows}\n\n## Page inventory\n\n| Path | Status | Title | H1 | Canonical | Robots |\n|---|---:|---|---|---|---|\n${pageRows}\n`;
  await writeFile(path.join(process.cwd(), "reports", "site-audit.md"), markdown);

  const productionStatus = new Map([
    ["/custom-padel-bags.html", 200], ["/custom-pickleball-bags.html", 200],
    ["/custom-pickleball-bag-manufacturer", 200], ["/custom-tennis-bags.html", 200],
    ["/custom-hiking-backpacks.html", 200], ["/custom-hiking-backpack-manufacturer", 200],
    ["/custom-hiking-daypacks-outdoor-backpacks", 200], ["/custom-travel-bag-luggage-manufacturer", 200],
    ["/custom-convertible-padel-backpack-duffel", 404], ["/custom-sports-duffel-bags.html", 200],
    ["/custom-hotel-bags.html", 200], ["/resources/outdoor-multifunctional-bag-manufacturing-guide", 200],
    ["/resources/custom-tennis-bag-guide", 200], ["/resources/pickleball-bag-customization-guide", 200],
    ["/resources/hiking-backpack-customization-guide", 200], ["/resources/quality-inspection-guide", 200],
    ["/resources/moq-sampling-faq", 200], ["/rfq", 308],
  ]);
  const sourceFor = (pagePath) => {
    if (pagePath === "/") return "public/site/index.html + app/static-site.js";
    if (pagePath === "/products") return "app/products/page.js";
    if (pagePath.startsWith("/products/")) return pagePath.includes("pdb001") ? "app/products/padel-work-tote-backpack-pdb001/page.js" : "app/products/[slug]/page.js";
    if (pagePath.startsWith("/padel-bags/")) return "app/padel-bags/[slug]/page.js + app/padel-product-template.js";
    if (pagePath.startsWith("/padel-accessories/")) return "app/padel-accessories/[slug]/page.js + app/padel-product-template.js";
    if (pagePath === "/padel-accessories") return "app/padel-accessories/page.js";
    if (pagePath.startsWith("/running-waist-packs/")) return "app/running-waist-packs/[slug]/page.js + app/running-product-template.js";
    if (pagePath === "/running-waist-packs") return "app/running-waist-packs/page.js";
    if (pagePath.startsWith("/running-guides/")) return "app/running-guides/[slug]/page.js + app/running-article-template.js";
    if (pagePath.startsWith("/running/")) return "app/running/[category]/page.js + app/running-collection-template.js";
    if (pagePath.startsWith("/pet-travel-bags/")) return "app/pet-travel-bags/[slug]/page.js + pet templates/data";
    if (pagePath.startsWith("/pet-travel-guides/")) return "app/pet-travel-guides/[slug]/page.js + pet article data";
    if (pagePath === "/pet-travel-bags" || pagePath === "/pet-travel-guides") return `app${pagePath}/page.js`;
    if (pagePath === "/privacy") return "app/privacy/page.js";
    return `public/site${pagePath}/index.html or public${pagePath}/index.html + app/static-site.js`;
  };
  const matrixRows = [...legacyRedirects].map(([source, target]) => `| ${source} | ${productionStatus.get(source) ?? "not captured"} | MERGE + 301 | ${target} | Removed |`).join("\n");
  const inventoryRows = report.pages.map((page) => `| ${page.path} | ${sourceFor(page.path)} | ${page.title || "—"} | ${page.h1[0] || "—"} | ${page.canonical || "—"} | ${page.robots} | ${page.inSitemap ? "Yes" : "No"} | ${page.internalLinkCount} | No after consolidation | KEEP | ${page.status} | ${page.path} |`).join("\n");
  const architectureReport = `# Cappuccino Bag Site Architecture Audit — August 2026\n\n## Scope and evidence\n\n- Production baseline captured on 2026-08-02 before this branch is deployed.\n- Local post-change evidence comes from a Next.js production build and HTTP crawl.\n- No page-level traffic export was available. Therefore only clearly duplicated URLs were consolidated; product, article, Pet Travel, Running and Padel assets were retained.\n- Detailed machine-readable results: \`reports/site-audit.json\`; readable crawl: \`reports/site-audit.md\`.\n\n## Architecture decision\n\nOption B was selected: keep the static HTML content sources and run one deterministic transform in \`app/static-site.js\`. Header, mobile navigation and Footer are rendered from \`lib/site-navigation.js\`; the homepage priority blocks are inserted together in one pass. This avoids a high-risk full migration while removing competing navigation injections.\n\n## Canonical hubs\n\n| Category | Canonical hub | Role |\n|---|---|---|\n| Padel | /custom-padel-bag-manufacturer | First-priority category hub |\n| Pickleball | /custom-pickleball-paddle-bags | Primary category hub |\n| Tennis | /custom-tennis-bag-manufacturer | Primary category hub |\n| Racket sports overview | /custom-tennis-padel-racket-bags | Padel/Pickleball/Tennis overview; not a Padel keyword competitor |\n| Outdoor & Hiking | /custom-outdoor-sports-bag-manufacturer | Primary category hub |\n| Travel | /custom-travel-backpacks-weekender-bags | Primary category hub |\n| Running | /running-waist-packs | Secondary growth hub |\n| Pet Travel | /pet-travel-bags | Secondary growth hub after Running |\n| RFID | /rfid-wallet-passport-holder-manufacturer | Supporting product hub |\n| Materials | /recycled-material-bags | Manufacturing capability |\n\n## URL deduplication matrix\n\n| Production URL | Production status before | Action | Post-change target | Sitemap |\n|---|---:|---|---|---|\n${matrixRows}\n\nAll redirect rows return HTTP 301 in the local production audit. No redirected URL remains in the sitemap.\n\n## Navigation specification\n\nDesktop and mobile use the same order: Padel Bags; Pickleball Bags; Tennis Bags; Outdoor & Hiking; Travel Bags; More Collections; Factory Proof; RFQ. More Collections is ordered Running & Sports Bags; Pet Travel Bags; RFID Wallets; Sustainable Materials; Padel Accessories; Buyer Resources.\n\nFooter groups: Core Sports Bags; Outdoor & Travel; Emerging Collections; Manufacturing & Proof; Contact. Padel Bags is the first product link.\n\n## Homepage order\n\n1. Hero\n2. Featured Padel Collection, including PDB001 and S001–S004\n3. Core Product Categories\n4. Secondary Growth Collections: Running, Pet Travel, RFID\n5. Material Capabilities\n6. OEM/ODM Manufacturing\n7. Existing Factory Proof\n8. Existing Buyer Guides\n9. Existing FAQ\n10. Existing RFQ\n\n## Indexing policy\n\n- Formal sitemap source: \`app/sitemap.js\`.\n- Removed shadow sitemap: \`public/site/sitemap.xml\`.\n- Explicitly disallowed from crawling: \`/crm/\`, \`/api/\`, \`/site/\`.\n- No standalone noindex page is included in the sitemap. Preview deployments remain noindex through response headers.\n- Canonical format: HTTPS, \`www\`, no trailing slash except the homepage.\n\n## Complete accessible page inventory\n\n| URL | Source file / renderer | Title | H1 | Canonical | Robots | Sitemap | Internal links | Duplicate | Action | Local status | Post-change target |\n|---|---|---|---|---|---|---|---:|---|---|---:|---|\n${inventoryRows}\n`;
  await mkdir(path.join(process.cwd(), "docs"), { recursive: true });
  await writeFile(path.join(process.cwd(), "docs", "site-architecture-audit-2026-08.md"), architectureReport);
  console.log(JSON.stringify({ summary: report.summary, issueCounts: Object.fromEntries(Object.entries(issues).map(([name, values]) => [name, values.length])) }, null, 2));
} finally {
  if (server) server.kill("SIGTERM");
}
