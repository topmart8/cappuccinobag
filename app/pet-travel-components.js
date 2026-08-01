import NextLink from "next/link";
import { PadelFooter, PadelHeader } from "./padel-components";
import { petCollectionUrl, petWhatsappUrl } from "./pet-travel-data";

export function Link(props) { return <NextLink {...props} prefetch={false} />; }

export function JsonLd({ value }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }} />;
}

export function PetShell({ children }) { return <><PadelHeader />{children}<PadelFooter /></>; }

export function PetBreadcrumb({ items }) {
  return <nav className="pet-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link>{items.map((item) => <span key={item.name}><span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.name}</Link> : <span>{item.name}</span>}</span>)}</nav>;
}

export function PetActions({ format = "Pet Travel Bags", secondary = false }) {
  const inquiry = `/inquiry/?product=Pet%20Travel%20Bags&format=${encodeURIComponent(format)}`;
  return <div className="pet-actions"><Link className="btn btn-primary" href={inquiry}>Start Your Custom Project</Link>{secondary && <Link className="btn btn-secondary" href={petCollectionUrl}>Explore Pet Travel Bags</Link>}<a className="btn btn-secondary" href={petWhatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a></div>;
}

export function PetProductVisual({ product, purpose = "production asset pending" }) {
  return <div className="pet-visual" role="img" aria-label={`${product.code} ${product.name}; ${purpose}`}><span>{product.code}</span><strong>{product.name}</strong><small>Production asset pending</small></div>;
}

export function PetProductCard({ product }) {
  return <article className="pet-product-card"><Link href={product.href} aria-label={`View ${product.code} ${product.name}`}><PetProductVisual product={product} /></Link><div><p className="eyebrow">{product.code} · {product.category}</p><h3><Link href={product.href}>{product.name}</Link></h3><p>{product.short}</p><Link className="pet-text-link" href={product.href}>View OEM development page</Link></div></article>;
}

export function QuotationChecklist() {
  const items = ["Product type", "Dimensions", "Intended pet size or load", "Material", "Color", "Estimated quantity", "Logo method", "Packaging requirements", "Reference photos or technical drawings", "Target market", "Target timeline"];
  return <ul className="pet-checklist">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
