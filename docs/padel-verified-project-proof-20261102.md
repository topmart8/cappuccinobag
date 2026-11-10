# Anonymized European Padel project evidence

Base: main `4e91d0dcd4ac10aeee2382115d2cb35235b27ca0`. Independent branch: `feat/padel-verified-conversion-proof`.

## Changes

- `public/site/custom-padel-bag-manufacturer/index.html`: semantic project section after customization capabilities; 300 custom padel bags + 500 racket sleeves, confirmed 800-piece order, European market, sample feedback and print/material/branding/label workflow. Final technical approvals remain pending. Existing inquiry destination and Padel query parameter retained. New custom bulk MOQ explicitly 300 pcs per style in visible copy and existing FAQ JSON-LD.
- `public/llms.txt`: one auxiliary project-evidence entry linked to the visible section; approval boundary and MOQ included.
- `tests/padel-b2b-conversion.test.mjs`: three regression tests for semantic evidence, privacy/commercial boundaries, CTA, MOQ and schema consistency.
- This report.

## 10 November 2026 evidence update

- Seller-side email records now explicitly confirm receipt of the production deposit for the same 800-piece order already represented in this draft.
- The existing case was updated in place; no duplicate case or new URL was created.
- Public wording distinguishes deposit receipt from approval to manufacture. Material, print-finish and sewn-in-label approvals remain pending production gates.
- Exact pricing, deposit amount, payment documents, customer names and contact details remain private.
- The new branch commits require fresh CI/preview verification; earlier 203-test and hosted-build results apply only to the earlier application SHA documented below.

No new page, backend, form, dependency, navigation, image, animation or JavaScript. On 10 November 2026, the existing anonymous case was updated after seller-side confirmation that the production deposit had been received. The public copy does not disclose the amount, payer, payment document, customer identity or bank details. It does not claim paid-in-full status, completed production, shipping or endorsement.

## Validation

- Full Node suite: **203/203 passed**.
- Focused Padel, Golf inquiry, homepage RFQ, floating controls and site architecture suite: **39/39 passed** (subset of full suite).
- ESLint: passed. Next route type generation: passed (not a separate TypeScript compiler check).
- Source title, H1, canonical and meta description identical to main. One H1 and correct canonical verified in local rendered HTML. Existing schema parses; FAQ MOQ matches visible answer. No new review/rating schema. Robots, sitemap, redirects, navigation and unrelated categories unchanged.
- Existing Padel design guide and material article already link naturally to the manufacturer owner; no additional cross-page link edits needed.
- Local exact-identifier scan: three normalized prohibited identity tokens absent from edited public content and diff. No identity tokens or reversible encodings committed as test fixtures. Generic project-block checks reject contact details, financial identifiers and endorsement language. Existing company contact details retained.
- No added scripts or media requests. Core Web Vitals have not been measured; no performance score claim.

## Browser evidence and limits

Local Next development server, Chromium 154.0.8037.57, desktop 1440px and mobile viewport emulation at 360/390/430px. Google fonts fall back locally. These are not physical-device or hosted-production checks.

New module is readable, no horizontal overflow, and its CTA is clickable at all four widths. CTA enters the original inquiry and preselects Padel Bags. Golf Bags preselection also passes at all four widths. Existing Padel collection mobile navigation retains Padel first, reaches #padel-rfq and exposes the name input at all three phone widths; desktop RFQ access passes too. The initial immediate hash check ran before client navigation settled; a settled-navigation check passed, and original main reproduced the passing mobile behavior. API requests: zero; no forms submitted, customer messages or CRM writes.

Module screenshots isolate the section, hiding fixed header/developer/floating widgets only for the screenshot; the separate viewport captures preserve actual page controls. Click and overflow checks run on the unmodified page. Screenshot files are delivered through ChatGPT Library, not public source assets.

## Build blocker — keep Draft

`npm run build` was attempted on this branch and clean original main. Both fail while fetching Inter and Montserrat from Google Fonts. The environment proxy returns HTTP 403 for the Google Fonts endpoint. No font mock, certificate bypass, dependency replacement or configuration change was used to label this a passing build.

The first baseline setup using a node_modules symlink was rejected by Turbopack's project-root constraint; a normal copied dependency directory was then used to reproduce the same Google Fonts failure as the candidate.

The local build remains blocked, but the same source has subsequently passed the actual Vercel production build (see below). Production-runtime browser acceptance remains required. No merge or production deployment performed. **READY FOR REVIEW: NO — Draft / hosted browser gate pending.**

## Exact Vercel build and hosted-access follow-up

Tested application commit: `412b64b1d0fbf8770c259e5a69941f3ea52b11b1`.

- Preview deployment: `dpl_Avo3WyELUrPBNhXgHVStWr5TBMr4`, state `READY`, target `null` (Preview).
- Deployment Git metadata matches the complete application SHA above.
- [Exact Preview page](https://cappuccinobag-qrpubcmv8-cappuccinobag.vercel.app/custom-padel-bag-manufacturer#european-padel-project).
- [Vercel build log](https://vercel.com/cappuccinobag/cappuccinobag/Avo3WyELUrPBNhXgHVStWr5TBMr4).
- [Draft PR #59](https://github.com/topmart8/cappuccinobag/pull/59).

Read-only deployment events confirm:

```text
Cloning github.com/topmart8/cappuccinobag (Branch: feat/padel-verified-conversion-proof, Commit: 412b64b)
Running "npm run build"
> next build
✓ Compiled successfully in 1633ms
✓ Generating static pages using 1 worker (226/226) in 4.1s
Build Completed in /vercel/output [14s]
Deployment completed
```

This establishes a successful full remote production build, including 226 static pages, rather than only a generic CI status. The build log includes package-manager warnings but no build failure.

Hosted browser attempt on 2026-11-02: Chromium navigation to the exact Preview failed with `net::ERR_TUNNEL_CONNECTION_FAILED`; a direct HTTP request returned proxy `CONNECT tunnel failed, response 403` (`server: envoy`). A separately approved escalated read-only request returned the same proxy error. These responses occurred before the application or a Vercel protection/login page could be inspected; they do not establish that the deployment itself returns 403.

The Vercel protected-deployment skill was discovered and read. It recommends existing CLI authentication or an origin-scoped short-lived development OIDC header. This environment has no Vercel CLI, local CLI authentication file, linked `.vercel/project.json`, or `VERCEL_OIDC_TOKEN`. No credentials were printed or copied. Connector fetch/share tools can create bearer share links; they were not used because this follow-up authorizes existing legitimate access, not broadening access or changing protection.

Required to finish: a browser execution environment with permitted HTTPS access to the exact Preview hostname and, if Vercel protection then requires it, an existing authorized same-project Vercel session or short-lived development OIDC credential. No production access or long-lived bypass secret is required. No access-control change was attempted; no approval-review denial occurred. Hosted font loading, raw 1440/360/390/430px screenshots, control occlusion and hosted Padel/Golf prefill remain unverified. Existing local screenshots must not be relabeled as hosted evidence.

This follow-up changes only this report. Application source, public content, configuration and tests are byte-identical to the tested and remotely built commit `412b64b1d0fbf8770c259e5a69941f3ea52b11b1`; the final report commit is recorded by Git/PR history. The 203 passing tests and remote build evidence apply to that unchanged application tree.
