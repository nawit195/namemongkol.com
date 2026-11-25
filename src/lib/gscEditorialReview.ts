import type { GscRow } from './searchConsole';

const shift = (day: string, amount: number) => new Date(Date.parse(`${day}T00:00:00Z`) + amount * 86400000).toISOString().slice(0, 10);
const sum = (rows: readonly GscRow[]) => rows.reduce((total, row) => total + row.clicks, 0);
/** Descriptive imported-row metrics, without assigning queries to separate page exports. */
export function gscEditorialReview(rows: readonly GscRow[]) {
    const daily = rows.filter(row => row.kind === 'daily').sort((a, b) => a.date!.localeCompare(b.date!));
    const latest = daily.at(-1)?.date;
    const periods = [28, 56].map(length => {
        if (!latest) return null;
        const currentFrom = shift(latest, 1 - length), previousFrom = shift(latest, 1 - 2 * length), previousTo = shift(currentFrom, -1);
        const current = daily.filter(row => row.date! >= currentFrom && row.date! <= latest);
        const previous = daily.filter(row => row.date! >= previousFrom && row.date! <= previousTo);
        if (current.length !== length || previous.length !== length) return null;
        const currentClicks = sum(current), previousClicks = sum(previous);
        return { days: length, currentFrom, currentTo: latest, previousFrom, previousTo, currentClicks, previousClicks,
            change: previousClicks ? (currentClicks - previousClicks) / previousClicks * 100 : null };
    }).filter(period => period !== null);
    const pages = rows.filter(row => row.kind === 'pages').sort((a, b) => b.clicks - a.clicks);
    const pageClicks = sum(pages), topTwoClicks = sum(pages.slice(0, 2));
    const queries = rows.filter(row => row.kind === 'queries');
    const nonBrand = queries.filter(row => !/namemongkol|name\s+mongkol|เนมมงคล/i.test(row.query ?? ''));
    return { periods, pageClicks, topTwoClicks, topTwoShare: pageClicks ? topTwoClicks / pageClicks * 100 : null,
        queryClicks: sum(queries), nonBrandClicks: sum(nonBrand),
        opportunities: nonBrand.filter(row => row.impressions >= 100 && row.position >= 4 && row.position <= 15)
            .sort((a, b) => b.impressions - a.impressions || a.key.localeCompare(b.key, 'th')).slice(0, 5)
            .map(row => ({ query: row.query!, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position })) };
}
