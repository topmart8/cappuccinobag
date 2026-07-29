# SEO Automation Setup Checklist

## Repository and deployment

- [ ] Confirm repository is `topmart8/cappuccinobag`
- [ ] Confirm production branch is `main`
- [ ] Confirm GitHub is connected to the Cappuccino Bag Vercel project
- [ ] Confirm Vercel creates Preview deployments for pull requests
- [ ] Protect `main` and require checks/review

## Supabase

- [ ] Back up the current project
- [ ] Review and apply `20260730_cappuccinobag_seo_automation.sql`
- [ ] Confirm all 9 tables exist
- [ ] Confirm indexes and RLS policies exist
- [ ] Confirm only active CRM admins can access SEO tables
- [ ] Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only to server/Actions/Vercel secrets
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and anon key only if an existing public feature needs them

## AI and analytics

- [ ] Add `OPENAI_API_KEY` to protected environments
- [ ] Set and test `OPENAI_MODEL`
- [ ] Create a Google service account with read-only Search Console access
- [ ] Add GSC client email/private key as secrets
- [ ] Set the exact property URL `https://www.cappuccinobag.com/`
- [ ] Add `GA4_PROPERTY_ID` if GA4 import is enabled later

## GitHub Actions

- [ ] Add Supabase, OpenAI and GSC secrets
- [ ] Keep `AUTOMATION_MODE=draft_only`
- [ ] Keep all five auto-action flags `false`
- [ ] Run each workflow once with `workflow_dispatch`
- [ ] Confirm no workflow pushes or merges `main`
- [ ] Confirm content PRs are drafts

## Admin and operations

- [ ] Configure CRM admin username/password
- [ ] Confirm sales users cannot access SEO admin pages/APIs
- [ ] Run `npm run automation:scan`
- [ ] Review the 13 initial reports
- [ ] Run `npm run automation:briefs`
- [ ] Review the 10 initial test tasks
- [ ] Confirm all initial tasks are `manual_review`
- [ ] Approve the first real keyword cluster manually

## Release checks

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm run test:seo`
- [ ] `npm run test:links`
- [ ] `npm run test:images`
- [ ] `npm run test:email`
- [ ] Search the diff for secrets, Novlane content, wrong emails and unsupported claims
