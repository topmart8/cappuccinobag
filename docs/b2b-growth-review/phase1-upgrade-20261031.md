# Six-site upgrade: Cappuccino first implementation

Task: COCO_SIX_SITE_DESIGN_UPGRADE_20261031. Continues PR50; no new CRM or parallel business task.

## Behavior

- Home keeps Padel first and introduces Racket Sports, Brand Development and Clubs / Events paths. Existing outdoor/travel/accessory discovery remains in the featured collections.
- Concept, tech pack, club and reorder links select their matching existing development RFQ path.
- PDB001 links use the development brief. The gallery's “Discuss this colour direction” action carries the selected model and digital colour reference into editable fields.
- Product and colour references join the existing message adapter for the existing inquiry handler. Submission IDs, attachments, endpoint and retry behavior remain owned by that handler.
- Only catalog identifiers travel in URLs. No arbitrary query data is accepted as a product claim. Colour references retain the requirement for swatch and sample approval.
- The PDB001 purchasing snapshot now states the approved new-custom MOQ of 300 pieces per style, with separate sampling and no pooling of different styles.

## Baseline and verification

- Starts from PR50 head `9f710e5610594142482fe5aaba4377bcd8e15b57` and incorporates production/main `6f2ccccb27eb53a94d1ca025429b3e3676a9b3c8`, retaining the existing motion and mobile-menu fixes.
- 219 Node tests pass; ESLint passes; Next build generates all 225 pages.
- Tests cover six colour references, four RFQ paths, unknown identifiers, preserving buyer edits and carrying references in the actual form-data adapter. Test data uses `example.invalid`; no live inquiry was submitted.
- Browser rendering, mobile layout, real CRM/attachment/inbox receipt and production release remain separate acceptance items. Managed local preview currently cannot launch the Next process; it is not a product failure.

## Visual scope and rollback

This pilot keeps the existing brand palette, components and assets. It does not claim the full visual redesign or three-dimensional product showcase is finished. No new imagery or speculative product capabilities are added.

Review on a preview deployment before production. Revert the phase-one feature commit to remove these additions while keeping the merged mobile-menu/motion baseline.

## Visual hierarchy increment — 1 November 2026

- Home shortens the hero headline, brings the 300-per-style custom MOQ into the lead, keeps that lead visible on mobile, and gives the three buyer paths simpler separators and larger link targets.
- PDB001 uses a shorter product heading with laptop/racket details in the lead. At tablet/mobile widths, copy precedes the colour gallery in the same order as the document; colour-reference controls retain the existing selected-state and brief URL behavior.
- Development adds an immediate anchor to the existing project brief. Its form uses two columns on desktop and one on mobile, with full-width narrative fields and 48px minimum input/select targets. Field names, transport, conditional paths and attachment handling are unchanged.
- Scope: five presentation files; no new dependency, backend change, generated imagery, live inquiry or production release.
- Validation: 219/219 tests, ESLint and the normal Next build pass (225 pages). Generated HTML checks confirm one H1 per pilot page, the expected CTA routes, the development stylesheet and existing reference/contact fields.
- Browser acceptance is pending. The managed launcher passes unsupported `--host` / `--strictPort` options to Next; the protected Vercel preview opens a sign-in page in the available browser. These checks do not establish desktop/mobile appearance, console health or rendered interaction success.
- Release stays HOLD / Draft until the current commit has desktop/mobile review and the existing live-receipt acceptance requirements are met. The visual increment can be reverted independently of the buyer-path implementation.
