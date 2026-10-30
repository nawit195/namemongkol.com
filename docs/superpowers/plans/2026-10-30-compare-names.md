# Free name comparison

Implement the user-approved /compare-names design: 2–5 manual/autocomplete names,
optional shared surname, required weekday, free without authentication or credits.
Use the individual analysis utilities, never the catalog's grades. Sort grades
stably; expose thaksa separately. Public suggestions obey existing publication
rules. No persistence, export, schema changes, or deployment.

## Tasks
- [x] Comparison validation, calculation, sorting and detail-link helpers + tests.
- [x] Public suggestion selector and API + tests.
- [x] Accessible autocomplete, form and responsive comparison table.
- [x] Navigation, individual-analysis entry, metadata and sitemap.
- [x] Tests, TypeScript, lint, build, browser verification and review.

## Execution notes
Work in the provided checkout on existing feature branch codex/surname-premium-cta.
Design authority: the approved plan in this conversation.
API consumes the existing public catalog; UI consumes only suggestion display fields.
Calculation consumes names/surname/DayKey; table consumes calculated immutable rows.

## Verification
- Full Vitest suite: 41 files, 212 tests passed. New tests cover utility parity,
  validation, stable sorting, suggestion ranking/whitelisting, endpoint failures,
  debounce timing, aborted requests, stale responses, and manual-search fallback.
- TypeScript --noEmit, targeted ESLint and git diff --check passed.
- Production Next.js build passed, including static /compare-names. Initial
  sandbox build could not download existing Google fonts; retry with network
  access succeeded without changing font configuration.
- Browser: real public catalog search, ArrowDown/Enter selection, 2/5 names,
  empty/duplicate/unsupported input, Wednesday night, shared surname, sorting,
  invalidation after changes/removal, detail navigation and reverse prefill.
- Responsive: desktop 1440px, mobile 360px/390px, no document horizontal overflow;
  table keyboard horizontal scrolling preserves sticky row labels.
- Independent read-only review found no blocking issues; its only optional polish
  suggestion was a visible disclosure chevron. No browser errors were captured on
  the tested flow. No deployment, schema or dependency changes.
