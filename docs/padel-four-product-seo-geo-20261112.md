# Four Padel products: search intent, evidence and buyer copy

Date: 2026-11-12. Baseline: dfca0e4a5d4a49a6da4f7e11c0da67090344e447 (gallery release PR #72).
Scope: existing PDB014, PDB016, PDB017 and S005 URLs only. Cappuccino is the primary site. This continues the product/gallery release; it does not create a new category, CRM, automation or alternate product URL.

## Search intent ownership

| SKU | Existing URL | Product-level intent | Search title |
|---|---|---|---|
| PDB014 | /products/womens-lightweight-padel-tote-pdb014 | custom canvas padel tote bag | Custom Canvas Padel Tote Bag — Private Label — Cappuccino |
| PDB016 | /products/weekend-padel-carryall-pdb016 | custom padel sports duffel bag | Custom Padel Sports Duffel Bag — Shoe Storage — Cappuccino |
| PDB017 | /products/travel-padel-utility-backpack-pdb017 | custom multifunction padel backpack | Custom Multifunction Padel Backpack — OEM — Cappuccino |
| S005 | /padel-accessories/custom-padel-racket-sleeve | 900D thermal lined padel racket sleeve | 900D Thermal-Lined Padel Racket Sleeve — Custom Logo |

Actual metadata uses vertical bars between phrases. Model copy, meta descriptions, H1s, detail paragraphs and questions are versioned in app/padel-product-content.js, the single editorial source for these four pages.

The broad `custom padel bag` intent remains with /racket-sports/padel-bags; manufacturer intent remains with /custom-padel-bag-manufacturer. /padel-accessories owns the accessory range. Other generic sleeve landing pages are not duplicated. Product-level terms above are intent hypotheses, not verified search-volume claims. UK/NL/DE/US are target markets, not measured per-country results in this audit. No city/country doorway pages are added.

## Search baseline

OpenSEO's connected GSC property `sc-domain:cappuccinobag.com`, retrieved 2026-11-12. Final web data, 2026-10-12 through 2026-11-08, query + page dimensions, query contains `padel`, all countries/devices. Eight returned query/page rows, 60 row-level impressions and zero clicks. Query/page row totals are not site-wide totals and may double-count exposure across URLs.

- `custom padel bag`: collection 8 impressions, average position 7.8; manufacturer 1 impression, position 22.
- `custom padel racket backpack`: collection 2 impressions, average position 12.5.
- `oem padel accessory`: accessories 1 impression, average position 9.
- `personalised padel bag`: accessories 21 impressions, average position 40; collection 24, average position 15.7.
- `personalised padel racket bag`: collection 2 impressions, average position 10.5.
- `personalized padel bag`: collection 1 impression, average position 8.

No four-product URL appears in these returned query-filtered rows. That does not establish lack of indexing, lack of demand, or zero impressions across all queries. The data is too small to claim a winning title. Google average position is not a universal live rank. GSC Wizard was unavailable due to its subscription status; the existing OpenSEO GSC connection provided the baseline without a new subscription.

## Content and semantic changes

- Buyer-specific opening copy, proposed or photographed interior explanation, intended buyer, customization options, and model-specific sample checks.
- Visible evidence status and a link to factory/material proof. General factory evidence is explicitly not model-specific performance proof.
- Twenty-one model-specific visible FAQ entries (including one MOQ question per model), reflected in existing FAQ schema. FAQ markup does not imply Google FAQ rich-result eligibility.
- Product and WebPage entities linked through stable canonical-based IDs; visible evidence status is also a Product additionalProperty. Existing brand/manufacturer and breadcrumb markup retained.
- No fake offers, price, aggregateRating, reviews, GTIN, stock, guaranteed waterproofing, thermal duration, certifications or universal racket fit. Product markup without offers/reviews is not presented as eligibility for Google's Product rich results.
- Crawlable server-rendered paragraphs, accurate existing alt/captions, self-canonical URLs, OG/Twitter summaries, direct comparison links and existing RFQ paths. Images and hero gallery remain intact.
- MOQ 300 per style, no combined styles, samples separately assessed; email and WhatsApp alternatives. Link review does not establish successful email delivery or CRM recording.

S005 keeps 900D subtly lustrous slate-grey/blue exterior, silver reflective lining, tonal glossy black branding effect and removable EPE shipping inserts. The EPE is not permanent lining. Other three products remain clearly disclosed as AI-generated development concepts; no copied customer branding is introduced.

## Pending work and conflict review

Reviewed 15 open PR file lists before editing. #70 owns the design-guide SEO draft; #50 the collection/RFQ journey; #52 sitemap; #56 identity/MOQ; #59 manufacturer proof. Those files are untouched.

Draft #23 from August overlaps the two shared product templates and contains old product assumptions (1–2 rackets, unverified laptop sizes and a side shoe compartment) that differ from the subsequently approved #71/#72 release. This continuation is based on current main, preserves approved product data and gallery behavior, and makes only additive, SKU-gated editorial integration in the two templates. No #23 branch/file contents are overwritten or merged. The new content lives in an independent module and component; this document is the handoff record for rebasing #23. Do not restore #23's obsolete product assumptions during a future merge. PDB015 and S001–S004 retain their existing rendering and metadata paths.

## Official guidance and boundaries

https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

Google's official AI guidance emphasizes accessible, useful, original content and standard search fundamentals. No special AI schema, llms.txt file, fixed paragraph length or keyword density is required to guarantee inclusion. This release supports machine understanding and buyer decisions; it does not certify search indexing, improved rankings, or AI recommendations. No bots or access controls are changed.

## Validation and follow-up

Validate local tests/lint/build, rendered metadata/canonical/entity consistency, all image URLs and internal links, visible content and inquiry links on preview, then check the exact production URLs after release. Actual RFQ submission and CRM receipt are outside this content release's verification. No background schedule is created. Review the existing measurement workflow at 7/14/28 days for indexed pages, query/page impressions, clicks, qualified RFQs and sampled AI citations. Record unknowns as unknowns.

Local checks completed: 204/204 existing tests, lint with zero warnings, Next.js production build, and rendered HTML assertions for all four H1/title/canonical/Product-WebPage references, visible FAQ/schema equivalence, evidence disclosure, crosslinks, gallery anchors and SKU-bearing RFQ links. Non-target PDB015 and S002 did not receive the editorial component. The managed local preview injects Vite-only `--host` arguments into Next.js and cannot start; application code was not changed to compensate. Hosted Vercel preview is the visual acceptance path.
