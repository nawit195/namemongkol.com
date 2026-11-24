import { z } from 'zod';

const filters = z
    .object({
        group: z.enum(['ab', 'aplus']).optional(),
        q: z.string().max(100).optional(),
        day: z.string().max(20).optional(),
        gender: z.string().max(10).optional(),
        initial: z.string().max(3).optional(),
        score: z.number().int().min(1).max(200).nullable().optional(),
        grade: z.enum(['all', 'A', 'B']).optional(),
        view: z.enum(['all', 'owned']).optional(),
        page: z.number().int().min(1).max(1000).optional(),
    })
    .strict();

export const nicknameQuerySchema = z.object({ filters }).strict();
export const nicknameUnlockSchema = z
    .object({
        filters,
        requestId: z.uuid(),
        quote: z.string().min(10).max(6000),
    })
    .strict();
export const nicknamePrivateHeaders = {
    'Cache-Control': 'private, no-store, max-age=0',
};

export function nicknameSameOrigin(request: Request) {
    const origin = request.headers.get('origin');
    return !origin || origin === new URL(request.url).origin;
}

export async function readNicknameBody(request: Request) {
    const body = await request.text();
    if (body.length > 10_000) throw new Error('Request too large');
    return JSON.parse(body) as unknown;
}
