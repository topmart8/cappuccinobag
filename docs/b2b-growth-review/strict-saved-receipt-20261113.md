# Strict saved-receipt follow-up — 2026-11-13

Status: implementation prepared for existing Draft PR #50; no merge or production release.

## Problem and resulting behavior

Three existing handlers (legacy lead, /inquiry, and Padel RFQ) accepted a contradictory response with ok:true and saved:false when inquiryNumber and submissionId matched. This was reproduced with mocked responses, not observed from a real buyer submission.

Require both ok and saved to be boolean true before showing success or recording the conversion. Keep the existing HTTP and submission-ID checks. An unconfirmed receipt retains buyer input and the same retry ID. A valid saved receipt with a pending notification still succeeds and displays the existing follow-up message; notification acceptance is not inbox receipt.

## Scope and coexistence

- Runtime changes: three receipt conditions in public/site/assets/script.js and app/racket-sports/padel-bags/PadelRfqForm.jsx.
- Update the legacy lifecycle success fixture to include saved:true.
- Add tests/receipt-saved-review.test.mjs (24 mocked cases across the three handlers).
- Starting PR50 head: 949646c8e598991742ef6abf56e944babb5dbf2e.
- Refreshed main: f7936abf539ac9e8f0b6b984cb54750b2f3d3a46; PR50 is behind main by five commits. This follow-up does not merge or overwrite main.
- PR56 head: 65d6d7941574080b4ffab7e2dd1b8e56dee3158e. Its script hunk concerns card-holder prefill; this follow-up changes only later receipt checks. PR50 already retains that prefill. This is a hunk review, not a complete combined-branch acceptance.
- No API, CRM, dependency, MOQ policy, product content, navigation or PR74 code changes.

## Validation actually run

The 24 new cases fail 12/24 against the original source and pass 24/24 after this change. Together with four existing focused test files, 44/44 pass on the exact candidate source. Runtime diff was checked against fresh GitHub source; node --check public/site/assets/script.js passes.

Focused command (use an isolated environment with live network blocked):

```bash
node --test tests/brief-entry.test.mjs tests/padel-rfq-contract.test.mjs tests/lead-form-lifecycle.test.mjs tests/pr50-preview-crm-check.test.mjs tests/receipt-saved-review.test.mjs
```

In this review, a local preload replaced global fetch with a throwing function; individual tests supplied their own mocks. No live inquiry, email or database request was made by those tests. Only a source snapshot was available locally, so a full-repository test suite, lint and local production build were not run. A connected Vercel build is separate evidence, and the inherited PR50 prebuild may perform its configured read-only HEAD check.

## Still required before release

Reconcile the current main changes and concurrent PR scopes; test the resulting combined version. Complete authenticated hosted desktop/mobile interaction checks. Separately authorize and reconcile a clearly labelled test inquiry with actual internal inbox receipt and one corresponding CRM record. Do not equate READY, HTTP 200, notification accepted or mocked tests with actual delivery.

Keep Draft/HOLD. Roll back this follow-up with an additive revert of its receipt/test/document changes, preserving unrelated PR50 work. Never reset to the older PR50 baseline over newer work.
