# Pet Travel Deployment Checklist

## Automated checks

- [x] Local ESLint passes.
- [x] Existing tests pass: 21/21.
- [x] Production build and TypeScript phase pass: 184 app routes generated.
- [x] `git diff --check` passes.
- [x] PT001–PT012 are present and unique.
- [x] Commercial titles and descriptions are unique.
- [x] Sitemap includes collection, subcategories, products, guide index and articles.
- [x] Unsupported-claim search reviewed; matches are explicit prohibitions or disclaimers only.
- [x] Placeholder-text search passes; intentional product-photography status labels are not broken image references.
- [x] 92 generated JSON-LD scripts parse successfully across 34 new HTML pages.
- [x] 39 target routes and 53 extracted internal links return without 4xx errors.
- [x] All 26 source WebP assets are non-empty, hash-unique and below the defined size limits; 35 rendered image URLs return successfully.
- [x] Representative collection, product and article pages pass overflow/console checks at 390, 768, 1024 and 1440 px.

## Manual browser QA

- [ ] Review homepage addition without changing hero priority.
- [ ] Test header, mobile navigation and footer at 390, 768, 1024 and 1440 px.
- [ ] Submit a pet-travel RFQ in staging and verify Supabase record, email notification and attachment upload.
- [ ] Confirm `product_category` is Pet Travel Bags or the selected pet product type.
- [ ] Verify WhatsApp prefilled context and number +86 139 2871 5568.
- [ ] Validate representative Product, CollectionPage, FAQPage, BreadcrumbList and Article JSON-LD.

## Required before final image launch

- [x] Produce 24 distinct AI-assisted product concepts for PT001–PT012 (main and lifestyle).
- [x] Produce distinct desktop and mobile AI-assisted collection banners.
- [ ] Produce the remaining 144 detail images from the manifest.
- [ ] Replace all AI-assisted concepts with approved real-sample photography before claiming final production assets.
- [ ] Confirm final product dimensions before dimension graphics.
- [ ] Compress product images below 220 KB where quality permits and banners below 450 KB.
- [x] Render concept images over the existing safe CSS fallback with meaningful alt text and a visible production-pending disclosure.
