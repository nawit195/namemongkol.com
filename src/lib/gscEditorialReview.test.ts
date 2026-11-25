import { expect, it } from 'vitest';
import { gscEditorialReview } from './gscEditorialReview';
import type { GscRow } from './searchConsole';
const row = (value: Partial<GscRow>): GscRow => ({ kind: 'queries', key: 'x', clicks: 1, impressions: 100, ctr: 1, position: 5, ...value });
it('compares complete equal-length daily periods and refuses incomplete periods', () => {
    const daily = Array.from({ length: 112 }, (_, i) => { const date = new Date(Date.UTC(2026, 5, 1 + i)).toISOString().slice(0, 10); return row({ kind: 'daily', key: date, date, clicks: i < 56 ? 1 : 2 }); });
    const review = gscEditorialReview(daily);
    expect(review.periods.map(period => period.days)).toEqual([28, 56]);
    expect(review.periods[1].change).toBe(100);
    expect(gscEditorialReview(daily.filter((_, i) => i !== 100)).periods).toEqual([]);
});
it('uses each dimension denominator and never joins the separate query and page rows', () => {
    const result = gscEditorialReview([row({ query: 'namemongkol', clicks: 10 }), row({ key: 'q', query: 'ชื่อมงคล', clicks: 2 }), ...[60, 30, 10].map((clicks, i) => row({ kind: 'pages', key: '/'+i, path: '/'+i, clicks }))]);
    expect(result.topTwoShare).toBe(90); expect(result.nonBrandClicks).toBe(2); expect(result.queryClicks).toBe(12);
    expect(result.opportunities).toHaveLength(1); expect(result.opportunities[0]).not.toHaveProperty('path');
});
