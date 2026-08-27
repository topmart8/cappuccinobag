# PR #11 Selective Port Matrix

PR: `#11 Complete CRM Phase 4A canonical ingest and identity safeguards`

Head: `1c37649fc6c34d4649a0ef0cba0dc12516f8dbe5`

Merge base: `293f22f33c3e6e5f0ba1a7e71f2add4c207a88a8`

Relative to current main: 4 PR-only commits; current main has 51 later commits.

This is an audit matrix only. No PR #11 code or migration was ported in this reconciliation.

## File matrix

| PR #11 file | Classification | Reason / future handling |
|---|---|---|
| `.env.example` | PORT_FROM_PR11 | Port key names only: project-ref guard, prospect-check secret and automated-email global false; never port secret values |
| `.gitignore` | PORT_FROM_PR11 | `supabase/.temp/` ignore is isolated and safe |
| `app/api/crm/export/route.js` | PORT_FROM_PR11 | Identity/suppression columns are useful only after an approved schema phase |
| `app/api/crm/imports/route.js` | CONFLICT | Identity resolver is useful, but current route and import behavior win; re-implement calls after canonical resolver exists |
| `app/api/crm/inquiries/[id]/attachments/route.js` | PORT_FROM_PR11 | Owner-scoped, short-lived signed attachment access is portable after path/auth review |
| `app/api/crm/intake/route.js` | DO_NOT_PORT | Creates a duplicate alias for the canonical shared intake |
| `app/api/crm/leads/[id]/route.js` | CONFLICT | PR version predates and would remove the P0 Requirement Gate; current main wins completely, with suppression guards added later by hand |
| `app/api/crm/leads/route.js` | PORT_FROM_PR11 | Resolver-based manual-lead dedupe is portable as a selective edit |
| `app/api/inquiries/route.js` | CONFLICT | Current RFQ behavior wins; PR broadens risky file types and depends on pending identity schema |
| `app/api/shared-crm/inquiries/route.js` | CONFLICT | PR removes the Novlane-only guard and changes route semantics; current main wins |
| `app/api/shared-crm/prospect-check/route.js` | PORT_FROM_PR11 | Prospect eligibility endpoint is useful after identity port; replace process-local rate limit and preserve strict server auth |
| `app/crm/inquiries/[id]/page.js` | PORT_FROM_PR11 | Identity status display is portable after schema/API support |
| `app/crm/leads/[id]/page.js` | PORT_FROM_PR11 | Relationship/suppression visibility is useful after identity support |
| `components/LeadDetailActions.jsx` | PORT_FROM_PR11 | Admin review controls may be ported only after route-level P0 Gate preservation tests |
| `docs/lead-crm.md` | SUPERSEDED | Reconcile into Revenue OS canonical docs rather than replacing current documentation |
| `lib/crm/identity.js` | PORT_FROM_PR11 | Normalization, candidate construction and classification are the main portable identity core |
| `lib/crm/importer.js` | PORT_FROM_PR11 | Additional normalized identity inputs are portable with current importer retained |
| `lib/crm/shared-ingest.js` | CONFLICT | Identity status and global delivery gate are useful; old safe-auto and workflow changes must not replace current main wholesale |
| `lib/crm/supabase.js` | PORT_FROM_PR11 | Project-ref guard, resolver, suppression lookup, outbound eligibility and signed URL helpers are portable as reviewed functions, not as a whole-file replacement |
| `proxy.js` | DO_NOT_PORT | Its bypass exists only for the duplicate `/api/crm/intake` route |
| `supabase/migrations/20260809093510_align_cappuccino_site_source_constraint.sql` | DO_NOT_PORT | Migration forbidden; validation may fail against unknown Production history |
| `supabase/migrations/20260809164921_crm_identity_suppression.sql` | DO_NOT_PORT | Migration forbidden; schema, grants, RLS, advisory locks and existing-data compatibility need a separate approval/audit |
| `supabase/migrations/20260810010341_harden_crm_attachments.sql` | DO_NOT_PORT | Migration forbidden; allowed MIME list and bucket state require separate security review |
| `supabase/migrations/20260810010716_index_crm_identity_foreign_keys.sql` | DO_NOT_PORT | Migration forbidden; indexes are future schema work only |
| `tests/crm-phase-4a.test.mjs` | PORT_FROM_PR11 | Portable contract/security tests after adapting paths to current main |
| `tests/crm.test.mjs` | CONFLICT | Extract identity assertions only; preserve current P0 and route tests |
| `tests/shared-crm-ingest.test.mjs` | CONFLICT | Extract idempotency/identity/global-disable assertions; do not restore old route or safe-auto expectations |

## Portable component summary

1. Pure identity normalization and candidate construction.
2. Canonical resolver contract with conservative company-only duplicate review.
3. Suppression and do-not-prospect semantics.
4. Existing-customer/no-outreach classification.
5. Supabase project-ref mismatch guard.
6. Global automated-email disabled-by-default guard, to be hardened to code-level draft-only.
7. Owner-scoped signed attachment URLs.
8. Prospect eligibility preflight.
9. Identity/idempotency/security tests adapted to current main.

## Conflicts that current main must win

- P0 Requirement Confirmation Gate and opportunity-specific confirmation.
- Current lead update route.
- Current RFQ route and accepted attachment contract.
- Current shared Novlane intake guard.
- Existing Lead Score.
- Existing Sales Policy and reconciled P1A modules.
- Existing follow-up/task ownership.
- Current routes and later website/Padel work.
- Draft-only outbound target state.

## Supabase/security notes

- The resolver function is `SECURITY INVOKER` and PR #11 revokes execute from `public`, `anon` and `authenticated`, granting it only to `service_role`; this is directionally sound.
- `crm_suppressions` enables RLS and restricts its admin policy through `crm_is_admin()`.
- Live Production schema, row compatibility and applied migration history remain UNKNOWN.
- New Data API exposure behavior, function grants, RLS, storage policies and `SECURITY DEFINER` dependencies must be verified in a future isolated schema review.
- No historical backfill may be added implicitly; normalized fields for existing records require an explicit compatibility strategy.

## Result

PR #11 is a semantic source, not a merge candidate. The next authorized port should begin with pure `identity.js` plus tests, then adapt server helpers and routes one capability at a time. Migrations remain out of scope.
