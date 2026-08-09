import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditInternalLinks } from "./internal-links/audit.js";
import { detectCannibalization } from "./keywords/pipeline.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportRoot = path.join(root, "reports");
const siteUrl = "https://www.cappuccinobag.com";

async function listFiles(directory, predicate, output = []) {
  let entries = [];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return output;
  }
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await listFiles(target, predicate, output);
    else if (predicate(target)) output.push(target);
  }
  return output;
}

function stripTags(value = "") {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

function match(html, pattern) {
  return stripTags(html.match(pattern)?.[1] || "");
}

function pageUrlFromFile(file) {
  const relative = path.relative(path.join(root, "public"), file).split(path.sep).join("/");
  let route = relative
    .replace(/^site\//, "")
    .replace(/index\.html$/, "")
    .replace(/\.html$/, "")
    .replace(/\/+$/, "");
  return route ? `/${route}/` : "/";
}

function issue(name, url, severity, recommendation, autoFixable = false, humanReview = true, detail) {
  return {
    issue: name, url, severity, recommendation,
    auto_fixable: autoFixable, human_review_required: humanReview,
    ...(detail ? { detail } : {}),
  };
}

export async function scanRepository() {
  const htmlFiles = await listFiles(path.join(root, "public"), (file) => file.endsWith(".html"));
  const imageFiles = await listFiles(path.join(root, "public"), (file) => /\.(avif|webp|png|jpe?g|gif|svg)$/i.test(file));
  const pages = [];
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, "utf8");
    const url = pageUrlFromFile(file);
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map((entry) => ({ href: entry[1], text: stripTags(entry[2]) }))
      .filter((link) => link.href.startsWith("/") && !link.href.startsWith("//"));
    const images = [...html.matchAll(/<img\b([^>]*)>/gi)].map((entry) => {
      const attrs = entry[1];
      return {
        src: attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1] || "",
        alt: attrs.match(/\balt=["']([^"']*)["']/i)?.[1] || "",
      };
    });
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map((entry) => {
        try { JSON.parse(entry[1]); return { valid: true }; } catch { return { valid: false }; }
      });
    pages.push({
      site: "cappuccinobag", url, absolute_url: new URL(url, siteUrl).href,
      source_file: path.relative(root, file).split(path.sep).join("/"),
      page_type: url.includes("/blog/") || url.includes("-guide") ? "blog_or_guide"
        : /manufacturer|landing|collection/.test(url) ? "commercial" : "static",
      title: match(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      h1: match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
      meta_description: html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
        || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] || "",
      canonical: html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
        || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] || "",
      primary_keyword: match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).toLowerCase(),
      links, images, has_json_ld: jsonLd.length > 0, json_ld_valid: jsonLd.every((entry) => entry.valid),
      status: "published",
    });
  }
  const linkAudit = auditInternalLinks(pages);
  const missingAlt = pages.flatMap((page) => page.images.filter((image) => !image.alt).map((image) =>
    issue("missing_alt_text", page.url, "medium", "Add concise, descriptive alt text.", true, true, image.src)
  ));
  const duplicateBy = (field, label) => {
    const grouped = new Map();
    for (const page of pages) {
      if (!page[field]) continue;
      const value = page[field].toLowerCase();
      grouped.set(value, [...(grouped.get(value) || []), page.url]);
    }
    return [...grouped.entries()].filter(([, urls]) => urls.length > 1).map(([value, urls]) =>
      issue(label, urls[0], "high", "Choose one primary URL and review competing pages.", false, true, { value, urls })
    );
  };
  const duplicateTitles = duplicateBy("title", "duplicate_title");
  const duplicateDescriptions = duplicateBy("meta_description", "duplicate_meta_description");
  const cannibalization = detectCannibalization(pages);
  const seoPriority = pages.flatMap((page) => [
    ...(!page.title ? [issue("missing_title", page.url, "high", "Add a unique buyer-intent title.", true)] : []),
    ...(!page.h1 ? [issue("missing_h1", page.url, "high", "Add one clear H1.", true)] : []),
    ...(!page.meta_description ? [issue("missing_meta_description", page.url, "medium", "Add a useful meta description.", true)] : []),
    ...(!page.canonical ? [issue("missing_canonical", page.url, "high", "Add a self-referencing canonical.", true)] : []),
    ...(page.has_json_ld && !page.json_ld_valid ? [issue("invalid_json_ld", page.url, "high", "Correct JSON-LD syntax.", true)] : []),
  ]).concat(duplicateTitles, duplicateDescriptions, missingAlt, linkAudit.broken, linkAudit.orphans);
  const productPages = pages.filter((page) => page.page_type === "commercial");
  const blogPages = pages.filter((page) => page.page_type === "blog_or_guide");
  const imageInventory = imageFiles.map((file) => ({
    path: `/${path.relative(path.join(root, "public"), file).split(path.sep).join("/")}`,
    format: path.extname(file).slice(1).toLowerCase(),
  }));
  return {
    pages, products: productPages, blogs: blogPages, images: imageInventory,
    links: linkAudit.index.map((page) => ({
      url: page.url, inbound_internal_links: page.inbound_internal_links,
      outbound_internal_links: page.outbound_internal_links, page_depth: page.page_depth,
      links: page.links,
    })),
    broken: linkAudit.broken, orphans: linkAudit.orphans,
    duplicateTitles, duplicateDescriptions, missingAlt, cannibalization, seoPriority,
  };
}

function report(items, summary = {}) {
  return {
    site: "cappuccinobag", generated_at: new Date().toISOString(), mode: "draft_only",
    summary: { total: items.length, ...summary }, items,
  };
}

export async function writeReports(scan) {
  await fs.mkdir(reportRoot, { recursive: true });
  const reports = {
    "cappuccinobag-page-inventory.json": report(scan.pages, { published_pages: scan.pages.length }),
    "cappuccinobag-keyword-map.json": report(scan.pages.map((page) => ({
      keyword: page.primary_keyword, url: page.url, page_type: page.page_type, status: "existing",
    }))),
    "cappuccinobag-product-inventory.json": report(scan.products),
    "cappuccinobag-blog-inventory.json": report(scan.blogs),
    "cappuccinobag-image-inventory.json": report(scan.images),
    "cappuccinobag-internal-link-map.json": report(scan.links),
    "cappuccinobag-broken-links.json": report(scan.broken),
    "cappuccinobag-orphan-pages.json": report(scan.orphans),
    "cappuccinobag-duplicate-titles.json": report(scan.duplicateTitles),
    "cappuccinobag-duplicate-descriptions.json": report(scan.duplicateDescriptions),
    "cappuccinobag-missing-alt-text.json": report(scan.missingAlt),
    "cappuccinobag-cannibalization-report.json": report(scan.cannibalization),
    "cappuccinobag-seo-priority-report.json": report(scan.seoPriority, {
      high: scan.seoPriority.filter((item) => item.severity === "high").length,
      medium: scan.seoPriority.filter((item) => item.severity === "medium").length,
    }),
  };
  for (const [filename, payload] of Object.entries(reports)) {
    await fs.writeFile(path.join(reportRoot, filename), `${JSON.stringify(payload, null, 2)}\n`);
  }
  return Object.keys(reports);
}
