type DatedName = {
    name: string;
    createdAt?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function timestamp(value?: string): number {
    if (!value) return 0;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function sortSearchNamesByNewest<T extends DatedName>(names: readonly T[]): T[] {
    return [...names].sort((left, right) => {
        const dateDifference = timestamp(right.createdAt) - timestamp(left.createdAt);
        if (dateDifference !== 0) return dateDifference;
        return left.name.localeCompare(right.name, 'th');
    });
}

export function isRecentlyAdded(createdAt?: string, now = Date.now(), days = 14): boolean {
    const createdTimestamp = timestamp(createdAt);
    if (createdTimestamp === 0 || createdTimestamp > now) return false;
    return now - createdTimestamp <= days * DAY_IN_MS;
}
