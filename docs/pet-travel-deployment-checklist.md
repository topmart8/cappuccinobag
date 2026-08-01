# Pet Travel Deployment Checklist

## Automated checks

- [x] Local ESLint passes.
- [x] Existing tests pass: 17/17.
- [x] Production build passes: 177 static/dynamic app routes generated.
- [x] `git diff --check` passes.
- [x] PT001–PT012 are present and unique.
- [x] Commercial titles and descriptions are unique.
- [x] Sitemap includes collection, subcategories, products, guide index and articles.
- [x] Unsupported-claim search reviewed; matches are explicit prohibitions or disclaimers only.
- [x] Placeholder-text search passes; intentional product-photography status labels are not broken image references.
- [x] 92 generated JSON-LD scripts parse successfully across 34 new HTML pages.
- [x] 39 target routes and 53 extracted internal links return without 4xx errors.
- [x] Representative collection, product and article pages pass overflow/console checks at 390, 768, 1024 and 1440 px.

## Manual browser QA

- [ ] Review homepage addition without changing hero priority.
- [ ] Test header, mobile navigation and footer at 390, 768, 1024 and 1440 px.
- [ ] Submit a pet-travel RFQ in staging and verify Supabase record, email notification and attachment upload.
- [ ] Confirm `product_category` is Pet Travel Bags or the selected pet product type.
- [ ] Verify WhatsApp prefilled context and number +86 139 2871 5568.
- [ ] Validate representative Product, CollectionPage, FAQPage, BreadcrumbList and Article JSON-LD.

## Required before final image launch

- [ ] Produce and approve 168 product images from the manifest.
- [ ] Produce desktop and mobile collection banners.
- [ ] Confirm final product dimensions before dimension graphics.
- [ ] Compress product images below 220 KB where quality permits and banners below 450 KB.
- [ ] Replace CSS placeholders only after construction and alt-text review.
