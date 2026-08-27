# LeadFlow multi-site CRM

## Architecture

The CRM is intentionally hosted inside the Cappuccino Bag Next.js App Router
application under the protected `/crm` and `/api/crm` routes. This avoids a
third deployment, keeps the existing public sites unchanged, and gives both
brands one canonical backend.

- `www.cappuccinobag.com`: public Cappuccino pages, RFQ API, CRM UI, Meta
  WhatsApp webhook and shared scheduled follow-up endpoint.
- `www.novlane.com`: public Novlane pages and RFQ/contact/project-builder APIs.
  These write to the same Supabase project with `site = 'novlane'`.
- Supabase: canonical lead, inquiry, activity, task, draft and import store.
- Resend: internal inquiry notification and safe receipt confirmation only.
- OpenAI: optional reply drafting. A deterministic rules fallback is used when
  the API is not configured or unavailable.
- Meta Cloud API: optional inbound WhatsApp webhook. Outbound WhatsApp remains
  `draft_only` unless a person explicitly approves a message.

The public inquiry mailbox remains `info@cappuccinobag.net`.

## Database migration order

Run these files in the Supabase SQL editor in order:

1. `supabase/migrations/20260728_unified_crm.sql`
2. `supabase/migrations/20260730_lead_crm_v2.sql`
3. `supabase/migrations/20260730_google_analytics.sql`

The v2 migration is additive. It adds:

- extended `customers` fields for company research and sales ownership;
- extended attribution fields on `inquiries`;
- `profiles` with `admin` and `sales` roles;
- `activities`, `tasks`, `email_drafts`, `whatsapp_drafts`;
- `imports` and `import_rows`;
- lookup and follow-up indexes;
- authenticated RLS helpers and service-role policies;
- a private `crm-attachments` read policy scoped by role/site.

Production does not seed fake companies. `/crm?demo=1` displays in-code,
clearly marked examples and never writes them to Supabase.

## Environment variables

Configure these in the Cappuccino Vercel project:

The authenticated cross-site endpoint is `POST /api/crm/intake`. The legacy
`POST /api/shared-crm/inquiries` path remains as a compatibility alias.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Server-only shared Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_URL` | compatibility only | Legacy fallback; server ingest prefers `SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only database/storage access |
| `SHARED_CRM_INGEST_SECRET` | yes for cross-site ingest | Server-only bearer secret for the shared ingest route |
| `CRM_PROSPECT_CHECK_SECRET` | future outbound only | Server-only bearer secret for the pre-outreach eligibility endpoint; may fall back to the shared ingest secret |
| `CRM_EXPECTED_SUPABASE_PROJECT_REF` | recommended | Server-only guard that rejects writes when `SUPABASE_URL` points at an unexpected project |
| `CRM_AUTOMATED_EMAIL_ENABLED` | yes | Keep `false` throughout Phase 4A; only a separately authorized email rollout may set it to `true` |
| `SUPABASE_STORAGE_BUCKET` | yes | Private attachment bucket, normally `crm-attachments` |
| `CRM_ADMIN_USER` / `CRM_ADMIN_PASSWORD` | yes | Initial admin login |
| `CRM_SALES_USER` / `CRM_SALES_PASSWORD` | optional | Initial sales login |
| `CRM_DEFAULT_OWNER` | optional | Default unassigned queue owner |
| `RESEND_API_KEY` | recommended | Email delivery |
| `INQUIRY_FROM_EMAIL` | recommended | Verified Resend sender |
| `INQUIRY_TO_EMAIL` | yes | Set to `info@cappuccinobag.net` |
| `OPENAI_API_KEY` / `OPENAI_SALES_MODEL` | optional | AI draft generation |
| `WHATSAPP_*` / `META_APP_SECRET` | optional | Meta Cloud API webhook |
| `CRON_SECRET` | recommended | Scheduled follow-up endpoint |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | analytics | Google Cloud service-account email |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | analytics | Server-only private key; preserve newlines or use escaped `\n` |
| `GSC_CAPPUCCINO_PROPERTY` | analytics | Exact Cappuccino Search Console property, URL-prefix or `sc-domain:` |
| `GSC_NOVLANE_PROPERTY` | analytics | Exact Novlane Search Console property, URL-prefix or `sc-domain:` |
| `GA4_CAPPUCCINO_PROPERTY_ID` | analytics | Numeric Cappuccino GA4 property ID |
| `GA4_NOVLANE_PROPERTY_ID` | analytics | Numeric Novlane GA4 property ID |

Configure the shared Supabase and Resend variables in the Novlane Vercel
project as documented in its `.env.example`. Never expose the service-role,
Meta, OpenAI or Resend secret through a `NEXT_PUBLIC_` variable.

## Roles and safety

- `admin`: sees all sites and can assign owners and view team configuration.
- `sales`: backend queries are owner-scoped and assignment changes are blocked.
- Basic authentication is the deployment-safe bootstrap login.
- `profiles` and RLS are ready for Supabase Auth invitations when multi-user
  identity management is enabled.
- Phase 4A creates review tasks and drafts but never sends email while
  `CRM_AUTOMATED_EMAIL_ENABLED=false`.
- Price, quotation, PI, payment, bank details, contract, complaints,
  compensation, shipping cost and final delivery-date content always requires
  a person to review and press the send action.
- Facebook support means recording lawful public source URLs or imported
  public/business data. The application does not scrape private Facebook data.

## Phase 4A Production readiness checklist

Do not apply these steps without separate Production authorization.

1. Confirm the target Supabase project ref and pre-change counts.
2. Apply, in order, the shared-ingest contract migration, Data API hardening,
   Cappuccino alignment correction, `crm_identity_suppression`, then
   `harden_crm_attachments` and `index_crm_identity_foreign_keys`.
3. Confirm the existing rows are unchanged and the new identity columns remain
   nullable on historical records; no backfill is required.
4. Confirm `crm_suppressions` has RLS enabled, anonymous access revoked, admin
   management policy present, and service-role select/insert/update access.
5. Configure server-only Vercel variables in Preview first:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`,
   `SHARED_CRM_INGEST_SECRET`, `CRM_EXPECTED_SUPABASE_PROJECT_REF`,
   `INQUIRY_TO_EMAIL`, and `CRM_AUTOMATED_EMAIL_ENABLED=false`.
6. Confirm no secret uses a `NEXT_PUBLIC_` prefix and that both sites point to
   the same Supabase project.
   The Novlane server must call the Cappuccino Preview URL ending in
   `/api/crm/intake`, send `site_source=novlane`, and use the same
   `SHARED_CRM_INGEST_SECRET`; never expose that secret to browser JavaScript.
7. Run separately authorized Cappuccino and Novlane canaries using unique
   `submission_id` values; retry each ID once and confirm one inquiry per ID.
8. Verify `site_source`, `brand`, customer identity link, attribution,
   identity classification, activity, review task, draft and `email_status`.
9. Verify a manual email/domain suppression produces `blocked`, an urgent
   review task, no email draft and no automated delivery.
10. Confirm `CRM_AUTOMATED_EMAIL_ENABLED=false`, Production counts after
    cleanup, and no unrelated deployment or branch merge occurred.

Before future Snov.io outreach, call the CRM outbound-eligibility check first.
Snov.io remains discovery/enrichment/outreach infrastructure only; Supabase CRM
is the source of truth. Existing/old customers, blocked or duplicate contacts,
suppliers, previous inquiries and active opportunities must be skipped.

## Google Search Console and GA4

`/crm/analytics` reads only server-side aggregate tables. Google credentials
are never serialized into React props, browser JavaScript or a
`NEXT_PUBLIC_` variable.

1. In Google Cloud, enable **Google Search Console API** and
   **Google Analytics Data API**.
2. Create a service account and private key.
3. Add the service-account email as a user on both Search Console properties
   with read access.
4. Add the same email to both GA4 properties with the Viewer role.
5. Set the six `GOOGLE_*`, `GSC_*` and `GA4_*` variables in the Cappuccino
   Vercel project. The Novlane frontend does not need the Google private key.
6. Execute `20260730_google_analytics.sql`.
7. Redeploy Cappuccino, sign in as an admin, open `/crm/analytics`, and press
   **立即同步 Google 数据**.

Vercel calls `/api/cron/analytics` daily at 08:15 UTC. The endpoint requires
the Vercel-provided `Authorization: Bearer <CRON_SECRET>` header. GSC is read
with `dataState = final` and a three-day reporting delay so incomplete search
data is not mixed into conversion reporting. The dashboard supports 7, 28 and
90-day site comparisons, weighted average position, top queries/pages, GA4
sessions, CRM inquiry totals and inquiry-per-session conversion rate.
