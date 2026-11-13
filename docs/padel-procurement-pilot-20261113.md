# Padel procurement pilot — Draft / HOLD

2026-11-13. Base/main and Vercel production: `f7936abf539ac9e8f0b6b984cb54750b2f3d3a46`. Vercel read-only lookup of www.cappuccinobag.com returned READY production deployment `dpl_FhSApeKJeAvwAh6pTYDB3MmDKwGj`, matching that SHA. Refreshed main again before commit. No release authorization is inferred.

## Scope and ownership

README is only the repository title. No tracked AGENTS.md or .agents/skills/SKILL.md exists in this checkout; /workspace/.agents is empty. Next dev subsequently generated AGENTS.md/CLAUDE.md locally; read those rules and the installed Next linking/navigation guide. Generated files are excluded from this change.

All 15 open PR file lists checked: #4, #10, #11, #23, #38, #40, #41, #42, #50, #52, #53, #56, #59, #69, #70. None changes components/PadelBuyerDetails.jsx. Only this component receives runtime edits: five additive lines gated to PDB014/PDB016/PDB017. Product data, shared templates, gallery, RFQ, API and CRM are untouched. Existing worktrees and branches are preserved.

| PR | Current head / disposition | Boundary |
|---|---|---|
| #23 | 51be9de2a0ba68ddd41d3202a179b33fcce3b6c7; Draft; author topmart8; no requested reviewer | Fetched diff; owns hybrid data/template. Old 1–2 racket / laptop assumptions conflict with approved current concepts. Do not restore whole files. |
| #50 | 949646c8e598991742ef6abf56e944babb5dbf2e; Draft | RFQ receipts, retries, CRM and shared files remain its scope. PR base metadata is stale, not current main. |
| #56 | 65d6d7941574080b4ffab7e2dd1b8e56dee3158e; Draft | MOQ/company policy, static rendering, script. |
| #59 | b6945f773a253e101ca2038972d805e2529abfad; Draft | European proof is not published; no new link to its proposed anchor. |
| #70 | 30bba57f99348449b6cf8d84b1180feaa5ba4ff0; Draft | Design guide retained; no duplication. |
| #71 | merged 770c66b4c4e45d7d1742a69a53cb1e13d6e9ad41 | Six concept views per target product already exist. |
| #72 | merged dfca0e4a5d4a49a6da4f7e11c0da67090344e447 | Interior/detail viewer already exists. |
| #73 | merged f7936abf539ac9e8f0b6b984cb54750b2f3d3a46 | Buyer details, evidence labels, FAQ and metadata already exist. |

## Actual procurement gap and bounded change

Each product already has six views, proposed layout, customization, MOQ 300 pieces per style with no combined styles, separate sampling assessment and SKU-bearing quote URL. No duplicate specifications or image generation is needed. Existing specs in app/hybrid-padel-data.js are development targets, not measured samples:

| Model | Existing target and proposed layout | Still needs human product evidence |
|---|---|---|
| PDB014 | Top width 50 × H38 × D18 cm; one horizontal racket sleeve; no fixed shoe compartment | Measured usable opening/interior, canvas composition/weight, packed fit, load, logo sample |
| PDB016 | L54 × H30 × D28 cm; long-wall racket sleeve; end shoe zone/removable pouch | Combined racket/shoe/clothing fit, pouch size, final textile/BOM, seams/strap load, logo process |
| PDB017 | H50 × W33 × D22 cm; full-height racket sleeve; removable shoe pouch | Grip/zipper clearance, packed shoe space, final textile/BOM, carry comfort, optional device clearance |

The existing buyer evidence block lacked direct material/Logo/anonymous construction references. Added three existing destinations with explicit limits:
- /blog/recycled-water-resistant-materials-padel-bags: options only; no model-specific recycled/certified/waterproof claim.
- /logo-customization-guide: select fabric/process together; approve swatch and logo sample.
- /custom-padel-bag-manufacturer#padel-prototype-case: already-published US two-construction sample example, introduced by #65 (416c6ca); reference structure comparison only. No identity, client artwork, payment details or commercial documents copied.

No prices, dates, performance, certifications or sample availability have been invented. S005 and PDB015 remain unchanged.

## Inquiry → CRM → internal email

app/hybrid-padel-product-template.js: inquiryHref sends product=Padel Bags and format=model + product name. public/site/assets/script.js: preselectInquiryContext writes format to message and selects Padel Bags. There is no separate model field consumed here: retaining the editable message retains the model. Editing/removing it can remove that reference.

script.js POSTs /api/inquiries. app/api/inquiries/route.js maps product_needed to product_category and calls lib/crm/shared-ingest.js. mapSharedInquiryPayload preserves message, category, quantity, material and logo_method. deliverInquiryEmails uses message in the internal notification body; subject uses category/reference, not an explicit SKU. Recipient is INQUIRY_TO_EMAIL or info@cappuccinobag.net. Notification transport success is not inbox receipt. Actual production configuration was not inspected.

Current client accepts response.ok, displays success and resets the form. API returns ok/inquiryNumber/submissionId/idempotent/humanReviewRequired, but not saved/emailStatus. Ingest stores notification state separately. #50 owns stricter receipt behavior; this patch deliberately does not change it.

Simulation: three mapSharedInquiryPayload + deliverInquiryEmails runs used synthetic example.invalid data and an injected callback; global fetch was replaced with a throwing function. Each model survived CRM mapping and simulated notification HTML; one callback per model. No database, real email or actual form submission occurred. These are mapping/mock outcomes only. Real database persistence, attachment persistence, notification transport and inbox arrival: NOT VERIFIED.

## Validation

- npm ci --ignore-scripts initially failed because the default home npm cache was unwritable; retry with /tmp/padel-npm-cache succeeded. No dependencies changed.
- npm test after installation: 204/204 pass. An initial concurrent run during incomplete installation failed module loading and is not the final result.
- npm run lint: pass, zero warnings. npm run typecheck: route generation pass, not independent tsc.
- npm run build: FAIL/BLOCKED downloading Google Inter/Montserrat fonts. No font/config workaround or mocked build was used.
- Local dev browser, Chromium at 1440/360/390/430: 12 product visits HTTP 200, no horizontal overflow, three new references present, SKU prefill preserved on existing inquiry page. All non-GET/HEAD and external requests blocked; no form submitted. Consent dismissed with Necessary only for final screenshots.
- Local reference destinations: 3/3 HTTP 200; manufacturer anchor exists. Screenshots and JSON are under reports/padel-procurement-20261113. Dev fallback fonts and React development CSP/eval warning mean this is not production-runtime or clean-console acceptance.
- Direct public GET of six target/reference pages: environment proxy CONNECT 403; recorded separately in public-get.json. Vercel deployment metadata confirmation is not a replacement for live-page browser acceptance.
- Three 390px gallery checks: Show interior becomes pressed and full-size href points to the interior image, 3/3 pass.
- git diff --check: pass.

## Human acceptance and rollback

Keep Draft. Reviewer should confirm the link wording and the limited use of the already-public anonymous case, then inspect exact-head built preview at 1440/360/390/430 with production fonts, check gallery selection, accessible links and keyboard focus, reference anchor, model-prefilled inquiry and no S005/PDB015 change. Factory must approve measured specifications/BOM/material and logo samples before those facts can be published. Resolve RFQ delivery evidence with #50 owner under a separately authorized controlled test; this task authorizes no live submission.

Before any future merge, refresh main/all relevant PR heads and coordinate #23's outdated assumptions. Rollback before merge: close this draft, leave production unchanged. After a separately approved adoption: revert only this additive component commit, preserving newer production and other PRs; no database rollback is involved. No merge, production deployment, mail, database change or shared-file overwrite occurred.
