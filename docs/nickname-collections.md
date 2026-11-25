# Curated nickname collections

The three editorial entry points are `/nicknames/meaning/light`, `/nicknames/meaning/happiness` and `/nicknames/unisex`. They serve theme-specific discovery, while `/nicknames` owns the general nickname catalog/day/grade search. Existing boys/girls nickname pages retain their separate parenting-oriented seed lists.

`src/lib/nicknameCollectionLinks.ts` is the small public link registry. The server-only `src/lib/nicknameCollections.ts` resolves explicit IDs solely against the public A/B manifest, preserving meanings, grades, scores, gender and suitable days. Initial collections contain 8, 8 and 20 entries. Their selection reasons explain category fit against the supplied dataset; they do not certify linguistic accuracy or introduce new etymological claims. The unisex label follows the source gender field.

At least eight distinct valid free entries are required per collection. Missing IDs, newly paid/unsupported grades, empty meanings/reasons and non-unisex entries in the unisex collection fail the build. When changing membership or source meanings, review the editorial category reasons too. Do not automatically fill a collection using keyword matches or import the private A+ catalog.

Pages render the complete selection and its editorial context on the server, reuse the existing nickname cards and parent favorites provider, and have self-canonicals, share metadata, breadcrumbs and `CollectionPage`/`ItemList` structured data. The meaning route statically whitelists only `light` and `happiness`; unsupported slugs return 404. Schema counts equal the actual rendered selection. All child pages are linked from the main nickname browser and relevant legacy nickname categories.

Sitemap integration uses `getPublishedNicknameCollections()` and its `.path` values. The existing query-filter variants retain the `/nicknames` canonical rather than becoming duplicate landing pages.

Run `npm test -- --maxWorkers=2 nicknameCollections` for source integrity, page identity, server HTML, JSON-LD and unsupported-slug tests. During release QA, verify the three HTTP pages and a missing meaning slug, and check mobile layout and existing card actions.
