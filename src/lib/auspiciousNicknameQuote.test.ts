import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { DEFAULT_NICKNAME_FILTERS } from './auspiciousNicknameShared';
import {
    nicknameQuoteHash,
    signNicknameQuote,
    verifyNicknameQuote,
} from './auspiciousNicknameQuote';

const secret = 'nickname-test-signing-secret';
const now = 1_800_000_000_000;
const filters = { ...DEFAULT_NICKNAME_FILTERS, group: 'aplus' as const };
const payload = {
    userId: 'member-a',
    version: 'test-v1',
    filters,
    ids: ['nn_aaaaaaaaaaaaaaaaaaaa'],
};

describe('nickname purchase quotes', () => {
    it('accepts the signed batch only on its original page', () => {
        const token = signNicknameQuote(payload, secret, now);
        expect(
            verifyNicknameQuote(
                token,
                secret,
                payload.userId,
                payload.version,
                filters,
                now,
            )?.ids,
        ).toEqual(payload.ids);
        expect(
            verifyNicknameQuote(
                token,
                secret,
                payload.userId,
                payload.version,
                { ...filters, page: 2 },
                now,
            ),
        ).toBeNull();
        const secondPage = { ...filters, page: 2 };
        expect(
            verifyNicknameQuote(
                signNicknameQuote(
                    { ...payload, filters: secondPage },
                    secret,
                    now,
                ),
                secret,
                payload.userId,
                payload.version,
                secondPage,
                now,
            )?.filters.page,
        ).toBe(2);
    });
    it('rejects tampering, cross-account replay, new filters, old catalogs and expiration', () => {
        const token = signNicknameQuote(payload, secret, now);
        expect(
            verifyNicknameQuote(
                token + 'x',
                secret,
                payload.userId,
                payload.version,
                filters,
                now,
            ),
        ).toBeNull();
        expect(
            verifyNicknameQuote(
                token,
                secret,
                'member-b',
                payload.version,
                filters,
                now,
            ),
        ).toBeNull();
        expect(
            verifyNicknameQuote(
                token,
                secret,
                payload.userId,
                payload.version,
                { ...filters, gender: 'female' },
                now,
            ),
        ).toBeNull();
        expect(
            verifyNicknameQuote(
                token,
                secret,
                payload.userId,
                'test-v2',
                filters,
                now,
            ),
        ).toBeNull();
        expect(
            verifyNicknameQuote(
                token,
                secret,
                payload.userId,
                payload.version,
                filters,
                now + 901_000,
            ),
        ).toBeNull();
    });
    it('deduplicates the same purchased names independently of quote expiration', () => {
        const a = verifyNicknameQuote(
            signNicknameQuote(payload, secret, now),
            secret,
            payload.userId,
            payload.version,
            filters,
            now,
        )!;
        const b = verifyNicknameQuote(
            signNicknameQuote(payload, secret, now + 100),
            secret,
            payload.userId,
            payload.version,
            filters,
            now + 100,
        )!;
        expect(nicknameQuoteHash(a)).toBe(nicknameQuoteHash(b));
        expect(nicknameQuoteHash({ ...b, ids: ['other'] })).not.toBe(
            nicknameQuoteHash(a),
        );
    });
});
