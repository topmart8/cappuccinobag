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

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Shared Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only database/storage access |
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

Configure the shared Supabase and Resend variables in the Novlane Vercel
project as documented in its `.env.example`. Never expose the service-role,
Meta, OpenAI or Resend secret through a `NEXT_PUBLIC_` variable.

## Roles and safety

- `admin`: sees all sites and can assign owners and view team configuration.
- `sales`: backend queries are owner-scoped and assignment changes are blocked.
- Basic authentication is the deployment-safe bootstrap login.
- `profiles` and RLS are ready for Supabase Auth invitations when multi-user
  identity management is enabled.
- Receipt confirmations may send automatically only for low-risk inquiries.
- Price, quotation, PI, payment, bank details, contract, complaints,
  compensation, shipping cost and final delivery-date content always requires
  a person to review and press the send action.
- Facebook support means recording lawful public source URLs or imported
  public/business data. The application does not scrape private Facebook data.

## Deployment checklist

1. Apply both migrations to the shared Supabase project.
2. Add the environment variables to both Vercel projects.
3. Deploy both `main` branches.
4. Open `/crm` with the admin bootstrap login.
5. Submit Cappuccino `/inquiry/` and Novlane `/rfq` plus `/contact`.
6. Verify `site`, attribution, product category, receipt confirmation and
   private attachment metadata in the CRM.
7. Open both WhatsApp buttons and confirm their prefilled text includes source
   page and a brand/product source code.
8. Generate email and WhatsApp drafts, confirming no message sends without
   explicit human approval.
