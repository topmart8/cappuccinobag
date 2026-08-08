import Image from "next/image";
import NextLink from "next/link";
import { PadelFooter, PadelHeader } from "./padel-components";
import {
  runningCollections,
  runningCollectionUrl,
  runningWhatsappUrl,
} from "./running-data";

export function Link(props) {
  return <NextLink {...props} prefetch={false} />;
}

export function RunningShell({ children }) {
  return (
    <>
      <PadelHeader />
      {children}
      <PadelFooter />
    </>
  );
}

export function JsonLd({ value }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }}
    />
  );
}

export function RunningBreadcrumb({ items }) {
  return (
    <nav className="running-breadcrumb" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((item) => (
        <span key={item.name} className="running-breadcrumb-item">
          <span aria-hidden="true">/</span>
          {item.href ? <Link href={item.href}>{item.name}</Link> : <span>{item.name}</span>}
        </span>
      ))}
    </nav>
  );
}

export function RunningActions({ format = "Running Belt Project" }) {
  const inquiry = `/inquiry/?product=Outdoor%20Sports%20Bags&format=${encodeURIComponent(format)}`;
  return (
    <div className="running-actions">
      <Link className="btn btn-primary" href={inquiry}>Request Sample &amp; Quote</Link>
      <a className="btn btn-secondary" href={runningWhatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className="btn btn-secondary" href="mailto:info@cappuccinobag.net">Email Brief</a>
    </div>
  );
}

export function RunningNavCards() {
  return (
    <div className="running-nav-grid">
      <Link href={runningCollectionUrl}><strong>All 30 SKU</strong><span>Complete running waist pack collection</span></Link>
      {Object.entries(runningCollections).map(([slug, collection]) => (
        <Link href={`/running/${slug}`} key={slug}>
          <strong>{collection.name}</strong>
          <span>{collection.eyebrow}</span>
        </Link>
      ))}
    </div>
  );
}

export function ProductCard({ product, priority = false }) {
  return (
    <article className="running-product-card">
      <Link href={product.href} aria-label={`View ${product.sku} ${product.name}`}>
        <Image
          src={product.image}
          width={1200}
          height={900}
          sizes="(max-width: 660px) calc(100vw - 28px), (max-width: 1000px) 46vw, 31vw"
          alt={product.imageAlt}
          priority={priority}
        />
      </Link>
      <div>
        <p className="eyebrow">{product.sku} · {product.collection}</p>
        <h3><Link href={product.href}>{product.name}</Link></h3>
        <p>{product.features.slice(0, 3).join(" · ")}</p>
        <p className="running-status">Concept / development option — final specification follows sampling.</p>
        <Link className="running-text-link" href={product.href}>View development page</Link>
      </div>
    </article>
  );
}

export function ReferenceProof() {
  return (
    <section className="running-section running-reference-proof">
      <div className="running-heading">
        <div><p className="eyebrow">Real development references</p><h2>Sample construction, pattern review and factory process</h2></div>
        <p>These images document available sample-development capability. They are not presented as finished RW001–RW030 inventory or as proof of a fixed production specification.</p>
      </div>
      <div className="running-reference-grid">
        <figure><Image src="/images/running/references/sample-front.webp" width={900} height={1200} sizes="(max-width: 700px) 100vw, 33vw" alt="Actual black running waist pack sample front with bungee storage" /><figcaption>Actual sample · front construction reference</figcaption></figure>
        <figure><Image src="/images/running/references/sample-side.webp" width={1200} height={675} sizes="(max-width: 700px) 100vw, 33vw" alt="Actual running waist pack sample side profile and breathable contact panel" /><figcaption>Actual sample · side and body-contact reference</figcaption></figure>
        <figure><Image src="/images/running/references/sample-detail.webp" width={1200} height={675} sizes="(max-width: 700px) 100vw, 33vw" alt="Actual running waist pack sample zipper and compartment construction detail" /><figcaption>Actual sample · zipper and compartment reference</figcaption></figure>
      </div>
    </section>
  );
}
