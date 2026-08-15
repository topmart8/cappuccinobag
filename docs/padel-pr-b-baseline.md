# Padel PR B Baseline and Intent Map

Captured before editing on 2026-08-16 (Asia/Shanghai).

## Source state

- Main SHA: `fd176110f30f6464b7af8a108912e4a0ef19b640`
- Production SHA: `fd176110f30f6464b7af8a108912e4a0ef19b640`
- Production deployment: `dpl_AGWjR2LKZoQnSnBuQhPuuenu2EA7` (`READY`)
- Existing audit evidence: `reports/cappuccino-url-audit.csv`, `reports/duplicate-content-report.csv`, `reports/keyword-cannibalization-report.csv`, and the current Production crawl.
- GSC evidence: **NOT VERIFIED**. The repository contains a protected GSC/GA4 workflow, but no local credentials or authenticated query/landing-page export was available. No traffic, ranking, or volume numbers are inferred.

## Production baseline

All three URLs returned 200, were indexable, self-canonical, present in the sitemap, and had one H1.

| URL | Existing role signal | Title | H1 | Key H2 signals | Schema | Contextual internal anchors |
|---|---|---|---|---|---|---|
| `/custom-padel-bag-manufacturer` | Manufacturer plus an injected product catalogue | Reliable Padel Bag Manufacturer in China \| OEM/ODM | Reliable Custom Padel Bag Manufacturer in China | Collection 2026; product formats; customization; MOQ; manufacturing FAQ | CollectionPage, FAQPage, BreadcrumbList, WebSite | Quote; collection development; accessories; tennis; factory proof; products |
| `/racket-sports/padel-bags` | Manufacturer and production landing page | Custom Padel Bag Manufacturer \| OEM Padel Racket Bags | Your Padel Bag Development Partner | partnership; product programs; OEM process; manufacturing; QC | CollectionPage, FAQPage, BreadcrumbList, WebSite | Quote; product programs |
| `/custom-tennis-padel-racket-bags` | Mixed manufacturer/product landing page | Custom Tennis & Padel Racket Bags \| OEM Racquet Sports Bag Manufacturer | Custom Tennis & Padel Racket Bags | showroom; product opportunity; features; OEM process; generic FAQ | CollectionPage, FAQPage, BreadcrumbList, WebSite | Quote; upload; catalogue; project |

### Baseline similarity

Cosine values use normalized visible body text after excluding header, navigation, footer, aside, scripts and styles. Sequence values compare normalized body strings. The same method is used after implementation.

| Pair | Body cosine | Body sequence | Title cosine | Description cosine | H1 cosine | FAQ cosine |
|---|---:|---:|---:|---:|---:|---:|
| Manufacturer ↔ Collection | 0.7697 | 0.1285 | 0.5590 | 0.2802 | 0.3381 | 0.4347 |
| Manufacturer ↔ Racquet overview | 0.7745 | 0.1199 | 0.4472 | 0.2390 | 0.3381 | 0.0000 |
| Collection ↔ Racquet overview | 0.6881 | 0.2001 | 0.8000 | 0.3553 | 0.2000 | 0.0000 |

## One-page-one-primary-intent map

| URL | Primary keyword cluster | Secondary cluster | Search intent and role | Buyer stage | Main CTA | Recommended inbound anchors | Links out |
|---|---|---|---|---|---|---|---|
| `/custom-padel-bag-manufacturer` | padel bag manufacturer; OEM padel bag manufacturer; padel bag factory China | private-label production; sampling; MOQ factors; QC; materials; export support | Commercial sourcing; manufacturer/factory/OEM hub | Evaluation → supplier contact | Start an OEM padel project | padel bag manufacturer; OEM padel bag development; factory review | Collection, factory proof, materials, case studies, inquiry |
| `/racket-sports/padel-bags` | custom padel bags; custom padel racket bag; padel backpack; padel duffel | private-label collection; compartments; materials; customization | Commercial investigation; collection and product-discovery hub | Discovery → shortlist → RFQ | Build a padel bag shortlist | explore custom padel bags; padel bag collection; compare padel bag formats | Product pages, manufacturer, materials, case studies, inquiry |
| `/custom-tennis-padel-racket-bags` | racquet sports bags; custom racket sports bags; tennis vs padel bag | tennis, padel and pickleball storage; shoe and accessory organization | Educational/commercial investigation; racquet-sports overview | Awareness → category selection | Choose a racquet bag family | racquet sports bag guide; compare tennis, padel and pickleball bags | Padel collection, tennis, pickleball, manufacturer, products |

## Intended hierarchy

`Racquet sports overview → Padel collection → Padel manufacturer / Start OEM project`

- Homepage “Explore Padel Bags” and product-directory/category links should enter the Collection hub.
- Manufacturer-oriented anchors should point to the Manufacturer hub.
- The overview should compare product families, not claim primary Padel manufacturer intent.
- All three URLs remain indexable and self-canonical. `/site/custom-padel-bag-manufacturer` remains unchanged pending traffic/backlink evidence.

## Post-implementation validation

| URL | Final role | Final title | Final H1 |
|---|---|---|---|
| `/custom-padel-bag-manufacturer` | OEM/ODM manufacturer and sourcing hub | Custom Padel Bag Manufacturer in China \| OEM/ODM Factory | OEM/ODM Padel Bag Manufacturer in China |
| `/racket-sports/padel-bags` | Padel product-format collection hub | Custom Padel Bags Collection \| Racket Bags, Backpacks & Duffels | Custom Padel Bags: Racket Bags, Backpacks & Duffels |
| `/custom-tennis-padel-racket-bags` | Educational racquet-sports comparison guide | Racquet Sports Bag Guide \| Tennis, Padel & Pickleball | Racquet Sports Bags: Tennis, Padel & Pickleball |

### Similarity after implementation

| Pair | Body cosine | Body sequence | Title cosine | Description cosine | H1 cosine | FAQ cosine |
|---|---:|---:|---:|---:|---:|---:|
| Manufacturer ↔ Collection | 0.7743 | 0.1420 | 0.2108 | 0.2554 | 0.1260 | 0.5873 |
| Manufacturer ↔ Racquet overview | 0.7532 | 0.0524 | 0.2520 | 0.1820 | 0.1543 | 0.3991 |
| Collection ↔ Racquet overview | 0.7857 | 0.1569 | 0.1195 | 0.4454 | 0.4082 | 0.3786 |

Unigram body cosine remains vocabulary-sensitive because all three pages discuss Padel and bag development. The more intent-sensitive signals show the separation: titles and H1s are substantially more distinct, and sequence similarity fell from `0.1199` to `0.0524` for Manufacturer ↔ Overview and from `0.2001` to `0.1569` for Collection ↔ Overview.

### Role-term concentration (mentions per 1,000 words)

| Page | Manufacturer terms, before → after | Collection terms, before → after | Overview/comparison terms, before → after |
|---|---:|---:|---:|
| Manufacturer | 45.1 → 71.6 | 35.2 → 22.0 | 2.7 → 7.7 |
| Collection | 48.3 → 18.4 | 28.0 → 97.7 | 1.3 → 10.3 |
| Racquet overview | 67.9 → 6.6 | 7.0 → 51.1 | 17.4 → 68.2 |

### Verification summary

- ESLint passed with zero warnings.
- Next.js type generation passed.
- Test suite passed: 51 passed, 0 failed.
- Production build passed: 222 static pages generated.
- Local production crawl: 175/175 sitemap pages successful; zero broken internal links, redirected internal links, broken images, canonical errors, sitemap errors, schema parse errors, or visible FAQ/FAQPage mismatches.
- Browser QA passed at 1440px and 390px for all three pages: HTTP 200, one H1, no horizontal overflow, no broken images, no failed requests, and no console errors.
- No authenticated GSC evidence was available. `/site/custom-padel-bag-manufacturer` remains deferred; no redirect or index change is included.
