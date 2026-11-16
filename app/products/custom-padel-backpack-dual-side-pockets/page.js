import Image from "next/image";
import Link from "next/link";
import { PadelHeader, PadelFooter } from "../../padel-components";
import { origin, productPath, categoryPath, productName, imageBase, inquiry, description, features, faqs } from "../../dual-pocket-padel-data";
import styles from "../../dual-pocket-padel.module.css";

const title = "Custom Padel Backpack with Side Pockets | Cappuccino";
export const metadata = { title, description, alternates: { canonical: `${origin}${productPath}` }, openGraph: {title, description, url: `${origin}${productPath}`, type: "website", images: [{url: `${origin}${imageBase}/custom-padel-backpack-hero.webp`, width: 1254, height: 1254, alt: "Charcoal dual-pocket padel backpack concept"}]}, twitter: {card: "summary_large_image", title, description, images: [`${origin}${imageBase}/custom-padel-backpack-hero.webp`]} };
const specs = [
  ["Development status", "Custom development concept; final construction and fit confirmed through sampling"],
  ["Proposed storage", "Padded front racket compartment, main compartment, inner divider and zip pocket, two external side pockets"],
  ["Material options", "Polyester or recycled polyester; composition, recycled content, coating and lining agreed for the order"],
  ["Zipper options", "YKK or another agreed specification; model and availability quoted separately"],
  ["Branding options", "Screen print, embroidery or woven label, subject to material compatibility"],
  ["Size and capacity", "Developed around the buyer’s equipment and packing list; no fixed measured capacity is stated"],
  ["Minimum order", "300 pieces per style for new custom production; different styles cannot be combined"],
  ["Sampling and delivery", "Fees, tooling, revisions, shipping and lead time quoted after specification review"],
];
const schemas = [
  {"@context":"https://schema.org","@type":"Product",name:productName,description,url:`${origin}${productPath}`,image:[`${origin}${imageBase}/custom-padel-backpack-hero.webp`],brand:{"@type":"Brand",name:"Cappuccino Bag"},category:"Custom Padel Backpacks"},
  {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{name:"Padel Bags",item:`${origin}/racket-sports/padel-bags`},{name:"Padel Backpacks",item:`${origin}${categoryPath}`},{name:productName,item:`${origin}${productPath}`}].map((item,i)=>({"@type":"ListItem",position:i+1,...item}))},
];
export default function Page(){return <>
  {schemas.map(s=><script key={s["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(s).replace(/</g,"\\u003c")}}/>)}
  <PadelHeader/><main className={styles.page}><div className={styles.wrap}>
  <nav aria-label="Breadcrumb" className={styles.crumb}><Link href="/racket-sports/padel-bags">Padel Bags</Link> / <Link href={categoryPath}>Padel Backpacks</Link> / Dual-Pocket Backpack</nav>
  <section className={styles.hero}>
    <figure className={styles.media}><Image src={`${imageBase}/custom-padel-backpack-hero.webp`} alt="Charcoal padel backpack concept with a water bottle pocket and a separate ball tube pocket" width={1254} height={1254} priority sizes="(max-width:760px) 90vw, 45vw"/><figcaption>Development concept. Bottle, balls and racket are illustrative accessories, not included.</figcaption></figure>
    <div><p className={styles.eyebrow}>Private-label development · Clubs &amp; brands</p><h1>Custom Padel Backpack with Bottle &amp; Ball Pockets</h1><p>A rounded court-ready design direction with separate racket storage, organized everyday space and two easy-access side pockets. Develop your logo, colours and material specification for a focused club or retail collection.</p><p className={styles.note}><strong>New custom production: 300 pieces per style.</strong><br/>Recycled polyester and YKK zippers are optional specifications, subject to quotation and material confirmation.</p><div className={styles.actions}><Link href={inquiry} className={styles.button}>Request a Sample &amp; Quote</Link><a href="#features">Explore the features ↓</a></div><small>Final dimensions, equipment fit and construction are agreed through sampling.</small></div>
  </section>
  <section id="features" className={styles.section}><p className={styles.eyebrow}>Storage that follows the player</p><h2>One backpack, clearly separated essentials</h2><div className={styles.grid}>{features.map(([h,p])=><article className={styles.card} key={h}><h3>{h}</h3><p>{p}</p></article>)}</div></section>
  <section className={styles.section} id="product-details-gallery"><h2>Explore the proposed construction</h2><p>Review the front, rear, court-use and interior views below. These renders communicate the development direction; physical samples establish fit, material feel and workmanship.</p><figure className={`${styles.media} ${styles.wide}`}><Image src={`${imageBase}/custom-padel-backpack-views.webp`} alt="Six concept views showing dual side pockets, mesh back padding and the open main compartment" width={1536} height={1024} sizes="90vw"/><figcaption>Proposed dual-pocket layout and internal organization.</figcaption></figure><figure className={`${styles.media} ${styles.wide}`}><Image src={`${imageBase}/custom-padel-backpack-detail.webp`} alt="Padel backpack feature overview: bottle and ball storage, interior divider, padded carry and optional recycled fabric and YKK zippers" width={1122} height={1402} sizes="90vw"/><figcaption>Optional materials and zipper specifications require confirmation for the order.</figcaption></figure></section>
  <section className={styles.section}><h2>Custom development specification</h2><dl className={styles.specs}>{specs.map(([k,v])=><div key={k} style={{display:"contents"}}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p className={styles.note}>No finished-bag waterproof, recycled-content certification or tested capacity claim is made for this concept. Material evidence must match the selected fabric and order.</p></section>
  <section className={styles.section}><h2>From your brief to an approved sample</h2><ol><li>Share your quantity, logo, destination, equipment dimensions and intended arrival date.</li><li>Agree the material, pocket layout, branding, sample scope and quotation.</li><li>Review the prototype with your racket, bottle, ball tube and intended main-compartment load.</li><li>Approve the final specification and order terms before bulk production.</li></ol></section>
  <section className={`${styles.section} ${styles.faq}`}><h2>Buyer questions</h2>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
  <section className={styles.cta}><h2>Build your branded court collection</h2><p>Send your planned quantity, logo artwork and material preferences. Include a packing list so we can review the storage layout and quote the right sample.</p><div className={styles.actions}><Link href={inquiry} className={styles.button}>Start This Backpack Project</Link><a href={`https://wa.me/8613928715568?text=${encodeURIComponent(`Hello, I would like to develop the ${productName}. ${origin}${productPath}`)}`}>WhatsApp +86 13928715568</a><a href="mailto:info@cappuccinobag.net">Email our team</a></div></section>
  <nav className={styles.links} aria-label="Related buyer resources"><Link href={categoryPath}>Compare Padel Backpacks</Link><Link href="/custom-padel-bag-manufacturer">Manufacturing &amp; sampling</Link><Link href="/recycled-material-bags">Recycled material options</Link><Link href="/padel-club-tournament-supply">Club &amp; tournament collections</Link></nav>
  </div></main><PadelFooter/>
  </>;}
