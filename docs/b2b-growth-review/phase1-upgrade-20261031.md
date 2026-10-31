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

## Conditional release handoff — 2026-10-31

This section supersedes the earlier statement that original product discovery only remains in featured collections. The original main buyer-path block is now restored verbatim, in its original order: Racket Sports, Outdoor & Travel, Wallets & Accessories. The additional business-path section follows it. OEM title, H1, original introduction and four-step process are restored; development is supplemental. PR56's overlapping footer MOQ policy, Card Holder(s) prefill and llms company/order policy are incorporated by hunk only; PR56 as a whole is not merged.

Owner: the current delegated executor, continuing existing PR50. Remote PR50 baseline: 49ea179edf04a3717fce0bfd198b53a7d2739b22. Main/production: 6f2ccccb27eb53a94d1ca025429b3e3676a9b3c8. Preserved local inquiry guards were reconciled through merge 07415a3; no reset or force push. Another computer's unpublished work is unknown. Original V3 section 5.1 was updated in place (Library version 6), including Johnny's conditional publication authorization.

Receipt validation requires a matching submission ID and reference. Invalid JSON/2xx does not clear buyer input. Responses distinguish saved records, provider acceptance and unverified inbox receipt; workflow/status failures request review without encouraging a new submission. Existing IDs never blindly resend uncertain mail. Workflow record failures are now observable, including activities/email-draft failures. Durable asynchronous repair is not implemented and requires an explicit operational decision; no new schema or outbox is introduced.

Attachments are validated before ingest: at most five files, 4,000,000 bytes combined, allowlisted MIME. Stable server-generated content hashes prevent same-ID identical-file retries from creating new object names or overwriting objects. Partial upload failures retain previous objects; no automatic deletion. Changed-content retries may leave unreferenced objects, requiring separately authorized cleanup. MIME validation is not malware/content inspection.

Final local verification: 233 tests; lint; next typegen (route generation, not full tsc); normal webpack production build (225 pages); diff whitespace check. Local Chromium covers 360/390/430px touch, 768px menu, 390px keyboard/reduced motion and 1440px desktop. Seven protected routes return 200, one H1, canonical and no noindex; no horizontal overflow. All four brief paths retain inputs after invalid JSON and retry with the same ID; pending notification is displayed honestly. API calls are intercepted, with no live CRM, storage or email traffic. Browser appearance and frontend results remain valid after the final backend-only workflow failure change; backend regression was rerun.

Release remains HOLD. The authorized current Supabase project lookup was denied at 2026-10-31 16:53:02 UTC (2026-11-01 00:53:02 Beijing). Production configuration still identifies cepsbgvvalcjkfnmynkw; live health, canonical records and actual inbox receipt are unverified. An AI credential is configured, so paid draft-generation side effects also require clearance before a real test. No live submission, database mutation, push, ready transition, merge or deployment was performed. Production remains deployment dpl_AAgfFdaMwuUgyzaAbqNXsmjj2Djq. PR55 navigation, PR52 sitemap and PR53 media are not altered by this repair.

Uncompleted gates: authorized protected-preview review; live duplicate check and one permitted internal test with same-ID record/notification/inbox correlation; current production-vs-candidate LCP/CLS/interaction measurement; accessible search/qualified-inquiry baseline. These are unknown, not zero and not passing. Existing media issues owned by PR53 are not claimed repaired here. Once access and side effects are cleared, recheck remote HEAD, validate the exact final combination, then use Johnny's existing conditional release authorization under repository rules. Before any rollout retain the current production ID; rollback must check for unrelated intervening releases before promoting that deployment.

### Preview continuation and legacy lead-form boundary

The earlier local-only stop was corrected: commit 4fab44f was pushed to existing PR50 under the explicit preview authorization; its preview dpl_HVRH1BR62ukrv2gPytZKC2QCuCht reached READY. This did not authorize bypassing protection or release without receipt evidence. Current cloud Chromium access to both the exact preview and production failed with ERR_TUNNEL_CONNECTION_FAILED, before a login page. No CLI/OIDC identity is available; no new share link or credential was created. Online performance comparison remains unmeasured.

The remaining reachable legacy lead form at /download-catalog now locks in-flight and accepted submissions, retains the same ID across failed/unknown receipts, and starts a new ID only on a buyer edit after acceptance. Its saved reference remains in an aria-live form status instead of a 4.2-second toast. The same protection applies to the public legacy /site/request-sample/index.html asset. The clean /request-sample route is not in main's allowed routes and returns 404 locally; this pre-existing route discrepancy is not repaired or represented as a working acquisition route here. Inputs remain visible after acceptance, with the button disabled until an edit. This is form-session protection, not durable across-page buyer deduplication.

Updated verification: 234 tests pass, lint passes, normal production build passes (225 pages). Legacy form lifecycle tests cover concurrent dispatch, failed receipt retry, stable ID, accepted lock and deliberate-edit reset. Existing routes retain the previous browser results because this increment only changes the legacy lead handler; its actual browser evidence is recorded separately. No Supabase lookup or real submission was retried. Main/production remains unchanged, and release stays Draft/HOLD under Johnny's existing conditional approval.
