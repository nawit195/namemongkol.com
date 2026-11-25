import { describe, expect, test } from 'vitest';
import { topicClusters } from './topicClusters';

describe('article topic clusters', () => {
    test('connects distinct naming decisions to meaning lookup and the analysis tool', () => {
        const cluster = topicClusters.find(item => item.links.some(link => link.href === '/articles/real-name-nickname-numerology'));
        expect(cluster?.links.map(link => link.href)).toEqual([
            '/articles/real-name-nickname-numerology',
            '/articles/name-meaning-vs-numerology',
            '/meaning',
            '/name-check',
        ]);
    });

    test('uses a unique href for every sibling link', () => {
        for (const cluster of topicClusters) {
            const hrefs = cluster.links.map((link) => link.href);
            expect(new Set(hrefs).size, cluster.title).toBe(hrefs.length);
        }
    });
});
