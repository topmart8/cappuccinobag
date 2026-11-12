import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import {
  addCompanySocialToContact,
  companyFacebook,
  companySocialLinkStyle,
  renderCompanyFacebookLink,
  withCompanyFacebookSameAs,
} from "../lib/company-social.js";
import { footerNavigation, moreCollectionsNavigation, primaryNavigation, utilityNavigation } from "../lib/site-navigation.js";
import { trackEvent } from "../lib/analytics/client.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const organizationId = "https://www.cappuccinobag.com/#organization";

test("Facebook config uses the verified canonical company page without share or tracking parameters", () => {
  const url = new URL(companyFacebook.href);
  assert.equal(url.href, "https://www.facebook.com/people/cappuccinobag/100070817364999/");
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  assert.equal(companySocialLinkStyle.minHeight, "44px");
  assert.ok(Object.isFrozen(companyFacebook));
});

test("static company link is labelled, keyboard-native and safe for a new tab", () => {
  const link = renderCompanyFacebookLink();
  assert.match(link, /<a href="https:\/\/www.facebook.com\/people\/cappuccinobag\/100070817364999\/"/);
  assert.match(link, /target="_blank" rel="noopener noreferrer"/);
  assert.match(link, /aria-label="Cappuccino Bag on Facebook \(opens in a new tab\)"/);
  assert.match(link, /data-social-platform="facebook"/);
  assert.match(link, /min-height:44px/);
  assert.match(link, />Facebook company page<\/a>/);
  assert.doesNotMatch(link, /data-track=|onclick=|<script|<iframe/);
});

test("React footer uses the same link config and preserves email and navigation", async () => {
  const source = await read("components/SiteFooter.jsx");
  for (const field of ["href", "rel", "accessibleLabel", "platform", "label"]) {
    assert.ok(source.includes(`companyFacebook.${field}`));
  }
  assert.match(source, /style=\{companySocialLinkStyle\}/);
  assert.match(source, /target="_blank"/);
  assert.match(source, /mailto:info@cappuccinobag.net/);
  assert.match(source, /footerNavigation.map/);
});

test("static footer includes one shared company link without changing its existing content", async () => {
  const source = await read("app/static-site.js");
  const functions = source.slice(source.indexOf("function renderLinks("), source.indexOf("function addHomePrioritySections("));
  assert.ok(functions.includes("function applySharedNavigation("));
  const html = vm.runInNewContext(`${functions}\napplySharedNavigation('<main><h1>Example</h1></main>')`, {
    footerNavigation, moreCollectionsNavigation, primaryNavigation, utilityNavigation, renderCompanyFacebookLink,
  });
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] || "";
  assert.equal(footer.split(companyFacebook.href).length - 1, 1);
  assert.match(footer, /mailto:info@cappuccinobag.net/);
  assert.match(footer, /Guangzhou Cappuccino Leather Handbag Co., Ltd./);
  for (const group of footerNavigation) for (const link of group.links) assert.ok(footer.includes(`href="${link.href}"`));
});

test("contact adds one company section while preserving the original RFQ, email and WhatsApp markup", async () => {
  const source = await read("public/site/contact/index.html");
  const result = addCompanySocialToContact(source, "contact");
  assert.equal(result.split('id="company-social"').length - 1, 1);
  assert.match(result, /aria-labelledby="company-social-heading"/);
  assert.equal(addCompanySocialToContact(result, "contact"), result);
  assert.equal(result.replace(/<section class="section" id="company-social"[\s\S]*?<\/section>/, ""), source);
  for (const retained of ["../inquiry/", "info@cappuccinobag.net", "https://wa.me/8613928715568"]) assert.ok(result.includes(retained));
  assert.equal(addCompanySocialToContact(source, "inquiry"), source);
  assert.equal(addCompanySocialToContact(source, ""), source);
});

test("Organization sameAs is additive, immutable and idempotent", () => {
  const source = { "@context": "https://schema.org", "@graph": [
    { "@id": organizationId, "@type": "Organization", name: "Cappuccino Bag", sameAs: "https://example.com/existing-company" },
    { "@id": "https://example.com/other", "@type": "Organization", name: "Other" },
    { "@id": "https://www.cappuccinobag.com/#manufacturer", "@type": "Manufacturer" },
  ] };
  const before = structuredClone(source);
  const result = withCompanyFacebookSameAs(source);
  assert.deepEqual(source, before);
  assert.deepEqual(result["@graph"][0].sameAs, ["https://example.com/existing-company", companyFacebook.href]);
  assert.deepEqual(result["@graph"].slice(1), before["@graph"].slice(1));
  assert.deepEqual(withCompanyFacebookSameAs(result), result);
  assert.deepEqual(withCompanyFacebookSameAs({ "@type": "WebPage" }), { "@type": "WebPage" });
});

test("the existing homepage Organization receives sameAs without a new Organization node", async () => {
  const html = await read("public/site/index.html");
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  const nodes = schemas.flatMap((schema) => schema["@graph"] || [schema]);
  assert.equal(nodes.filter((node) => node["@id"] === organizationId).length, 1);
  const result = withCompanyFacebookSameAs(nodes);
  assert.equal(result.filter((node) => node["@id"] === organizationId).length, 1);
  assert.ok(result.find((node) => node["@id"] === organizationId).sameAs.includes(companyFacebook.href));
  const renderer = await read("app/static-site.js");
  assert.match(renderer, /withCompanyFacebookSameAs\(removeUnsupportedClaims\(visibleSchema\)\)/);
  assert.match(renderer, /rendered = addCompanySocialToContact\(rendered, pageSlug\)/);
});

test("Facebook clicks reuse one existing CTA event and preserve other contact event routing", async () => {
  const source = await read("components/analytics/AnalyticsProvider.jsx");
  const handler = source.match(/const onClick = \(event\) => \{[\s\S]*?\n    \};/)?.[0];
  assert.ok(handler);
  for (const [href, label, dataset, expected] of [
    [companyFacebook.href, companyFacebook.label, { socialPlatform: "facebook" }, "cta_click"],
    ["mailto:info@cappuccinobag.net", "Email", {}, "email_click"],
    ["https://wa.me/8613928715568", "WhatsApp Us", {}, "whatsapp_click"],
    ["/inquiry", "Request a Quote", {}, "cta_click"],
    ["/products", "Products", {}, null],
  ]) {
    const calls = [];
    const link = { dataset, textContent: label, getAttribute: (name) => name === "href" ? href : "" };
    vm.runInNewContext(`${handler}\nonClick(event)`, {
      event: { target: { closest: () => link } },
      ctaLocation: () => "footer", pageContext: () => ({ page_path: "/contact" }),
      trackEvent: (name, params) => calls.push({ name, params }),
    });
    assert.equal(calls.length, expected ? 1 : 0);
    if (expected) {
      assert.equal(calls[0].name, expected);
      assert.equal(calls[0].params.cta_name, label);
      assert.equal(calls[0].params.cta_location, "footer");
      assert.ok(!("href" in calls[0].params));
    }
  }
});

test("CTA tracking retains consent gating and does not transmit the Facebook URL", () => {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  globalThis.document = { title: "Contact Cappuccino Bag", documentElement: { lang: "en" }, referrer: "" };
  let consent = "denied";
  const calls = [];
  globalThis.window = {
    localStorage: { getItem: () => consent },
    location: { pathname: "/contact" },
    gtag: (...args) => calls.push(args),
  };
  try {
    trackEvent("cta_click", { cta_name: companyFacebook.label, cta_location: "footer", href: companyFacebook.href });
    assert.equal(calls.length, 0);
    consent = "granted";
    trackEvent("cta_click", { cta_name: companyFacebook.label, cta_location: "footer", href: companyFacebook.href });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], "event");
    assert.equal(calls[0][1], "cta_click");
    assert.equal(calls[0][2].cta_name, companyFacebook.label);
    assert.ok(!("href" in calls[0][2]));
  } finally {
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
  }
});
