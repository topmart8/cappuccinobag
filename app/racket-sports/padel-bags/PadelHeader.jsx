import Link from "next/link";
import styles from "./page.module.css";

const productLinks = [
  ["Padel Bags", "/racket-sports/padel-bags"],
  ["Pickleball Bags", "/custom-pickleball-paddle-bags"],
  ["Tennis Bags", "/custom-tennis-bag-manufacturer"],
  ["Outdoor & Hiking", "/custom-outdoor-sports-bag-manufacturer"],
  ["Travel Bags", "/custom-travel-backpacks-weekender-bags"],
  ["More Collections", "/products"],
];

const manufacturingLinks = [
  ["Custom Bag Manufacturing", "/oem-odm-bag-manufacturer"],
  ["Factory Proof", "/factory-trust-materials"],
  ["Quality Control", "/resources/quality-inspection-guide"],
];

function Caret() {
  return (
    <svg viewBox="0 0 12 8" aria-hidden="true">
      <path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function Dropdown({ label, links }) {
  return (
    <details className={styles.desktopDropdown}>
      <summary>{label}<Caret /></summary>
      <div className={styles.dropdownPanel}>
        {links.map(([text, href]) => <Link href={href} key={href} prefetch={false}>{text}</Link>)}
      </div>
    </details>
  );
}

export default function PadelHeader() {
  return (
    <header className={styles.padelHeader}>
      <div className={styles.headerInner}>
        <Link className={styles.headerBrand} href="/" aria-label="Cappuccino Bag home" prefetch={false}>
          <span className={styles.headerMark} aria-hidden="true" />
          <span>Cappuccino Bag</span>
        </Link>
        <nav className={styles.desktopNavigation} aria-label="Main navigation">
          <Dropdown label="Products" links={productLinks} />
          <Dropdown label="Manufacturing" links={manufacturingLinks} />
          <Link href="/factory-trust-materials" prefetch={false}>Materials</Link>
          <Link href="/case-studies" prefetch={false}>Case Studies</Link>
          <Link href="/about-us/" prefetch={false}>About</Link>
        </nav>
        <Link className={styles.headerCta} href="#padel-rfq">Request Quote</Link>
        <details className={styles.mobileMenu}>
          <summary aria-label="Open navigation"><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            <details>
              <summary>Products<Caret /></summary>
              <div>{productLinks.map(([text, href]) => <Link href={href} key={href} prefetch={false}>{text}</Link>)}</div>
            </details>
            <details>
              <summary>Manufacturing<Caret /></summary>
              <div>{manufacturingLinks.map(([text, href]) => <Link href={href} key={href} prefetch={false}>{text}</Link>)}</div>
            </details>
            <Link href="/factory-trust-materials" prefetch={false}>Materials</Link>
            <Link href="/case-studies" prefetch={false}>Case Studies</Link>
            <Link href="/about-us/" prefetch={false}>About</Link>
            <Link className={styles.mobileQuote} href="#padel-rfq">Request Quote</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
