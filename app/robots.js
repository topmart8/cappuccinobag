export default function robots() {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.cappuccinobag.com/sitemap.xml",
    host: "https://www.cappuccinobag.com",
  };
}
