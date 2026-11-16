import Image from "next/image";
import Link from "next/link";
import { PadelHeader, PadelFooter } from "../padel-components";
import styles from "./page.module.css";

const origin = "https://www.cappuccinobag.com";
const path = "/padel-club-tournament-supply";
const title = "Custom Padel Club & Tournament Bags | Cappuccino";
const description = "Build a branded Padel range for club shops, member welcome kits and tournament packs. Compare racket sleeves, shoe bags, pouches and team bags. MOQ 300 per style.";
const sleeveImage = "/images/padel/original-court-series-2026/S005/S005-hero.webp";
const rfq = (program) => `/inquiry?product=Padel%20Bags&format=${encodeURIComponent(program)}`;

export const metadata = {
  title, description, alternates: { canonical: `${origin}${path}` },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: `${origin}${path}`, type: "website", images: [{ url: sleeveImage, width: 1250, height: 1250, alt: "S005 Padel sleeve sample-photo reference with digital Cappuccino branding" }] },
  twitter: { card: "summary_large_image", title, description, images: [sleeveImage] },
};

const products = [
  { sku: "S005", name: "Thermal-lined racket sleeve", href: "/padel-accessories/custom-padel-racket-sleeve", image: sleeveImage, status: "Sample-photo reference · digitally branded", text: "A compact starting point for club retail and member packs. Review the 900D exterior, silver reflective lining, accessory zip and detachable strap.", check: "Check actual racket fit and lining construction. Thermal and finished-bag water resistance need testing." },
  { sku: "S004", name: "Court essentials pouch", href: "/padel-accessories/custom-padel-organizer-pouch", image: "/images/padel/S004/S004-01-main.png", status: "Design concept · sample approval required", text: "An organizer for overgrips, keys and small personal items. Develop it as a stand-alone club item or the base of a tournament welcome pack.", check: "Agree the contents list, pocket dimensions and logo area. Contents are not included." },
  { sku: "S003", name: "Separate shoe bag", href: "/padel-accessories/custom-ventilated-padel-shoe-bag", image: "/images/padel/S003/S003-01-main.png", status: "Design concept · sample approval required", text: "Keep footwear in its own bag within a coordinated club range. Review a wide opening, carry handle and suitable lining for the intended use.", check: "Approve the target shoe size, lining, ventilation method and packed dimensions." },
  { sku: "PDB016", name: "Match-day team duffel", href: "/products/weekend-padel-carryall-pdb016", image: "/images/padel/original-court-series-2026/PDB016/PDB016-hero.webp", status: "AI design concept · sample approval required", text: "An anchor bag for team travel and premium member programmes, with a proposed racket sleeve, wide top access and footwear zone.", check: "Fit the racket, shoes and clothing together before approving capacity or dimensions." },
];

const programs = [
  { name: "Club shop collection", number: "01", subtitle: "A coordinated range players can buy separately", items: "Start with S005 sleeve + S004 pouch. Add S003 footwear storage or a main bag when the range is established.", brief: "Club-shop collection: S005 sleeve / S004 pouch / S003 shoe bag", planning: "Define retail price targets, quantities per style, brand colours, hangtags and replenishment requirements." },
  { name: "Member & academy welcome kit", number: "02", subtitle: "A useful introduction to your club identity", items: "Develop a branded sleeve and pouch as separate items in one welcome pack. The club can add its own membership card and approved playing accessories.", brief: "Member / academy welcome kit: S005 sleeve and S004 pouch", planning: "Specify member numbers, the contents list, kit assembly, packaging and required arrival date." },
  { name: "Tournament & sponsor pack", number: "03", subtitle: "One event identity, clearly defined pack levels", items: "Use the pouch as a participant-pack base. Review a shoe bag or duffel for a premium tier, officials or sponsor guests.", brief: "Tournament / sponsor packs: S004 pouch, S003 shoe bag, optional PDB016 duffel", planning: "Provide quantities by tier, sponsor artwork rights, delivery destination and event date. Dates are confirmed after quotation." },
];

const faqs = [
  ["What can Cappuccino develop for Padel clubs and tournaments?", "Our core scope is custom bags and sewn accessories: racket sleeves, backpacks, duffels, totes, shoe bags and organizer pouches. Select individual styles or develop a coordinated range for club retail, membership and tournament programmes."],
  ["Can different products share one 300-piece minimum?", "No. New custom production starts at 300 pieces per style. For example, 300 sleeves and 300 pouches are two production lines, not a combined 300-piece order. Colour splits, packaging and sampling are assessed separately."],
  ["Do the proposed packs include rackets, balls or overgrips?", "No. The published core offer covers bags and sewn accessories. Rackets, balls, overgrips, towels and apparel require separate supplier, sample, quality and quotation review, or can be supplied by the buyer. They are not included by default."],
  ["Can you add a club logo and tournament sponsor artwork?", "Yes. Submit artwork you are authorised to use, the preferred placement and colours. We review print, embroidery, woven labels or other suitable methods with the selected material and approve a physical logo sample."],
  ["How should we plan for a fixed event date?", "Work back from the required arrival date and destination. Allow for specification review, sampling, artwork approval, material sourcing, production, inspection and shipping. A delivery commitment is made only after these stages and the order terms are agreed."],
  ["Can we reorder the same club collection?", "Reorders should refer to the approved style, material, colour, artwork and sample version. Material availability, minimums, pricing and delivery are reconfirmed for each order. A first order does not reserve future stock or capacity."],
];

const schemas = [
  { "@context": "https://schema.org", "@type": "WebPage", "@id": `${origin}${path}#webpage`, url: `${origin}${path}`, name: title, description, inLanguage: "en", mainEntity: { "@id": `${origin}${path}#service` } },
  { "@context": "https://schema.org", "@type": "Service", "@id": `${origin}${path}#service`, name: "Custom Padel club and tournament bag programmes", serviceType: "OEM/ODM bag and sewn-accessory development", description, url: `${origin}${path}`, provider: { "@type": "Organization", name: "Cappuccino Bag", url: origin }, audience: { "@type": "BusinessAudience", audienceType: "Padel clubs, academies, tournament organisers and sports brands" } },
  { "@context": "https://schema.org", "@type": "ItemList", name: "Padel club and tournament bag development shortlist", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.sku} ${p.name}`, url: `${origin}${p.href}` })) },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: origin }, { "@type": "ListItem", position: 2, name: "Padel bags", item: `${origin}/racket-sports/padel-bags` }, { "@type": "ListItem", position: 3, name: "Club & tournament supply", item: `${origin}${path}` }] },
];

export default function PadelClubTournamentSupply() {
  return <>
    {schemas.map(schema => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
    <PadelHeader />
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/racket-sports/padel-bags">Padel bags</Link><span aria-hidden="true"> / </span><span>Clubs & events</span></nav>
          <p className={styles.eyebrow}>Cappuccino · Padel programmes</p>
          <h1>Your club.<br />Your colours.<br /><em>A connected range.</em></h1>
          <p className={styles.lead}>Custom Padel bags and accessories for club shops, member welcome kits and tournament packs. Build around what your players carry, with one consistent brand identity.</p>
          <p className={styles.order}>Custom production from <strong>300 pieces per style.</strong><br />Samples assessed separately. Different styles cannot be combined.</p>
          <div className={styles.actions}><Link className={styles.primary} href={rfq("Padel club / tournament bag programme")}>Plan your club range</Link><a className={styles.secondary} href="#programmes">Compare programmes ↓</a></div>
        </div>
        <figure className={styles.heroMedia}><Image src={sleeveImage} width={1250} height={1250} sizes="(max-width: 800px) 100vw, 50vw" alt="S005 full-cover Padel sleeve with front zip pocket and detachable strap, sample-photo reference with digitally applied branding" priority /><figcaption>S005 · Sample-photo reference with digital branding. Explore the actual lining and strap details below.</figcaption></figure>
      </section>

      <section className={styles.section} id="programmes">
        <p className={styles.eyebrow}>Three buying scenarios</p><h2>Start with the programme.</h2><p className={styles.intro}>Choose the recipient, contents and budget before choosing the bag. These are configurable development proposals, not stocked kits.</p>
        <div className={styles.programGrid}>{programs.map(p => <article key={p.number} className={styles.program}><span className={styles.number}>{p.number}</span><h3>{p.name}</h3><p className={styles.subtitle}>{p.subtitle}</p><p>{p.items}</p><p className={styles.planning}>{p.planning}</p><Link href={rfq(p.brief)}>Discuss this programme →</Link></article>)}</div>
      </section>

      <section className={styles.section} id="products"><p className={styles.eyebrow}>A focused first range</p><h2>Four formats. Clear roles.</h2><p className={styles.intro}>Develop each style to your brief and coordinate the materials, trims and approved artwork. Product pages include internal layouts and detail views.</p>
        <div className={styles.productGrid}>{products.map(p => <article key={p.sku} className={styles.product}><Link href={p.href}><Image src={p.image} width={1250} height={1250} sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 25vw" alt={`${p.sku} ${p.name} — ${p.status}`} /></Link><div className={styles.productCopy}><p className={styles.eyebrow}>{p.sku}</p><h3><Link href={p.href}>{p.name}</Link></h3><p className={styles.status}>{p.status}</p><p>{p.text}</p><p className={styles.check}>{p.check}</p><Link href={p.href}>View interior & details →</Link></div></article>)}</div>
        <p className={styles.more}>For a broader club collection, compare the <Link href="/products/womens-lightweight-padel-tote-pdb014">canvas court tote</Link>, <Link href="/products/travel-padel-utility-backpack-pdb017">training backpack</Link> and <Link href="/products/custom-hybrid-padel-duffel-backpack">convertible duffel backpack</Link>.</p>
      </section>

      <section className={`${styles.section} ${styles.detail}`} id="sample-detail">
        <figure><Image src="/images/padel/original-court-series-2026/S005/S005-interior.webp" width={1250} height={1250} sizes="(max-width: 800px) 100vw, 50vw" alt="Open S005 sleeve showing silver reflective lining; sample-photo retouch with digital branding" /><figcaption>Silver reflective lining shown in the sample reference. No temperature reduction or cooling duration is claimed.</figcaption></figure>
        <div><p className={styles.eyebrow}>Look inside before you specify</p><h2>Protection starts with the details.</h2><p>The S005 sample reference shows a subtly lustrous 900D exterior, silver reflective lining and clip-on shoulder strap. Confirm the actual racket opening, lining laminate and logo finish during sampling.</p><p>White EPE sheets visible in the packing photos are removable shipping inserts for shape retention. They are not permanent internal dividers or validated cushioning.</p><Link className={styles.secondary} href="/padel-accessories/custom-padel-racket-sleeve#product-details-gallery">Inspect all sleeve detail views →</Link></div>
      </section>

      <section className={styles.section}><p className={styles.eyebrow}>Scope & delivery</p><h2>Build the bag programme first.</h2><div className={styles.scopeGrid}><article><h3>Custom manufacture</h3><p>Racket sleeves, bags, shoe bags and organizer pouches are the core development scope. Approve each style’s material, pattern, logo sample, packaging and quality checks before production.</p></article><article><h3>Additional playing equipment</h3><p>Rackets, balls, grips, towels and apparel are a separate sourcing discussion. Supplier qualification, product samples, relevant testing and a separate quotation are required. Playing equipment is not included in the bag proposals.</p></article><article><h3>Repeatable club identity</h3><p>Retain the approved artwork, colour references, material specification and sample version for future orders. Confirm availability and delivery again for every production run.</p></article></div></section>

      <section className={`${styles.section} ${styles.proof}`}><div><p className={styles.eyebrow}>From brief to sample</p><h2>A practical approval path.</h2><ol><li>Choose the programme, styles and quantities per style.</li><li>Supply the contents list, racket or shoe dimensions, artwork and destination.</li><li>Review materials, construction, logo sample and quotation.</li><li>Approve the packed sample, inspection points and production schedule.</li></ol><p><Link href="/custom-padel-bag-manufacturer">Padel manufacturing process</Link> · <Link href="/quality-inspection-guide">Quality checks</Link> · <Link href="/logo-customization-guide">Logo options</Link></p></div><figure><Image src="/images/workshop/sewing-production.webp" width={1920} height={864} sizes="(max-width: 800px) 100vw, 50vw" alt="Cappuccino sewing workshop with operators, sewing machines and production baskets" /><figcaption>Real workshop photograph supplied by Cappuccino. <Link href="/factory-trust-materials">View factory evidence →</Link></figcaption></figure></section>

      <section className={styles.section} id="questions"><p className={styles.eyebrow}>Buyer questions</p><h2>Plan a clear brief.</h2><div className={styles.faqs}>{faqs.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>

      <section className={styles.cta}><p className={styles.eyebrow}>Club · Academy · Tournament</p><h2>Tell us what your players need.</h2><p>Send your chosen styles, quantities per style, intended contents, logo, target budget, delivery destination and required arrival date.</p><div className={styles.actions}><Link className={styles.primary} href={rfq("Padel club / tournament bag programme")}>Request a programme quotation</Link><a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a><a href="https://wa.me/8613928715568">WhatsApp +86 139 2871 5568</a></div></section>
    </main><PadelFooter />
  </>;
}
