# PR C1 Homepage and RFQ Baseline

## Approved source state

- Branch base: `6120448133a7b1f82640415b550c521458127046`
- Production commit at baseline: `6120448133a7b1f82640415b550c521458127046`
- Production deployment: `4MQJ6JgpVmTJ4Ldp6DSt7YcHzkU5` (`READY`)
- Scope: Cappuccino homepage hierarchy and Cappuccino inquiry-form conversion only.
- Explicit exclusions: the three PR B Padel roles, Novlane, CRM or Supabase behavior/schema, claims expansion, deployment, and live form submission.

## Production homepage before PR C1

The rendered homepage had 19 top-level content modules. Several repeated the same product, process, proof, or material concepts with equal visual weight.

| Order | Module | Main purpose | Baseline observation |
| --- | --- | --- | --- |
| 1 | Hero | Manufacturer positioning and Padel CTAs | Four source CTAs were transformed into two Padel-first CTAs. |
| 2 | Buyer support / proof | Experience, scoped evidence, QC | Valuable proof, but repeated later. |
| 3 | Featured Padel | Padel collection entry | Keeps the PR B collection destination. |
| 4 | Core categories | Five priority collection links | Category list, not a buyer-path decision. |
| 5 | Secondary collections | Running, pet travel, RFID | Repeats navigation choices. |
| 6 | Material capabilities | Material options and qualification | Useful, retained once in the target hierarchy. |
| 7 | OEM/ODM process | Nine development steps | Repeated by later capability and QC modules. |
| 8 | Small accessories | Four accessory cards | Product detail beyond the homepage decision task. |
| 9 | Product solutions | Five broad categories | Repeats the category modules. |
| 10 | Product expansion concepts | Six outdoor/travel concepts | Additional equal-priority product choices. |
| 11 | Buyer trust | Experience, scope, product capabilities, QC | Repeats modules 2, 7, 14 and 15. |
| 12 | Case studies | Three anonymous buyer projects | Distinct proof; retained as a dedicated stage. |
| 13 | Capability band | Concept-to-export workflow | Repeats the process module. |
| 14 | Factory proof | Workshop, sample, packing and QC evidence | Consolidated with development proof. |
| 15 | Quality control | Ten inspection points | Consolidated with development proof. |
| 16 | Resources | Thirteen guide links | Remains available through navigation and `/resources`. |
| 17 | Product RFQ pages | Product-specific inquiry entries | Remains available through product/navigation routes. |
| 18 | Inquiry CTA | Project brief and RFQ route | Retained as the final conversion stage. |
| 19 | Alcantara entry | Four material-specific product links | Remains available through Products/navigation. |

### Baseline homepage links and CTAs

| Area | Destinations present before PR C1 |
| --- | --- |
| Header | `/racket-sports/padel-bags`, `/custom-pickleball-paddle-bags`, `/custom-tennis-bag-manufacturer`, `/custom-outdoor-sports-bag-manufacturer`, `/custom-travel-backpacks-weekender-bags`, `/running-waist-packs`, `/pet-travel-bags`, `/rfid-wallet-passport-holder-manufacturer`, `/recycled-material-bags`, `/padel-accessories`, `/resources`, `/factory-trust-materials`, `/inquiry` |
| Hero | Primary `Start a Padel Bag Project` to `/inquiry?product=Padel%20Bags`; secondary `Padel Bag Manufacturer` to `/custom-padel-bag-manufacturer` |
| Featured Padel | `Explore Padel Bags` to `/racket-sports/padel-bags`; project CTA to `/inquiry?product=Padel%20Bags` |
| Core and secondary collections | The header collection destinations above, including running, pet travel and RFID |
| Factory / proof | `/factory-trust-materials` and an in-page inquiry anchor |
| Resources and product entries | `/resources` plus individual buyer guides, product pages and material/product collections |
| Inquiry and floating CTA | `/inquiry` |
| Footer | Core collections, `/case-studies`, `/products`, `/contact`, `/privacy`, `/resources`, `/factory-trust-materials`, and `/inquiry` |

No collection or content route is deleted by PR C1. Secondary collections remain reachable through the shared Products/navigation system and the Products directory.

## Inquiry dependency audit before PR C1

### Required fields in Production

The Cappuccino `/inquiry` form required inquiry intention, product needed, name, email, and WhatsApp. Email and WhatsApp both had client-side validation; WhatsApp used `name="phone"` and the pattern `^\+?[0-9\s().-]{7,20}$`.

### End-to-end dependency result

| Layer | Email | Phone / WhatsApp | Evidence and effect |
| --- | --- | --- | --- |
| HTML form | Required | Required before PR C1 | WhatsApp is the only layer that needs a requirement change. |
| Client validation | Required and format-checked | Validated only when required or when a non-empty value fails the pattern | Removing `required` preserves validation for supplied numbers. |
| `/api/inquiries` | Name plus valid email required | Not required | The API returns 422 only when name/email are invalid. |
| Shared payload mapping | Required | Maps an omitted value to `null` | `phone` and `whatsapp` are nullable payload values. |
| Customer identity | Email-first lookup | Optional fallback identifier | A valid email is sufficient for customer lookup/creation. |
| Notification templates | Reply-to and auto-reply recipient | Displays an em dash when absent | No notification recipient depends on WhatsApp. |
| CRM UI/export | Displayed and filterable | Empty values are tolerated | Missing WhatsApp does not break list, detail, or CSV rendering. |
| Repository migrations | Nullable | Nullable | No repository constraint requires phone or WhatsApp. |
| Live Supabase tables | Nullable | Nullable | Read-only inspection confirmed `customers.phone`, `customers.whatsapp_phone`, `inquiries.phone`, and `inquiries.whatsapp` allow null. |
| Analytics | Success event after an OK API response | No identifier dependency | The lead-success event is not gated on WhatsApp. |

**Decision:** make the label exactly `WhatsApp (optional)`, remove only the field's `required` marker, and retain `type="tel"`, autocomplete, placeholder, pattern validation, API mapping, CRM mapping, and notification behavior. Email remains required. No database or CRM change is needed.

## Target homepage hierarchy

PR C1 reduces the homepage to seven decision stages while retaining distinct proof and all important routes:

1. Hero — broad OEM/ODM positioning; primary `Start Your Custom Bag Project`; secondary `Explore Product Collections`.
2. Three Core Buyer Paths — Racket Sports; Outdoor & Travel; Wallets & Accessories.
3. Featured Products — concise entries, including the unchanged PR B Padel collection/manufacturer/overview destinations.
4. Factory + Development Proof — experience, specification review, sampling, production, QC, packing and export evidence.
5. Case Studies — existing anonymous buyer examples only.
6. Material Capabilities — one qualified, non-expanded material summary.
7. RFQ / Project CTA — primary project CTA and secondary Products directory link.
