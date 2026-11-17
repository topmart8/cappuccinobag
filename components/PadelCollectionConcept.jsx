import Image from "next/image";
import Link from "next/link";
import styles from "./PadelCollectionConcept.module.css";

const exterior = "/images/padel/club-collection-20261117/coordinated-exterior-concept.webp";
const interior = "/images/padel/club-collection-20261117/coordinated-interior-concept.webp";
const views = [
  { sku: "S005", title: "Keep the sleeve true to the sample", crop: "20 85 730 345", href: "/padel-accessories/custom-padel-racket-sleeve", text: "Retain the tapered shape, front zip and detachable strap. The proposed finish follows the sample’s subtly lustrous slate-grey 900D exterior and visible silver lining.", check: "Confirm the lining laminate and racket clearance. Thermal performance and finished-bag water resistance require testing. White EPE sheets are removable shipping packaging." },
  { sku: "S004", title: "Give small essentials a clear place", crop: "785 85 730 345", href: "/padel-accessories/custom-padel-organizer-pouch", text: "Explore a light-coloured lining, wide zip access and a flat mesh pocket. Agree the layout around the actual overgrips, keys and other items your members carry.", check: "The coordinated exterior fabric and pocket layout are proposals. Contents shown are not included. Approve usable dimensions, wrist-loop attachment and a material swatch." },
  { sku: "S003", title: "Keep court shoes in their own bag", crop: "20 510 730 395", href: "/padel-accessories/custom-ventilated-padel-shoe-bag", text: "Review the wide opening, side handle, lining and proposed ventilation. Match the fabric and black trims to the rest of the club collection.", check: "Test the buyer’s intended shoe pair and the cleaning method. No universal shoe fit, waterproof or odour-control performance is established by the image." },
  { sku: "PDB017", title: "Pack around a full-height racket sleeve", crop: "785 510 730 395", href: "/products/travel-padel-utility-backpack-pdb017", text: "Keep one racket upright behind the forward-opening main space. The concept uses a retaining tab and a removable footwear pouch, with no fixed bottom shoe cavity.", check: "The internal pouch is a separate component to develop. S003 is not confirmed to fit inside this backpack. Compare textile weight and test the racket, footwear, bottle and clothing together." },
];

export default function PadelCollectionConcept() {
  return <section id="collection-development" className={styles.section} aria-labelledby="collection-development-title">
    <p className={styles.eyebrow}>Four-style development proposal</p>
    <h2 id="collection-development-title">See the collection, inside and out.</h2>
    <p className={styles.intro}>Coordinate a sleeve, essentials pouch, shoe bag and training backpack around one slate-charcoal material direction. These are AI-assisted design concepts for review, not photographs of a completed matching set.</p>
    <figure className={styles.overview}>
      <a href={exterior} target="_blank" rel="noopener noreferrer" aria-label="Open the full-size exterior collection concept in a new tab">
        <Image src={exterior} width={1536} height={1024} sizes="(max-width: 800px) 94vw, 1200px" alt="Proposed slate-charcoal S005 racket sleeve, S004 pouch, S003 shoe bag and PDB017 backpack; coordinated exterior design concepts" />
      </a>
      <figcaption>Proposed colour and material coordination. Final fabric, colour match, construction and fit are sample-approved. <a href={exterior} target="_blank" rel="noopener noreferrer">Open full-size exterior board ↗</a></figcaption>
    </figure>
    <div className={styles.grid}>{views.map(view => <article className={styles.card} key={view.sku}>
      <svg className={styles.view} viewBox={view.crop} role="img" aria-labelledby={`interior-concept-${view.sku}`}>
        <title id={`interior-concept-${view.sku}`}>{`${view.sku} proposed interior: ${view.title}`}</title>
        <image href={interior} x="0" y="0" width="1536" height="1024" />
      </svg>
      <div className={styles.copy}><p className={styles.eyebrow}>{view.sku} · Interior concept</p><h3>{view.title}</h3><p>{view.text}</p><p className={styles.check}><strong>Sample review:</strong> {view.check}</p><Link href={view.href}>View {view.sku} specifications & details →</Link></div>
    </article>)}</div>
    <p className={styles.note}><a href={interior} target="_blank" rel="noopener noreferrer">Open the complete interior board ↗</a> · New custom production starts at 300 pieces per style. Different styles cannot share one minimum.</p>
    <a className={styles.cta} href="#range-builder">Choose styles and quantities ↓</a>
  </section>;
}
