# P1A Reconciliation Diff Review

## Source status

The source worktree is `/Users/tonia/Documents/New project/cappuccinobag-ai-sales-brain-v2-p0` on local branch `codex/ai-sales-brain-v2-p1a`. Its P1A changes were uncommitted and were not merged, cherry-picked or copied as a branch history unit.

Only reviewed application-layer modules and focused tests were reconstructed on current main.

## Capability decisions

| Capability | Source decision | Final behavior |
|---|---|---|
| Sales Playbook | PORT SELECTIVELY | Upgrade the one main registry; four families, sixteen scenarios |
| Customer Tier recommendation | PORT | Evidence-backed, recommendation-only |
| Million-Dollar recommendation | PORT | Cannot recommend S without evidence |
| Strategic Account recommendation | PORT | Recommendation-only; human override wins |
| Strategic Value × Closing Urgency | PORT | Pure derived recommendation |
| Existing Lead Score | KEEP_MAIN | `scoreLead()` and `score_override` remain authoritative |
| Shadow Lead Score | PORT | `mode=shadow_only`; no score write |
| Follow-up | PORT | Pure recommendation to existing `tasks`; no second table |
| Script Planner | PORT | Draft-only; verified facts only |
| Next Best Action | MERGE_LOGIC | Main output contract retained; Company Policy check added |
| Payment/production checks | PORT AS POLICY GUARDS | Pure validation only; no workflow or commitment |
| DDP | HARDEN DURING PORT | Always `HUMAN_ONLY`, including after logistics validation |
| Confidential information | PORT | Public use blocked unless anonymized or human-approved |
| Human-reviewed drafts | PORT | No sender; no route integration |

## P0 compatibility

- The original six P0 scenarios remain present.
- The fixed `24 playbooks / version 1.0.0 / null script` test was replaced by a compatibility assertion because the authorized reconciliation intentionally upgrades that registry.
- Requirement Confirmation remains the existing P0 implementation.
- Historical quoted records remain compatible.
- Opportunity-specific confirmations cannot reuse another opportunity's confirmation.
- The lead update route continues to enforce the existing gate.

## Not ported from the dirty P1A worktree

- Nine P1A planning/audit Markdown files.
- Any Git index or worktree state.
- Any route, API, UI or persistence integration.
- Any migration or database proposal.
- Any environment or outbound configuration.
- Any automatic execution behavior.

## No-duplication evidence

- One `scoreLead()` remains.
- One Sales Playbook registry remains.
- Follow-up declares `FOLLOW_UP_TASK_TARGET = "tasks"` and does not reference `follow_up_tasks`.
- Script Planner imports the existing playbook and policy modules.
- No new customer, inquiry, task, CRM or taxonomy persistence system was added.

## Safety evidence

Static scan of the reconciled modules found no:

- `fetch()`
- `sendCloudMessage`
- `sendEmail`
- `resend()`
- `supabaseRequest`
- route handler
- Production environment access

All external-facing text remains a recommendation or draft requiring human review.

## Tests

- Targeted: 34/34 PASS.
- Full regression: 109/109 PASS.
- Lint/type/build/diff check: PASS.
