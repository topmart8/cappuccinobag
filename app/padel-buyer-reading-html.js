import { getPadelArticleNavigation, padelArticleTopics, padelBuyerReading, padelGuide } from "./padel-buyer-reading.js";

const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const link = ([href, title]) => `<a href="${escape(href)}">${escape(title)}</a>`;
const list = (items) => `<ul>${items.map((item) => `<li>${link(item)}</li>`).join("")}</ul>`;

export function renderPadelReading(html, pageSlug) {
  if (`/${pageSlug}` === padelGuide) {
    const groups = padelArticleTopics.map(({ id, title, intro }) => {
      const matching = padelBuyerReading.filter((article) => article.topic === id).map(({ href, title }) => [href, title]);
      const sampleLink = id === "padel-load-testing"
        ? `<p>${link(padelBuyerReading.find(({ slug }) => slug === "padel-bag-packed-fit-test").destination)}</p>`
        : "";
      return `<article><h3 id="${id}" style="scroll-margin-top:130px">${escape(title)}</h3><p>${escape(intro)}</p>${list(matching)}${sampleLink}</article>`;
    }).join("");
    const section = `<section class="section" aria-labelledby="padel-reading-topics"><div class="section-head"><p class="eyebrow">Padel buyer resources</p><h2 id="padel-reading-topics" style="scroll-margin-top:130px">Browse buyer guides by topic</h2><p>New custom bulk orders start at 300 pieces per style; different styles cannot be combined. Samples are assessed separately. <a href="/moq-sampling-faq">Review the custom MOQ and sampling policy.</a></p></div><div class="guide-grid">${groups}</div></section>`;
    return html.replace(/(<header class="page-hero">[\s\S]*?<\/header>)/, (_, hero) => hero + section);
  }
  if (!pageSlug.startsWith("blog/")) return html;
  const navigation = getPadelArticleNavigation(pageSlug.slice("blog/".length));
  if (!navigation) return html;
  const resources = navigation.resources.filter(([href]) => !html.includes(`href="${href}"`));
  return html.replace("</article>", `<nav class="padel-article-reading" aria-label="Padel article topic and related reading"><h2>Explore this buying topic</h2><p>Topic: ${link(navigation.topic)}</p>${list([...resources, ...navigation.recommendations])}</nav></article>`);
}
