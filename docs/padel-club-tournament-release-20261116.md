# Padel club and tournament supply programme

Date: 2026-11-16. Base: `ab6c18e64fafb684e8e27f8acc082907e40b7e3b`.

## Product strategy

Position Cappuccino around a focused Padel bag and sewn-accessory supply programme for club retail, academy/member welcome kits and tournament/sponsor packs. The initial shortlist reuses existing products and canonical URLs; it does not create duplicate sleeve SKUs or claim to manufacture playing equipment.

| Priority | Existing format | Role in the programme | Evidence / approval needed |
| --- | --- | --- | --- |
| First | S005 thermal-lined racket sleeve | Club retail and membership entry item | Sample-photo-based reference with retouched branding; fit, laminate and performance require approval |
| First | S004 court essentials pouch | Compact participant/member pack base | Design concept; confirm contents, internal dimensions and sample |
| First | S003 shoe bag | Coordinated accessory and premium pack addition | Design concept; footwear fit, ventilation and lining approval |
| Second | PDB016 duffel | Main bag for team travel or premium club range | AI concept; approve simultaneous racket/shoe/clothing packing |
| Extend after sample/market review | PDB014 tote, PDB017 backpack, existing convertible hybrid | Additional member segments and carrying routines | Maintain each product's existing evidence and sample limitations |
| Separate sourcing review | Rackets, balls, grips, towels, apparel | Possible future complementary supply | No verified supplier or product specification asserted; no included equipment, price or stock claim |

This is a supply-fit and programme-use shortlist, not a sales ranking. Start with a sleeve and pouch sample programme, then expand the main bag range when fit, quality, cost and buyer feedback support it. Club groups, sports brands, distributors and larger events are a better initial fit for 300-piece custom production than single small-club orders. Every custom style retains its own minimum. Kit assembly, colour splits, sponsor artwork and packaging require explicit quotation.

## Public benchmark research

Official NOSSA pages read on 2026-11-16:
- https://nossapadel.com/ — focused racket/bag/accessory catalogue plus Player Packs and Bundles; temporary promotion prices are not manufacturing cost benchmarks.
- https://nossapadel.com/products/padel-case — sleeve positioning combines compact carry, external pocket, strap and thermal lining. These are NOSSA's claims, not evidence for Cappuccino performance.
- https://nossapadel.com/products/padel-rucksack-duffel — hybrid work/court/travel positioning. On-site reviews raise useful sampling hypotheses around empty-bag structure and bottle storage; they are not independently verified quality findings.
- https://nossapadel.com/products/nossa-base-green-player-pack-1 — bundled retail presentation.

Takeaway: organise a small range by buyer use and coordinated packs. Do not copy competitor artwork, photos, reviews, warranty, inventory, prices, universal-fit or performance claims. NOSSA is a public benchmark; no commercial relationship or endorsement is asserted on the site.

Keyword research tools were attempted. Semrush returned no_api_units; OpenSEO keyword research returned INSUFFICIENT_CREDITS. No search-volume estimate, bestseller status or product-sales forecast is supplied. Existing first-party search data was reviewed separately; no account metrics are published in this repository.

## Search intent and page ownership

| Page | Primary role |
| --- | --- |
| /racket-sports/padel-bags | Compare bag formats |
| /custom-padel-bag-manufacturer | Manufacturer capability and process |
| /padel-accessories | Accessory range discovery |
| /padel-club-tournament-supply | Club retail, member kits, tournament pack procurement |
| /padel-accessories/custom-padel-racket-sleeve | S005 sleeve specifications, evidence and fit |
| /padel-accessories/custom-ventilated-padel-shoe-bag | S003 footwear organisation and club use |
| /padel-accessories/custom-padel-organizer-pouch | S004 member/event pouch development |

The new solution page contains server-rendered content, visible procurement questions, stable internal links, a self-referencing canonical, Open Graph/Twitter metadata, and WebPage/Service/ItemList/BreadcrumbList structured data. No fabricated Offers, ratings, stock or special AI-ranking markup. The existing product template retains its existing schema behaviour. Google guidance: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide. Implementation improves discoverability and clarity; indexing and AI citation are not guaranteed.

## Scope and conflict review

All 16 open PR file lists checked. No existing club/tournament solution route was found. Additive inbound link in the collection overlaps the file edited by #23/#40/#41/#42/#50; only the current main file receives one new paragraph. The new sitemap entry is additive and does not adopt #52's pending timestamp change. The buyer-details navigation link is separate from #74's proposed material-reference block. Product editorial additions are in app/padel-product-content.js, not #23's underlying product data. No old PR is merged or copied wholesale.

No inquiry/API/CRM/database contract, existing workshop photograph or image branding is changed. Existing no-overlay workshop image is reused. Programme CTAs reuse the existing inquiry URL's product=Padel Bags and format context. No production form is submitted and no email is sent.

## Validation before publication

- Existing suite: 204/204 tests pass.
- ESLint: pass.
- Production build: pass.
- Managed local preview: unavailable; launcher adds unsupported `--host` and `--strictPort` flags to Next. Working app code and network controls were not changed to bypass this infrastructure failure.
- Built HTML and production deployment checks are recorded in the associated pull request. Live browser validation follows deployment.
- Google indexing, AI mentions/citations and actual RFQ receipt are separate outcomes and remain unverified for this release.

## Follow-through

Use the existing product ledger/Company OS rather than a parallel CRM. Track qualified club/event RFQs, sample approvals, ordered styles and reorders. Propose a focused club/brand sample pilot before expanding to playing equipment. No automatic outreach or follow-up schedule was created.

Rollback: revert only this release's additive page, editorial fields and links; retain unrelated newer work. No database rollback is required.
