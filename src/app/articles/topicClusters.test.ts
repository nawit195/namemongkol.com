import { describe, expect, test } from 'vitest';
import { topicClusters } from './topicClusters';

describe('article topic clusters', () => {
    test('uses a unique href for every sibling link', () => {
        for (const cluster of topicClusters) {
            const hrefs = cluster.links.map((link) => link.href);
            expect(new Set(hrefs).size, cluster.title).toBe(hrefs.length);
        }
    });
});
