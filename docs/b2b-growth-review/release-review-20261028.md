# PR #50 release review — 28 October 2026

**Disposition: HOLD / keep Draft. No production merge or promotion.**

The release request authorizes review, necessary fixes and a release only after the conditions pass. Actual synthetic inquiries require the user's specified live-test authorization. No live inquiries or internal/customer emails were generated during this review.

## Baseline and reconciliation

- Original PR head: `5baa2914ecb39eb4654a4eccbead4b416aa7ceec`.
- Latest observed production/main: `e7d90a16ca55c0f05b9a22124a8bd3e84d061dbe` (PR #51 sitemap fix).
- Original PR remained Open, Draft, mergeable, with no formal GitHub review approvals.
- Original preview `dpl_Qtkr3umtVStQgLg8ad2SZB9421X4` was READY and matched the original head; it does not validate these subsequent edits.
- Integrated the current main changes to `app/sitemap.js` and its test. No merge conflict. Both previously omitted buyer guides are retained.

## Fixes prepared in this revision

1. Initialize each newly inserted development form after Next.js client navigation. The original one-time script left a replacement form without its brief adapter and with its button disabled. A DOM replacement regression test verifies initialization occurs exactly once.
2. Replace the inaccurate 8 MB attachment promise with a 4,000,000-byte aggregate file limit in the browser, server and both relevant form hints. This leaves multipart/brief overhead under Vercel's 4.5 MB function request cap. Validate all MIME types before any object in a batch is uploaded. Files remain optional.
3. Retry transient internal notification transport errors, HTTP 429 and 5xx up to three total attempts, with a stable Resend idempotency key, identical payload, 10-second per-attempt timeout and bounded backoff. Permanent errors fail immediately; a provider-requested backoff over five seconds requires later operator handling. Missing configuration is `skipped`; rejected/exhausted delivery is `failed`, rather than incorrectly `skipped`.
4. Display `email_status` in the protected CRM inquiry details. `sent` means provider API acceptance, not verified delivery to the inbox.
5. Align name/email field maximums with server normalization and correct the new form's error-status CSS selector.

No migration, credential, environment-variable, domain, deployment-protection, pricing, payment or customer-outbound settings were changed. Notification retries execute only when an actual inquiry invokes the existing internal notification path. They do not enable unattended customer email.

## Field contract

| Browser field | Existing Company OS destination |
| --- | --- |
| Name, email, company | `inquiries.name`, `email`, `company`; existing customer association |
| Product category | `product`, `product_category` |
| Quantity / material / target cost | `quantity`, `material`, `target_price` |
| RFQ path / design status / positioning | Labelled lines in `message` |
| Launch date | Labelled `Target launch date` line in `message`; not falsely mapped to delivery date |
| Club/event mix / prior order reference | Conditional labelled lines in `message`; inactive fields disabled |
| Original project details | Preserved within `message` |
| Attachment | Private object path and name/type/size/`scan_status=pending` in `uploaded_files` |
| Attribution and submission UUID | Existing first/current attribution columns, `submission_id`, `dedupe_key` |

The four customer paths are preserved in the inquiry text, not new database columns. This change does not add structured per-path reporting. Attachment storage and scanning on the live database are unverified; `pending` does not mean scanned or safe. The current CRM exports attachment metadata but has no new attachment download UI in this PR.

## Business rules retained

- Custom MOQ: 300 pcs per style. Below-MOQ and mixed proposals can be submitted for manual review; submission is not order acceptance.
- Concept and Tech Pack uploads remain optional; no-drawing customers can describe their project.
- Written design/specification approval precedes physical sampling. AI concept images are not approval.
- Sample scope and any fee need separate agreement; no automatic PI, charge or production authorization.
- Padel remains first in primary navigation and first among the racket options. The homepage Padel entry remains before the existing content; product order is not changed.

## Checks and evidence boundaries

- Original head: reran all 203 Node tests successfully.
- Revised code: 211 Node tests passed, including all four brief-to-CRM mappings, form replacement, rejected oversized/unsupported multipart uploads before storage writes, small-attachment metadata mapping, and bounded/deduplicated internal notification retries.
- ESLint and Next route type generation passed. See the PR metadata for the final build/deployment result on the revised commit.
- These are local tests with injected database/email adapters, not live persistence or inbox tests. No genuine customer information was used.
- The public production OEM page was opened in a browser and still showed the old heading `From Design Brief to Bulk Bag Shipment`. Its Request a Quote link navigated to the working `/inquiry` UI, which still showed the old 8 MB hint. This is baseline entry verification only.
- New-head desktop/mobile browser interactions have NOT been revalidated. The cloud browser could not reach the local dev server. A protected-preview share-link attempt was blocked by automatic approval review because it would grant access to anyone holding the link. No share link or protection bypass was created by this review.
- A production error/warning log query over the supported latest 30-minute window returned no matches. This is not proof of successful submission or absence of earlier errors. A 24-hour query was rejected by the plan's retention limit.

## Release gates still open

1. **Database identity/access:** the production server's configured Supabase project differs from the project currently accessible through the connected Supabase account. The actual production project could not be inspected with this account. Current intended Company OS routing, table grants, live storage bucket privacy and schema compatibility therefore remain unverified. Do not switch database URLs or keys merely to make a test pass.
2. **Real synthetic test:** after authorization and database access reconciliation, run four clearly labelled inquiries and confirm exactly four inquiry records, correct fields, attachment object linkage and internal notifications. A successful preview build does not satisfy this gate.
3. **Preview/mobile interaction:** validate four dynamic paths, no-design submission, optional upload, disabled inactive fields, validation, double-click protection, navigation away/back and stable-ID manual retry on the revised deployment, including a narrow mobile viewport.
4. **Notification recovery:** bounded in-request retries are now covered. There is still no durable background notification outbox. An already-saved submission returns idempotently and does not automatically replay workflow records or notifications. A crash after persistence, or a failure while writing workflow logs before delivery, can leave `pending` without another email attempt. Failed/skipped/pending records require an agreed operator recovery procedure; do not resubmit the customer's form with a new UUID as a substitute.
5. **Inbox evidence:** production recipient configuration was read and equals `info@cappuccinobag.net`. Preview has a separate protected override whose value was not readable. Do not assume both recipients match or send to an unverified preview recipient. Provider acceptance alone is not inbox delivery.

## Concrete synthetic test proposal (not executed)

Use marker `PR50-QA-20261028`, company `Cappuccino Internal QA — NOT A CUSTOMER`, reserved-domain addresses `pr50-qa-concept@example.invalid`, `pr50-qa-techpack@example.invalid`, `pr50-qa-club@example.invalid`, and `pr50-qa-reorder@example.invalid`. Use one unique submission UUID per case. Use 300 pcs/style, QA-only material/cost, an unambiguous future launch date and `TEST ONLY — DO NOT QUOTE, SAMPLE, INVOICE OR CONTACT` in the message. These are synthetic values, not commercial terms.

| Case | Attachment | Expected evidence |
| --- | --- | --- |
| Concept, no design files | None | Complete brief text and native quantity/material/cost columns |
| Tech Pack | Harmless QA PDF under 4 MB | Private object, exact metadata and inquiry linkage |
| Club/event | None | Recipient/packaging mix retained |
| Reorder | None | `QA-NOT-A-REAL-ORDER` reference retained |

Verify the recipient is the approved internal mailbox before any send. Expect four internal notifications, zero customer emails and no PI/payment actions. Record HTTP response, inquiry number, submission UUID, CRM record ID, attachment metadata and inbox message evidence. Mark test records appropriately through the existing supported workflow after reconciliation; do not silently delete production records. Test denied-type/oversize paths and injected failures locally, not by deliberately disrupting production. Use the same UUID for a manual duplicate test; expect no additional inquiry or notification.

Only after these gates pass: reread the PR head, required checks, unresolved review threads and current main; then remove Draft/merge without bypassing branch protection and wait for the exact merged commit's production deployment to be READY. Verify the live OEM page, all three solution anchors, RFQ navigation and production submission evidence. Revert the merge if release validation fails; no schema rollback is needed.

## Official references

- [Vercel Function request body limits](https://vercel.com/docs/functions/limitations#request-body-size)
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys) — dedupe retention is 24 hours, not indefinite.
- [Supabase new-table grant change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) — this PR creates no tables; permissions still need verification in the actual target project.
