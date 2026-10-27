# Deployment asset deduplication — 2026-10-28

Base: `e7d90a16ca55c0f05b9a22124a8bd3e84d061dbe` on `main`.

Six public assets are byte-for-byte duplicates of other files already in the repository. Remove the duplicate copies and use exact internal rewrites to keep every historical URL working. The retained image/video bytes, page content, asset references, CSP and existing redirects are unchanged.

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

## Validation

- `npm ci --ignore-scripts --no-audit --no-fund` completed.
- `npm test`: 198 passed, 0 failed.
- `npm run lint`: passed with `--max-warnings=0`.
- `npm run typecheck`: route type generation passed (this script runs `next typegen`, not a separate TypeScript compiler check).
- `npm run build`: normal production build passed; 225 static pages generated.
- Production-mode HTTP checks: 31 passed. All six old URLs returned HTTP 200 with the exact retained bytes, expected MIME type and correct content length; all six HEAD requests passed. Each of the four old video URLs returned correct HTTP 206 ranges at the beginning, middle and end. Homepage, contact, why-us, Padel collection, travel collection, inquiry and sitemap returned HTTP 200.
- `git diff --check`: passed.

HTTP checks above were run locally with `next start`; deployed-preview checks must be assessed separately. No inquiry was submitted.

## Review and rollout

The reviewed versions of open PRs #50 and #52 do not change these files. Open PR #10 adds an unrelated entry to `redirectPairs` in `next.config.mjs`; retain both changes if it is merged first and revalidate the result.

Keep this change in a draft PR until its preview checks and review complete. Do not delete the active production deployment, necessary rollback versions, or active review previews. Deployment cleanup, retention changes and plan upgrades are separate decisions; this PR performs none of them. Revert this commit to restore the original files and config if rollback is required.
