import Link from "next/link";
import { padelProductContent } from "../app/padel-product-content";
import styles from "./PadelBuyerDetails.module.css";

export default function PadelBuyerDetails({ product }) {
  const content = product.editorial;
  if (!content) return null;
  const model = product.model || product.sku;
  return (
    <section className={styles.section} aria-labelledby="buyer-detail-heading">
      <p className={styles.eyebrow}>{model} · Private-label development</p>
      <h2 id="buyer-detail-heading">{content.headline}</h2>
      <div className={styles.grid}>
        <article><h3>How the interior works</h3><p>{content.structure}</p><a href="#product-details-gallery">Inspect interior and detail images</a></article>
        <article><h3>Who this format is for</h3><p>{content.buyerFit}</p><h3>Make it your own</h3><p>{content.customization}</p></article>
      </div>
      <div className={styles.evidence}>
        <h3>What the images establish</h3><p>{content.evidence}</p>
        <p><Link href="/factory-trust-materials">Review factory and material evidence</Link>. Factory references explain capability; they do not validate every proposed feature of this model.</p>
        {["PDB014", "PDB016", "PDB017"].includes(model) && <>
          <h3>Material, logo and construction references</h3>
          <p><Link href="/blog/recycled-water-resistant-materials-padel-bags">Compare Padel bag material options</Link> and <Link href="/logo-customization-guide">review logo application methods</Link>. Select the fabric and logo process together, then approve a swatch and logo sample. These guides do not establish this model’s recycled content, certification or water resistance.</p>
          <p><Link href="/custom-padel-bag-manufacturer#padel-prototype-case">Compare two structures from an anonymous Padel sample project</Link>. Use the published example to discuss construction choices; it is not a sample or performance test of {model}.</p>
        </>}
      </div>
      <div className={styles.grid}>
        <article><h3>Resolve these details on the sample</h3><ol>{content.checks.map(item => <li key={item}>{item}</li>)}</ol><p><Link href="/padel-bag-design-guide">Prepare your Padel bag specification</Link> · <Link href="/quality-inspection-guide">Plan quality checks</Link></p></article>
        <article><h3>Send a brief that can be quoted</h3><p>Send your target racket dimensions, packing list, logo artwork, materials, quantity and destination. We review the specification and sampling scope before confirming a quotation or production schedule.</p><p><strong>New custom MOQ: 300 pieces per style.</strong> Different styles cannot be combined. Sampling is assessed separately.</p><p><a href={`mailto:info@cappuccinobag.net?subject=${encodeURIComponent(`${model} Padel product brief`)}`}>info@cappuccinobag.net</a><br /><a href={`https://wa.me/8613928715568?text=${encodeURIComponent(`Hello, I would like to discuss ${model} for a custom Padel collection.`)}`}>WhatsApp +86 139 2871 5568</a></p></article>
      </div>
      <nav className={styles.compare} aria-label="Compare Padel bag formats">
        <h3>Compare the other Padel formats</h3>
        {Object.entries(padelProductContent).filter(([sku]) => sku !== model).map(([sku, item]) => <Link key={sku} href={item.href}>{item.linkLabel}</Link>)}
        <Link href="/racket-sports/padel-bags">Explore the Padel bag collection</Link>
      </nav>
    </section>
  );
}
