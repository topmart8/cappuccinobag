# Six-site upgrade: Cappuccino first implementation

Task: COCO_SIX_SITE_DESIGN_UPGRADE_20261031. Continues PR50; no new CRM or parallel business task.

## Behavior

- Home keeps Padel first and introduces Racket Sports, Brand Development and Clubs / Events paths. Existing outdoor/travel/accessory discovery remains in the featured collections.
- Concept, tech pack, club and reorder links select their matching existing development RFQ path.
- Home's primary CTA retains `/inquiry`. PDB001's primary and mobile quote actions retain the existing `/inquiry?product=Padel%20Bags&format=PDB001%20Padel%20Work%20Tote%20Backpack` route. The gallery's additional “Discuss this colour direction” action carries the selected model and digital colour reference into editable development-brief fields.
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

- Home retains its production headline, introduction and primary inquiry CTA. The presentation keeps the introduction visible on mobile and gives the three buyer paths simpler separators and larger link targets.
- All original homepage destination URLs remain linked, including the tennis, pickleball, travel, cardholder and phone-pouch entries alongside the additional business paths.
- PDB001 retains its production H1 and introduction, including laptop/racket terminology. At tablet/mobile widths, copy precedes the colour gallery in document order; colour-reference controls retain their selected-state and additional development-brief URL behavior.
- Development adds an immediate anchor to the existing project brief. Its form uses two columns on desktop and one on mobile, with full-width narrative fields and 48px minimum input/select targets. Field names, transport, conditional paths and attachment handling are unchanged.
- Scope: five presentation files; no new dependency, backend change, generated imagery, live inquiry or production release.
- Validation: 219/219 tests, ESLint and the normal Next build pass (225 pages). Generated HTML checks confirm one H1 per pilot page, the expected CTA routes, the development stylesheet and existing reference/contact fields.
- Browser acceptance is pending. The managed launcher passes unsupported `--host` / `--strictPort` options to Next; the protected Vercel preview opens a sign-in page in the available browser. These checks do not establish desktop/mobile appearance, console health or rendered interaction success.
- Release stays HOLD / Draft until the current commit has desktop/mobile review and the existing live-receipt acceptance requirements are met. The visual increment can be reverted independently of the buyer-path implementation.

## Existing traffic and inquiry protection — Johnny's execution constraint

- Continue the same task and PR50. Do not create a duplicate upgrade task, replacement CRM or parallel implementation. Other PRs retain their own scope: PR52 sitemap, PR53 media and PR56 company/MOQ facts. Check overlapping files before integrating them; never overwrite another task's changes.
- Existing enquiry-generating routes, Padel collection/manufacturer/product URLs, canonical tags, metadata, structured data and primary conversion links are protected. Do not remove pages, rename URLs or replace their search topic for a visual redesign. Any later content/SEO change needs its own evidence and review within the existing task.
- The visual increment does not change production, DNS, analytics identifiers, inquiry handlers, required fields, attachments, CRM destination or notification recipients. Existing submission behavior remains a release acceptance requirement.
- PR50 as a whole includes earlier backend/inquiry work. Review its complete diff against the then-current production baseline, combine overlapping changes in preview, and verify existing as well as new enquiry paths before any release decision.
- Browser checks must cover desktop/mobile navigation, the original general inquiry path, PDB001's preserved product prefill, all four development paths and colour prefill. Live receipt verification must separately establish the same submission ID, database/CRM record, attachment where applicable and actual inbox delivery.
- Keep production unchanged while acceptance is incomplete. Retain the previous production deployment for rollback and compare inquiry delivery/errors and Padel search performance after any separately approved rollout. No claim of guaranteed rankings or zero risk follows from passing a build.
