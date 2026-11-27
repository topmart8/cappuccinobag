export default function robots() {
  const preview = process.env.VERCEL_ENV === "preview";
  return {
    rules: preview
      ? { userAgent: "*", disallow: "/" }
      : {
          userAgent: "*",
          allow: [
            "/",
            "/site/assets/styles.css",
            "/site/assets/inquiry.css",
            "/site/assets/recycled-content.css",
            "/site/assets/compliance-content.css",
            "/site/assets/script.js",
            "/site/assets/cappuccino-logo.png",
          ],
          disallow: ["/crm/", "/api/", "/site/"],
        },
    ...(preview ? {} : { sitemap: "https://www.cappuccinobag.com/sitemap.xml" }),
    host: "https://www.cappuccinobag.com",
  };
}
