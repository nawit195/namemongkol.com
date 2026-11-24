import type { NicknameFilters } from '@/types/auspiciousNickname';

export const NICKNAME_UNLOCK_COST = 15;
export const NICKNAME_BATCH_SIZE = 20;
export const NICKNAME_PAGE_SIZE = 30;
export const NICKNAME_FREE_PER_INITIAL = 2;
export const NICKNAME_PREVIEW_POLICY = 'two-per-initial-v1';
export const NICKNAME_DAYS = [
    { key: 'sunday', label: 'อาทิตย์', short: 'อา.' },
    { key: 'monday', label: 'จันทร์', short: 'จ.' },
    { key: 'tuesday', label: 'อังคาร', short: 'อ.' },
    { key: 'wednesday', label: 'พุธ (กลางวัน)', short: 'พ. (วัน)' },
    { key: 'wednesday_night', label: 'พุธ (กลางคืน)', short: 'พ. (คืน)' },
    { key: 'thursday', label: 'พฤหัสบดี', short: 'พฤ.' },
    { key: 'friday', label: 'ศุกร์', short: 'ศ.' },
    { key: 'saturday', label: 'เสาร์', short: 'ส.' },
] as const;
export const NICKNAME_GENDERS = {
    male: 'ชาย',
    female: 'หญิง',
    unisex: 'ใช้ได้ทุกเพศ',
} as const;
export const DEFAULT_NICKNAME_FILTERS: NicknameFilters = {
    group: 'ab',
    q: '',
    day: 'all',
    gender: 'all',
    initial: 'all',
    score: null,
    grade: 'all',
    view: 'all',
    page: 1,
};

export function nicknameInitial(name: string) {
    return name.match(/[ก-ฮ]/u)?.[0] ?? '';
}

/** One canonical representation for URLs, requests, and signed purchase quotes. */
export function normalizeNicknameFilters(
    input: Partial<Record<keyof NicknameFilters, unknown>>,
): NicknameFilters {
    const group = input.group === 'aplus' ? 'aplus' : 'ab';
    const score = Number(input.score);
    const page = Number(input.page);
    return {
        group,
        q:
            typeof input.q === 'string'
                ? input.q.trim().normalize('NFC').slice(0, 100)
                : '',
        day: NICKNAME_DAYS.some((day) => day.key === input.day)
            ? (input.day as NicknameFilters['day'])
            : 'all',
        gender: ['male', 'female', 'unisex'].includes(String(input.gender))
            ? (input.gender as NicknameFilters['gender'])
            : 'all',
        initial:
            typeof input.initial === 'string' && /^[ก-ฮ]$/u.test(input.initial)
                ? input.initial
                : 'all',
        score:
            input.score !== null &&
            input.score !== '' &&
            Number.isInteger(score) &&
            score > 0 &&
            score <= 200
                ? score
                : null,
        grade:
            group === 'ab' && ['A', 'B'].includes(String(input.grade))
                ? (input.grade as NicknameFilters['grade'])
                : 'all',
        view: group === 'aplus' && input.view === 'owned' ? 'owned' : 'all',
        page: Number.isInteger(page) && page > 0 ? Math.min(page, 1000) : 1,
    };
}

export function nicknameFilterParams(filters: NicknameFilters) {
    const params = new URLSearchParams();
    for (const key of Object.keys(
        DEFAULT_NICKNAME_FILTERS,
    ) as (keyof NicknameFilters)[]) {
        if (
            filters[key] !== DEFAULT_NICKNAME_FILTERS[key] &&
            filters[key] !== null
        )
            params.set(key, String(filters[key]));
    }
    return params;
}

export function nicknameReturnUrl(filters: NicknameFilters) {
    const query = nicknameFilterParams(filters).toString();
    return `/nicknames${query ? `?${query}` : ''}`;
}
