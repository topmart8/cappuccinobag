# Deployment asset deduplication and server tracing — 2026-10-28

Base: `e7d90a16ca55c0f05b9a22124a8bd3e84d061dbe` on `main`.

Six public assets are byte-for-byte duplicates of other files already in the repository. Remove the duplicate copies and use exact internal rewrites to keep every historical URL working. The HTML renderer also traces the entire public directory into its server bundles even though it reads only HTML documents. Exclude static media from those two server traces while retaining all HTML sources. The retained image/video bytes, page content, asset references, CSP and existing redirects are unchanged.

## Measured scope

| Tracked public files | Bytes | Decimal MB |
| --- | ---: | ---: |
| Before | 297,598,564 | 297.60 |
| After | 228,428,471 | 228.43 |
| Removed duplicate bytes | 69,170,093 | 69.17 |

This is a 23.24% reduction in tracked public-file bytes. It is **not** a measurement of Vercel's billed Deployment Storage or Function Storage. Existing deployments keep their existing assets; publishing this change creates another deployment and can initially increase retained storage. Actual team-level relief depends on retention/deleting eligible historical deployments and Vercel's accounting.

## Preserved URL mappings

All paths below are relative to `public/`; `next.config.mjs` maps each removed path to its retained counterpart without a browser redirect.

| Removed duplicate | Retained file | Bytes removed |
| --- | --- | ---: |
| `site/assets/cappuccino-brand-video.mp4` | `site/assets/video/factory-profile-full.mp4` | 62,742,544 |
| `assets/cappuccino-outdoor-bag-factory-workshop.png` | `site/assets/factory-workshop-wide-hero.png` | 2,591,482 |
| `site/assets/process-flow-overview-topcrop.png` | `site/assets/process-flow-overview-cropped.png` | 1,831,760 |
| `assets/videos/cappuccino-bag-showroom.mp4` | `videos/cappuccino-racquet-showroom-overview-website-16x9-web-optimized.mp4` | 216,067 |
| `videos/cappuccino-racquet-showroom-overview-website-16x9.mp4` | `videos/cappuccino-racquet-showroom-overview-website-16x9-web-optimized.mp4` | 216,067 |
| `videos/cappuccino-travel-bag-production-overview-website-16x9.mp4` | `videos/cappuccino-travel-bag-production-overview-website-16x9-web-optimized.mp4` | 1,572,173 |

The `web-optimized` names already exist on the base revision. No new transcoding or image compression was performed. Each deleted file was compared directly with its retained counterpart, including a second comparison against `git show HEAD:<path>`.

## Server trace reduction

After the asset deduplication in `339c0da`, both `.next/server/app/page.js.nft.json` and `.next/server/app/[...slug]/page.js.nft.json` still included all 471 public files. The only application filesystem reader is `app/static-site.js`: its allowlisted page resolver reads `index.html` files, not media bytes. The two pages use 24-hour revalidation, so the HTML files must remain available after the initial build.

`outputFileTracingExcludes` is restricted to `/` and the escaped literal `/[...slug]` route. It excludes only six media extensions under `public/`: AVIF, JPEG, JPG, MP4, PNG and WebP. It does not apply to API routes, remove public assets, change the document loader or change page revalidation.

| Measured per document-renderer trace | Before tracing fix | After tracing fix |
| --- | ---: | ---: |
| Public-file references | 471 | 143 |
| Public-file bytes | 228,428,471 | 1,260,593 |
| HTML source files retained | 114 | 114 |
| Static media references | 328 | 0 |

Each trace drops 227,167,878 bytes of static-media references. These two traces refer to the same media; do **not** add the figures together and claim that Vercel has reclaimed 454 MB. Vercel's function grouping, deduplication, regional copies and retention determine actual stored bytes. This is direct build-output evidence of unnecessary inclusion, not a measurement attributing the October 15 Function Storage alert or the October 27 Deployment Storage increase to a specific deployment. Keep those two alert metrics separate.

Configuration follows [Next.js output file tracing documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/output). The project remains on its existing Next.js version.

## Validation

- `npm ci --ignore-scripts --no-audit --no-fund` completed.
- `npm test`: 198 passed, 0 failed.
- `npm run lint`: passed with `--max-warnings=0`.
- `npm run typecheck`: route type generation passed (this script runs `next typegen`, not a separate TypeScript compiler check).
- `npm run build`: normal production build passed; 225 static pages generated.
- Production-mode HTTP checks: 31 passed. All six old URLs returned HTTP 200 with the exact retained bytes, expected MIME type and correct content length; all six HEAD requests passed. Each of the four old video URLs returned correct HTTP 206 ranges at the beginning, middle and end. Homepage, contact, why-us, Padel collection, travel collection, inquiry and sitemap returned HTTP 200.
- After the tracing fix, all 180 sitemap pages returned HTTP 200. All 471 public-file URLs were checked: 465 returned HTTP 200, and six legacy HTML URLs preserved their configured HTTP 301 destinations. No unexpected failure occurred across the 651 requests.
- Isolated runtime validation copied the production build plus only the 143 traced public files, with zero image/video files. Local on-demand revalidation succeeded for all 74 non-redirect document pages (`REVALIDATED`, followed by `HIT`); seven existing redirects matched their configured destinations. Regenerated HTML matched the seeded page HTML after removing script tags and normalizing whitespace. No filesystem/runtime errors were logged. Only the isolated local build's generated key was used, never a production key.
- Source inspection and trace comparison confirm that all 114 HTML sources remain included; all 328 excluded media files remain in `public/` for static serving.
- `git diff --check`: passed.

HTTP and isolated-runtime checks above were run locally with `next start`; deployed-preview checks must be assessed separately. Browser spot checks of the unchanged production site verified Padel navigation, FAQ expansion, inquiry product selection and additional-specification expansion. No inquiry was submitted, and real email/CRM delivery was not exercised. A physical mobile-device check is not included in this validation.

## Review and rollout

The reviewed versions of open PRs #50 and #52 do not change these files. Open PR #10 adds an unrelated entry to `redirectPairs` in `next.config.mjs`; retain both changes if it is merged first and revalidate the result.

Keep this change in a draft PR until its preview checks and review complete. Do not delete the active production deployment, necessary rollback versions, or active review previews. Deployment cleanup, retention changes and plan upgrades are separate decisions; this PR performs none of them. Revert this commit to restore the original files and config if rollback is required.
