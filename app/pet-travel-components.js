import NextLink from "next/link";
import Image from "next/image";
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
  return <div className="pet-visual" aria-label={`${product.code} ${product.name}; ${purpose}`}>
    <Image className="pet-visual-image" src={`/assets/pet-travel/${product.code}/01-main.webp`} width={1600} height={1600} sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 34vw" alt={`${product.code} ${product.name} AI-assisted product concept on a neutral studio background`} />
    <div className="pet-asset-status"><span>{product.code}</span><small>AI-assisted concept · Production asset pending</small></div>
  </div>;
}

const petLifestyleAlt = {
  PT001: "European woman travelling with a cat in the PT001 UrbanAir soft-sided pet carrier at an airport",
  PT002: "European woman using the PT002 ExpandAir expandable pet carrier with a small dog at a train station",
  PT003: "European man carrying a cat in the PT003 MetroPaw pet carrier backpack in an urban plaza",
  PT004: "European woman hiking with a dog in the PT004 TrailPaw outdoor pet carrier backpack",
  PT005: "North American man securing a dog beside the PT005 RoadNest pet car seat travel bag in a parked vehicle",
  PT006: "European woman packing the PT006 Weekender pet travel organizer with a dog nearby in a hotel room",
  PT007: "North American man feeding a dog outdoors using the PT007 FeedMate pet feeding organizer",
  PT008: "European woman carrying a cat in the PT008 CityPaw premium pet carrier tote at a boutique hotel",
  PT009: "European woman walking a dog with the PT009 WalkReady pet walking crossbody bag",
  PT010: "North American woman training a dog while wearing the PT010 TrainPro dog training treat pouch",
  PT011: "Northern European man travelling by rail with a cat in the PT011 EcoPaw recycled-material pet carrier",
  PT012: "Two European product developers reviewing the PT012 FlexForm custom OEM pet bag prototype and components",
};

export function PetLifestyleVisual({ product }) {
  return <figure className="pet-lifestyle-visual">
    <Image src={`/assets/pet-travel/${product.code}/09-lifestyle.webp`} width={1800} height={1200} sizes="(max-width: 1000px) 100vw, 56vw" alt={petLifestyleAlt[product.code] || `${product.code} ${product.name} pet travel lifestyle concept`} />
    <figcaption>AI-assisted lifestyle concept · Production asset pending. Final photography will replace this image after sample approval.</figcaption>
  </figure>;
}

export function PetProductCard({ product }) {
  return <article className="pet-product-card"><Link href={product.href} aria-label={`View ${product.code} ${product.name}`}><PetProductVisual product={product} /></Link><div><p className="eyebrow">{product.code} · {product.category}</p><h3><Link href={product.href}>{product.name}</Link></h3><p>{product.short}</p><Link className="pet-text-link" href={product.href}>View OEM development page</Link></div></article>;
}

export function QuotationChecklist() {
  const items = ["Product type", "Dimensions", "Intended pet size or load", "Material", "Color", "Estimated quantity", "Logo method", "Packaging requirements", "Reference photos or technical drawings", "Target market", "Target timeline"];
  return <ul className="pet-checklist">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
