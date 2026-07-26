import Link from "next/link";

export function PadelHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Cappuccino Bag home">
        <span className="brand-mark" aria-hidden="true" />
        <span>Cappuccino Bag</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/custom-padel-bag-manufacturer/">Padel Bags</Link>
        <Link href="/custom-pickleball-paddle-bags/">Pickleball Bags</Link>
        <Link href="/custom-tennis-padel-racket-bags/">Tennis Bags</Link>
        <Link href="/custom-travel-backpacks-weekender-bags/">Travel Bags</Link>
        <Link href="/factory-trust-materials/">Factory Proof</Link>
        <Link href="/inquiry/">RFQ</Link>
      </nav>
      <Link className="header-cta" href="/inquiry/">
        Request a Quote
      </Link>
      <details className="mobile-menu">
        <summary aria-label="Open mobile navigation">
          <span />
          <span />
        </summary>
        <nav aria-label="Mobile navigation">
          <Link href="/">Home</Link>
          <Link href="/custom-padel-bag-manufacturer/">Padel Bags</Link>
          <Link href="/padel-accessories/">Padel Accessories</Link>
          <Link href="/factory-trust-materials/">Factory Proof</Link>
          <Link href="/inquiry/">RFQ</Link>
        </nav>
      </details>
    </header>
  );
}

export function PadelFooter() {
  return (
    <footer className="site-footer padel-product-footer">
      <div>
        <strong>Cappuccino Bag</strong>
        <p>
          Custom outdoor, racquet sports and travel bag manufacturing for
          global brands.
        </p>
        <p>
          <a href="mailto:info@cappuccinobag.net">
            info@cappuccinobag.net
          </a>
        </p>
      </div>
      <div className="footer-links">
        <Link href="/">Home</Link>
        <Link href="/custom-padel-bag-manufacturer/">Padel Collection</Link>
        <Link href="/padel-accessories/">Padel Accessories</Link>
        <Link href="/inquiry/">RFQ</Link>
      </div>
    </footer>
  );
}
