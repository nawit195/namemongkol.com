import {
    thaiActivityDate,
    shiftActivityDate,
    activityDateIsValid,
} from './memberActivityDates';
export { thaiActivityDate, shiftActivityDate } from './memberActivityDates';
import { z } from 'zod';
export const RETURNING_MEMBERS_PAGE_SIZE = 50;
export function parseReturningMembersQuery(
    params: URLSearchParams,
    now = new Date(),
) {
    const today = thaiActivityDate(now);
    const days = params.get('days') ?? '30';
    let from: string, to: string;
    if (params.has('from') || params.has('to')) {
        from = params.get('from') ?? '';
        to = params.get('to') ?? '';
    } else {
        if (!['7', '30', '90'].includes(days)) return null;
        to = today;
        from = shiftActivityDate(today, 1 - Number(days));
    }
    if (
        !activityDateIsValid(from) ||
        !activityDateIsValid(to) ||
        from > to ||
        to > today
    )
        return null;
    const span = (Date.parse(to) - Date.parse(from)) / 86400000;
    if (span > 364) return null;
    const page = params.get('page') ?? '1',
        source = params.get('source') ?? 'all',
        search = (params.get('search') ?? '').normalize('NFC').trim();
    if (
        !/^[1-9]\d*$/.test(page) ||
        Number(page) > 100000 ||
        !['all', 'observed'].includes(source) ||
        search.length > 100
    )
        return null;
    return {
        from,
        to,
        page: Number(page),
        source: source as 'all' | 'observed',
        search,
    };
}
const timestamp = z.string().datetime({ offset: true });
export const returningMembersSchema = z.object({
    members: z
        .array(
            z
                .object({
                    id: z.string().uuid(),
                    firstName: z.string().nullable(),
                    lastName: z.string().nullable(),
                    email: z.string().nullable(),
                    tier: z.string().nullable(),
                    activeDays: z.number().int().min(2).max(365),
                    observedDays: z.number().int().nonnegative(),
                    legacyOnlyDays: z.number().int().nonnegative(),
                    firstSeenAt: timestamp,
                    lastSeenAt: timestamp,
                    source: z.enum(['observed', 'legacy', 'mixed']),
                })
                .refine(
                    (row) =>
                        row.observedDays + row.legacyOnlyDays ===
                            row.activeDays &&
                        Date.parse(row.firstSeenAt) <=
                            Date.parse(row.lastSeenAt),
                ),
        )
        .max(50),
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    pageSize: z.literal(50),
    summary: z.object({
        activeMembers: z.number().int().nonnegative(),
        returningMembers: z.number().int().nonnegative(),
    }),
    coverage: z.object({
        trackingStartedAt: timestamp,
        legacyImportedAt: timestamp.nullable(),
        legacySources: z.array(
            z.enum([
                'user_action_events',
                'analysis_history',
                'credit_transactions',
            ]),
        ),
    }),
});
export type ReturningMembersResult = z.infer<typeof returningMembersSchema>;
