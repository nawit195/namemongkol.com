import { compareNames } from './nameComparison';
import { expect, test } from 'vitest';
import { comparisonCost, orderComparisonRows } from './comparisonPricing';
import { favoritesStorageKey, writeFavorites } from './nameFavorites';
import { comparisonIdentity } from './comparisonReport';
test('two/three names cost zero and four/five cost ten per set, not per additional name', () => {
    expect([2, 3, 4, 5].map(comparisonCost)).toEqual([0, 0, 10, 10]);
});
test('favorites are stored in separate account keys without changing legacy data', () => {
    const values = new Map<string, string>();
    const storage = {
        setItem: (key: string, value: string) => {
            values.set(key, value);
        },
    };
    writeFavorites(
        storage,
        [{ name: 'Alice', kind: 'english' }],
        favoritesStorageKey('user-a'),
    );
    writeFavorites(
        storage,
        [{ name: 'Henry', kind: 'english' }],
        favoritesStorageKey('user-b'),
    );
    expect(values.size).toBe(2);
    expect(values.get(favoritesStorageKey('user-a'))).not.toContain('Henry');
});
test('same set identity ignores order/case/outer spaces but changes with name, surname or day', () => {
    const a = {
        names: ['Alice', 'Henry', 'Peter', 'Victor'],
        surname: '',
        day: 'monday',
    };
    expect(comparisonIdentity(a)).toBe(
        comparisonIdentity({
            ...a,
            names: [' victor ', 'PETER', 'henry', 'ALICE'],
        }),
    );
    for (const b of [
        { ...a, names: [...a.names, 'Daniel'] },
        { ...a, surname: 'ทดสอบ' },
        { ...a, day: 'friday' },
    ])
        expect(comparisonIdentity(a)).not.toBe(comparisonIdentity(b));
});

test('reopened paid sets use the current order/spelling and reject mismatched snapshots', () => {
    const input = {
        names: ['Alice', 'Henry', 'Peter', 'Victor'],
        surname: '',
        day: 'monday',
    };
    const rows = compareNames(input.names, input.surname, input.day);
    const next = { ...input, names: ['VICTOR', 'peter', 'henry', 'alice'] };
    const ordered = orderComparisonRows(rows, next)!;
    expect(ordered.map((row) => row.name)).toEqual(next.names);
    expect(ordered.map((row) => row.inputIndex)).toEqual([0, 1, 2, 3]);
    expect(ordered[0].nameScore).toBe(rows[3].nameScore);
    expect(
        orderComparisonRows(rows, {
            ...next,
            names: ['Daniel', 'Peter', 'Henry', 'Alice'],
        }),
    ).toBeNull();
});
