import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { techGiftArticles, techGiftCollectionPath, techGiftImages, techGiftProductPath, techGiftSiteUrl } from "../corporate-tech-gift-data";

const canonical = `${techGiftSiteUrl}${techGiftCollectionPath}`;
export const metadata = {
  title: "Corporate & Tech Gift Solutions | Custom Backpack Gift Sets",
  description: "Explore private-label corporate and promotional gift solutions led by functional laptop backpacks, flexible tech accessories and custom packaging.",
  alternates: { canonical }, robots: { index: true, follow: true },
  openGraph: { title: "Corporate & Tech Gift Solutions", description: "Backpack-led OEM gift sets for corporate promotions, welcome kits, distributors and Latin America programs.", url: canonical, type: "website", images: [{ url: `${techGiftSiteUrl}${techGiftImages[0].src}`, width: 1254, height: 1254, alt: techGiftImages[0].alt }] },
  twitter: { card: "summary_large_image", title: "Corporate & Tech Gift Solutions | Cappuccino Bag", description: "Backpack-led OEM tech gift sets for corporate promotions, employee welcome kits, distributors and Latin America programs.", images: [`${techGiftSiteUrl}${techGiftImages[0].src}`] },
};

export default function CorporateTechGiftSolutionsPage() {
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Corporate & Tech Gift Solutions", description: metadata.description, url: canonical, mainEntity: { "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, name: "3-in-1 Tech Gift Set", url: `${techGiftSiteUrl}${techGiftProductPath}` }] } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><SiteHeader /><main className="tech-gift-page"><nav className="padel-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Corporate &amp; Tech Gift Solutions</span></nav><section className="tech-gift-collection-hero"><div><h1>Corporate &amp; Tech Gift Solutions</h1><p>Backpack-led private-label gift sets for corporate promotions, employee programs, distributors and retail campaigns.</p><div className="hero-actions"><Link className="btn btn-primary" href="/inquiry?product=Corporate%20Tech%20Gift%20Set">Request OEM Quote</Link></div></div><Image src={techGiftImages[0].src} alt={techGiftImages[0].alt} width={1254} height={1254} sizes="(max-width: 900px) calc(100vw - 28px), 52vw" priority /></section><section className="tech-gift-section"><div className="tech-gift-heading"><h2>Featured 3-in-1 Tech Gift Set</h2><p>A water-resistant laptop backpack with flexible headphone, speaker and custom gift box configurations.</p></div><div className="tech-gift-featured-product"><Image src={techGiftImages[1].src} alt={techGiftImages[1].alt} width={1254} height={1254} loading="lazy" /><div><h3>One set, four configuration routes</h3><p>Choose backpack only, backpack plus headphones, backpack plus speaker or the full 3-in-1 set. Custom branding and Spanish or Portuguese packaging layouts can be reviewed for South America programs.</p><Link className="btn btn-primary" href={techGiftProductPath}>Explore the product</Link></div></div></section><section className="tech-gift-section"><div className="tech-gift-heading"><h2>Buyer Guides</h2></div><div className="tech-gift-link-list">{Object.entries(techGiftArticles).map(([slug, article]) => <Link href={`/blog/${slug}`} key={slug}>{article.title}</Link>)}</div></section></main><SiteFooter /></>;
}
