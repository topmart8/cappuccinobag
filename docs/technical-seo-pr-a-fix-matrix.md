# PR A Technical SEO & Indexing Fix Matrix

## Baseline

- Main SHA: `079abb58f47c687c9c719bebed838b8a14317e6b`
- Production deployment SHA: `079abb58f47c687c9c719bebed838b8a14317e6b`
- Production deployment: `dpl_CgycbK43yejtn3izR6be54R5TMaS`
- Audit crawl timestamp: `2026-08-15T16:35:44Z`

## Fix matrix

| Issue | Site | URL | Current state | Planned fix | Source file | Risk | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Canonical shadow URL | Cappuccino | `/custom-outdoor-sports-travel-bags` → `/custom-outdoor-sports-bag-manufacturer` | Source returns 200 and canonicalizes to another indexable URL | 301 both slash variants to the canonical URL and update the Pet Travel internal link | `next.config.mjs`; `app/sitemap.js`; `app/pet-travel-bags/page.js` | Low | Redirect unit test; final crawl reports 301 to the intended target and no internal redirect |
| Duplicate legacy Tennis/Padel route | Cappuccino | `/custom-tennis-padel-racket-bag-landing` → `/custom-tennis-padel-racket-bags` | Both return 200 and are self-canonical; audit body similarity is 0.8336 | 301 both slash variants and update the Resources link; no Padel copy change | `next.config.mjs`; `app/sitemap.js`; `public/site/resources/index.html` | Low | Redirect unit test; final crawl reports 301 to the intended target and no internal redirect |
| Approved sitemap omissions | Cappuccino | `/resources`; `/rfid-wallet-passport-holder-manufacturer` | Both return 200, are indexable and canonical, but were absent from the 173-URL Production sitemap | Add only these two owner-approved URLs | `app/sitemap.js` | Low | Sitemap unit test; final sitemap contains both as 200 canonical URLs and has 175 URLs total |
| Redirected internal links | Cappuccino | 36 audited internal targets, including `/inquiry/`, `/inquiry/?product=…`, `/inquiry/#upload-design`, `/resources/quality-inspection-guide`, and the two route sources above | Links resolve through 301/308 instead of directly to their final targets | Normalize the audited static inquiry links and three remaining canonical source links | 18 audited `public/site/*/index.html` files; `app/pet-travel-bags/page.js`; `app/racket-sports/padel-bags/PadelHeader.jsx`; `public/site/resources/index.html` | Low | Static-source unit test; final crawl reports 0 redirected internal targets |
| Google Fonts/CSP conflict | Cappuccino | Site-wide static pages, confirmed on `/custom-padel-bag-manufacturer` | Static CSS requests `fonts.googleapis.com`, while CSP permits only self-hosted font/style resources | Use `next/font` variables, preserve Inter/Montserrat intent, and remove external stylesheet import | `app/layout.js`; `app/globals.css`; `public/site/assets/styles.css` | Low | Unit test, lint, build, source scan, desktop/mobile computed-font and console checks |

## Confirmed no-change and deferred items

| Item | Decision | Reason |
| --- | --- | --- |
| `/custom-tennis-padel-racket-bags` FAQ | No change | Live and source verification both show five visible FAQs and five matching FAQPage entries. |
| `/site/custom-padel-bag-manufacturer` | Deferred | It still returns 200 with the canonical target, but redirect safety requires traffic/backlink evidence not available in this implementation gate. |
| Other sitemap-missing URLs | Deferred | Owner approval explicitly allows only `/resources` and `/rfid-wallet-passport-holder-manufacturer`. |
| Novlane findings | Deferred | Separate repository and later PR scope. |
| PR B–E content, conversion, CRM, and claim changes | Excluded | Outside PR A authorization. |

## Priority findings implemented

| Priority | Confirmed finding groups | Result |
| --- | ---: | --- |
| P0 | 0 | No Production outage, 4xx/5xx crawl failure, broken internal link, or broken image was confirmed. |
| P1 | 3 | Canonical shadow URL, duplicate legacy Tennis/Padel landing, and Google Fonts/CSP conflict are fixed in this branch. |
| P2 | 2 | Two owner-approved sitemap omissions and the audited inquiry-route internal redirects are fixed in this branch. |

## Validation results

- Lint: passed with zero warnings.
- Type generation: passed.
- Full tests: 50 passed, 0 failed.
- Production build: 222 static pages generated successfully.
- Final local production crawl: 175 pages from 175 sitemap URLs, 323 internal targets, and 217 image targets checked.
- Final crawl failures: 0 non-200 sitemap URLs, 0 broken internal links, 0 redirected internal links, 0 broken images, 0 redirect errors, 0 invalid or duplicate canonicals, 0 schema parse errors, and 0 FAQ/schema mismatches.
- Browser QA: desktop 1440×900 and mobile 390×844 loaded without horizontal overflow, framework error overlays, or console errors; computed fonts use self-hosted Inter and Montserrat.
- Existing audit-only navigation-order warnings remain on `/racket-sports/padel-bags` (one desktop and one mobile warning) and are deferred because navigation architecture is not part of PR A.

## Before/after audit summary

| Check | Production before | Branch after |
| --- | ---: | ---: |
| P0 findings | 0 | 0 |
| Broken internal links | 0 | 0 |
| Broken images | 0 | 0 |
| Confirmed canonical conflicts | 1 | 0 |
| Owner-approved sitemap inconsistencies | 2 | 0 |
| Confirmed FAQ/schema mismatches | 0 | 0 |
| Redirected internal link targets | 36 | 0 |
