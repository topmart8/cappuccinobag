# Cappuccino Bag SEO Automation

## Scope and safety

This system only manages `topmart8/cappuccinobag`. Phase one is permanently conservative:

- `AUTOMATION_MODE=draft_only`
- no automatic merge to `main`
- no automatic page publishing
- no automatic internal-link insertion
- no automatic image generation or publication
- `manual_review` content cannot publish
- public inquiry email is `info@cappuccinobag.net`
- prices, final MOQ, sample fees, lead times, certifications, payment, contracts and compensation require a person

## Architecture

The existing site is a Next.js App Router application with React data-driven Padel and Running templates plus legacy HTML under `public/`. The automation scanner inventories both static HTML and the repository page structure. Operations live under `automation/`:

- `config/`: site identity, brand facts, prohibited claims, keyword and publishing rules
- `keywords/`: normalization, deduplication, intent, buyer stage, category, page type, scoring and cannibalization
- `content/`: structured briefs and safe page drafts
- `review/`: factual, SEO, buyer-value, brand, language, duplication and hallucination review
- `internal-links/`: page index, broken/orphan detection, recommendations and anchor checks
- `images/`: image jobs, prompts, naming, alt text, validation and WebP conversion
- `analytics/`: low-CTR and content-decay analysis
- `lib/`: protected OpenAI and Supabase clients plus environment gates
- `scan.js`: repository inventory and reports
- `cli.js`: script entry point

The admin UI is integrated into the existing protected CRM at `/crm/seo`. API routes under `/api/seo` use the same Basic Auth proxy and require the admin role.

## Database

Migration: `supabase/migrations/20260730_cappuccinobag_seo_automation.sql`.

It adds `seo_keywords`, `seo_keyword_clusters`, `seo_pages`, `content_tasks`, `content_reviews`, `internal_link_suggestions`, `image_jobs`, `publishing_runs`, and `analytics_page_performance`. All records are constrained to `site = cappuccinobag`. Tables have relevant unique constraints and indexes, RLS is enabled, authenticated access requires the existing `crm_is_admin()` function, and the service role is reserved for protected server jobs.

The migration is additive: it does not delete or truncate CRM data.

## Environment variables

Copy names from `.env.example`; never commit real values. Required for the application are the existing CRM credentials. SEO features safely degrade:

- no OpenAI key: deterministic briefs, drafts and rule-based reviews still work
- no Supabase credentials: local reports and fixtures still work
- no GSC credentials: JSON/CSV export import remains available
- no image service: prompt and image-task generation still work
- no GitHub token: local generation and checks still work

The OpenAI client is server-only, rate-limited, retried, timed out, idempotent and JSON-schema based. It rejects input containing bank, payment, password, key or token signals before transmission.

## Local operation

Use the repository's Node/npm environment:

```bash
npm install
npm run automation:scan
npm run automation:briefs
npm run test
npm run lint
npm run typecheck
npm run build
```

Keyword CSV headers may include `keyword`, `query` or `search term`, plus optional volume, difficulty, CPC, language and country fields:

```bash
npm run automation:keywords -- --input ./keywords.csv
```

## Search Console

For phase one, export GSC rows and POST a JSON body to the protected `/api/seo/analytics` route:

```json
{
  "rows": [
    {
      "url": "https://www.cappuccinobag.com/custom-padel-bag-manufacturer/",
      "date": "2026-07-30",
      "clicks": 12,
      "impressions": 900,
      "average_position": 11.2,
      "previous_clicks": 20
    }
  ]
}
```

The weekly workflow has placeholders for GSC service-account secrets. Direct API acquisition should only be enabled after the property grants the service account read access.

## Content lifecycle

1. Import a keyword.
2. Normalize, deduplicate, classify and score it.
3. Compare it with existing pages and flag cannibalization.
4. Human approves the keyword direction.
5. Generate a structured brief and page draft.
6. Run all seven reviews.
7. Generate internal-link suggestions and image jobs.
8. Human reviews claims, copy, links and imagery.
9. Convert an approved task into a feature-branch draft PR.
10. Review the Vercel Preview.
11. A person merges `main`.
12. Verify the production URL and import performance data.

Generated page data is `noindex, nofollow` and `manual_review` until a human-approved publishing task converts it to the existing page/template structure.

## GitHub Actions

Seven workflows separate weekly keyword research, briefs, manual content generation, daily link and SEO audits, manual content PRs, and weekly analytics. Workflows use GitHub Secrets, never push directly to `main`, never merge, and never publish. `content-pr.yml` only runs when its explicit `approval_status` input is `approved`, opens a draft PR, and leaves Vercel Preview review to a person.

## Vercel Preview and production verification

After a branch is pushed and a PR is opened, the repository's connected Vercel project should attach a Preview URL to the PR. Verify:

- HTTP 200 and canonical host/path
- title, description, one H1, robots and JSON-LD
- responsive images and valid alt text
- RFQ, Factory Proof, Contact and WhatsApp paths
- no unsupported claims or wrong email
- no `published` status before merge

The repository does not contain a `.vercel/project.json`; project linkage and Preview environment variables must be confirmed in Vercel.

## Rollback

Do not reset or force-push. Close the draft PR or revert its commit in a new PR. The migration is additive; disable scheduled workflows first if needed. Avoid dropping SEO tables until data is exported and an owner explicitly approves removal.

## Troubleshooting

- `Supabase is not configured`: add server-only URL/service-role variables to the protected environment.
- empty admin data: run `automation:briefs` for local fixtures or apply the migration and configure Supabase.
- OpenAI fallback: validate the key/model, but deterministic generation remains available.
- build failure: run `npm run typecheck`, `npm run lint`, then the failing focused test.
- Preview missing: confirm the GitHub repository is connected to Vercel and Preview deployments are enabled.
