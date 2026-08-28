# BUILD 02-C — WhatsApp Unified Qualification Adapter

## Scope

BUILD 02-C reuses the existing WhatsApp webhook, parser, customer identity, inquiry, conversation and message storage. The new adapter reads inbound messages already associated with the current inquiry and passes conservative evidence into the existing `qualifySalesOpportunity()` engine.

The CRM inquiry page computes the result at read time. Nothing is written by the adapter.

## Evidence boundary

- Direct customer WhatsApp statements may become `CUSTOMER_CONFIRMED`.
- Conflicting statements in the same inquiry remain `CONFLICTED` and trigger human handoff.
- CRM country, company and product context never become confirmed requirements.
- Phone country code and system defaults are not requirement evidence.
- Missing values remain `UNKNOWN`.
- Media qualification is deferred; no image or vision pipeline is added.

## Reuse and safety

- Existing `scoreLead()` and `score_override` remain operational truth.
- Shadow score remains `shadow_only`.
- Existing Customer Intelligence, Requirement Gate, Sales Policy, Sales Playbooks, Script Planner, Next Best Action, Follow-up recommendation and Human Handoff are reused.
- The adapter recommends one next safe question and never sends it.
- `safe_auto` remains hard-disabled.
- Existing explicitly `humanApproved` WhatsApp delivery remains unchanged.
- `tasks` remains canonical, but BUILD 02-C writes no task.
- Legacy `follow_up_tasks` is not referenced or extended.
- No schema, migration, qualification snapshot, analytics event or Production write is added.

## Deferred

Email, Alibaba, Hunter, Product Intelligence, Sales Command Center, Revenue Learning and media intelligence remain unconnected.
