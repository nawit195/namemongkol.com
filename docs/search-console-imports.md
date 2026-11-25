# Search Console CSV and XLSX reports

Open `/admin/search-console`. This is an administrator-only report, independent of the site's Bangkok-time first-party page-view counter. CSV data stays private in Supabase; do not commit real exports, query terms or raw files to Git.

## Supported v1 imports

The upload form also accepts a standard Google Web Search `.xlsx` export. The administrator-only, same-origin `/api/admin/search-console/workbook` endpoint streams at most 3 MiB, checks actual ZIP inflation limits, rejects formulas/macros/external workbook links and oversized sparse coordinates, and reads workbook values only on the server. It returns a no-write conversion to the existing strict CSV normalization flow. Parsing does not import data automatically.

Thai and English Chart, Queries and Pages sheets remain separate. The Chart's actual daily dates prefill the PT reporting interval; the user must verify property, country, device and other filters. Relative filter labels such as “last 3 months” do not determine the dates. Country, Device and Search Appearance sheets are listed as auxiliary sheets, explicitly excluded from imported totals; their raw rows are not persisted. Images workbooks are rejected rather than mislabeled as Web. CSV support, deduplication and hash-confirmed persistence remain unchanged.

The no-write preview additionally summarizes complete adjacent 28/56-day Chart periods, the top two pages' share of **imported page clicks**, and a basic text-based non-brand query breakdown. Missing daily coverage prevents that period comparison. These descriptive cards neither join separate dimensions nor establish causality. See [the 2027 operating plan](seo-2027-delivery.md) for deployment-aligned review and editorial gates.

Use Google **Web Search** exports with daily PT dates. Select one CSV per dimension, up to four dimensions and 20,000 normalized rows in one import. The UTF-8 JSON request, including metadata and quoted CSV text, must fit within 3 MiB.

- Queries: `Top queries,Clicks,Impressions,CTR,Position` (also accepts common Thai headers).
- Pages: `Top pages,Clicks,Impressions,CTR,Position`.
- Daily Chart: `Date,Clicks,Impressions,CTR,Position`, with ISO `YYYY-MM-DD` values inside the stated reporting period.
- Genuine combined query/page data: `query,page,clicks,impressions,position`, compatible with the existing weekly CLI's input shape.

Do not label hourly/24-hour, weekly or monthly exports as daily. Standard GSC daily dates are Pacific Time; the site's visitor report uses Asia/Bangkok. Never join their dates or treat Search clicks as unique people. Search Console can omit anonymous queries and truncate tables to 1,000 representative rows, while chart totals and page/query aggregation differ. This report therefore keeps dimensions separate and labels summaries as **sums from imported rows**, not complete Google traffic. It never combines a separate Queries file with a Pages file to invent query→page relationships. Combined rows retain their actual relationships without inferring causality.

Set the exact property (URL-prefix or domain), dates, country, device and any additional filter notes used for the export, then confirm they match. The default is the last 28 complete PT days; future PT dates are rejected. Standard separate aggregate tables do not carry sufficient date/filter metadata, so the user must supply it. URL-prefix imports accept only URLs under that prefix; domain-property imports allow HTTP/HTTPS and www/non-www variants and preserve those variants and query strings for diagnosis.

## Import and comparison semantics

The parser supports UTF-8 BOM, CRLF, quoted multiline fields, escaped quotes and quoted thousands. It rejects malformed quotes, missing dimensions/metrics, invalid or negative counts, duplicate dimension keys and mixed granularities that can be detected from columns/dates. Counts are checked lexically before conversion to a JavaScript number, so fractional tails cannot be silently rounded into integers; `.0`-only decimal tails are accepted as exact integers. A measured position must be at least 1 when impressions are positive; zero-impression rows may use zero as the no-data sentinel. CTR is derived from counts; position is impression-weighted. `POST /api/admin/search-console?validate=1` returns a no-write preview of scope, per-dimension counts and weighted metrics. Final save requires `X-GSC-Preview-Hash` from that preview, and a changed normalized payload is rejected with 409. UI edits invalidate the preview. Invalid batches are rejected before persistence. The database import RPC then saves metadata and all rows atomically.

Normalized content, period and scope determine the SHA-256 import hash. Uploading identical data (even a reordered file or renamed file) returns its original import ID. Revised values for an existing period create a new immutable snapshot; they do not append metrics into the older version. History is paginated so older snapshots remain accessible. Dimension identity hashes avoid database index-width limits on long Unicode query/page keys.

Comparisons require the same property, Web search type, country, device, other-filter notes, dimension and equal-length **non-overlapping** date intervals. Both current and comparison summaries apply the current search text and opportunity filter independently. Zero previous clicks/impressions produce no percentage baseline, rather than infinity or invented growth. CTR/position deltas are null when either side has no impressions. CTR differences are percentage points; a lower position is better. Empty datasets summarize to zero with no claim of a measured ranking for zero impressions.

## Sorting and opportunity review

Detail requests accept `sort=clicks|impressions|ctr|position|dimension`, `order=asc|desc` and optional `opportunity=1` (`0` or absent disables it). Unknown values are rejected. Ordinary tables default to clicks descending; daily tables default to date/dimension ascending. CTR and position rows with no impressions sort after measured values in either direction. Dimension keys break ties consistently across pages.

The opportunity option selects rows with positive impressions and average position **4 through 15 inclusive**. It is available for query, page and genuine query/page tables, not daily charts. Search text and this filter apply in SQL before counting rows, computing summaries or paginating, including both sides of comparisons. This is a review aid, not a prediction of traffic growth. Rows can enter or leave this range between periods, so a filtered comparison is not a fixed cohort of identical queries or pages.

The new service-only `search_console_report_filtered` RPC has seven required parameters. The original four-parameter `search_console_report` RPC is preserved for deployed callers; there is no overloaded function name or SQL built from user-provided identifiers.

## Security and storage

`search_console_imports` and `search_console_rows` enable RLS, revoke guest/member access and reset existing default service-role grants before granting only reads/inserts. The creator FK is nullable on account deletion so a later account removal does not block or remove shared historical metrics. All RPCs use invoker rights with fixed search paths and service-only execution. Every admin API verifies the cookie session and the database profile role before creating the service client. APIs return private/no-store responses; import POST rejects cross-origin writes. Raw CSV files are not retained, only normalized records and scope metadata. Report keys are rendered as text; browser code never imports the Node crypto/parser module.

Apply `*_search_console_imports.sql`, then `*_search_console_report_filters.sql`, before deploying this UI. Existing daily page traffic work and the weekly CLI remain unchanged. Validate with `npm test -- searchConsole` and `node scripts/test-search-console.mjs path/to/@electric-sql/pglite`; the SQL harness exercises 1,440 opportunity rows, every sort/direction across page boundaries, exact filtered summaries, deduplication, revisions, rollback, long Unicode identities and role denial. Production GSC prioritization still requires an actual export; the dashboard starts empty.

Sources: [Google export limitations](https://support.google.com/webmasters/answer/12919797?hl=en), [GSC dates and groupings](https://support.google.com/webmasters/answer/17011259?hl=en-GW), [Google metric definitions and one-based average position](https://support.google.com/webmasters/answer/9131543?hl=en).
