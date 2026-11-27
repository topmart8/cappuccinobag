import { hybridPadelArticles } from "./hybrid-padel-articles.js";
import { padelWorkToteArticles } from "./padel-work-tote-articles.js";

export const padelGuide = "/padel-bag-design-guide";
const manufacturer = "/custom-padel-bag-manufacturer";
const collection = ["/racket-sports/padel-bags", "Compare custom Padel bag formats"];
const p001 = ["/products/padel-work-tote-backpack-pdb001", "Review the PDB001 work tote"];
const p017 = ["/products/travel-padel-utility-backpack-pdb017", "Review the PDB017 backpack and its removable shoe pouch"];
export const padelArticleTopics = [
  { id: "padel-bag-selection", title: "Choosing a Padel bag", intro: "Choose a format for court, travel or work-to-court carry." },
  { id: "padel-load-testing", title: "Packing and sample testing", intro: "Check racket access, shoe storage and bottle retention on a packed sample." },
  { id: "padel-oem-sampling", title: "OEM sampling and quoting", intro: "Plan material approval, logo checks and a quote by style." },
];

const [selection, testing, sampling] = padelArticleTopics.map(({ id }) => id);
// Each editorial article belongs to one topic. Tags rank recommendations, not routes.
const readingMap = {
  "choosing-the-right-padel-bag-style": [selection, ["shoe", "racket", "logo"], p017],
  "from-desk-to-court-cappuccino-padel-collection": [selection, ["racket", "fabric", "logo"], collection],
  "work-to-court-padel-bags": [selection, ["racket", "bottle", "organization"], ["/products/work-court-padel-commuter-tote-pdb015", "Explore the PDB015 commuter tote"]],
  "how-to-choose-office-to-court-padel-bag": [selection, ["racket", "fabric", "organization"], p001],
  "one-lightweight-bag-office-to-padel-court": [selection, ["racket", "fabric", "organization"], p001],
  "padel-bag-packed-fit-test": [testing, ["shoe", "racket", "bottle", "logo"], p017, "How to Test a Padel Bag Sample When It Is Fully Packed"],
  "multi-pocket-organization-padel-commuter-bag": [testing, ["racket", "bottle", "organization"], p001],
  "custom-padel-bag-moq-prototype-cost": [sampling, ["fabric", "logo", "quotation"], [manufacturer, "See the Padel OEM and sampling process"], "How to Quote a Custom Padel Bag at 300 and 500 Pieces"],
  "recycled-water-resistant-materials-padel-bags": [sampling, ["fabric", "racket", "logo"], p017],
  "recycled-water-resistant-fabrics-custom-padel-bags": [sampling, ["fabric", "logo"], p001],
};

export const padelBuyerReading = Object.entries(readingMap).map(([slug, [topic, tags, destination, staticTitle]]) => ({
  slug, topic, tags, destination, href: `/blog/${slug}`,
  title: staticTitle ?? (hybridPadelArticles[slug] ?? padelWorkToteArticles[slug]).title,
}));

export function getPadelArticleNavigation(slug) {
  const current = padelBuyerReading.find((article) => article.slug === slug);
  if (!current) return null;
  const topic = padelArticleTopics.find(({ id }) => id === current.topic);
  const matches = (item) => item.tags.filter((tag) => current.tags.includes(tag)).length;
  const recommendations = padelBuyerReading
    .filter((item) => item.slug !== slug && matches(item) > 0)
    .sort((a, b) => matches(b) - matches(a) || Number(b.topic === current.topic) - Number(a.topic === current.topic))
    .slice(0, 2);
  return {
    topic: [`${padelGuide}#${topic.id}`, topic.title],
    resources: [current.destination, ...(current.destination[0] === manufacturer ? [] : [[manufacturer, "Review the Padel OEM and sampling process"]])],
    recommendations: recommendations.map(({ href, title }) => [href, title]),
  };
}
