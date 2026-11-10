const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
export function thaiActivityDate(now = new Date()): string {
    const parts = dateFormatter.formatToParts(now);
    const part = (kind: string) => parts.find((p) => p.type === kind)!.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}
export function shiftActivityDate(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
}
export function activityDateIsValid(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000'))
        return false;
    const date = new Date(`${value}T00:00:00Z`);
    return (
        Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}
export function isMemberActivityPath(path: string): boolean {
    return [
        '/',
        '/names',
        '/search',
        '/name-check',
        '/compare-names',
        '/name-analysis',
        '/name-generator',
        '/premium-search',
        '/premium-analysis',
        '/articles',
        '/meaning',
        '/pet-name',
        '/wallpapers',
        '/phone-analysis',
        '/aura-analysis',
        '/palm-analysis',
        '/about',
        '/methodology',
        '/reviews',
        '/privacy',
        '/terms',
    ].some(
        (root) =>
            path === root || (root !== '/' && path.startsWith(root + '/')),
    );
}
