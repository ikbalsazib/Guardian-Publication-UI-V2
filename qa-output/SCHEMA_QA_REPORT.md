# JSON-LD Local QA Report

**Date:** 2026-06-21  
**SSR server:** `http://localhost:7001` (port 7000 blocked by macOS AirPlay)  
**Build:** `npm run build` — success  
**Unit tests:** `npx vitest run src/app/core/schema/schema.service.spec.ts` — 6/6 pass

## Code changes this session

1. **About page LocalBusiness** — `buildAboutPageGraph()` now includes `LocalBusiness` node + `mainEntity` reference to `#localbusiness`.
2. **BookStore type** — kept `LocalBusiness` in `schema.config.ts` (client confirmation pending for `BookStore`).
3. **Offers page schema race** — removed `setBreadcrumbSchema()` overwrite; collection schema always applied via `setCollectionSchema()`.
4. **Invalid ISBN** — `isValidIsbn()` rejects `"00"` / `"0"` placeholder values.

## SSR HTML verification (initial HTML source)

| URL | JSON-LD | Types | Result |
|-----|---------|-------|--------|
| `/` | Yes | WebSite, Organization | PASS |
| `/product-details/ami-jani-tumi-mithya-bolcho` | Yes | Product, Book, Offer (nested), BreadcrumbList | PASS |
| `/product-list` | Yes | CollectionPage, BreadcrumbList (no Product) | PASS |
| `/blog/the-mistake-that-led-to-saddam-hussein-s-downfall` | Yes | BlogPosting, BreadcrumbList | PASS |
| `/contact-us` | Yes | ContactPage, LocalBusiness, BreadcrumbList | PASS |
| `/pages/about-us` | Yes | AboutPage, Organization, LocalBusiness, BreadcrumbList | PASS |
| `/offers` | Yes | CollectionPage, BreadcrumbList | PASS |
| `/product-details/invalid-slug-xyz-404` | No Product schema | — | PASS |
| `/blog/invalid-blog-slug-xyz` | No BlogPosting | — | PASS |

Run locally: `BASE_URL=http://localhost:7001 node scripts/schema-qa.mjs`

## Data parity (product pages)

| Product | Schema price | Visible price | Availability | ISBN | aggregateRating |
|---------|-------------|---------------|--------------|------|-----------------|
| ami-jani-tumi-mithya-bolcho | 280 BDT | 280 | InStock | 978-984-95370-6-9 | omitted |
| utthhaner-pothe-bangladesh | 250 BDT | 250 | InStock | 978-984-29286-4-2 | omitted |
| lost-history- | 360 BDT | 360 | InStock | omitted (was "00") | omitted |

Price parity: schema `offers.price` matches visible discounted price on page.

## Structural validation (Rich Results readiness)

`node scripts/schema-validate-structural.mjs` — **0 critical issues** on sample URLs.

## External validators

**ngrok not installed** on this machine — Google Rich Results Test cannot reach localhost directly.

**After manual deploy**, test these production URLs:

- https://www.guardianpubs.com/
- https://www.guardianpubs.com/product-details/ami-jani-tumi-mithya-bolcho
- https://www.guardianpubs.com/product-list
- https://www.guardianpubs.com/contact-us
- https://www.guardianpubs.com/pages/about-us
- https://www.guardianpubs.com/offers

Tools:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

Optional local tunnel: `ngrok http 7001` then test tunnel URL in Rich Results Test.

## Definition of Done

- [x] JSON-LD in server-rendered HTML source
- [x] No Product schema on listing pages
- [x] No BlogPosting on missing blog
- [x] No aggregateRating without reviews (sample products)
- [x] No empty/placeholder ISBN
- [x] About + Contact include LocalBusiness
- [ ] Rich Results Test on production (post-deploy — user action)
