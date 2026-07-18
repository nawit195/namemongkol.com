import type { PetNameFilters, ScoredPetName } from '@/types/petName';

export const PET_NAME_FREE_COUNT = 3;
export const PET_NAME_SET_SIZE = 12;
export const PET_NAME_UNLOCK_COST = 15;
export const PET_NAME_FINGERPRINT_VERSION = 'pet-name-v1';

export type PetNameQueryMode = 'search' | 'analysis';

export interface PetNamePreview {
    detailLevel: 'preview';
    slug: string;
    nameTh: string;
    nameEn: string;
    pronunciation: string;
    meaning: string;
    petTypes: ScoredPetName['petTypes'];
    totalScore: number;
    numerologyValue: number;
    reason: string;
    meaningAvailable: boolean;
}

export interface PetNameFullResult extends ScoredPetName {
    detailLevel: 'full';
}

export type PetNameVisibleResult = PetNamePreview | PetNameFullResult;

export interface PetNameViewer {
    authenticated: boolean;
    credits: number | null;
}

export interface PetNameQueryResponse {
    success: true;
    mode: PetNameQueryMode;
    fingerprint: string;
    results: PetNameVisibleResult[];
    totalMatches: number;
    lockedCount: number;
    isUnlocked: boolean;
    canUnlock: boolean;
    cost: number;
    viewer: PetNameViewer;
}

export function normalizePetNameFilters(filters: PetNameFilters): PetNameFilters {
    return {
        ...filters,
        traits: [...new Set(filters.traits.map((value) => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th')),
        intents: [...new Set(filters.intents.map((value) => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th')),
        initial: filters.initial.trim().toLocaleLowerCase('th'),
        excludedLetters: [...new Set(filters.excludedLetters.trim().toLocaleLowerCase('th'))].sort().join(''),
    };
}

function stableHash(value: string) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

export function createPetNameFingerprint(
    mode: PetNameQueryMode,
    filters: PetNameFilters,
    analysisName = '',
) {
    const normalizedFilters = normalizePetNameFilters(filters);
    const normalizedName = analysisName.trim().toLocaleLowerCase('th').replace(/\s+/g, '');
    const payload = JSON.stringify({ mode, filters: normalizedFilters, name: normalizedName });
    return `${PET_NAME_FINGERPRINT_VERSION}:${mode}:${stableHash(payload)}`;
}

export function toPetNamePreview(result: ScoredPetName): PetNamePreview {
    return {
        detailLevel: 'preview',
        slug: result.slug,
        nameTh: result.nameTh,
        nameEn: result.nameEn,
        pronunciation: result.pronunciation,
        meaning: result.meaningAvailable ? result.meaning : '',
        petTypes: result.petTypes,
        totalScore: result.totalScore,
        numerologyValue: result.numerologyValue,
        reason: result.reasons[0] || 'เสียงเรียกชัดและจดจำได้ง่าย',
        meaningAvailable: result.meaningAvailable,
    };
}

export function toPetNameFullResult(result: ScoredPetName): PetNameFullResult {
    return { ...result, detailLevel: 'full' };
}

export function presentSearchResults(results: ScoredPetName[], isUnlocked: boolean) {
    const hasCompleteSet = results.length >= PET_NAME_SET_SIZE;
    if (isUnlocked || !hasCompleteSet) {
        return {
            results: results.map(toPetNameFullResult),
            lockedCount: 0,
            canUnlock: false,
            isUnlocked: true,
        };
    }

    return {
        results: results.slice(0, PET_NAME_FREE_COUNT).map(toPetNamePreview),
        lockedCount: PET_NAME_SET_SIZE - PET_NAME_FREE_COUNT,
        canUnlock: true,
        isUnlocked: false,
    };
}

export function presentAnalysisResult(result: ScoredPetName, isUnlocked: boolean) {
    if (isUnlocked || !result.meaningAvailable) {
        return {
            results: [toPetNameFullResult(result)],
            lockedCount: 0,
            canUnlock: false,
            isUnlocked: true,
        };
    }

    return {
        results: [{ ...toPetNamePreview(result), meaning: '' }],
        lockedCount: 1,
        canUnlock: true,
        isUnlocked: false,
    };
}
