# ชื่อเล่นมงคล

`/nicknames` has free A/B discovery and a paid A+ catalog. Data is imported from the supplied workbook, never recalculated with the real-name grading algorithm.

## Updating the catalog

Run `python scripts/import-auspicious-nicknames.py path/to/workbook.xlsx`. The importer validates grades, days, genders and pair colors and rejects conflicting duplicates. The public manifest contains A/B only. All A+ records are written to `.local/nicknames-import/aplus.json`, which is ignored by Git. Publish it with `node scripts/publish-nickname-catalog.mjs` after applying both nickname migrations and before deploying the corresponding manifest. IDs are derived from NFC-normalized names; the catalog version is content-based. The initial import has 1,645 names: 369 A+, 25 A, and 1,251 B.

The Git repository is public. Never commit the private import, paid records or paid production test fixtures. `nickname_catalog` permits only service-role access. Versioned paid catalogs are cached on the server for 600 seconds; older versions can coexist during deployment. A/B is paginated in groups of 30. A+ exposes the first two Thai-sorted names of each initial as fixed free examples, chosen before search, gender, score or birthday filters. Letters with fewer than two names are entirely free. Changing filters cannot rotate these examples. Unit and SQL tests use synthetic paid names.

A+ pages contain up to 20 non-preview records plus the free examples encountered in that range. When a specific initial is selected, its free examples stay visible on subsequent pages. Buying names does not move records between pages. `lockedOnPage` is a count only; public responses contain no locked record IDs, names or details. Authenticated purchase quotes bind the exact IDs without exposing nickname details. Blurred cards contain decorative shapes. The public request includes a preview-policy version to avoid stale CDN responses after allowance changes.

## Purchases

Apply the `nickname_unlocks` migration before enabling purchases. The existing Supabase server URL, anonymous key and server-only service-role key are required. Missing schema or service configuration disables purchasing. An A+ purchase costs 15 credits for the next 1–20 new matching names; the actual count is displayed before confirmation. Free examples and purchased names are excluded.

The server signs a quote bound to the account, filters including the displayed page, catalog version and exact result IDs. A purchase opens all remaining locked cards on that page, up to 20; free and already purchased names are excluded. `unlock_nickname_batch` serializes purchases on the existing wallet, debits valid welcome credits first, records the spend and persists snapshots/entitlements atomically. The service role alone can execute it. Account-scoped RLS permits customers to read their own receipts, never write them.

Snapshots do not expire with general search history. A repeated request ID or identical result set does not incur another charge. A changed selection returns 409 without charging. Following an uncertain network response, retry the same request; the API checks the receipt before validating quote expiry.

## Validation

- `npm test` covers source reconciliation, filters, pagination, fixed previews, retained snapshots, quote integrity and API access boundaries.
- `node scripts/test-nickname-unlocks.mjs path/to/@electric-sql/pglite` exercises the actual migration and wallet transaction in an isolated PostgreSQL runtime.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Check mobile through desktop, keyboard details/favorites, login return URLs, partial batches and private response headers.

Public responses use CDN caching. Account data and purchase responses are private/no-store. The interface does not poll wallets or run name analysis for each card.
