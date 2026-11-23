import Link from "next/link";

const topics = [
  ["Padel sourcing", [
    ["custom-padel-bag-moq-prototype-cost", "Quote a Custom Padel Bag at 300 and 500 Pieces"],
    ["padel-bag-packed-fit-test", "Test a Padel Bag Sample When It Is Fully Packed"],
    ["choosing-the-right-padel-bag-style", "Choose the Right Padel Bag Style"],
  ]],
  ["Materials and construction", [
    ["recycled-nylon-polyester-packable-bags-guide", "Recycled Nylon and Polyester for Packable Bags"],
    ["how-to-source-custom-waterproof-roll-top-backpack", "Source a Custom Waterproof Roll-Top Backpack"],
    ["alcantara-bag-accessory-production-process", "Alcantara Bag and Accessory Production"],
  ]],
  ["Sampling and quality", [
    ["custom-bag-development-quality-control-process", "Custom Bag Development and Quality Control"],
    ["verify-custom-bag-manufacturer-china", "Verify a Custom Bag Manufacturer in China"],
    ["bag-manufacturer-compliance-documents-explained", "Bag Manufacturer Compliance Documents"],
  ]],
];

export const guidePages = topics.map((_, index) => index + 1);
export function guidePath(page) {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}
export function guideMetadata(page) {
  const topic = topics[page - 1][0];
  const title = `${topic} Buyer Guides | Cappuccino Bag`;
  const description = `Read Cappuccino Bag's buyer guides on ${topic.toLowerCase()}.`;
  const url = guidePath(page);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url }, twitter: { title, description } };
}
export function BuyerGuides({ page }) {
  const [, articles] = topics[page - 1];
  return (
    <main className="buyer-resources-page header-offset-page">
      <section className="page-hero">
        <Link href="/resources">All buyer resources</Link>
        <h1>Bag Buyer Guides</h1>
        <p>Read practical guides for sourcing, specifying and approving custom bags.</p>
      </section>
      <section className="section">
        <nav aria-label="Buyer guide topics">
          <ul className="resource-grid">
            {topics.map(([topic], index) => (
              <li key={topic}><Link href={guidePath(index + 1)} aria-current={page === index + 1 ? "page" : undefined}>{topic}</Link></li>
            ))}
          </ul>
        </nav>
        <h2>{topics[page - 1][0]}</h2>
        <ul className="resource-grid">
          {articles.map(([slug, title]) => (
            <li key={slug}><Link href={`/blog/${slug}`}>{title}</Link></li>
          ))}
        </ul>
        <nav aria-label="Buyer guide pagination">
          <ul className="resource-grid">
            {page > 1 && <li><Link href={guidePath(page - 1)}>Previous</Link></li>}
            {guidePages.map((number) => (
              <li key={number}><Link href={guidePath(number)} aria-label={`Page ${number}`} aria-current={page === number ? "page" : undefined}>{number}</Link></li>
            ))}
            {page < guidePages.length && <li><Link href={guidePath(page + 1)}>Next</Link></li>}
          </ul>
        </nav>
      </section>
    </main>
  );
}
