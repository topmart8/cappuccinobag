# BUILD 02-A.1 Test Report

Date: 2026-08-27

Base: `origin/main@3a049088ba144e197de057f8dfb85f1d73dd35a9`

Baseline includes merged PR #32 and PR #33. PR #33 is the authoritative SAFE-AUTO hard-disable.

## Targeted qualification tests

Result: 32/32 PASS.

| Required case | Result |
|---|---|
| A. Known facts are not asked again | PASS |
| B. Unknown facts remain unknown | PASS |
| C. Inference is not promoted to fact | PASS |
| D. Image result maps without claiming certainty/capability | PASS |
| E. Quantity changes qualification recommendation | PASS |
| F. First order alone does not determine strategic tier | PASS |
| G. Strong verified brand + channel raises strategic recommendation | PASS |
| H. Low quantity + strategic evidence is not automatically D | PASS |
| I. Price-only / low evidence is downgraded | PASS |
| J. S/A_PLUS triggers human handoff | PASS |
| K. High-value low-confidence evidence triggers review | PASS |
| L. Product-specific question selection | PASS |
| M. Existing `scoreLead` and `score_override` authoritative | PASS |
| N. Existing shadow score reused unchanged | PASS |
| O. P0 Requirement Gate authoritative | PASS |
| P. Existing Follow-up recommendation remains task-only | PASS |
| Q. No outbound/persistence dependency | PASS |
| R. Hunter profiles reuse one common engine | PASS |
| S. Customer ID/source/UTM/Alibaba context untouched | PASS |

Additional tests cover Company Policy precedence, grounded script behavior, commercial-commitment exclusion, human override and image-feature question deduplication.

Coverage-completion tests explicitly verify all ten canonical topics, UNKNOWN/INFERRED/CUSTOMER_CONFIRMED/HUMAN_CONFIRMED/CONFLICTED handling, evidence and confidence retention, human-confirmed priority, conflict-first and one-question behavior, inferred Hunter hypotheses, and human-only commercial/risk handoff boundaries.

## Compatibility and regression

| Check | Result |
|---|---|
| SAFE-AUTO focused compatibility | 39/39 PASS |
| P0 + P1A focused compatibility | 34/34 PASS |
| Full regression | 148/148 PASS |
| Lint | PASS, zero warnings |
| Typecheck / Next route generation | PASS |
| Next production build | PASS |
| Static pages | 222/222 |

## Final repository checks

The final pre-PR verification additionally passed `git diff --check`, protected-path comparison and outbound/persistence scanning. No Production database or customer outbound system was used by these tests, and no manual deployment was performed.

The current main baseline was automatically deployed to the Vercel Production environment when PR #33 merged. This reconciliation has not been merged or deployed; merging it later may trigger the same automatic integration.
