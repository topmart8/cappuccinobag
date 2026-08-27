# BUILD 02-A.1 Diff Review

## Repository truth

| Item | Result |
|---|---|
| Source of Truth | Current main |
| Base SHA | `3a049088ba144e197de057f8dfb85f1d73dd35a9` |
| Baseline PRs | PR #32 merged; PR #33 merged |
| Branch | `codex/build-02-a1-reconcile-current-main` |
| Existing files modified | None |
| Route/API changes | None |
| Schema/migration changes | None |
| Production access | None |

## Changed files

| File | Classification | Purpose |
|---|---|---|
| `lib/crm/qualification.js` | `COVERAGE_COMPLETION` | Complete the ten-topic runtime view, conflict-first question and required handoff coverage |
| `lib/crm/hunter-qualification-profiles.js` | `KEEP_UNCHANGED` | Reapply four ICP profiles sharing one Hunter/qualification engine |
| `tests/crm-build-02-a1-qualification.test.mjs` | `COVERAGE_COMPLETION` | Add explicit ten-topic, state, evidence, question, Hunter and commercial-handoff coverage |
| `BUILD_02_A1_AI_SALES_QUALIFICATION.md` | `DOC_UPDATE_ONLY` | Update base, canonical reuse, SAFE-AUTO and deployment truth |
| `BUILD_02_A1_DIFF_REVIEW.md` | `DOC_UPDATE_ONLY` | Update reconciliation classifications and repository truth |
| `BUILD_02_A1_TEST_REPORT.md` | `DOC_UPDATE_ONLY` | Update new-main verification evidence |
| `HUNTER_QUALIFICATION_PROFILES.md` | `KEEP_UNCHANGED` | Preserve Hunter profile boundaries and shared-engine contract |

No file is classified `UPDATE_FOR_SAFE_AUTO` or `DROP`. The SAFE-AUTO file intersection remains zero.

## Reuse / duplication control

| Capability | Decision |
|---|---|
| CRM / customer and inquiry IDs | Keep current main; read-only passthrough |
| Lead Score | Keep `scoreLead()` and `score_override` authoritative |
| Shadow score | Reuse `evaluateLeadScoreShadow()` unchanged |
| Customer tier | Reuse `recommendCustomerPriority()`; qualification produces only rule input |
| Product taxonomy | Reuse `mapProductTaxonomy()` |
| Playbook registry | Reuse `getSalesPlaybook()` |
| Script Planner | Reuse `planSalesScript()` with confirmed facts only |
| P0 Requirement Gate | Reuse `validateRequirementConfirmationGate()` unchanged |
| NBA | Reuse `recommendNextBestAction()` |
| Follow-up | Reuse `recommendFollowUp()`; target remains `tasks` |
| Hunter-01/Padel-02/Eco-03/Hotel-04 | Configuration profiles, not separate engines or databases |

## Protected paths unchanged

- `app/api/**`
- `components/**`
- `lib/crm/scoring.js`
- `lib/crm/customer-intelligence.js`
- `lib/crm/product-taxonomy.js`
- `lib/crm/next-best-action.js`
- `lib/crm/sales-policy.js`
- `lib/crm/sales-playbooks.js`
- `lib/crm/script-library.js`
- `lib/crm/follow-up.js`
- `lib/crm/shared-ingest.js`
- `lib/crm/supabase.js`
- `lib/crm/whatsapp.js`
- `supabase/**`
- `.env.example`
- `proxy.js`

## Runtime safety scan

New runtime files contain no `fetch()`, Email/WhatsApp sender, Resend, Supabase helper, `process.env`, route object, SQL mutation or `follow_up_tasks` reference.

The qualification contract now covers product, quantity, target market, material, dimensions/specification, logo/customization, customer-supplied budget/target price, timeline, compliance and sample requirement. Existing facts are adapted into one canonical runtime view; no new persistence or parallel CRM contract is introduced.

The module is not imported by any API route. It cannot persist a qualification, create a task, send a draft or alter historical data.

Merged PR #33 remains authoritative for outbound runtime safety: customer Email defaults to `draft_only`, unattended Email and WhatsApp are hard-disabled, and WhatsApp delivery requires explicit `humanApproved` context. BUILD 02-A.1 has no outbound integration.

## Deployment truth

- Code-change database impact: none.
- Manual Production deploy action for this reconciliation: none.
- Current base status: merging PR #33 triggered an automatic Vercel Production deployment.
- Future risk: merging this PR to main may trigger Vercel Production automatically; merge remains unauthorized pending human review.

## Deferred work

Any future route adapter, CRM persistence, activity write, task creation, image-provider integration, WhatsApp adapter, schema proposal or historical backfill requires separate authorization. No migration is required for this application-layer slice.
