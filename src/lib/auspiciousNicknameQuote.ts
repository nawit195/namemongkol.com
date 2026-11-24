import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { NicknameFilters } from '@/types/auspiciousNickname';
import { normalizeNicknameFilters } from './auspiciousNicknameShared';

interface NicknameQuote {
    userId: string;
    version: string;
    filters: NicknameFilters;
    ids: string[];
    expires: number;
}

export function nicknamePurchaseFilters(
    filters: NicknameFilters,
): NicknameFilters {
    return normalizeNicknameFilters({
        ...filters,
        group: 'aplus',
        grade: 'all',
        view: 'all',
    });
}

export function signNicknameQuote(
    payload: Omit<NicknameQuote, 'expires'>,
    secret: string,
    now = Date.now(),
) {
    const body = Buffer.from(
        JSON.stringify({
            ...payload,
            filters: nicknamePurchaseFilters(payload.filters),
            expires: now + 15 * 60_000,
        }),
    ).toString('base64url');
    return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}

export function verifyNicknameQuote(
    token: string,
    secret: string,
    userId: string,
    version: string,
    filters: NicknameFilters,
    now = Date.now(),
): NicknameQuote | null {
    try {
        if (token.length > 6000) return null;
        const [body, signature, extra] = token.split('.');
        if (!body || !signature || extra) return null;
        const expected = createHmac('sha256', secret).update(body).digest();
        const received = Buffer.from(signature, 'base64url');
        if (
            received.length !== expected.length ||
            !timingSafeEqual(received, expected)
        )
            return null;
        const payload = JSON.parse(
            Buffer.from(body, 'base64url').toString('utf8'),
        ) as NicknameQuote;
        if (
            payload.userId !== userId ||
            payload.version !== version ||
            !Number.isFinite(payload.expires) ||
            payload.expires < now
        )
            return null;
        if (
            !Array.isArray(payload.ids) ||
            !payload.ids.length ||
            payload.ids.length > 20 ||
            new Set(payload.ids).size !== payload.ids.length
        )
            return null;
        if (
            JSON.stringify(payload.filters) !==
            JSON.stringify(nicknamePurchaseFilters(filters))
        )
            return null;
        return payload;
    } catch {
        return null;
    }
}

export function nicknameQuoteHash(quote: {
    userId: string;
    version: string;
    ids: string[];
}) {
    return createHash('sha256')
        .update(JSON.stringify([quote.userId, quote.version, quote.ids]))
        .digest('hex');
}
