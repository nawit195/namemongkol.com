# Meaning pages

`/meaning` is the server-rendered discovery hub. Its GET search sends a valid Thai name to `/meaning/[name]`; invalid input remains in the form with an explanation. Names are normalized to NFC and limited to 60 Thai letters/marks. Malformed detail paths return 404.

The detail page now describes the actual published meaning rather than presenting a numerology prediction as a dictionary definition. It separates meaning, reviewed reading, source limitations, related names and an optional analysis journey to `/name-check?name=…`. No root, source language, English translation, pronunciation or external citation is invented.

## Publication boundaries

`src/data/meaningDiscovery.ts` owns a browser-safe, bounded explicit discovery whitelist, based on the former popular-name sitemap list plus a few editorial semantic groups. The model re-exports this membership for existing server consumers. `prepareReviewedNames` remains the publication gate: an approved nonempty meaning may be used; existing editorial meanings may be used only when no explicit adverse status exists; pending/draft/rejected meanings and rejected duplicates are excluded. Legacy or unapproved pronunciations and variants never display as confirmed readings.

Approval in the site's catalog does not establish dictionary or linguistic certification. The public adapter does not expose source evidence, so the UI labels the meaning conservatively as published NameMongkol catalog/editorial information and states that no external reference is attached. It does not infer a CSV or user-supplied origin from that approval flag.

Only whitelist names with eligible meanings are linked from the hub and returned by `getMeaningDiscoveryNames()` for sitemap use. Other valid Thai names provide a transparent `noindex,follow` utility page explaining that this curated meaning-page collection covers only part of the site's catalog. These names do not trigger catalog loading or emit DefinedTerm, even if the wider database might contain them. Unavailable seed meanings also remain noindex with no DefinedTerm. This prevents bulk publication of thousands of imported, thin definition pages and full-catalog scans for arbitrary typed URLs.

## Related names and structured data

Related names require both explicit group membership and a supported word in each published meaning. The displayed reason quotes that word. This is an editorial relationship between meanings, not a claim of shared linguistic derivation. At most four related names are shown, and unsupported or unavailable entries are omitted.

DefinedTerm descriptions use the actual displayed meaning only; numerology is never their definition. Breadcrumbs lead to the real `/meaning` hub. Metadata uses NFC self-canonicals and leaves the root title template to add the brand once. JSON-LD escapes HTML-significant characters and line separators, and visible source strings use React text escaping.

## Caching and verification

`src/lib/nameMeaningCatalog.ts` reuses `fetchAllPublicNames(true)`, whose bounded database pages already use the `public-names` tag. Only the small discovery model is cached separately for 600 seconds with the same tag. Review preparation filters to the whitelist before calculating anything; it never recalculates the full imported catalog for every detail request. Nonseed lookups return before loading any catalog, so cache cardinality stays bounded. There are no new database queries, schema changes, writes or raw data exports.

Run `npm test -- nameMeaning` for review gates, legacy readings, unknown/malformed names, bounded discovery, related-name integrity, server HTML, metadata, lookup redirects and JSON-LD escaping. Check `/meaning`, a known name such as `/meaning/ธนกร`, a valid unavailable name and a malformed path at mobile and desktop sizes before release. The guide links point to `/articles/name-meaning-vs-numerology` and `/articles/real-name-nickname-numerology`.
