import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { cardHolderCollectionUrl, cardHolderWhatsappUrl } from "./card-holder-data";
import styles from "./card-holders/card-holders.module.css";

export function JsonLd({ value }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }} />;
}

export function CardHolderShell({ children }) {
  return <><SiteHeader />{children}<SiteFooter /></>;
}

export function Breadcrumb({ items }) {
  return <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <Link href="/">Home</Link>
    {items.map((item) => <span key={item.name}><span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.name}</Link> : <span>{item.name}</span>}</span>)}
  </nav>;
}

export function InquiryActions({ product = "Card Holder" }) {
  const rfqUrl = `/inquiry/?product=Card%20Holder&format=${encodeURIComponent(product)}`;
  return <div className={styles.actions}>
    <Link className={styles.primaryAction} href={rfqUrl}>RFQ</Link>
    <a className={styles.secondaryAction} href={`mailto:info@cappuccinobag.net?subject=${encodeURIComponent(`${product} quotation`)}`}>info@cappuccinobag.net</a>
    <a className={styles.secondaryAction} href={cardHolderWhatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp +86 139 2871 5568</a>
  </div>;
}

export function ProductCard({ product }) {
  const [filename, alt] = product.images[0];
  return <article className={styles.productCard}>
    <Link className={styles.cardImageLink} href={product.href} aria-label={`View ${product.name}`}>
      <Image src={`${product.imageBase}/${filename}`} alt={alt} width={1000} height={1000} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" loading="lazy" />
    </Link>
    <div className={styles.cardBody}>
      <p className={styles.productCode}>{product.code}</p>
      <h3><Link href={product.href}>{product.shortName}</Link></h3>
      <p>{product.material}</p>
      <dl className={styles.cardFacts}><div><dt>RFID</dt><dd>{product.rfidConfirmed ? "Confirmed in source title" : "Not confirmed"}</dd></div><div><dt>Structure</dt><dd>{product.structure}</dd></div></dl>
      <Link className={styles.textLink} href={product.href}>View product details</Link>
    </div>
  </article>;
}

export function ProductGrid({ products }) {
  return <div className={styles.productGrid}>{products.map((product) => <ProductCard product={product} key={product.code} />)}</div>;
}

export function FaqSection({ faqs, title = "Card holder sourcing questions" }) {
  return <section className={`${styles.section} ${styles.faqSection}`}>
    <div className={styles.sectionHeading}><h2>{title}</h2><p>Answers reflect only confirmed source information and clearly identify what still requires quotation review.</p></div>
    <div className={styles.faqList}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
  </section>;
}

export function InternalLinks({ links }) {
  return <nav className={styles.internalLinks} aria-label="Related card holder and material pages">{links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>;
}

export function ProductGallery({ product }) {
  return <div className={styles.gallery}>{product.images.map(([filename, alt], index) => <figure className={index === 0 ? styles.galleryPrimary : undefined} key={filename}>
    <Image src={`${product.imageBase}/${filename}`} alt={alt} width={1000} height={1000} sizes={index === 0 ? "(max-width: 900px) 100vw, 58vw" : "(max-width: 720px) 100vw, 40vw"} priority={index === 0} loading={index === 0 ? "eager" : "lazy"} />
  </figure>)}</div>;
}

export function QuotationChecklist() {
  const items = ["Model code", "Target material and color", "Required dimensions", "Card-slot and pocket layout", "RFID requirement and test standard", "Logo artwork and preferred method", "Packaging format", "Estimated order quantity", "Destination market", "Target timing"];
  return <ul className={styles.checklist}>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function BackToCollection() {
  return <Link className={styles.textLink} href={cardHolderCollectionUrl}>View all selected card holders</Link>;
}
