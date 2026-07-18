import 'server-only';

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { PET_NAME_SEEDS } from '@/data/petNamesSeed';
import type { PetNameLanguage, PetNameRecord } from '@/types/petName';

export type PetNameRow = {
    id: string;
    slug: string;
    name_th: string;
    name_en: string | null;
    pronunciation: string;
    meaning: string;
    language: PetNameLanguage;
    pet_types: PetNameRecord['petTypes'];
    genders: PetNameRecord['genders'];
    traits: string[];
    styles: string[];
    intents: string[];
    syllables: number;
    initial: string;
    meaning_score: number;
    pronunciation_score: number;
    distinctiveness_score: number;
    is_active: boolean;
    updated_at: string;
};

export function mapPetNameRow(row: PetNameRow): PetNameRecord {
    return {
        id: row.id,
        slug: row.slug,
        nameTh: row.name_th,
        nameEn: row.name_en ?? '',
        pronunciation: row.pronunciation,
        meaning: row.meaning,
        language: row.language,
        petTypes: row.pet_types,
        genders: row.genders,
        traits: row.traits,
        styles: row.styles,
        intents: row.intents,
        syllables: row.syllables,
        initial: row.initial,
        meaningScore: row.meaning_score,
        pronunciationScore: row.pronunciation_score,
        distinctivenessScore: row.distinctiveness_score,
        isActive: row.is_active,
        updatedAt: row.updated_at,
    };
}

export function toPetNameRow(record: PetNameRecord) {
    return {
        slug: record.slug,
        name_th: record.nameTh,
        name_en: record.nameEn || null,
        pronunciation: record.pronunciation,
        meaning: record.meaning,
        language: record.language,
        pet_types: record.petTypes,
        genders: record.genders,
        traits: record.traits,
        styles: record.styles,
        intents: record.intents,
        syllables: record.syllables,
        initial: record.initial,
        meaning_score: record.meaningScore,
        pronunciation_score: record.pronunciationScore,
        distinctiveness_score: record.distinctivenessScore,
        is_active: record.isActive,
    };
}

export const getPublicPetNames = unstable_cache(
    async (): Promise<PetNameRecord[]> => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return PET_NAME_SEEDS;

        const supabase = createClient(url, key, { auth: { persistSession: false } });
        const { data, error } = await supabase
            .from('pet_names')
            .select('*')
            .eq('is_active', true)
            .order('name_th', { ascending: true });

        if (error) {
            if (error.code !== '42P01') console.error('[pet-names] Failed to fetch database records:', error);
            return PET_NAME_SEEDS;
        }

        return data?.length ? (data as PetNameRow[]).map(mapPetNameRow) : PET_NAME_SEEDS;
    },
    ['public-pet-names-v2'],
    { revalidate: 600, tags: ['pet-names'] },
);
