# Cappuccino OpenSEO / GSC conversion review

Date: 2026-11-11. Status: **Draft / HOLD, partial implementation**.

This review combines the keyword-conversion, GSC striking-distance and GSC SEO/GEO V2 requests. One narrow draft carries the non-overlapping guide work. It does not claim to implement all four target pages, clear the existing RFQ release gates or authorize publication.

## 1. Exact scope and reuse

Baseline: `9738be575333d952dad344c982d7fe4fea4bfa56` (`main` and verified production at the start of this review). Production deployment: `dpl_ggoVee1mj4W59t3QgWqjmWJH7Z5X`.

Runtime content changes are limited to `public/site/padel-bag-design-guide/index.html`. The guide is reused byte-for-byte from the previously reviewed standalone content candidate, not rewritten:

- Original guide commit: `c89ebba0be94b75429c3577be1d709138742242b`.
- Recovered standalone candidate: `f261beedaeb5c3ce757bfcd1fb15f14657cc65f8`.
- Reused guide blob: `44e40e2c85d021cc81dbea7b29acff0b3dce40ac`.
- The historical bundle was verified and imported only into local review refs. Its complete seven-file content change was **not** published: it overlaps #56 and #59.
- This guide change was not present in `main` or any of the fourteen open PR file lists checked immediately before implementation. This draft is the first remote review carrier for this isolated guide delta, not a second implementation of an existing remote PR.
- New tests check this guide independently of the unmerged #56 MOQ-page changes. The old combined test could not be copied unchanged because it depends on the broader unmerged candidate.

No changes to forms, API, CRM, shared inquiry JavaScript, analytics events, navigation, dependencies, redirects, sitemap or robots configuration. No real inquiry, CRM write, email, merge, production deployment, permission change or protection bypass was performed.

## 2. Existing PR ownership and conflict boundaries

| Existing work | Current verified state / head | Scope to preserve | Decision |
|---|---|---|---|
| #50 | Open Draft, `949646c8e598991742ef6abf56e944babb5dbf2e` | OEM HTML/wrapper, collection and RFQ work | Keep its writer responsible for OEM/collection edits. Do not copy or modify its backend work. |
| #56 | Open Draft, `65d6d7941574080b4ffab7e2dd1b8e56dee3158e` | MOQ guide, card-holder FAQ/schema, shared script, identity/footer | Reuse approved policy wording only; no shared-file overwrite. |
| #59 | Open Draft, `b6945f773a253e101ca2038972d805e2529abfad`, reported merge conflict | Padel manufacturer MOQ and anonymous European evidence | Do not recreate its manufacturer changes. Preserve current main's U.S. case. |
| #62 | Merged as `a075e47c3c033dc882778a3778bb21caa0faaf16` | Hybrid product, collection entry and sitemap | Already in baseline; preserve later black hero and construction updates too. |
| #40 / #41 | Open older SEO work, `0d4370f...` / `ba77d9b...` | Collection, manufacturer, racket-sports/shared SEO | Review diffs before adoption; an open PR is not proof that its content remains absent from main. |
| #23 | Open Draft, `51be9de...` | Earlier Padel journey, products and manufacturer | Many concepts already exist in current main. No duplicate rewrite. |
| #38 / #42 | Open Draft, `b243c9e...` / `c19bdbb...` | RFQ submission/receipt/friction work | Keep separate RFQ owners and release gates; not merged by this task. |
| #52 / #53 | Open Draft, `3998d93...` / `9158d82...` | Sitemap / media and bundle scope | Hand off existing sitemap omission and missing concept image. |
| #69 | Open Draft, `cb3e2d0...` | Facebook footer/contact/schema | No overlap with guide content; no shared schema/footer rewrite. |

The GitHub author name alone does not establish that an older writer is inactive. Current exclusive handoff for the shared #50/#56/#59 files remains unverified, so this draft does not write them. The guide-only scope has one writer in this task. Old branches are not reset, rebased, force-pushed or merged.

Specific integration caution: #59 and main insert different useful sections at the same `public/llms.txt` location. Keep both main's recycled-material links and #59's documented-project links. #50/#56 also have a known Card Holder prefill integration risk; historical local fixes are not evidence that the remote branches have adopted them.

## 3. Search-intent ownership

These are primary landing-page assignments, not promises that every query currently ranks on that page.

| Query / cluster | Single primary URL | Role |
|---|---|---|
| custom bag manufacturer; bag manufacturer china; sports bag manufacturer; OEM bag manufacturer | `/oem-odm-bag-manufacturer` | General B2B factory sourcing and OEM/ODM workflow |
| padel bag manufacturer; custom padel bag manufacturer | `/custom-padel-bag-manufacturer` | Padel supplier evaluation, evidence, samples and QC |
| custom padel bags; custom padel bag; personalised/personalized padel bag | `/racket-sports/padel-bags` | Compare complete bag formats; qualify bulk rather than single-item retail personalization |
| custom padel racket backpack | `/racket-sports/padel-bags` | Format discovery, then the appropriate existing backpack product |
| oem padel accessory | `/padel-accessories` | Accessory sourcing; no new `/accessories` URL |
| tennis bag manufacturer | `/custom-tennis-bag-manufacturer` | Existing tennis factory page; no new tennis landing page |
| Padel bag design / procurement / material and sample-check questions | `/padel-bag-design-guide` | Informational specification guide supporting the commercial owners |

The original OpenSEO suggestion for a “proposed” tennis page is not an instruction to create a duplicate. The existing tennis page is live and has GSC impressions. Preserve the site's existing [intent separation](./padel-pr-b-baseline.md); its old validation counts are historical, not current proof.

## 4. First-party GSC, separate from third-party estimates

Connected source: [OpenSEO Search Performance](https://app.openseo.so/p/c123a897-2a01-4d26-a386-5175f4190183/search-performance), authenticated property `sc-domain:cappuccinobag.com`.

The explicit finalized window is **2026-10-12 through 2026-11-08**, Web, all countries/devices, using GSC Pacific-date semantics. The date probe returned finalized data only through November 8. Later missing rows are not zero traffic. The default window was October 11–November 7: 16 clicks / 1,027 impressions. Shifting to the latest complete window replaces October 11 (39 impressions, 1 click) with November 8 (30 impressions, 1 click), explaining the nine-impression difference. Both results are valid for their own dates; do not mix them.

Verified totals: **16 clicks / 1,018 impressions / 1.57% calculated CTR**. About 13.21 is a derived impressions-weighted approximation from rounded daily positions, not a fixed keyword rank. These totals match the independently parsed user export for the same window.

| Exact query | Impressions | Clicks | CTR | API avg. position | Observed owner |
|---|---:|---:|---:|---:|---|
| custom padel bag | 9 | 0 | 0% | 9.3 | Collection 8 impressions, manufacturer 1 |
| custom padel racket backpack | 2 | 0 | 0% | 12.5 | Collection, USA |
| oem padel accessory | 1 | 0 | 0% | 9.0 | `/padel-accessories`, Malaysia |
| personalised padel bag | 28 | 0 | 0% | 17.79 in export | Complete-bag intent; small overlap signal below |
| tennis bag manufacturer | 4 | 0 | 0% | 88.75 in export | Existing tennis manufacturer owner |

Joined rows for `custom padel bag`: collection USA 3 impressions at 9.3, UK 1 at 7, Poland 2 at 8, India 1 at 7, Dominican Republic 1 at 4; manufacturer Indonesia 1 at 22. No German or Dutch joined row was returned for the three priority exact queries. This does not establish zero market demand.

| Page | Impressions | Clicks | CTR | API avg. position |
|---|---:|---:|---:|---:|
| Padel collection | 165 | 2 | 1.21% | 8.0 |
| Padel manufacturer | 71 | 2 | 2.82% | 5.1 |
| Padel accessories | 48 | 1 | 2.08% | 22.9 |
| Tennis manufacturer | 12 | 0 | 0% | 38.3 |
| General OEM and Padel design guide | Not returned | Not returned | Unknown | Unknown |

Missing page rows do not establish zero traffic or non-indexing. The accessory page's one click is not attributed to `oem padel accessory`, whose exact-query row has zero clicks. Page aggregation sums (17 clicks / 1,136 impressions) differ from property totals and must not replace them. The 54 visible query rows cover only 2 clicks / 300 impressions, so they cannot prove all traffic is branded or non-brand clicks are zero.

| Country | Impressions | Clicks | CTR | API avg. position |
|---|---:|---:|---:|---:|
| USA | 279 | 4 | 1.43% | 20.4 |
| UK | 122 | 1 | 0.82% | 26.0 |
| Germany | 53 | 2 | 3.77% | 5.7 |
| Netherlands | 2 | 0 | 0% | 3.0 |

These country totals cover the property, not just Padel. Two Dutch impressions do not establish a stable third-place ranking. The US `personalised padel bag` join shows collection 24 impressions at 15.7 and accessories 21 at 40.0. This is potential role overlap, not proven harmful cannibalization. Do not add 24 + 21 as unique query demand, redirect, delete or noindex either page. Retain precise complete-bag versus accessory copy and anchors.

Third-party source: [OpenSEO keyword report](https://app.openseo.so/p/c123a897-2a01-4d26-a386-5175f4190183/reports/a69da6fb-96e0-4b69-8d29-935c22b366a5), saved 2026-11-10T23:17:49.583Z; complete 9,392-byte report checked. These are estimated monthly searches, not GSC clicks or RFQs:

- US custom bag manufacturer: 210, KD 6, CPC $9.06; UK: 20, KD 43, $3.93.
- UK bag manufacturer china: 50, KD 4, $5.11; US: 110, KD 37, $7.31.
- US sports bag manufacturer: 20, KD 0, $4.51; UK: 10, KD unknown, $13.47.
- US OEM bag manufacturer: 20, KD unknown, $1.83; UK tennis bag manufacturer: 10, KD unknown, $4.29.
- Padel exact volumes are unavailable, not zero. Netherlands estimates were unavailable; no paid retry was performed. Do not sum close variants or interpret KD 0 as a ranking guarantee.

## 5. Before / after and unimplemented owner handoffs

| Page / element | Before | This draft / next owner action |
|---|---|---|
| Guide title, meta, H1/H2 | Already informational: “Custom Padel Bag Design & Procurement Guide” / “OEM Brief” | Unchanged. Retain design intent rather than compete for factory phrases. |
| Guide first-screen qualification | All MOQ is described as project-specific | Reused 300 pieces per style, different styles cannot be combined, linked custom MOQ policy. |
| Guide visible MOQ FAQ + FAQPage | Generic project-specific MOQ/lead-time answer | Matching answer: 300/style, not per colour, no mixed styles, material/component minimums may increase quantity; sampling/fees assessed separately; existing agreements preserved; timing reviewed. |
| Guide material evidence path | General materials caveat, no direct article link in that section | Reused precise link to the existing recycled/water-resistant materials article; no new article or performance claim. |
| OEM title/meta/H1 | “OEM/ODM Bag Manufacturer” / “From Design Brief to Bulk Bag Shipment” | Not changed here. #50 writer may test title “Custom Bag Manufacturer in China \| OEM/ODM” and H1 “Custom Bag Manufacturer for OEM/ODM Projects”, with sports-specific supporting copy and existing process links. |
| OEM MOQ and buyer copy | Main still has “lower MOQ projects” | #50 already corrects this and has 300/style plus FAQ/brief paths. Do not recreate its change on main. |
| Padel manufacturer | Established factory title/H1, material and QC evidence, current U.S. prototype case | Not changed here. #59 already owns MOQ + anonymous European proof. Preserve all case limitations, existing inquiry links and current main case. |
| Padel collection | Established format title/H1, comparison table, hybrid product, product links | Not changed here. #50 writer should keep complete-bag intent, clarify bulk qualification near discovery/FAQ and preserve all products. Do not re-title it as another manufacturer page. |
| Padel accessories | Existing accessory owner | No change. Exact accessory query has one impression; retain accessory-specific role rather than target complete bags. |

Claims added by this draft: none beyond the already approved commercial minimum. No new certification, factory capacity, customer endorsement, test result, thermal/waterproof guarantee, measured recycled content or delivery promise. Existing diagrams remain distinct from physical evidence. “15+ years” and Guangzhou should remain tied to approved company evidence when an owning PR uses them, not be expanded into unsupported factory/test claims.

## 6. Technical SEO / GEO audit

The final isolated Preview build generated 228 pages. Rendered output for all four target pages has exactly one H1 and one correct normalized self-canonical. JSON-LD parses; 18 visible FAQ answers match their schema across the four pages (manufacturer 8, collection 5, guide 5, OEM 0 on main). No new schema type, rating, Offer, Product claim or canonical was introduced by this delta. FAQ validity does not guarantee Google rich results or AI citations.

The generated sitemap has 183 unique URLs. Manufacturer, OEM and collection are included. **The existing `/padel-bag-design-guide` is absent.** Its page is built, self-canonical, internally linked and has index/follow metadata; absence from the sitemap is not evidence of non-indexing. Hand off a one-URL addition to the #52 sitemap owner, preserving the hybrid product and newer entries. This draft does not overwrite that shared file.

Preview robots disallows `/`; the local Preview response has `X-Robots-Tag: noindex, nofollow, noarchive`. Individual page metadata still says index/follow, but the restrictive response header controls Preview indexing. Production robots configuration remains unchanged and is not inferred from the Preview response. Vercel project SSO protection was already enabled (`all_except_custom_domains`); no settings or share/bypass tokens were changed.

Read-only local HTTP audit: **50/51 targets returned 200**. All selected page/internal-link targets pass; the sole failure is the inherited manufacturer concept image `/assets/cappuccino-original-padel-technical-bag-v1.png` (404), also absent from Git. This guide adds no media. The prior candidate's replacement suggestion remains for #53/#59 review; it is not silently included here. Actual image crop, video playback and mobile rendering remain separate acceptance items.

## 7. Tests and RFQ evidence boundaries

- Clean baseline: 204/204 Node tests and normal production build passed.
- Final content/test tree: **209/209 Node tests**, ESLint with zero warnings, Next route type generation and normal Turbopack Preview build **228/228** passed. Type generation is not an independent full `tsc` pass.
- Five new tests: exact commercial-policy safeguards, all five guide FAQ/body matches, informational intent/canonical/owner links, existing material article/caveat, and two unchanged non-submitting Padel inquiry links.
- `git diff --check`: passed. Protected runtime scopes have no diff from main.
- Rendered/HTTP checks are scoped to the four target pages and their selected targets; they are not a full-site crawl or Core Web Vitals result.

No real form was submitted. Current main does **not** contain the pending Padel submission guard, stable retry ID or strict receipt checks found in #50/#38. Main's passing general inquiry tests are not evidence that those unmerged protections are live, and this draft does not claim a Padel browser failure/retry pass. #50 source includes guard/attribution, optional details, strict receipt identity, isolated analytics errors and saved-versus-notified wording, but this guide-only draft does not prove #50's exact integrated head, real durable storage, attachment objects, notification delivery or inbox receipt. Do not convert a success UI, a 2xx response, a simulation, a READY deployment or a historical test count into delivered-RFQ evidence.

Do not cherry-pick #38/#42 over #50's current implementation. #38's current six-file diff includes an API import and general inquiry endpoint change; its older three-file description is incomplete. #38 and #42 are not ancestors of #50, even though #50 contains equivalent and extended safeguards. Current #40/#41 are open but not Draft; their CI status is not publication evidence. #41's proposed racket sleeves/cases routes are not current main routes and are not added as live links here. #4's unmerged SEO automation/database work remains disabled and out of scope.

Required read-only / intercepted browser checks on the eventual fixed Preview: input labels and required fields; Padel prefill; quantity per style; retained input on failure; duplicate click/retry behavior; valid versus mismatched receipts; saved-with-notification-failure wording; event deduplication without personal data. All POST/CRM/email/analytics effects must be intercepted or remain unexercised. Live receipt acceptance requires separate approved testing and is not part of this task.

## 8. Visual acceptance and release gate

Local Chromium could not start because the environment denied its socket operation, including the normal reviewed execution attempt. It never loaded a page. Therefore **desktop/mobile visual acceptance is NOT RUN**, and no screenshots are represented as passed. A local read-only HTTP check subsequently succeeded in a single isolated server process; that does not establish browser rendering.

Keep the draft on HOLD until the exact hosted Preview SHA has been reviewed at 1440px desktop and 360/390/430px mobile. Inspect:

1. Guide hero MOQ, unchanged title hierarchy, long FAQ wrapping and horizontal table scrolling.
2. Material article link, manufacturer/collection links and both original inquiry links.
3. Navigation, focus states, floating controls, CTA visibility and Back/Forward navigation.
4. Unchanged manufacturer, OEM and collection flows, hybrid black hero and case links, with existing missing-media issue explicitly recorded.
5. RFQ prefill/fields/messages only under safe request interception; no actual submission.

Hosted build status and URL must be recorded for the exact final commit. An older #50 or #59 Preview cannot validate this draft. Do not disable deployment protection to complete the check.

## 9. Measurement, expected benefit and rollback

Expected mechanism: clearer bulk qualification and a shorter route from design questions to material evidence and the correct commercial page. Search interpretation and qualified briefs may improve; no ranking, CTR, citation, RFQ or revenue lift has been demonstrated.

Use the existing GSC workflow, not a second dashboard. Preserve the exact 28-day baseline and the query/page/country definitions above. For ongoing comparison:

| Complete window | Clicks | Impressions | Calculated CTR | Approx. weighted position |
|---|---:|---:|---:|---:|
| Previous 28 days: September 14–October 11 | 27 | 1,431 | 1.89% | 9.21 |
| Latest 28 days: October 12–November 8 | 16 | 1,018 | 1.57% | 13.21 |
| Earlier 14 days: October 12–25 | 8 | 517 | 1.55% | 12.45 |
| Latest 14 days: October 26–November 8 | 8 | 501 | 1.60% | 13.99 |

Latest versus previous 28 days: clicks -40.7%, impressions -28.9%; latest versus earlier 14 days: clicks unchanged, impressions -3.1%. These are pre-release observations from finalized date rows, not an effect of this unmerged draft. Position approximations are weighted from rounded daily API values. No cause is assigned from these totals alone.

- Record the actual owner-approved production SHA/date if publication occurs. A Draft PR date is not an intervention date.
- At 14 days, compare completed 14-day windows and use technical checks plus query/page intent signals as an early read. Do not over-interpret one or two impressions.
- At 28 days, compare a complete finalized 28-day post-release period against the preceding comparable period. Keep USA, UK, Germany and Netherlands separate, with global and device totals retained.
- Track impressions, clicks, calculated CTR and average-position distribution separately from CTA clicks, attempted submissions, unique durable receipts, actual notification delivery, qualified RFQs, quotes, paid samples and orders. No new production events or CRM schema are added here.
- AI referral/citation claims require observed referrers or response citations with date, prompt and system. `llms.txt`, estimated volume and brand mention alone are insufficient.

No production rollback is currently needed because no production change was made. If this isolated delta is later accepted, revert only its guide/test/report commit after checking newer work. Do not reset main or replace shared files with old candidate trees. The preserved baseline is `9738be575333d952dad344c982d7fe4fea4bfa56`; recheck the then-current production pointer before any future rollback.
