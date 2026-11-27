# Four-product search and buying-intent release

Date: 17 November 2026 (Asia/Shanghai).
Baseline: `5f199ea1861f6bc9c6d280ccf4271cdf6d3dba6e` (PR #82).

The four-product exterior/interior presentation is already live. This follow-up sharpens the existing product pages for specific B2B buying questions and adds a daily-training preset to the existing programme selector. It creates no new URLs or duplicate products.

## Search ownership

| Model / existing route | Primary query | Supporting buyer language |
| --- | --- | --- |
| S005 `/padel-accessories/custom-padel-racket-sleeve` | custom padel racket cover | custom padel racket sleeve; 900D cover with logo; club member kits |
| S004 `/padel-accessories/custom-padel-organizer-pouch` | custom padel accessories pouch | private label organizer pouch; member welcome pouch; tournament gift pouch |
| S003 `/padel-accessories/custom-ventilated-padel-shoe-bag` | custom padel shoe bag | shoe bags with club logo; footwear storage; tournament packs |
| PDB017 `/products/travel-padel-utility-backpack-pdb017` | custom padel racket backpack | private label training backpack; full-height racket sleeve; removable shoe pouch |

The existing bag collection retains broad format-comparison intent; the manufacturer page retains manufacturer/factory intent; `/padel-club-tournament-supply` retains coordinated club, member and tournament procurement. Synonyms do not receive separate pages.

## Evidence and limits

- OpenSEO successfully read final first-party GSC query/page data for 17 October–13 November 2026. The query `custom padel racket backpack` appears against the collection page, with a very small sample. It supports choosing buyer language, not a traffic forecast or a fixed country ranking. Account metrics are not published here.
- GSC Wizard refused access because its subscription was inactive. OpenSEO keyword metrics refused the focused seven-keyword request because credits were insufficient. Search volume, keyword difficulty and market-specific rank remain unverified. Other phrases are intent candidates, not measured high-volume terms.
- Google primary guidance checked: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide and https://developers.google.com/search/docs/appearance/structured-data/product-snippet . Use clear, crawlable, useful product content. Do not promise AI inclusion or fabricate offers/reviews for rich-result eligibility.
- Product facts follow the user-reviewed development brief: S005 is a sample-photo reference; S003, S004 and PDB017 are development concepts. 900D for the sleeve is not automatically extended to the other products. Dimensions, fit and performance require sampling. S003 is not a verified nested fit for PDB017.

## Buyer-facing changes

- Align four titles, descriptions and opening answers with product identity, customization and independent 300-piece minimums.
- Make cover/sleeve and pouch/organizer synonyms readable in normal buyer copy.
- Add practical quotation/sampling questions for footwear, pouch contents and simultaneous backpack packing. Retain exact visual/FAQ consistency through the existing template.
- Explain the proposed PDB017 retaining strap and distinguish the 50 × 33 × 22 cm development target from measured capacity.
- Add `Daily training collection` to the existing selector: PDB017 + S004, initially 300 pieces each. Each quantity is checked independently; optional footwear remains selectable.
- Preserve canonical URLs, existing galleries, related-product links, Product/WebPage/Breadcrumb markup, contact channels and all inquiry/backend contracts. Existing FAQ markup is retained, not newly introduced as a Google rich-result promise. No fabricated price, stock, reviews, performance rating or AI-specific schema.

## Conflict review

All 16 open PR file lists inspected. Runtime changes are confined to `app/padel-product-content.js` and `lib/padel-programme-brief.mjs`; neither overlaps those lists. In particular, #23's templates/product data and #74's buyer-details component are untouched. No pending PR is merged as a dependency.

## Validation before publication

- Existing Node suite: 209 passed, zero failures.
- ESLint and production build: passed.
- Training preset check: PDB017 300 + S004 300 produces two styles and 600 items; 299 for either selected style is rejected.
- Managed browser preview cannot launch because its infrastructure appends unsupported `--host` / `--strictPort` arguments to `next dev`. `sites-preview status` reports stopped. Working application/configuration and network protections were not changed to compensate. Hosted browser checks follow publication.
- Production delivery, Google indexing, AI citation and actual RFQ receipt are separate checks. Opening an inquiry page is not a submission, email receipt or CRM record.

Rollback: revert this release's two runtime files and this report; preserve subsequent unrelated changes. No database rollback is needed.
