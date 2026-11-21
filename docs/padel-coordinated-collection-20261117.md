# Coordinated Padel collection - 17 November 2026

Continues the existing club and tournament programme from #79-#81 and the user-reviewed four-product development boards. No new product URL, collection URL, CRM or submission endpoint is created.

## Buyer-facing changes

- Feature S005, S004, S003 and PDB017 as the initial coordinated range on `/padel-club-tournament-supply`.
- Add the exterior concept board and four independently readable interior views with HTML explanations. Source images remain full boards; responsive SVG viewports enlarge each interior for mobile readers, without changing the underlying asset.
- Clearly label generated concepts. S005 retains its existing sample-photo gallery; new imagery is not passed off as a completed matching sample set.
- Include PDB017 in the existing quantity selector. Retain PDB016 as an optional main bag and keep the three existing programme presets unchanged.
- Add product-specific questions to the four existing product pages. S003 is not verified to nest inside PDB017; its proposed internal footwear pouch is a separate development component.
- Revise the existing English selection PDF to R2, using the same public download URL. The main shortlist now includes PDB017; PDB016 remains a programme option.

## Facts and evidence

The user confirms the S005 900D fabric direction and supplied sample photos showing a subtly lustrous slate-grey/blue exterior and silver reflective lining. White EPE sheets are removable shipping packaging. Finished-bag water resistance, thermal performance, usable fit and lining laminate require testing or specification confirmation. Materials for other styles remain proposals. No new measured dimensions, price, stock, delivery or performance claims are added.

New visual assets are AI-assisted concepts generated from the existing product references, without product logos. Exterior WebP is 171,816 bytes; interior WebP is 252,438 bytes, both 1536 x 1024. Original product galleries and real workshop photographs are unchanged.

## Baseline and conflict review

- Verified main / production baseline: `2450dcb0dd176d340081d307807962959afbb474`.
- Production deployment at inspection: `dpl_keEY9jLCTceYcv3YrEpeCeSqDtpy`, READY, linked to topmart8/cappuccinobag main and the requested production domain.
- All 16 open PR file lists inspected. This release's modified and added files do not overlap their changed paths. In particular, #23's shared templates and #74's buyer-details component are untouched.
- Existing URLs, canonical and sitemap ownership are preserved. Existing Product/FAQ representations receive the same answers shown to readers; no prices, ratings or special AI-ranking assertions are introduced.

## Validation

- 209 tests passed, including preservation of a selected PDB017 quantity, exclusion of the optional unselected duffel and independent per-style MOQ enforcement.
- ESLint and production build passed; text diff whitespace check passed (PDF excluded as a generated binary).
- PDF R2 rendered and all three pages visually inspected.
- Managed local browser preview could not start because the launcher adds unsupported `--host` and `--strictPort` flags to `next dev`. Working application code, preview infrastructure and network settings were not changed to bypass that environment limitation.
- Hosted rendering, selectors and links are to be checked against the resulting deployment. Production inquiry submission, email receipt, CRM recording, Google indexing and AI citation are separate outcomes and are not established by these checks.

Rollback: revert this isolated change set. Preserve subsequent work, original product galleries, the existing inquiry contract and all unrelated open PRs.
