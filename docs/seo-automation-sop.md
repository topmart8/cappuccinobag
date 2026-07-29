# SEO Automation SOP for Operations

This is a draft-first process. Never merge or publish a page until copy, claims, images and the Preview have been checked.

1. Open `/crm/seo/keywords`.
2. Paste keywords or upload a CSV.
3. Review score, intent, buyer stage, category, page type and existing target URL.
4. Approve only relevant B2B manufacturing keywords; leave unclear keywords in `manual_review`.
5. Open `/crm/seo/content` and review the Brief before the draft.
6. Check the seven review scores and every required change.
7. Edit or return copy that includes unconfirmed MOQ, price, fee, lead time, certification, capacity, customer or brand claims.
8. Confirm the only public inquiry email is `info@cappuccinobag.net`.
9. Open `/crm/seo/internal-links`; approve varied, relevant anchors. Do not link legal/payment pages.
10. Open `/crm/seo/image-jobs`; use real product photos for product structure. Label concept images and reject changed pockets, zippers, straps, hardware, logos or certifications.
11. Mark the task approved only after all reviews are complete.
12. Manually trigger “Approved content pull request” with the approved task ID and `approval_status=approved`.
13. Open the draft PR and wait for the Vercel Preview.
14. Check desktop/mobile layout, metadata, structured data, all links, images, RFQ and contact paths.
15. Ask an authorized person to merge. Automation must not merge `main`.
16. Verify the production page after deployment.
17. Import Search Console results under `/crm/seo/analytics` and review update suggestions.

If uncertain, keep the task in `manual_review`. Do not guess commercial facts.
