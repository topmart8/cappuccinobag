# Padel programme selection and sample brief - 2026-11-16

Continues the club / academy / tournament supply direction from PRs #79 and #80.

## Buyer-facing scope

- Existing `/padel-club-tournament-supply` gains a browser-local programme selector with four existing SKUs.
- Three presets support club retail, member / academy kits and tournament / sponsor packs. Buyers can adjust selected styles and each quantity.
- Minimum 300 pieces is checked independently for every selected style. Totals describe individual items, never assembled kit counts.
- The existing `/inquiry` route receives the selected programme, SKUs and quantities through its established `product` / `format` parameters. No new submission endpoint, database, analytics destination or CRM change.
- A sample-assessment link stays available independently of bulk quantities.
- A three-page English PDF provides the four-product shortlist, quantity examples and sample / quotation checklist. It uses existing site images, with photo-reference and concept statuses visible. No invented dimensions, costs, lead times or performance claims.

## Source and version

Product facts use the source register and evidence boundaries in `padel-club-tournament-release-20261116.md`. No new market-volume, bestseller or customer-endorsement claims are introduced.

PDF source: `scripts/build-padel-club-brief.py`. Public output: `public/downloads/cappuccino-padel-club-sample-brief.pdf`. Version R1, 16 November 2026. Review approved samples before converting this selection brief into any production instruction.

## Verification and rollback

Tests cover independent MOQ enforcement, invalid quantities, empty selections and preservation of uneven selected quantities in the RFQ handoff. Validate the built route, PDF links and live selector / handoff after deployment. Do not submit the production form or claim delivery verification from a populated form.

Rollback by reverting this release's isolated files and the programme-builder insertion / hero anchor on the existing page. No URL migration or database rollback is required.
