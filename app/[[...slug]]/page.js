import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { notFound } from "next/navigation";

const root = path.join(process.cwd(), "public", "site");

function fix(html) {
  return html
      .replace(/src="(?:\.\.\/)?assets\//g, 'src="/site/assets/')
          .replace(/href="(?:\.\.\/)?assets\//g, 'href="/site/assets/')
              .replace(/href="(?:\.\.\/)*index\.html#([^"]+)"/g, 'href="/#$1"')
                  .replace(/href="(?:\.\.\/)*index\.html"/g, 'href="/"')
                      .replace(/href="(?:\.\.\/)+/g, 'href="/')
                          .replace(/href="#/g, 'href="/#');
                          }

                          export default async function Page({ params }) {
                            const slug = (await params)?.slug || [];
                              const file = slug.length ? path.join(root, ...slug, "index.html") : path.join(root, "index.html");
                                if (!fs.existsSync(file)) notFound();
                                  const source = fs.readFileSync(file, "utf8");
                                    const body = source.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || source;

                                      return (
                                          <>
                                                <div dangerouslySetInnerHTML={{ __html: fix(body) }} />
                                                      <Script src="/site/assets/script.js" strategy="afterInteractive" />
                                                          </>
                                                            );
                                                            }
