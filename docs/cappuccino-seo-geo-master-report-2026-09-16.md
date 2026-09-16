# Cappuccino Bag B2B SEO + GEO Master Report

Date: 2026-09-16. Branch: `codex/cappuccino-seo-geo-master`. Base: remote `main` at `74a470f`, after PR #39.

## SECTION A — EXECUTIVE SUMMARY

This round protects the existing ranking URLs and makes targeted improvements instead of creating more pages. The Padel collection and racket-sports umbrella now carry clearer commercial titles and descriptions. The homepage description is shorter and category-focused. A single authoritative Organization entity now supplies a valid logo. The broken visual on the Padel manufacturer page now uses an existing first-party development image.

Expected impact: better B2B query alignment and search-result clarity for pages already receiving impressions, cleaner entity extraction for search and answer engines, and a fully valid priority-page crawl with no broken assets.

### Do not duplicate

- PR #39: merged MOQ and sampling guidance.
- PR #38: open Padel RFQ submission contract.
- PR #23: open Padel buyer-journey and procurement clarity work.
- PR #10: open duplicate-route, font and FAQ validation work.
- PR #4: open SEO content automation.
- Existing manufacturer, collection, racket-sports, MOQ, materials, QC and Padel design pages already cover the core clusters. No parallel replacement page was created.

## SECTION B — EXISTING WINNING URLS

| URL | Current role | Search intent | Action taken |
|---|---|---|---|
| `/` | Brand and category authority | Custom bag manufacturer / OEM / ODM | Kept structure and H1; shortened meta description; added authoritative Organization schema |
| `/custom-padel-bag-manufacturer` | Primary Padel supplier-decision page | Manufacturer, factory, OEM, ODM, private label, MOQ, sample, QC | Preserved URL/title/H1/canonical and copy; repaired one broken development image |
| `/racket-sports/padel-bags` | Padel product-format collection | Compare custom/OEM Padel bag formats | Improved title and description for B2B CTR; preserved H1 and canonical |
| `/custom-tennis-padel-racket-bags` | Cross-sport umbrella | Tennis, Padel, Pickleball racket-bag comparison | Repositioned title and description from “guide” to commercial OEM umbrella; preserved H1 and canonical |

## SECTION C — QUERY OWNERSHIP MAP

| Query cluster | Owner URL | Support URL | Action | Overlap risk |
|---|---|---|---|---|
| Custom Padel bag manufacturer, factory, supplier, China | `/custom-padel-bag-manufacturer` | `/factory-trust-materials` | KEEP / protect | Low after role separation |
| Padel OEM, ODM, private label, customization | `/custom-padel-bag-manufacturer` | `/padel-bag-design-guide` | UPGRADE EXISTING PAGE already sufficient | Medium if a new exact-match page is added |
| Padel racket bag, backpack, duffel, shoe bag | `/racket-sports/padel-bags` | Relevant product pages | CTR UPGRADE | Low |
| Thermal lining, racket protection, shoe compartment | `/custom-padel-bag-manufacturer` | `/racket-sports/padel-bags` and product pages | KEEP / consolidate | Medium if split into thin feature pages |
| Padel MOQ, low MOQ, sample, sampling | `/moq-sampling-faq` | `/custom-padel-bag-manufacturer` | KEEP after PR #39 | High if a Padel-only MOQ duplicate is created |
| Padel materials, tech pack, QC | `/padel-bag-design-guide` | `/quality-inspection-guide`, manufacturer page | KEEP / strengthen through links | Medium |
| Racket sports bag manufacturer | `/custom-tennis-padel-racket-bags` | Sport-specific owners | CTR UPGRADE | Low |
| Tennis bag / tennis backpack manufacturer | `/custom-tennis-bag-manufacturer` | Racket-sports umbrella | KEEP | Low |
| Pickleball bag manufacturer | `/custom-pickleball-paddle-bags` | Racket-sports umbrella | KEEP | Low |
| Custom sports / outdoor / technical bag manufacturer | `/custom-outdoor-sports-bag-manufacturer` | Outdoor guides | KEEP | Medium across legacy aliases; redirects already canonicalized |
| Travel bag / weekender manufacturer | `/custom-travel-backpacks-weekender-bags` | Product collection | KEEP | Low |
| Running / hydration belt manufacturer | `/running-waist-packs` | Running category pages | KEEP | Low |

## SECTION D — CTR IMPROVEMENTS

| URL | Old title | New title | Old meta | New meta | Reason |
|---|---|---|---|---|---|
| `/racket-sports/padel-bags` | Custom Padel Bags Collection \| Racket Bags, Backpacks & Duffels | Custom Padel Bags for Brands \| OEM Racket Bags & Backpacks | Explore custom Padel formats and private-label options | Compare OEM Padel formats for private-label brands, including storage, materials and customization | Adds brand/OEM intent while retaining the collection role |
| `/custom-tennis-padel-racket-bags` | Racquet Sports Bag Guide \| Tennis, Padel & Pickleball | Custom Racket Sports Bags \| Tennis, Padel & Pickleball OEM | General comparison wording | Commercial OEM comparison covering fit, shoes, thermal options, materials and carry | Matches the cross-sport commercial owner intent |
| `/` | Custom Padel & Functional Bag Manufacturer \| Cappuccino Bag | Unchanged | Broad long category description | Short description focused on Padel, racket sports, outdoor, travel and OEM/ODM | Improves clarity without disturbing the homepage title/H1 |

## SECTION E — CONTENT / GEO / AI IMPROVEMENTS

| Page | Answer-first changes | Factory evidence | AI extractability |
|---|---|---|---|
| Manufacturer | Existing direct answers retained; no filler added | Broken concept image replaced with an existing Cappuccino development collection image and qualified caption | Manufacturer, service, FAQ and breadcrumb blocks remain aligned |
| Padel collection | Commercial metadata clarified; visible product comparison remains unchanged | Physical sample and construction references retained | CollectionPage, BreadcrumbList and FAQPage remain valid |
| Racket sports | Commercial metadata clarified; visible comparison table retained | Links to focused sport and factory pages retained | Cross-sport comparison and FAQ blocks remain self-contained |
| Site-wide | Organization identity centralized with stable `@id`, legal name, URL, email and logo | Uses an existing first-party logo asset | Every rendered page exposes the same extractable organization entity |

## SECTION F — TECHNICAL FIXES

- Schema: added one central Organization entity with a valid `ImageObject` logo; JSON-LD parses successfully.
- Canonicals: all 175 sitemap pages have valid canonical URLs; no duplicates or trailing-slash conflicts detected.
- Robots: public pages allowed; `/crm/`, `/api/` and `/site/` remain disallowed.
- Sitemap: 175 canonical, indexable URLs; zero redirects, duplicates, non-200 URLs or noindex URLs.
- Internal links: 319 targets checked; zero broken or redirected internal links.
- Metadata: zero duplicate titles, duplicate H1s, duplicate canonicals or missing canonicals.
- Assets: priority-page broken image count reduced from one to zero.

## SECTION G — NEW PAGES

No new page created because existing pages sufficiently cover current high-value intent.

Rejected page ideas: separate pages for `padel bag OEM`, `padel bag ODM`, `private label padel bags`, `thermal padel bag`, `shoe compartment`, `padel MOQ`, `padel sampling`, `padel materials`, `padel tech pack` and `padel QC`. Each would duplicate an existing owner unless new, substantial manufacturing evidence creates a distinct buyer task.

## SECTION H — MULTILINGUAL PILOT

| Source English URL | Language | Native buyer term | Intent | Buyer | Justification | Localization needed | Decision |
|---|---|---|---|---|---|---|---|
| `/custom-padel-bag-manufacturer` | German | Hersteller für individuelle Padel-Taschen | OEM supplier selection | Sports brands/importers | Highest commercial owner | Native procurement terms, CTA, MOQ wording, legal review | GO after English results |
| `/racket-sports/padel-bags` | German | Padel-Taschen nach Maß / Eigenmarke | Product-format comparison | Brands/retailers | Existing impressions and broad format coverage | Native format vocabulary and collection copy | GO after English results |
| `/custom-tennis-padel-racket-bags` | German | Hersteller für Schlägersporttaschen | Cross-sport sourcing | Multi-sport brands | Supports category discovery | Use German sport-industry phrasing, not literal translation | WAIT |
| `/custom-padel-bag-manufacturer` | Dutch | fabrikant van padeltassen op maat | OEM supplier selection | Benelux brands/importers | Strong Padel-market fit | Native sourcing terms and Dutch CTA | GO after English results |
| `/racket-sports/padel-bags` | Dutch | padeltassen op maat / private label | Product-format comparison | Brands/retailers | Clear commercial support page | Native product terminology and examples | WAIT until German pilot data |

Do not publish localized pages yet. All other languages: WAIT.

## SECTION I — VALIDATION

| Check | Result |
|---|---|
| Lint | PASS |
| Type generation | PASS |
| Production build | PASS, 222 static pages generated |
| Relevant SEO/unit tests | PASS |
| Full test suite | FAIL: 187/188 pass; one pre-existing RFQ event-order assertion outside this change |
| HTTP / canonical / metadata | PASS on three protected Padel URLs at 1440px and 390px |
| Schema / Organization logo | PASS |
| Robots / sitemap | PASS |
| Links / assets | PASS: 319 internal targets and 205 images checked, zero broken |
| Mobile viewport | PASS: no horizontal overflow on three protected URLs at 390px |
| Interaction | PASS: Padel collection “Explore Padel Bag Formats” reaches `#product-programs` |
| Forms | Existing RFQ implementation not changed; full-suite pre-existing test failure recorded above |

## SECTION J — FILES CHANGED

- `app/layout.js`
- `app/racket-sports/padel-bags/page.js`
- `app/static-site.js`
- `public/site/custom-padel-bag-manufacturer/index.html`
- `public/site/custom-tennis-padel-racket-bags/index.html`
- `tests/padel-b2b-conversion.test.mjs`
- `tests/site-architecture.test.mjs`
- `reports/site-audit.json`
- `reports/site-audit.md`
- `docs/site-architecture-audit-2026-08.md`
- `docs/cappuccino-seo-geo-master-report-2026-09-16.md`

## SECTION K — RISKS / FOLLOW-UP

- The Padel collection uses a dedicated header, so the audit reports one desktop/mobile navigation-order exception. Changing it overlaps open buyer-journey work and was intentionally left untouched.
- The full suite retains one pre-existing RFQ client success-event ordering failure. This branch does not modify RFQ logic.
- Search Console and AI Share-of-Mentions baselines were not available through repository access; impact needs measurement after an approved deployment.
- No production publish, merge, DNS, credential, analytics ID or CRM change was made.

## SECTION L — NEXT RECOMMENDED PR

After reviewing and merging the existing RFQ/buyer-journey work, make one follow-up PR that reconciles the Padel collection header with shared navigation and validates the complete landing-to-RFQ path against current Search Console query data. Do not create new SEO pages in that PR.
