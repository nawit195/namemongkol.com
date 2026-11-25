import { z } from 'zod';
import { activityDateIsValid, shiftActivityDate, thaiActivityDate } from './memberActivityDates';

export const PAGE_TRAFFIC_PAGE_SIZE = 50;

export { normalizeTrafficPath } from './pageTrafficPath';

export function parsePageTrafficQuery(params: URLSearchParams, now = new Date()) {
    const today = thaiActivityDate(now);
    const from = params.get('from') ?? today;
    const to = params.get('to') ?? today;
    const q = (params.get('q') ?? '').normalize('NFC').trim();
    const page = params.get('page') ?? '1';
    if (!activityDateIsValid(from) || !activityDateIsValid(to) || from > to || to > today ||
        from < shiftActivityDate(to, -30) || q.length > 100 || !/^[1-9]\d*$/.test(page) || Number(page) > 100000) return null;
    return { from, to, q, page: Number(page) };
}

const count = z.number().int().nonnegative().safe();
const day = z.string().refine(activityDateIsValid);
export const pageTrafficReportSchema = z.object({
    rows: z.array(z.object({ day, path: z.string(), views: count, visitors: count })).max(50),
    daily: z.array(z.object({ day, views: count, visitors: count })).max(31),
    total: count,
    page: z.number().int().positive(),
    pageSize: z.literal(50),
    summary: z.object({ views: count, visitorDays: count, pages: count }),
});
export type PageTrafficReport = z.infer<typeof pageTrafficReportSchema>;
export const pageViewInputSchema = z.object({
    path: z.string().max(1500), visitorId: z.uuid(), eventId: z.uuid(),
}).strict();
