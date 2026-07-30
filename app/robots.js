export default function robots() {
  const preview = process.env.VERCEL_ENV === "preview";
  return {
    rules: preview
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/", disallow: ["/crm/", "/api/"] },
    ...(preview ? {} : { sitemap: "https://www.cappuccinobag.com/sitemap.xml" }),
    host: "https://www.cappuccinobag.com",
  };
}
