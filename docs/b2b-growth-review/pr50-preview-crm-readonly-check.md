# PR50 Preview CRM read-only build check

This check resolves missing credential evidence without exposing an HTTP diagnostic endpoint. It runs via npm prebuild only when VERCEL_ENV is preview and VERCEL_GIT_COMMIT_REF is codex/b2b-growth-review-20261027. Other branches, local builds and production do not query the database.

It verifies the approved recipient and server URL, checks the project and service_role claims of legacy JWT keys locally, then performs one HEAD request to the fixed approved project at /rest/v1/inquiries?select=id&limit=0. It follows no redirects, retries no failures, reads no response bodies or headers, and prints no secrets or raw errors. The request mirrors the existing application's authentication headers; it deliberately does not silently migrate key types.

A failed check exits with code 1 so the new Preview cannot be mistaken for an accepted candidate. The previous READY Preview and Production remain unchanged. A passed build check proves only build-time credential acceptance and read access to the inquiry endpoint. It does not verify runtime writes, schema completeness, Storage, notifications, inbox receipt or mobile behavior.

Inspect the PR50_CRM_READONLY_CHECK JSON line in the protected Vercel build logs. Fix a rejected credential only through the authorized secret-management workflow; do not paste keys into a chat. No credential rotation or database modification is performed by this check.

Validation: node --test tests/pr50-preview-crm-check.test.mjs.
Removal after acceptance: delete the prebuild entry and these diagnostic/test files in a reviewed follow-up; never remove unrelated build hooks.
