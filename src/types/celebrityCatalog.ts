import type { CelebrityPortrait } from '@/data/celebrityNames';

export interface CelebrityReference { title: string; url: string }

export interface CelebrityImageEvidence {
    status: 'own-work-declaration' | 'external-review-recorded' | 'public-domain-declaration';
    checkedAt: string;
    evidenceUrl: string;
    revisionId: number;
    title: string;
}

export interface CelebrityCatalogPerson {
    id: string;
    surname: string;
    nickname: string;
    referenceName: string;
    occupations: readonly string[];
    portrait: CelebrityPortrait | null;
    portraitStatus: 'available' | 'awaiting-evidence' | 'not-available';
    portraitEvidence?: CelebrityImageEvidence;
    source: CelebrityReference | null;
    roleSource?: CelebrityReference;
    referenceStatus: 'matched' | 'unconfirmed';
    checkedAt?: string;
}

export interface CelebrityCatalogGroup {
    sourceRow: number;
    name: string;
    workbookSum: number;
    people: readonly CelebrityCatalogPerson[];
}

export interface CelebrityCardData {
    slug: string;
    name: string;
    sum: number;
    goodPairs: number;
    pairCount: number;
    people: readonly CelebrityCatalogPerson[];
    articleHref?: string;
}
