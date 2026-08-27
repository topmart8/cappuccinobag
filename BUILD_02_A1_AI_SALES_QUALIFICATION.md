# BUILD 02-A.1 — AI Sales Qualification

Date: 2026-08-27

System: Cappuccino AI Growth & Sales OS

Base: `origin/main@3a049088ba144e197de057f8dfb85f1d73dd35a9`

Baseline: PR #32 and PR #33 are merged. PR #33 hard-disables `safe_auto` customer Email and WhatsApp execution.

Mode: application-layer, recommendation-only

## Objective

BUILD 02-A.1 converts structured inbound facts into a reviewable qualification result without creating another CRM, Lead Score, tier engine, follow-up engine, playbook engine or task system.

The implemented flow is:

`Structured facts / image-analysis result → qualification recommendation → existing customer priority → existing score context → existing NBA/playbook/script/follow-up → human handoff recommendation`

No adapter is connected to a route in this build.

This is the logical Unified Lead Contract for `Traffic / Hunter / Inbound → Qualification → Evidence / Missing Fields → One Next Safe Question → Human Handoff → existing CRM / Sales Brain`. It adapts existing records in memory and does not create another lead table or customer database.

## Input contract

Every qualification field is normalized to:

```json
{
  "field": "estimated_quantity",
  "value": 1200,
  "status": "FACT",
  "source": "website_inquiry",
  "confidence": 1,
  "evidence": [{ "value": "Buyer supplied quantity", "source": "website_inquiry" }]
}
```

The existing compatibility statuses remain `FACT`, `INFERRED` and `UNKNOWN`. The same fact envelope now exposes one canonical qualification state: `UNKNOWN`, `INFERRED`, `CUSTOMER_CONFIRMED`, `HUMAN_CONFIRMED` or `CONFLICTED`. Customer/human confirmation projects to legacy `FACT`; this is a compatibility view, not a second state engine.

- Untyped raw values are not silently promoted to facts.
- Inferred values retain their status and reduced scoring weight.
- Only confirmed facts are passed into evidence-sensitive customer tier recommendations and grounded scripts.
- Unknown values remain `UNKNOWN`.
- Human-confirmed values outrank customer-confirmed and inferred aliases. Explicit conflicts remain `CONFLICTED`, trigger human handoff and are never promoted to fact.

Supported source labels are website inquiry, Alibaba inquiry, manual CRM entry, email-derived structured facts, future WhatsApp adapter, image-analysis result and conversation summary.

The preserved contract represents customer-confirmed and human-confirmed information as `FACT` with explicit source, confidence and evidence. It does not add a second confirmation state machine. Conflicting evidence is retained in the handoff input and cannot be auto-confirmed.

## Canonical field reuse

| Classification | Logical fields |
|---|---|
| `EXISTING_FIELD` | customer/inquiry IDs, identity, source, UTM, product/category, owner and stage |
| `EXISTING_METADATA` | Alibaba reference, activities context and existing structured inquiry facts |
| `DERIVED` | qualification components/band, missing facts, next question, handoff and Hunter profile recommendation |
| `RUNTIME_ONLY` | evidence/confidence envelope, image input contract and safety/integration targets |
| `FUTURE_SCHEMA_REQUIRED` | None for BUILD 02-A.1 |

The canonical runtime topics are product, quantity, target market, material, dimensions/specification, logo/customization, customer-supplied budget/target price, timeline, compliance and sample requirement. Each retains value, state, source/evidence and confidence without persistence.

## Qualification output

`qualifySalesOpportunity()` returns:

- normalized facts and evidence;
- image qualification contract, when supplied;
- existing Product Taxonomy mapping;
- `qualification_score`, band, component scores, confidence and missing critical facts;
- existing `scoreLead()` output as operational truth;
- existing shadow score with `mode=shadow_only`;
- existing Customer Intelligence priority recommendation and human override behavior;
- existing Sales Playbook and Script Planner context;
- existing P0 Requirement Gate output;
- existing Next Best Action output;
- one next qualification question;
- existing Follow-up recommendation targeting `tasks`;
- human handoff recommendation;
- read-only source/ID/UTM/Alibaba passthrough context;
- explicit outbound/persistence/migration safety state.

The qualification score is never written to the CRM and never replaces `scoreLead` or `score_override`.

## Image qualification

The image contract accepts precomputed analysis only. It does not call an image API.

Image-derived product, feature, material, compartment, hardware and customization observations remain `INFERRED`. The contract sets `capability_commitment=false`. A likely image mapping may guide the next missing question, but it cannot produce “Yes, we can make this bag.”

## Next-question behavior

The engine selects one question with `DRAFT_HUMAN_APPROVAL`:

1. resolve an explicit conflict first;
2. select one missing canonical topic by commercial usefulness;
3. continue with company, buyer, OEM/ODM and stage context;
4. select the minimum product-specific missing fact.

Known FACT or visibly inferred image structure is not asked again. Product-specific rules cover Racket Sports, Team Sports, Leather and Travel.

## Human handoff

Human handoff is recommended for S/A_PLUS, strategic or million-dollar potential, verified strong brand/group, high-value opportunity, low-confidence high-value evidence, conflicting evidence, risk, quotation stage, customer target-price review, commercial decisions, Company Policy exceptions and complaints.

The output contains `handoff_required`, reasons, owner, priority, due date and a grounded human summary. It does not create a task or send a message.

## Shared components

The build imports and reuses:

- Customer Intelligence and human tier override;
- Product Taxonomy;
- `scoreLead`, `score_override` and shadow score;
- Sales Playbooks;
- Script Planner;
- Requirement Confirmation Gate;
- Next Best Action;
- Follow-up recommendation and canonical `tasks` target;
- Company Policy.

Activities, tasks, drafts and CRM authorization are declared only as future integration targets. This build performs no persistence.

Future Product Intelligence may supply Product × ICP context upstream of Hunter and this contract. It must continue to reuse the existing Product Taxonomy; BUILD 02-A.1 adds no catalog, taxonomy or Product Intelligence runtime.

## Safety result

- Automated Email/WhatsApp: disabled in the new module.
- Customer reply: not implemented.
- Quotation, price, MOQ, payment, lead-time, compliance and logistics commitments: not implemented.
- Database/schema/migration/backfill: none.
- Production data/write/manual deploy from this branch: none.
- `safe_auto`: hard-disabled by merged PR #33; this build contains no sender and cannot weaken that boundary.
- Deployment truth: PR #33 merge triggered the connected Vercel Production deployment automatically. A future merge of this build may trigger the same integration and requires separate human authorization.
