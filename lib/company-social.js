// Verified company-page canonical URL, reviewed on 2026-11-10.
export const companyFacebook = Object.freeze({
  href: "https://www.facebook.com/people/cappuccinobag/100070817364999/",
  label: "Facebook company page",
  accessibleLabel: "Cappuccino Bag on Facebook (opens in a new tab)",
  platform: "facebook",
  rel: "noopener noreferrer",
});

export const companySocialLinkStyle = Object.freeze({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "44px",
});

export function renderCompanyFacebookLink() {
  return `<a href="${companyFacebook.href}" target="_blank" rel="${companyFacebook.rel}" aria-label="${companyFacebook.accessibleLabel}" data-social-platform="${companyFacebook.platform}" style="display:inline-flex;align-items:center;min-height:44px">${companyFacebook.label}</a>`;
}

export function addCompanySocialToContact(html, pageSlug) {
  if (pageSlug !== "contact" || html.includes('id="company-social"')) return html;
  const section = `<section class="section" id="company-social" aria-labelledby="company-social-heading"><h2 id="company-social-heading">Cappuccino Bag on Facebook</h2><p>Visit our company page for product and company updates.</p><p>${renderCompanyFacebookLink()}</p></section>`;
  return html.replace(/<\/main>/i, `${section}</main>`);
}

export function withCompanyFacebookSameAs(value) {
  if (Array.isArray(value)) return value.map(withCompanyFacebookSameAs);
  if (!value || typeof value !== "object") return value;
  const result = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, withCompanyFacebookSameAs(child)]),
  );
  const types = Array.isArray(result["@type"]) ? result["@type"] : [result["@type"]];
  if (result["@id"] === "https://www.cappuccinobag.com/#organization" && types.includes("Organization")) {
    const existing = Array.isArray(result.sameAs) ? result.sameAs : result.sameAs ? [result.sameAs] : [];
    result.sameAs = [...new Set([...existing, companyFacebook.href])];
  }
  return result;
}
