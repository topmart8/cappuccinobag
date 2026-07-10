import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { notFound } from "next/navigation";

const siteRoot = path.join(process.cwd(), "public", "site");
const publicRoot = path.join(process.cwd(), "public");
const publicRootPages = [
  "custom-hiking-daypacks-outdoor-backpacks",
  "custom-pickleball-paddle-bags",
];

export const dynamicParams = false;
export const revalidate = 86400;

function listStaticPages(dir = siteRoot, prefix = "") {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const pages = entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (!entry.isDirectory()) return [];

    const slug = prefix ? `${prefix}/${entry.name}` : entry.name;
    const indexPath = path.join(entryPath, "index.html");
    const nestedPages = listStaticPages(entryPath, slug);

    return fs.existsSync(indexPath) ? [slug, ...nestedPages] : nestedPages;
  });

  if (!prefix && fs.existsSync(path.join(siteRoot, "index.html"))) {
    return ["", ...pages, ...publicRootPages];
  }

  return pages;
}

function getAllowedPages() {
  return new Set(listStaticPages());
}

export function generateStaticParams() {
  return Array.from(getAllowedPages()).map((pageSlug) => ({
    slug: pageSlug ? pageSlug.split("/") : []
  }));
}

function getStaticFilePath(slug = []) {
  const pageSlug = slug.join("/");
  const allowedPages = getAllowedPages();
  if (!allowedPages.has(pageSlug)) return null;

  if (!pageSlug) return path.join(siteRoot, "index.html");

  const sitePath = path.join(siteRoot, pageSlug, "index.html");
  if (fs.existsSync(sitePath)) return sitePath;

  if (publicRootPages.includes(pageSlug)) {
    return path.join(publicRoot, pageSlug, "index.html");
  }

  return null;
}

function readStaticDocument(slug = []) {
  const filePath = getStaticFilePath(slug);
  if (!filePath || !fs.existsSync(filePath)) return null;

  return fs.readFileSync(filePath, "utf8");
}

function readStaticPage(slug = []) {
  const html = readStaticDocument(slug);
  if (!html) return null;

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return normalizeHtml(bodyMatch ? bodyMatch[1] : html);
}

function decodeHtmlEntities(text = "") {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#([0-9]+);/g, (_, num) =>
      String.fromCodePoint(Number.parseInt(num, 10))
    );
}

function extractMetadata(html, slug = []) {
  const pageSlug = slug.join("/");
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descriptionMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i
  );
  const canonicalMatch = html.match(
    /<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']\s*\/?>/i
  );

  const fallbackCanonical = pageSlug
    ? `https://www.cappuccinobag.com/${pageSlug}`
    : "https://www.cappuccinobag.com";

  return {
    title: decodeHtmlEntities(titleMatch?.[1]?.trim() || ""),
    description: decodeHtmlEntities(descriptionMatch?.[1]?.trim() || ""),
    canonical: decodeHtmlEntities(canonicalMatch?.[1]?.trim() || "") || fallbackCanonical
  };
}

function extractJsonLdScripts(html) {
  return Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  )
    .map((match) => match[1]?.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  const html = readStaticDocument(slug);

  if (!html) {
    return {};
  }

  const meta = extractMetadata(html, slug);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical
    },
    twitter: {
      title: meta.title,
      description: meta.description
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

function normalizeHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/src="(?:\.\.\/)?assets\//g, 'src="/site/assets/')
    .replace(/href="(?:\.\.\/)?assets\//g, 'href="/site/assets/')
    .replace(/href="\/index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="\.\.\/index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="\/index\.html"/g, 'href="/"')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="\.\.\/index\.html"/g, 'href="/"')
    .replace(/href="\.\.\/([^"]+)\/"/g, 'href="/$1"')
    .replace(/href="\/([^"?#]+)\/"/g, 'href="/$1"')
    .replace(/href="(contact|download-catalog|inquiry|request-a-quote|why-us|resources|factory|padel-bags|pickleball-bags|tennis-bags|hiking-backpacks|travel-bags|wallets-cardholders|smart-eco-bags|alcantara-accessories|premium-material-accessories|custom-duffle-bag-manufacturer|custom-microfiber-card-holder-manufacturer|hotel-group-custom-bag-project|custom-outdoor-multifunctional-bag-manufacturer|custom-outdoor-sports-bag-manufacturer|custom-tennis-bag-manufacturer|custom-pickleball-bag-manufacturer|custom-padel-bag-manufacturer|custom-hiking-backpack-manufacturer|custom-mountaineering-backpack-manufacturer|custom-travel-bag-luggage-manufacturer|custom-rfid-wallet-manufacturer|custom-magsafe-cardholder-manufacturer|custom-phone-pouch-manufacturer|phone-case-cardholder-gift-set-oem|vegan-leather-tech-accessories-manufacturer|eco-tech-smart-bag-manufacturer|outdoor-multifunctional-bag-manufacturing-guide|outdoor-sports-bag-manufacturing-guide|custom-tennis-bag-guide|pickleball-bag-customization-guide|padel-bag-design-guide|hiking-backpack-customization-guide|mountaineering-backpack-manufacturing-guide|travel-bag-luggage-customization-guide|hotel-group-custom-bag-project-guide|wallet-materials-guide|rfid-wallet-customization-guide|card-holder-customization-guide|eco-tech-bag-material-guide|gps-trackable-bag-guide|logo-customization-guide|private-label-packaging-guide|moq-sampling-faq|quality-inspection-guide|sustainable-bag-wallet-materials-guide|custom-pickleball-bag-landing|custom-tennis-padel-racket-bag-landing|custom-hiking-daypack-landing|custom-gym-duffel-bag-landing|custom-travel-weekender-bag-landing|custom-rfid-wallet-card-holder-landing|gps-trackable-smart-bag-landing|recycled-eco-tech-bag-landing)\//g, 'href="/$1')
    .replace(/href="#/g, 'href="/#')
    .replace(/id="home"/g, 'id="home" data-rendered-by="next"');
}

export default async function StaticSitePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  const sourceHtml = readStaticDocument(slug);
  const html = readStaticPage(slug);
  if (!html) notFound();

  const jsonLdScripts = sourceHtml ? extractJsonLdScripts(sourceHtml) : [];

  return (
    <>
      {jsonLdScripts.map((jsonLd, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ))}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/site/assets/script.js" strategy="afterInteractive" />
    </>
  );
}
