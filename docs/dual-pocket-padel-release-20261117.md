# Dual-pocket Padel backpack and backpack subcategory

User explicitly requested publication of this product and a subcategory on 17 November 2026 (Asia/Shanghai). Base main: 13ba3a3 (PR #83). Domain/project verified: www.cappuccinobag.com / cappuccinobag / prj_i1PevCZR3RG6q8E3t2nXxhKDyu3f.

## Scope
- New product: /products/custom-padel-backpack-dual-side-pockets
- New subcategory: /racket-sports/padel-backpacks
- Add two links inside the existing Padel Backpacks programme and two dated sitemap entries.
- Preserve S002, PDB001 and PDB017 identities and URLs. The new rounded dual-pocket concept has no invented stock SKU, measured capacity, price, review or availability claim.
- Three user-requested concept renders, converted to WebP (approximately 722KB combined), with visible concept descriptions and descriptive alt text. Bottles, balls and rackets are not included.
- YKK and recycled polyester are optional sourcing specifications; no model-specific certification or waterproof claim. New custom MOQ 300 pieces per style; colour splits and samples assessed separately.
- Crawlable English benefits, specifications, sample process and buyer FAQs. Product/Breadcrumb schema and CollectionPage/ItemList schema; no fabricated offers, ratings or special AI markup. Existing RFQ receives product=Padel Bags and descriptive format including the product URL. No inquiry submission or backend changes.

## Ownership review
All 16 current open PR changed-file lists were reviewed. New data/pages/CSS/assets are unclaimed. app/racket-sports/padel-bags/page.js overlaps #23/#40/#41/#42/#50 only at file level; this change adds two links to the current main backpack product array, without copying any pending implementation. app/sitemap.js overlaps #41/#52; this change adds only two new route entries and does not alter existing timestamps or #52's proposed timestamp strategy. Future adoption must retain these entries. No existing branch is overwritten, no unrelated pending PR merged.

## Validation
- 209 Node tests passed.
- ESLint passed.
- Production Next build passed.
- Built HTML: both routes have exactly one H1, self-canonical, buyer copy, images and RFQ links.
- git diff --check passed.
- Local browser attempt blocked by platform socket permission (Chromium process_singleton socket). Local Next start also reported uv_interface_addresses restriction. No network/protection configuration was changed. Mobile visual checks remain unverified until hosted access.
- Public HTTP and deployment verification follows merge. No production inquiry, email or CRM write. Indexing and AI citation are not claimed.

Rollback: revert only this release commit, preserving subsequent unrelated work. No database rollback needed.
