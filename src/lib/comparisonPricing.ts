import type { ComparisonInput } from './comparisonReport';
import type { NameComparison } from './nameComparison';
export const FREE_COMPARISON_LIMIT = 3;
export const EXTENDED_COMPARISON_COST = 10;
export function comparisonCost(count: number): number {
    return count > FREE_COMPARISON_LIMIT ? EXTENDED_COMPARISON_COST : 0;
}

// Reopening the same paid set must still follow today's input order and spelling.
export function orderComparisonRows(
    rows: NameComparison[],
    input: ComparisonInput,
): NameComparison[] | null {
    if (!Array.isArray(rows) || rows.length !== input.names.length) return null;
    const byName = new Map(
        rows.map((row) => [
            row.name.normalize('NFC').trim().toLowerCase(),
            row,
        ]),
    );
    if (input.names.some((name) => !byName.has(name.toLowerCase())))
        return null;
    return input.names.map((name, inputIndex) => ({
        ...byName.get(name.toLowerCase())!,
        name,
        surname: input.surname,
        inputIndex,
    }));
}
