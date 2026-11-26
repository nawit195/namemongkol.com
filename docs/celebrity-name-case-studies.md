# Editorial celebrity name calculations

Updated 26 November 2026. The feature explains arithmetic and belief-based numerology rules; it is separate from customer testimonials and the premium name database. No database migration or credit change is required.

## Current public scope

The original A+ workbook contains 156 distinct name strings and 185 separately split surname candidates (139 single-person groups, 15 multi-person groups, and two stage-name groups without surnames). The private manifest and research snapshots stay under ignored scratch/celebrity-name-import/2026-11-26/. The source SHA-256 is 30fe69dc222adc2e09ea65a11d41de88aecae8fd08110f316ad86ddb55c9b42f.

The public export now has **153 name groups and 181 matched person options**. One unresolved identity and three age-review records are withheld before export. The server helper also rechecks the publication holds. No raw biography extracts, birth dates, school records, family details, or unconfirmed identity records are serialized to the browser. The original workbook is unchanged.

All published input strings reproduce their workbook total and A+ with the shared personal-tool functions. A name may be a stage name, former name, or spelling variant. The card therefore displays the calculated input separately from the referenced person's public name. The grade is qualified as the website's belief-based name grade, with no claim that a name causes fame, wealth, or success.

## Routes and content

- /celebrity-names is the editorial directory, with an explanatory notice above the cards, source links, 24 cards per page, a full server-rendered directory, and 153 ItemList entries.
- /celebrity-names/editorial-policy explains purpose, score scope, identity/source handling, image evidence, and requests. Its canonical and sitemap entry are included.
- /privacy#editorial-data describes the actual public-reference data and links to the existing LINE contact channel. The legal controller identity and lawful-basis decision still require owner/counsel confirmation.
- The homepage preview now uses three generic text examples calculated by the shared engine, without celebrity portraits, nicknames, or surnames in that module. It links to methodology and the separate case-study directory.
- Bulk-card tool links prefill only the input name, using mode=prefill. They do not provide a celebrity surname or assumed birthday and do not run analysis automatically.

Only three individually curated workbook case-study articles are generated: Nanon (กรภัทร์ เกิดพันธุ์), Love (ภัทรานิษฐ์ ลิ้มปติยากร), and Fourth (ณัฐวรรธน์ จิโรชน์ธิกุล), with given-name totals 24, 42, and 50. Their existing article URLs remain unchanged. The older Khemanit and Suphajee article URLs are also preserved, with reproducible calculations and no unsupported success claims. No bulk templated articles are generated for the remaining names.

Full-name calculations use the separate given-name and surname pair sets, without a new pair across their boundary, matching the personal tool. Hypothetical day examples in articles are explicitly labeled and are not celebrity birthdays. The five articles link to methodology and the request policy; their direct premium-search CTA is removed. Curated local versions continue to take priority over stale database copies without overwriting the database.

## Portrait evidence and publication

The audit checked 78 source image records: **39 own-work declarations, five recorded external-source license reviews, and 34 sources needing more evidence**. These are evidence classifications, not legal clearances or celebrity marketing consents. Public cards currently have 44 portrait-bearing person options. Two curated copies share the same reviewed source images, so the public attribution file lists 46 local files.

The 34 unresolved originals and the separate curated Love copy were moved out of public (35 files). The previous generated image-optimizer cache was moved into the ignored archive to avoid stale cached delivery. Pending sources do not get restored by the curated-card merge. Unresolved images and missing images have distinct, deliberate placeholders.

Every displayed image has creator credit, file title, source link, license link, description-revision evidence, review date, and resize/framing notice. The creator's own-work declaration is labeled as a declaration; a Commons external-source review is described as such. The site does not present these as proof of personality-rights permission. See public/images/celebrity-names/ATTRIBUTION.md and src/data/celebrityImageReviews.json.

Use node scripts/audit-celebrity-image-evidence.cjs [private-input-directory] --refresh, followed by node scripts/prepare-celebrity-catalog.cjs [private-input-directory], to review sources and prepare the directory. Without --refresh the audit reads saved source snapshots. If a record becomes withheld, move its original out of public and invalidate the relevant deployed image/CDN caches. Tests fail if withheld files remain served. Keep original research archives private.

## Review still required before release

See docs/celebrity-editorial-review.md for the owner/counsel handoff. It records the unresolved lawful-basis assessment, controller identity/contact, any required permissions, transparency obligations, retention, and proportionate request handling. No consent or legal approval has been marked complete by code. The request channel is an existing contact link; no message-sending or ticketing backend was added.

## Verification

The 14 related tests pass, including exact public-source fingerprint, exclusions before export and serialization, all calculated grades, existing URLs, source status, image evidence, dimensions, withheld-file absence, and name-only tool links. TypeScript and changed-code ESLint pass. Pre-commit verification passed all 590 tests across 110 files, with one optional private-workbook test skipped. The import-backup guard tests ran separately from the other files to respect their hard-coded five-second subprocess limit. No unrelated timeout or import behavior was changed.

The final production build passed with 242 generated pages. Production-browser checks at 375, 768, and 1440 pixels passed with no page errors or horizontal overflow. The notice appears before the cards; source revisions are accessible; a held portrait is not borrowed from another selected person; and seven pages contain all 153 names, with nine cards on the last page. The homepage module has three generic examples and no celebrity portraits. Name-only prefill leaves the surname empty and triggers no automatic analysis server action.

The held curated portrait and its catalog copy return HTTP 404; the corresponding image-optimizer request returns HTTP 400 rather than image bytes. The policy page has its expected canonical and occurs once in the sitemap. Robots returns 200. All five existing article URLs return 200 with the updated policy/request links and without a direct premium-search CTA in the study's action section. Browser artifacts stay in ignored scratch/celebrity-name-import/2026-11-26/editorial-ui/. Production preview: http://127.0.0.1:3013/celebrity-names.

## Pre-commit review, 26 November 2026

The review added a current-register check for every bulk portrait before serialization, preventing a stale import from restoring a held image. Creator credit, source-file URL, and license URL must match the recorded evidence. Import and runtime publication holds now share one JSON file. Repeated given names in the Suphajee article meta title were removed. The new stale-import regression and existing source/grade tests pass (14 related tests).

After the pre-commit fixes, the production build again generated 242 pages. Production-browser checks at 375, 768, and 1440 pixels passed, including held-image delivery checks, person switching, source evidence, and name-only prefill without automatic analysis. Canonical, robots, sitemap uniqueness, and the corrected Suphajee meta title were checked on the resulting build. The staged changes exclude private source/research archives and the two pre-existing scratch QA images.
