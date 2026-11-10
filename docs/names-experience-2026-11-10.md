# Names experience update — 2026-11-10

## Implemented

Shared warm ivory/lavender/navy layout, six existing category photographs, two generated WebP hero photographs, stable parent navigation, approved-only Thai meanings/readings, canonical score/grade/Thaksa calculations, search/initial/day/style filters, 30-item batches, and a shared 50-item local favorites drawer. Real names transfer to free comparison through sessionStorage, without a URL payload, chosen birthday, automatic analysis or purchase. Pending login drafts take precedence.

## Data boundary observed locally

The public API currently has 7,378 records. In reviewed mode 22 records match approved meanings or existing editorial meanings with no explicit review status; no additional neutral record outside the curated sets currently qualifies. The original 24-boy/30-girl editorial files are preserved. Their unavailable or explicitly unreviewed rows are not reintroduced. Consequently `/names` currently renders 22 examples rather than the target 24. It will render up to 24 as eligible data becomes available. Additional neutral names remain gated until their meanings are approved. No database review decisions were changed.

Added exactly 40 new nicknames (all classified unisex) and 40 new English names, unique against existing entries after NFC/trim/case normalization. Collections total 63 nicknames and 75 English names; gender pages include their respective sets plus unisex names. New entries contain individual sourceUrl fields in `src/data/nameDiscoveryAdditions.ts`. Meanings are short editorial descriptions of lexical facts, not promises about personality or life. Thai readings for English names are explicitly approximate.

## Sources

- Thai word meanings: individual Thai Wiktionary entries, queried together through its MediaWiki API and reviewed on 2026-11-10. The unavailable entry ภูผา was replaced with the sourced entry ภูเขา. Only the intended literal word sense is summarized; other dictionary senses are not naming recommendations.
- English name meanings and historical gender usage: individual Behind the Name entries, linked beside each new name. Dorothy links to Dorothea, whose related names list establishes the relationship; Noah links to the masculine Noah (1) entry. Jacob retains uncertainty about alternative derivations; Rose explicitly describes the English flower association. Lucia traces to Lucius and Latin light.
- Existing dataset meanings were retained; no automatic approval or premium database change was made.

## Image generation record

Tool: built-in `image_gen.imagegen`; generation mode, two new images; no existing assets edited. Optimized with Sharp to WebP, 1200 × 800.

1. `public/images/names/family-hero-v1.webp` (108,888 bytes)

Prompt:

> Use case photorealistic-natural. A premium warm editorial photograph for a Thai baby naming website: a Thai mother and father in modest ivory cotton clothes gently smiling at their peacefully sleeping fully clothed newborn held safely in mother's arms, soft cream knit blanket, intimate wholesome family moment, natural soft window light, warm ivory and champagne palette, subtle dusty lavender accents in nursery, delicate baby's breath flowers in background, uncluttered realistic tasteful luxurious nursery. Landscape 3:2 composition suitable for a small side hero photograph, family grouped centrally with room around faces, no text, no letters, no symbols, no logos, no watermark. Realistic skin and hands, restrained luxury, matches warm baby portrait category photography.

2. `public/images/names/birthday-calendar-v1.webp` (101,914 bytes)

Prompt:

> Use case product-mockup. Premium warm editorial still-life photograph for a Thai baby naming by birthday website. A small blank ivory nursery desk calendar with a subtle seven column blank grid and no writing, pastel wooden moon and sun toys, tiny cream knitted baby booties, cream linen, a small branch of baby's breath flowers, soft lavender and champagne accents, warm natural window lighting, beautifully arranged minimal luxury nursery objects. Landscape 3:2 composition, objects centered, shallow natural depth of field but calendar recognizable. No people, no text, no letters, no digits, no brand, no watermark. Photorealistic tactile paper, wood and wool textures. Match elegant cozy baby photography.

## Validation

- Final full suite: 57 files / 295 tests passed (`vitest run --maxWorkers=2`). An earlier unrestricted parallel run while building hit the existing live-stats test 5-second timeout; limiting workers resolved it without changing that test.
- Production build generated all 219 pages; lint has zero errors and existing warnings in unrelated files/the redirected legacy Monday page.
- Browser: favorites persisted across full navigation and refresh, selection handoff filled two names with no birthday or analysis, nickname selection disabled, cap at 50 enforced, all test favorites removed, local search empty/reset/load-more verified.
- Responsive testing: 320px, 390px, and 1280px; no horizontal overflow. All seven landing images loaded. Verified on the final production build.
- Final audit: 33 routes passed; 30 visible ItemLists matched their SSR cards, one H1 and one brand per title, www canonicals, correct parent links, preserved Monday 308 redirect and destination return link, and no redirect URL in sitemap.
- Fault-injection browser tests used a temporary local proxy: API 500/retry, 30→60 pagination, delayed search replaced by the latest result, blocked localStorage with in-memory favorites, and pending comparison login draft taking precedence over favorite selection.
- Fixed pre-existing unguarded localStorage access in LanguageProvider and CookieConsent so storage denial does not crash the whole page. Strict reviewed reads reject database failures instead of exposing fallback names; original API callers retain their existing fallback.
- Repeatable HTML/metadata audit: `node scripts/audit-names-pages.mjs http://localhost:3155`.

No commit, push, database migration, pricing/formula change, or production deployment performed.


Preview available in the local server at http://localhost:3155/names. Temporary QA proxy stopped; no fixture data saved to the database.
