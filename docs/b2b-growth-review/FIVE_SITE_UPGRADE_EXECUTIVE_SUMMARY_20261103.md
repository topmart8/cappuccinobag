# Five-site market-to-website upgrade — 2026-11-03

Continues the unified V4 queue. Single writer: this execution task. CRM Phase1 reviewer is read-only. No production authorization in this round; no PAVUKO work. No live submissions or denied database retries.

## Stage 1: ownership and baseline (read before implementation)

|Site|Main / production commit|Existing owner and overlap|Allowed next scope|
|---|---|---|---|
|Cappuccino|4e91d0dcd4ac10aeee2382115d2cb35235b27ca0 / dpl_Eun95Vo1GgoEYd8GpmqLyVarLiYV|PR50 ec6229ceb13fcf00c0ccb5820361bcb881fc96c4: OEM/Brief; PR56 65d6d7941574080b4ffab7e2dd1b8e56dee3158e: facts, overlaps static-site/script/llms; PR59 6eed56c74f7e05a2847cbc0c05ab850bfcd350c0: Padel manufacturer proof/llms; PR52 sitemap; PR53 media; #55/#58 merged|P0: additive buyer review guidance on existing OEM page under PR50; leave manufacturer, CRM, sitemap and media owners untouched|
|Novlane|a8299798051a27253d028a2cbd0776d9bc23636a / dpl_EdihhKdAjCx9uEmK2SxfxdgAXoxK|PR26 9baed236bdfebd237054888239ff5f3c37400602: video/material study; PR27 ff995e7c29d271035ef3834a80e6d47d53874820: facts; PR28 merged gallery; PR29 552d1a14f8980d74753cc986fb6f4f45f6b0601f: CRM/forms overlaps ProjectBuilder/API|P1: material decision sheet requires exact content-owner reconciliation; no inquiry changes|
|Eyewear|85cb2cdc25a0d0af669e212567d23407947f9671|PR6 85f9961f6c196c2c0d6a0bd5fad33114ce5fcb4f: content/project tools/facts; PR7 11a5db724d9e7ce02f38893d204baf61b614350a: contact redirect only|P1: existing three product slugs only, coordinate PR6; PR7 is not proof of working CRM|
|Wallet|No confirmed source/production mapping|cappuccino-wallet staging dpl_9xhRUrW8nPVhkBUtr8FuiBokx69t; accessible GitHub search returns no wallet source|P2: specification and identity checklist only; no indexing/protection changes|
|SITE06|UNKNOWN|No confirmed repository; existing Vercel project named site cannot establish identity|P3: written stock and business specifications only; no duplicate site|

## Protected combinations and priorities

Capp local PR50 first fast-forwarded to remote ec6229c, then cleanly merged current main4e91d0d as 0f3d392aaeddd52a7dc1967569a3594103dbd120. This preserves Golf and PR55. Existing PR53 local40e041c, Nov inquiry a4f06e3 and Eye inquiry1c28add remain untouched. Untracked node_modules is preserved. No push performed at this stage.

P0: inquiry receipt evidence remains blocked by denied ceps/frjj access and unconfirmed side effects. Complete safe buyer guidance without backend changes. P1: reconcile Nov/Eye content queues before edits. P2: Wallet needs source/domain mapping. P3: SITE06 needs identity and written SKU evidence. No data subscription purchase; search/AI traffic remain unknown.

Commercial rule: 300 pcs per style for new custom orders; no pooling styles. Colour/artwork/material/hardware/packaging may raise minimums. Samples and freight separate. Existing confirmed orders retain agreed terms; exceptions require management written approval. Stock+logo low quantities are not publishable without current SKU evidence.

Production release recommendation: HOLD for every site. Only code/mock/authorized Preview review is in scope. No production traffic or receipt claims are established by this matrix.

## Implemented increment and ten-item site acceptance

### Cappuccino — P0, existing PR50
1. Baseline: remote ec6229c plus current main4e91d0d; local combination0f3d392. Main includes Golf58 and menu55.
2. Files: public/site/oem-odm-bag-manufacturer/index.html plus this original-queue report. No CRM/API/script/schema/sitemap/media changes in this increment.
3. Pages: existing OEM Clubs & Events / evidence sections only. No second Padel hub; PR59 manufacturer-page proof untouched.
4. Commercial: each proposed main bag, sleeve, shoe bag, wet kit and coach duffel has its own300-piece custom minimum, no style pooling, split/material/component caveats, separate sampling/freight, historical terms and written exceptions.
5. GEO/SEO: original title/H1/canonical/JSON-LD retained. Server HTML adds intended buyers and review-only engineering requirements. Existing Padel links/order retained; outdoor review links to the existing multifunctional page. No passed-test claim.
6. RFQ: existing message field gets descriptive guidance and accessible help. Racket count, shoe size, bottle dimensions, use, format/load/quantity/colour and outdoor capacity/carry/water/modules/test requirements are narrative inputs. They are NOT new structured CRM fields. CRM2be7b618 files remain frozen; no live submission.
7. Tests:238 current Node tests pass, lint passes, typegen passes (not full tsc). Default Turbopack fails due pre-existing external node_modules symlink; webpack production build succeeds226 pages. Local Chromium360/390/430/1440x900: one existing form, selected Clubs path, inputs retained, no overflow, metadata and JSON-LD checked.23 targeted Brief/route/upload/notification tests are part of238, not additional coverage.
8. Blockers: true receiving chain/source/site/category/attachment/inbox E2E unavailable; denied ceps/frjj not retried. New structured RFQ fields wait for original CRM decision. No claim of automatic notification replay or production conversion improvement.
9. Preview: candidate prepared on original branch; remote status recorded separately after push decision. Local screenshots/logs at /workspace/private-audit/market-20261103. Local URL is not a user-accessible Preview.
10. Release: HOLD. No production changes; revert the incremental content commit to undo copy, retain upstream Golf/menu and existing PR50 fixes.

### Novlane — P1, existing PR26
1. Baseline: video9baed236 plus main a829979 (gallery28), clean combination after one manual MOQ conflict resolution1ceb114.
2. Files: components/MaterialLibraryPages.jsx and docs/phase1-material-brief-20261031.md; merge resolution app/private-label-bag-manufacturer/page.jsx retains gallery link, no-pooling/legacy-order and higher component minimums.
3. Pages: existing material category/product pages. No new URLs or replacement homepage. Video assets/controller remain identical to9baed236.
4. Commercial: approved300/style rule, separate pattern/colour/material minimums and sampling; existing specs including N2613 remain unchanged.
5. GEO/SEO: server-rendered MaterialDecisionSheet groups supplier article/composition/surface/backing/binder, thickness/weight/handfeel/support/product area, abrasion/flex/colourfastness/water, MOQ/colours, certificate scope/report mapping/status. All NEW project evidence TO CONFIRM, not a replacement for existing catalogue values. Printed method/proof/rub/flex/adhesion/golden/bulk steps are review requirements. HappiGreens/Terratan are technical evaluation only. Existing FAQ/schema/title/canonical preserved.
6. RFQ: existing material_model/category/landing links preserved; API/ProjectBuilder/B2BInquiryForm and Draft29 recovery files frozen.
7. Tests:46 tests, lint, full tsc and normal build152 pages pass. Local Chromium four widths confirms N2410 sheet, CTA parameters, schema parsing and no overflow. No new video performance measurement;3.42s remains user-reported without trace.
8. Blockers: actual phone Safari/Android, hosted protected preview and actual inbox receipt unverified. No database access retried. Full supplier evidence still required before factual upgrades.
9. Preview: original PR26 local content commit954fffbfae9c39e57179e07c04df07e1d32b0121; publication status recorded separately. No new video assets created.
10. Release: HOLD; revert content commit to remove decision sheet, preserving merge of current gallery and existing video.

### Eyewear — P1, existing PR6
1. Baseline: PR6 85f9961 on production85cb2cdc; isolated checkout /workspace/eyewear-pr6-review uses original codex/company-facts-20261029 branch. Existing inquiry candidate untouched.
2. Files: lib/page-content.ts and docs/market-review-20261103.md only.
3. Pages: smart-eyewear-travel-organizer / ai-glasses-case / sports-smart-eyewear-case only; system travel/charging organizer/sports requirements map to these URLs, no synonymous pages.
4. Commercial: PR6 MOQ remains intact. No electronic manufacturing, included device, affiliation or test guarantee added.
5. GEO/SEO: title/canonical/FAQ/schema unchanged. Shared server-rendered review lists glasses/original charging case/puck/control band/cables/optical insert/clip lenses/nose pads/cloth, with physical device/official dimensions/buyer-sample disclaimer.
6. RFQ: existing notes/mailto draft remains explicit. Model/folded dimensions/temple/sensor/charging-case/accessories/protection/carry/quantity are brief requirements, NOT new persisted fields. PR7 config frozen; no claim that contact redirect establishes CRM.
7. Tests:lint and full tsc pass. Normal webpack build blocked by Google Geist network. Local font-fixture build19 pages passes;12 simulated cases (3 pages x4 widths) render disclaimer/link, valid JSON-LD, no overflow. No unit suite exists. All Eye screenshots label font fixture.
8. Blockers: normal-font/cloud preview, real device and true receipt unverified. No live Eye test authorized/performed.
9. Preview: original PR6 local candidate only until validated push decision. No production alias/config changes.
10. Release: HOLD; revert only content increment, retain approved commercial facts and original route.

### Wallet — P2, BLOCKED source identity
1. Baseline: only existing staging deployment9xhR... confirmed; production/source/domain mapping UNKNOWN.
2. Files: none changed; accessible repository search did not identify source.
3. Pages: no new pages. Existing popup/crazyhorse/printed-vegan directions are requirements, not verified product capabilities.
4. Commercial:300/style custom; no low-stock MOQ claim without written SKU evidence.
5. GEO/SEO: SITE_URL, canonical, sitemap503 cause, robots/noindex/protection remain unverified. Do not open staging indexing or change DNS.
6. RFQ: actual WA/form/source/CRM mapping unknown, no test.
7. Tests: none; no source or target guessed.
8. Blockers: exact repository/branch/domain owner and accessible staging configuration.
9. Preview: existing staging is not a newly validated candidate or formal domain.
10. Release: BLOCKED. Prepare specifications only: popup capacity/retention/ejection/RFID option/replaceable-cleanable mechanism/cash clip/magnetic backplate/tracker; crazyhorse source/finish/thickness/pull-up/patina/edge/logo/pack/colour variation; printed artwork permission/placement/method/coating/rub/flex/adhesion/proof/golden. All TO CONFIRM, no copied competitor structure/assets.

### SITE06 — P3, BLOCKED site identity and SKU evidence
1. Baseline: identity/repo/production unknown; Vercel project named site is not sufficient identification.
2. Files: none changed, no website created.
3. Pages: proposed Slim Leather Tech Brief, Business Backpack/Brief Hybrid,24–48H Work Travel Bag and Leather Laptop Bag map only after existing source is identified.
4. Commercial: Full OEM300/style; Ready Stock+Logo30/50/100 prohibited without SKU-specific inventory/colour/logo method/fee/minimum/lead-time/validity written evidence.
5. GEO/SEO: intended mens leather business briefcase/backpack/work-travel ownership; preserve Capp travel URLs and differentiate by buyer use rather than delete/noindex.
6. RFQ: planned laptop dimensions/trolley sleeve/removable strap/organization/leather type-thickness/hardware/edge/weight/pack/sample/MOQ; actual mapping unknown.
7. Tests: none, no site assumed.
8. Blockers: owner, source and written evidence. Unknown does not mean unavailable stock.
9. Preview: none created.
10. Release: BLOCKED; specifications only until identity/evidence supplied.

## Evidence, remaining decisions and seven-day queue

Logs: /tmp/market-capp-{tests,lint,webpack,typegen}.log; /tmp/market-nov-{tests,lint,types,build}.log; /tmp/market-eye-{lint,types,build,fixture-build}.log. Browser JSONL and screenshots: /workspace/private-audit/market-20261103/{capp,nov,eye}-browser.jsonl plus named PNGs. These local paths are execution evidence, not attachments delivered to the user. No screenshots/credentials/customer records are committed.

Day1: owner review of three bounded content candidates and frozen RFQ field mapping. Day2–3: authorized preview review and real devices, without bypassing protection; obtain original video LCP trace if performance diagnosis is still requested. Day3–5: authorized infrastructure owner resolves receiving evidence/access; do not retry denied projects or submit real tests under this content task. Day5–7: source/domain identification for Wallet and SITE06; collect written material/SKU evidence. Search/AI traffic and actual conversion baselines UNKNOWN; no fabricated zero or guaranteed ranking uplift. No duplicate schedule created.

Johnny decisions: Wallet/SITE06 exact existing source/owner; original CRM mapping review; per-site production approval after outstanding acceptance. Repeated permission for300/style is unnecessary. PAVUKO excluded throughout.
