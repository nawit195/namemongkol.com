export type PetType = 'dog' | 'cat' | 'other';
export type PetGender = 'male' | 'female' | 'neutral';
export type PetNameLanguage = 'thai' | 'english' | 'japanese' | 'korean' | 'international';

export interface PetNameRecord {
    id?: string;
    slug: string;
    nameTh: string;
    nameEn: string;
    pronunciation: string;
    meaning: string;
    language: PetNameLanguage;
    petTypes: PetType[];
    genders: PetGender[];
    traits: string[];
    styles: string[];
    intents: string[];
    syllables: number;
    initial: string;
    meaningScore: number;
    pronunciationScore: number;
    distinctivenessScore: number;
    isActive: boolean;
    updatedAt?: string;
}

export interface PetNameFilters {
    petType: PetType | 'all';
    gender: PetGender | 'all';
    traits: string[];
    language: PetNameLanguage | 'all';
    style: string | 'all';
    syllables: number | 'all';
    initial: string;
    excludedLetters: string;
    intents: string[];
}

export interface PetNameScoreBreakdown {
    meaning: number | null;
    pronunciation: number;
    suitability: number;
    auspicious: number;
    distinctiveness: number;
}

export interface ScoredPetName extends PetNameRecord {
    totalScore: number;
    numerologyValue: number;
    scoreBreakdown: PetNameScoreBreakdown;
    reasons: string[];
    meaningAvailable: boolean;
}
