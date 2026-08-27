# Hunter Qualification Profiles

Hunter specialization in BUILD 02-A.1 is configuration over one qualification engine. Profiles do not own CRM records, customer IDs, scores, tasks, activities, drafts, playbooks, follow-up or outbound delivery.

Every profile shares:

- Customer Intelligence;
- existing Lead Score and shadow score;
- `qualifySalesOpportunity()`;
- canonical CRM and Product Taxonomy;
- canonical `tasks` target;
- Next Best Action;
- Human Approval;
- Company Policy.

## Hunter-01 — Outdoor / Travel / Sports

- ICP: outdoor, travel and sports brands; specialist retailers/distributors; OEM/ODM repeat programs.
- Preferred families: Travel, Racket Sports and Team Sports.
- Priority questions: family, quantity, OEM/ODM, target market and development stage.
- Positive signals: clear product brief, retail channel, sample interest and repeat program.
- Negative signals: personal purchase, price-only behavior and no validated business need.
- Recommended existing playbooks: `MEN_TRAVEL`, `PAD`, `BASE`.

## Padel-02 — Padel / Pickleball / Tennis

- ICP: racket-sport brands, retailers, clubs, academies and distributors.
- Preferred family: Racket Sports.
- Priority questions: racket type/capacity, shoe compartment, quantity and branding.
- Positive signals: club/retail channel, team branding, sample interest and repeat program.
- Negative signals: single personal bag, missing quantity and price-only behavior.
- Recommended existing playbook: `PAD`.

## Eco-03 — Sustainable Materials

- ICP: brands with explicit recycled, vegan, apple-leather or traceable-material briefs.
- Preferred families: Leather, Travel and Racket Sports.
- Priority questions: material direction, compliance requirement, target market, quantity and development stage.
- Positive signals: verified material brief, compliance-review readiness and repeat program.
- Negative signals: unverified green claim, automatic compliance commitment request and price-only behavior.
- Recommended existing playbooks: `LEAW`, `MEN_TRAVEL`, `PAD`.

Compliance statements always require Company Policy and human review. A profile cannot make a sustainability claim.

## Hotel-04 — Hospitality / Corporate Gifting

- ICP: hotels, resorts, hospitality procurement and multi-property corporate-gifting programs.
- Preferred families: Travel and Leather.
- Priority questions: company identity, buyer type, quantity, customization and timeline.
- Positive signals: multi-property program, corporate gifting, repeat program and clear timeline.
- Negative signals: personal purchase, unverified hotel identity and price-only behavior.
- Recommended existing playbooks: `MEN_TRAVEL`, `LEAW`.

## Runtime boundary

Profiles are frozen data objects with `mode=qualification_profile_only`. They have no adapter, route, database, external API, sender or persistence method. Product weights affect only the reviewable qualification recommendation and cannot replace Product Taxonomy or operational Lead Score.
