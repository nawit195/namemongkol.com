import type { DayKey } from '@/types';

export type NicknameGrade = 'A+' | 'A' | 'B';
export type NicknameGender = 'male' | 'female' | 'unisex';
export interface AuspiciousNickname {
    id: string;
    name: string;
    grade: NicknameGrade;
    numerology: number;
    suitableDays: DayKey[];
    pairs: { number: string; status: 'green' | 'orange' }[];
    meaning: string;
    gender: NicknameGender;
}
export interface NicknameFilters {
    group: 'ab' | 'aplus';
    q: string;
    day: DayKey | 'all';
    gender: NicknameGender | 'all';
    initial: string;
    score: number | null;
    grade: 'all' | 'A' | 'B';
    view: 'all' | 'owned';
    page: number;
}
export interface VisibleNickname extends AuspiciousNickname {
    access: 'free' | 'preview' | 'purchased';
}
export interface NicknameQueryResponse {
    success: true;
    data: VisibleNickname[];
    total: number;
    visibleTotal: number;
    lockedCount: number;
    lockedOnPage: number;
    page: number;
    totalPages: number;
    initials: { initial: string; count: number }[];
    scores: number[];
    summary: { total: number; aPlus: number; ab: number; a: number; b: number };
    catalogVersion: string;
    viewer: { authenticated: boolean; credits: number | null };
    accessReady: boolean;
    purchase: { cost: number; count: number; quote: string | null };
}
