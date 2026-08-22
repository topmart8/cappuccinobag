import Image from "next/image";
import NextLink from "next/link";
import Pdb001Gallery from "../../pdb001-gallery";
import { PadelFooter, PadelHeader } from "../../padel-components";

const siteUrl = "https://www.cappuccinobag.com";
const canonical = `${siteUrl}/products/padel-work-tote-backpack-pdb001`;
const inquiryUrl =
  "/inquiry?product=Padel%20Bags&format=PDB001%20Padel%20Work%20Tote%20Backpack";

function Link(props) {
  return <NextLink {...props} prefetch={false} />;
}

export const metadata = {
  title: "Lightweight Padel Work Tote Backpack | OEM Manufacturer",
  description:
    "Custom lightweight padel tote backpack with laptop sleeve, curved racket compartment, multi-pocket organizer and recycled water-resistant fabric options.",
  alternates: { canonical },
  openGraph: {
    title: "One Bag from Office to Court — PDB001 Padel Work Tote",
    description:
      "Carry a laptop, racket and daily essentials in one lightweight multi-pocket tote, shoulder bag and backpack.",
    url: canonical,
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/padel/PDB001/hero-colors/PDB001-charcoal-grey-main.webp`,
        width: 1200,
        height: 1200,
        alt: "PDB001 charcoal grey padel work tote backpack Open Graph image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "One Bag from Office to Court — PDB001 Padel Work Tote",
    description:
      "A lightweight multi-pocket padel work tote with laptop and racket compartments.",
    images: [
      `${siteUrl}/images/padel/PDB001/hero-colors/PDB001-charcoal-grey-main.webp`,
    ],
  },
  robots: { index: true, follow: true },
};

const benefits = [
  ["Lightweight", "Soft padded construction reduces unnecessary bulk for daily commuting."],
  ["Laptop ready", "A dedicated device section and retention strap separate work equipment."],
  ["Office appropriate", "The clean vertical tote profile suits commutes, meetings and business travel."],
  ["Racket storage", "A curved front zipper compartment keeps padel equipment separate."],
  ["Multi-pocket", "Internal and external pockets organize documents, bottle, clothing and personal items."],
];

const specifications = [
  ["Model", "PDB001"],
  ["Size", "W31 × H38 × D15 cm"],
  ["Product type", "Padel work tote / laptop backpack / shoulder sports bag"],
  ["Main material", "Water-resistant nylon or polyester; recycled options available"],
  ["Lining", "Lightweight polyester lining; custom lining available"],
  ["Carrying modes", "Hand carry, shoulder carry and backpack carry"],
  ["Racket storage", "Curved front zipper compartment"],
  ["Work storage", "Laptop section, documents and accessory organizers"],
  ["Phone storage", "Optional magnetic-shielding fabric pocket"],
  ["Customization", "Colour, material, lining, zipper, hardware, logo, pocket layout and packaging"],
  ["Logo methods", "Screen print, heat transfer, embroidery, woven label, rubber patch or metal logo"],
  ["OEM/ODM", "Available; final specification confirmed through sampling"],
];

const procurementSnapshot = [
  ["Product type", "Padel work tote / laptop backpack / shoulder sports bag"],
  ["Approx. dimensions", "W31 × H38 × D15 cm"],
  ["Racket capacity", "Curved front compartment for a padel racket; final fit is confirmed during sampling"],
  ["Shoe compartment", "Not specified in the current PDB001 sample; confirm with factory if required"],
  ["Main material options", "Water-resistant nylon or polyester; recycled options available"],
  ["MOQ", "Confirm with factory after material, layout, logo and packaging review"],
  ["Sample", "Available; typically 7–15 days after specifications and materials are confirmed"],
  ["Bulk production lead time", "Confirm after quantity, materials, approved sample, packaging and inspection steps are agreed"],
  ["OEM / ODM", "Available for layout, materials, colours, straps, hardware, branding and packaging"],
  ["Logo options", "Screen print, heat transfer, embroidery, woven label, rubber patch or metal logo"],
  ["Packaging", "Custom packaging available; final format is confirmed in the project brief"],
  ["Compliance status", "No model-specific certification claimed; documentation must match the selected material and order scope"],
];

const pocketMap = [
  "Large main zip compartment",
  "Padded or reinforced laptop sleeve with securing strap",
  "Internal document and accessory slip pockets",
  "Internal zipper security pocket",
  "Optional magnetic-shielding fabric phone pocket",
  "Curved front racket compartment",
  "Front quick-access slot",
  "Side bottle or accessory pocket",
  "Rear zipper pocket",
  "Concealable or detachable backpack straps",
];

const angles = [
  ["PDB001-front-view.webp", "Front view of PDB001 padel work tote with curved racket compartment"],
  ["PDB001-side-view.webp", "Side profile of PDB001 lightweight laptop and padel tote"],
  ["PDB001-backpack-view.webp", "Backpack carry view of PDB001 convertible padel work bag"],
  ["PDB001-shoulder-carry-view.webp", "Shoulder carry configuration of PDB001 office-to-court tote"],
  ["PDB001-dimensions-31x38x15cm.webp", "PDB001 product dimensions W31 by H38 by D15 centimetres"],
];

const detailImages = [
  ["PDB001-main-compartment-laptop-organization.webp", "PDB001 main compartment with laptop securing strap and internal organization"],
  ["PDB001-curved-racket-pocket-zipper-detail.webp", "Curved front racket compartment zipper detail on PDB001 padel tote"],
  ["PDB001-side-pocket-detail.webp", "Side bottle and accessory pocket detail on PDB001 commuter padel bag"],
  ["PDB001-back-zip-pocket-detail.webp", "Rear quick-access zipper pocket detail on PDB001 work tote backpack"],
  ["PDB001-padded-top-handle-detail.webp", "Soft padded top handle detail on PDB001 lightweight tote"],
  ["PDB001-adjustable-strap-hardware-detail.webp", "Adjustable shoulder strap and hardware detail for PDB001 convertible bag"],
];

const sampleImages = [
  ["PDB001-real-sample-front-angle.webp", "Actual PDB001 sample front and angled views showing soft construction"],
  ["PDB001-real-sample-side-opening.webp", "Actual PDB001 sample side opening and curved racket pocket construction"],
  ["PDB001-real-sample-back-panel.webp", "Actual PDB001 sample back panel and padded backpack straps"],
  ["PDB001-real-sample-back-views.webp", "Actual PDB001 sample rear carry configurations"],
  ["PDB001-real-sample-back-zipper-and-straps.webp", "Actual PDB001 sample rear zipper pocket and strap attachment details"],
  ["PDB001-real-sample-detachable-backpack-straps.webp", "Actual PDB001 sample detachable backpack strap hardware"],
  ["PDB001-real-sample-interior-pockets.webp", "Actual PDB001 sample interior pockets and laptop securing strap"],
  ["PDB001-real-sample-zipper-and-interior.webp", "Actual PDB001 sample zipper construction and interior lining"],
  ["PDB001-real-sample-racket-and-shoulder-use.webp", "Actual PDB001 sample with racket storage and shoulder carry mode"],
];

const faqs = [
  ["Can this padel bag carry a laptop?", "Yes. The design includes a dedicated laptop section and securing strap. Exact device fit should be confirmed against the final internal dimensions and sample construction."],
  ["Can it carry a padel racket?", "Yes. The curved front zipper compartment is designed for a padel racket. Fit should be confirmed during sampling and the compartment can be adjusted for the target racket shape."],
  ["How can the bag be carried?", "It supports hand carry, shoulder carry and backpack carry with adjustable and detachable strap options."],
  ["What can be stored in the pocket layout?", "The layout can organize a laptop, documents, chargers, cables, keys, bottle, clothing, racket, towel and personal items in separate zones."],
  ["Is the fabric waterproof?", "The bag can use water-resistant nylon or polyester. Performance depends on the selected fabric, coating, zipper and seam construction, so the final claim must match the approved specification."],
  ["Can recycled material be used?", "Yes. Recycled nylon or polyester options can be reviewed. Any certification claim must match the selected material, supplier documents and order scope."],
  ["Can the phone pocket use magnetic-shielding fabric?", "Yes. An optional magnetic-shielding fabric phone pocket can be developed as a storage feature. It is not presented as a medical device and no health claim is made."],
  ["Can colours and the pocket layout be customized?", "Yes. OEM/ODM options include material, colour, lining, laptop section, pocket count, racket compartment, straps, zipper, hardware, logo and packaging."],
  ["What logo methods are available?", "Common methods include screen printing, heat transfer, embroidery, woven labels, rubber patches and metal logos."],
  ["How should a buyer start a sample?", "Send the target quantity, market, colour, material, laptop size, racket type, logo artwork and target price. A physical sample is recommended before bulk production."],
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Custom Lightweight Padel Work Tote Backpack with Laptop & Racket Compartment",
    description: metadata.description,
    sku: "PDB001",
    url: canonical,
    category: "Padel Bags",
    image: [
      `${siteUrl}/images/padel/PDB001/hero-colors/PDB001-charcoal-grey-main.webp`,
      `${siteUrl}/images/padel/PDB001/angles/PDB001-dimensions-31x38x15cm.webp`,
      `${siteUrl}/images/padel/PDB001/real-sample-reference/PDB001-real-sample-front-angle.webp`,
    ],
    brand: { "@type": "Brand", name: "Cappuccino Bag" },
    manufacturer: {
      "@type": "Organization",
      name: "Guangzhou Cappuccino Leather Handbag Co., Ltd.",
      url: siteUrl,
    },
    material: "Water-resistant nylon or polyester; recycled options available",
    size: "W31 × H38 × D15 cm",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Carrying modes", value: "Hand tote, shoulder bag and backpack" },
      { "@type": "PropertyValue", name: "Laptop organization", value: "Dedicated laptop section with securing strap" },
      { "@type": "PropertyValue", name: "Racket storage", value: "Curved front zipper compartment" },
      { "@type": "PropertyValue", name: "Customization", value: "Material, colour, lining, pockets, straps, hardware, logo and packaging" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Padel Bags", item: `${siteUrl}/racket-sports/padel-bags` },
      { "@type": "ListItem", position: 3, name: "PDB001 Padel Work Tote Backpack", item: canonical },
    ],
  },
];

export default function Pdb001ProductPage() {
  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PadelHeader />
      <main className="pdb001-page">
        <nav className="padel-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/racket-sports/padel-bags">Padel Bags</Link><span aria-hidden="true">/</span>
          <span>PDB001 Padel Work Tote Backpack</span>
        </nav>

        <section className="pdb001-hero">
          <div className="pdb001-hero-copy">
            <p className="eyebrow">PDB001 · OEM/ODM padel work bag</p>
            <h1>Custom Lightweight Padel Work Tote Backpack with Laptop &amp; Racket Compartment</h1>
            <h2>One Lightweight Bag. From Desk to Court.</h2>
            <p>A soft, lightweight office-to-court padel bag designed to organize a laptop, racket, documents, bottle, clothing and daily essentials without the bulky look of a traditional racket bag.</p>
            <dl className="pdb001-hero-facts">
              <div><dt>Dimensions</dt><dd>W31 × H38 × D15 cm</dd></div>
              <div><dt>Carry</dt><dd>Hand · Shoulder · Backpack</dd></div>
            </dl>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={inquiryUrl}>Request a Quote</Link>
              <a
                className="btn btn-secondary dark"
                href="mailto:info@cappuccinobag.net?subject=PDB001%20Padel%20Work%20Tote%20Brief"
              >
                Discuss Your Padel Bag Project
              </a>
            </div>
          </div>
          <Pdb001Gallery />
        </section>

        <section className="pdb001-answer-grid" aria-label="PDB001 direct answers">
          <article><h2>What is PDB001?</h2><p>PDB001 is a W31 × H38 × D15 cm convertible padel tote backpack designed to carry a laptop, racket, work accessories and daily sports gear in separate compartments.</p></article>
          <article><h2>Who is it for?</h2><p>It is designed for commuters, padel players, sports lifestyle brands and OEM buyers seeking one lightweight bag for office and court use.</p></article>
          <article><h2>What can be customized?</h2><p>Brands can customize material, recycled option, colour, lining, laptop section, pocket layout, racket compartment, straps, zipper, hardware, logo and packaging.</p></article>
          <article><h2>What must be verified?</h2><p>Laptop and racket fit should be confirmed through a physical sample because usable internal dimensions vary with padding and construction.</p></article>
        </section>

        <section className="pdb001-section">
          <div className="pdb001-heading"><p className="eyebrow">B2B Procurement Snapshot</p><h2>Verified PDB001 sourcing reference</h2><p>Exact fit and commercial terms are confirmed against the approved project brief and physical sample.</p></div>
          <dl className="pdb001-specs">{procurementSnapshot.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
          <div className="pdb001-trust-links"><Link href="/custom-padel-bag-manufacturer">Review the Padel development process</Link><Link href="/factory-trust-materials">See factory and material proof</Link><Link href="/resources">Open buyer resources</Link></div>
        </section>

        <section className="pdb001-section">
          <div className="pdb001-heading"><p className="eyebrow">Five buyer benefits</p><h2>Built for work, commuting and padel</h2></div>
          <div className="pdb001-benefits">
            {benefits.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="pdb001-section pdb001-catalogue">
          <div><p className="eyebrow">Digital design overview</p><h2>Colours, angles and functional details</h2><p>This catalogue view summarizes the digital colour directions and proposed construction. The actual sample photographs below are separated and labelled as physical reference evidence.</p></div>
          <Image src="/images/padel/PDB001/PDB001-colors-angles-details-catalog.webp" width={1600} height={1280} sizes="(max-width: 900px) calc(100vw - 28px), 58vw" alt="PDB001 digital catalogue showing colour directions, carry angles, dimensions and bag details" />
        </section>

        <section className="pdb001-section">
          <div className="pdb001-heading"><p className="eyebrow">Product specification</p><h2>Exact size and development reference</h2><p>Final device fit, racket fit, materials and construction are confirmed during sampling.</p></div>
          <dl className="pdb001-specs">{specifications.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
        </section>

        <section className="pdb001-section">
          <div className="pdb001-heading"><p className="eyebrow">Carry and proportion</p><h2>Five views of the convertible format</h2></div>
          <div className="pdb001-image-grid pdb001-angle-grid">
            {angles.map(([file, alt]) => <Image key={file} src={`/images/padel/PDB001/angles/${file}`} width={1000} height={1000} sizes="(max-width: 620px) calc(100vw - 28px), (max-width: 900px) 48vw, 31vw" alt={alt} />)}
          </div>
        </section>

        <section className="pdb001-section pdb001-pocket-section">
          <div><p className="eyebrow">Pocket map</p><h2>Separate work and sports equipment</h2><p>The organization is designed around real daily loads rather than decorative pocket count. A laptop, documents and small electronics stay separate from the racket and sports items.</p><ul>{pocketMap.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="pdb001-detail-grid">{detailImages.map(([file, alt]) => <Image key={file} src={`/images/padel/PDB001/details/${file}`} width={1000} height={1000} sizes="(max-width: 620px) 48vw, 22vw" alt={alt} />)}</div>
        </section>

        <section className="pdb001-carry-band">
          <div className="pdb001-heading"><p className="eyebrow">Three carrying modes</p><h2>Hand tote, shoulder bag and backpack</h2><p>Padded handles support short carries, a shoulder strap keeps essentials accessible, and adjustable backpack straps distribute the load during longer commutes.</p></div>
          <div className="pdb001-carry-list"><article><span>01</span><h3>Hand carry</h3><p>Clean tote profile for offices and meetings.</p></article><article><span>02</span><h3>Shoulder carry</h3><p>Quick access for commuting and short transfers.</p></article><article><span>03</span><h3>Backpack carry</h3><p>Hands-free comfort for walking, transit or cycling.</p></article></div>
        </section>

        <section className="pdb001-section pdb001-materials">
          <div><p className="eyebrow">Materials</p><h2>Water-resistant fabric options with qualified claims</h2><p>Water-resistant nylon or polyester can be selected, including recycled-fabric options. Performance depends on the face fabric, coating, zipper, seams and construction. Certification language is only used when the chosen material and document scope are verified for the order.</p><Link href="/recycled-material-bags">Review recycled material options</Link></div>
          <div><p className="eyebrow">OEM/ODM</p><h2>Develop the layout around your buyer</h2><p>We can adjust laptop fit, racket compartment, pocket count, straps, lining, colour blocking, zippers, hardware, logo execution and packaging. A physical sample is recommended before bulk production.</p><Link href="/custom-padel-bag-manufacturer">Work with a custom padel bag manufacturer</Link></div>
        </section>

        <section className="pdb001-section pdb001-sample-section">
          <div className="pdb001-heading"><p className="eyebrow">Actual sample photographs</p><h2>Real sample construction reference</h2><p>These are photographs of the physical sample, shown separately from the digital colour references. They provide evidence of the soft body, pockets, zipper access and convertible strap system.</p></div>
          <div className="pdb001-image-grid pdb001-sample-grid">{sampleImages.map(([file, alt]) => <Image key={file} src={`/images/padel/PDB001/real-sample-reference/${file}`} width={1400} height={1400} sizes="(max-width: 620px) calc(100vw - 28px), (max-width: 900px) 48vw, 31vw" alt={alt} />)}</div>
          <div className="pdb001-trust-links"><Link href="/factory-trust-materials">See our sample and production capability</Link><Link href={inquiryUrl}>Request a Sample</Link></div>
        </section>

        <section className="pdb001-section pdb001-faq-section">
          <div className="pdb001-heading"><p className="eyebrow">Buyer FAQ</p><h2>PDB001 sourcing questions</h2></div>
          <div className="padel-faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="pdb001-section pdb001-related">
          <div className="pdb001-heading"><p className="eyebrow">Related products</p><h2>Build a broader padel bag range</h2></div>
          <div className="pdb001-related-grid">
            <article><Image src="/images/padel/S001/S001-01-main.png" width={1200} height={1200} alt="Custom 60L padel racket duffel bag" /><h3>Performance 60L Padel Racket Duffel</h3><Link href="/padel-bags/custom-60l-padel-racket-duffel">View product direction</Link></article>
            <article><Image src="/images/padel/S002/S002-01-main.png" width={1200} height={1200} alt="Custom 30L padel backpack" /><h3>Urban 30L Padel Backpack</h3><Link href="/padel-bags/custom-30l-padel-backpack">View product direction</Link></article>
            <article><Image src="/images/padel/S003/S003-01-main.png" width={1200} height={1200} alt="Custom ventilated padel shoe bag" /><h3>Ventilated Padel Shoe Bag</h3><Link href="/padel-accessories/custom-ventilated-padel-shoe-bag">View product direction</Link></article>
          </div>
          <div className="pdb001-article-links">
            <h2>Supporting buyer guides</h2>
            <Link href="/blog/how-to-choose-office-to-court-padel-bag">How to choose an office-to-court padel bag</Link>
            <Link href="/blog/multi-pocket-organization-padel-commuter-bag">Why multi-pocket organization matters</Link>
            <Link href="/blog/recycled-water-resistant-fabrics-custom-padel-bags">Recycled water-resistant fabric guide</Link>
            <Link href="/blog/one-lightweight-bag-office-to-padel-court">One lightweight bag from office to padel court</Link>
          </div>
        </section>

        <section className="pdb001-rfq">
          <div><p className="eyebrow">Start your PDB001 project</p><h2>Send your quantity, market and product brief</h2><p>Include preferred colour, material, laptop size, racket type, pocket layout, logo artwork and target price. Email <a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a>.</p></div>
          <Link className="btn btn-primary" href={inquiryUrl}>Request a Quote</Link>
        </section>
      </main>
      <div className="pdb001-mobile-cta" aria-label="Request a PDB001 quotation">
        <Link className="btn btn-primary" href={inquiryUrl}>Request a Quote</Link>
      </div>
      <PadelFooter />
    </>
  );
}
