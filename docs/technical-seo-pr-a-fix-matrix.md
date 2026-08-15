# PR A Technical SEO & Indexing Fix Matrix

## Baseline

- Main SHA: `079abb58f47c687c9c719bebed838b8a14317e6b`
- Production deployment SHA: `079abb58f47c687c9c719bebed838b8a14317e6b`
- Production deployment: `dpl_CgycbK43yejtn3izR6be54R5TMaS`
- Audit crawl timestamp: `2026-08-15T16:35:44Z`

## Included fixes

| Finding | Production evidence | Implementation | Risk | Verification |
| --- | --- | --- | --- | --- |
| Outdoor shadow URL is indexable with a canonical pointing elsewhere | `/custom-outdoor-sports-travel-bags` returns 200 and canonicalizes to `/custom-outdoor-sports-bag-manufacturer` | Permanent redirect to the canonical URL | Low | Redirect config test and build |
| Legacy Tennis/Padel landing duplicates the retained overview | `/custom-tennis-padel-racket-bag-landing` and `/custom-tennis-padel-racket-bags` both return 200 and are self-canonical; audit body similarity is 0.8336 | Permanent redirect from the legacy landing to the retained overview; no Padel copy changes | Low | Redirect config test and build |
| Two approved indexable pages are absent from the sitemap | `/resources` and `/rfid-wallet-passport-holder-manufacturer` return 200 | Add only these two approved URLs | Low | Sitemap unit test and generated sitemap inspection |
| Audited internal links incur a trailing-slash redirect | Audit reports 36 Cappuccino links from `/inquiry/` to `/inquiry` through a 308 | Normalize only the audited static-page inquiry links while preserving query strings and fragments | Low | Static-source link test and audit |
| Google Fonts stylesheet is blocked by the current CSP | `public/site/assets/styles.css` imports `fonts.googleapis.com` while CSP allows only self-hosted fonts | Use `next/font` variables and remove the external stylesheet import | Low | Unit test, build, browser console and visual checks |

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
