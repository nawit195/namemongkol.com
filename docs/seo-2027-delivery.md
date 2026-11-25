# Organic search delivery, November 2026–December 2027

## Delivery policy

The primary outcome is qualified Google organic traffic. Capacity is one or two reviewed pages per week. Keep winning URLs, including the Monday article's existing 2569 slug and its current redirect. Do not create annual copies of every page, automatically advance the displayed year, or change zodiac-year content into a different year's guide. Publication dates represent actual substantive edits. Never infer query → page relationships from separate exports.

The supplied November 25 workbook is a pre-release baseline, ending November 23. It is not evidence of results from this release. Keep real exports and private normalized reports out of Git. The XLSX adapter is read-only until the existing preview/confirmation flow saves the normalized dimensions.

## First release

- Monday article: preserve all 400 original entries, accurately disclose 348 distinct names and repeated categories, add progressive name/meaning/category search, flag matching Monday rules, expose only confirmed readings and eligible meaning links. These are checks against the site's calculation convention, not dictionary verification or guarantees.
- Women's article: clarify general women's naming versus the baby-girl category, add the same search controls, calculate birthday labels with the existing rule engine, and retain the existing URL.
- Reviewed day wallpapers: preserve Saturday/Thursday image descriptions and download terms; add visually checked Tuesday content with the same SSR image, FAQ and metadata treatment. Finance separates paid 4289 downloads from linked free day collections.
- Boys' and Thursday/Saturday girls' categories: add practical selection guidance using their existing datasets and rule filters.
- GSC: support the standard Thai/English XLSX Chart/Queries/Pages sheets, retain CSV imports, list auxiliary sheets explicitly, and provide descriptive complete 28/56-day comparisons and imported-row concentration/non-brand metrics in the preview.

## Weekly operating cycle

1. Export Web results using one exact property, filters and complete PT dates. Include actual query+page data when evaluating page overlap. Export Images separately; this release does not mix or persist Images in the Web report.
2. Import through `/admin/search-console`, inspect each dimension's totals and filters, then confirm. Chart totals, query coverage and page totals have different meanings; do not add them together.
3. Choose one or two pages: review the specific page's queries, mobile query mix, positions 4–15, click-through rates and actual search-result appearance. A low site-wide CTR or a high average position alone is insufficient to diagnose a page.
4. Update useful answers, verified examples and internal links. Check title/H1/description, canonical, SSR content, images, free/paid conditions and mobile behavior before deployment.
5. Record the actual deployment date and compare at 28 and 56 days. Use equal-length non-overlapping periods and comparable device/query/position groups. Preserve evidence of other simultaneous changes; do not call a before/after difference causal proof.

The preview's 28/56-day cards compare the latest complete adjacent periods in the imported Chart. They are not automatically aligned to a deployment date. Use the release log below to select and export the correct review periods.

## Editorial gates for 2027

| Quarter | Delivery queue | Evidence required before publication |
| --- | --- | --- |
| Q1 | Existing boy birthday pages; Thursday/Saturday girl pages | Page-specific queries, correct birthday filtering, unique useful examples, mobile verification |
| Q2 | Additional individual real-name meanings | Actual publishable catalog entry, pronunciation evidence before displaying it, source URL/edition/page, reviewer and review date; retain pending state when evidence is missing |
| Q3 | Additional nickname meaning/use collections | New observed queries and explicit free A/B membership; no exposure of private A+ records; meaningful collection size and explanation |
| Q4 | Refresh proven pages and prepare 2571 content | Current-year review, material content improvements and a checked calendar convention for any zodiac-specific guide |

Do not invent reviewers, readings, dictionary citations, search volumes or annual traffic forecasts. Existing publication approval is not independent linguistic verification. Expand the bounded meaning-discovery whitelist only after its source and display checks; rerun meaning, sitemap and discovery tests. Create new nickname collections only after demand and dataset review, rather than publishing thin combinations in advance.

## Release log template

| URL | Actual deployment date (PT) | Material change | Baseline export / scope | 28-day review | 56-day review | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Fill after deployment | | | | | | |

Measure non-brand clicks, target-page clicks, pages consistently earning clicks, and absolute clicks outside the two leaders alongside their share. Compare CTR within similar query/device/position groups. Set numeric growth targets after a complete post-release baseline; no traffic increase is guaranteed.

## Mobile and Images checks

Use fixed device/network/CPU settings and repeat runs for before/after lab observations. Lab LCP/FCP and transfer bytes are not field Core Web Vitals p75. Review GSC Core Web Vitals or PageSpeed field data when available before claiming a real-user regression or improvement.

For Images, request an Images export first. Inspect crawlable preview `<img>` URLs, meaningful alt/captions, contextual landing-page text and canonical URLs. Private paid originals stay private; use public previews for indexing and never disclose storage keys or signed URLs in a sitemap.

References: [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [title links](https://developers.google.com/search/docs/appearance/title-link), [Images](https://developers.google.com/search/docs/appearance/google-images), [AI search features](https://developers.google.com/search/docs/appearance/ai-features).

## Verification record

- Full suite: 576 passing tests across 108 files with `npm test -- --maxWorkers=2 --testTimeout=15000`; the optional private-workbook test runs separately when `GSC_WORKBOOK_PATH` is provided. The supplied workbook passed, including Chart totals of 7,373 clicks and 80,292 impressions. No raw workbook or real query rows are committed.
- Optional meaning-catalog failures leave the two naming articles available with all original rows, search metadata and unconfirmed-reading placeholders. Other articles do not request that optional enrichment.
- Production build generates 237 pages. Public HTTP checks cover nine target pages, one H1, a single brand title suffix, canonical URLs, robots, regular sitemap and image sitemap. Unauthenticated workbook conversion returns 401.
- Browser checks cover article search, no results, clearing, category and Monday filtering; widths 320/375/768/1440; and all 400 Monday rows in HTML without JavaScript. The admin component is separately exercised in a local browser harness with mocked network responses, covering XLSX selection, auxiliary sheets, Chart dates, preview-only conversion, invalidation after scope edits and existing CSV controls. Auth checks remain on the real route and in API tests.
- Two local lab loads per target at 375px and 4× CPU throttling were observed before and after the first implementation. Results varied by load and cache; they do not establish field CWV improvement. The additional article-search client script transferred approximately 1.4 KiB in those samples, while XLSX parsing stays server-side. The final layout moves the filter ahead of the TOC and moves the naming journey after the article, removing the repeated pre-list summary/image block on these two articles.
