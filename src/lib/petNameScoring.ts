import { AUSPICIOUS_SUMS } from '@/utils/gradeResult';
import { calculateScore } from '@/utils/calculateScore';
import type { PetNameFilters, PetNameRecord, ScoredPetName } from '@/types/petName';

export const DEFAULT_PET_NAME_FILTERS: PetNameFilters = {
    petType: 'all',
    gender: 'all',
    traits: [],
    language: 'all',
    style: 'all',
    syllables: 'all',
    initial: '',
    excludedLetters: '',
    intents: [],
};

function normalize(value: string) {
    return value.trim().toLocaleLowerCase('th').replace(/\s+/g, '');
}

function intersectionCount(left: string[], right: string[]) {
    if (left.length === 0 || right.length === 0) return 0;
    const lookup = new Set(right);
    return left.reduce((count, value) => count + (lookup.has(value) ? 1 : 0), 0);
}

export function getAuspiciousScore(name: string) {
    const numerologyValue = calculateScore(name);
    if (AUSPICIOUS_SUMS.includes(numerologyValue)) return { numerologyValue, score: 94 };
    if (numerologyValue > 0 && numerologyValue % 9 === 0) return { numerologyValue, score: 84 };
    if (numerologyValue > 0) return { numerologyValue, score: 72 };
    return { numerologyValue: 0, score: 60 };
}

function calculateSuitability(record: PetNameRecord, filters: PetNameFilters) {
    let score = 68;
    const reasons: string[] = [];

    if (filters.petType !== 'all' && record.petTypes.includes(filters.petType)) {
        score += 10;
        reasons.push(filters.petType === 'dog' ? 'เหมาะกับน้องหมา' : filters.petType === 'cat' ? 'เหมาะกับน้องแมว' : 'เหมาะกับสัตว์เลี้ยงของคุณ');
    }
    if (filters.gender !== 'all' && (record.genders.includes(filters.gender) || record.genders.includes('neutral'))) score += 5;

    const traitMatches = intersectionCount(filters.traits, record.traits);
    if (traitMatches > 0) {
        score += Math.min(10, traitMatches * 5);
        reasons.push(`เข้ากับคาแรกเตอร์ ${record.traits.filter((trait) => filters.traits.includes(trait)).join(', ')}`);
    }

    if (filters.style !== 'all' && record.styles.includes(filters.style)) {
        score += 4;
        reasons.push(`สไตล์${filters.style}`);
    }

    const intentMatches = intersectionCount(filters.intents, record.intents);
    if (intentMatches > 0) {
        score += Math.min(8, intentMatches * 4);
        reasons.push(`ความหมายด้าน${record.intents.filter((intent) => filters.intents.includes(intent)).join(', ')}`);
    }

    return { score: Math.min(100, score), reasons };
}

export function scorePetName(record: PetNameRecord, filters: PetNameFilters, meaningAvailable = true): ScoredPetName {
    const suitability = calculateSuitability(record, filters);
    const auspicious = getAuspiciousScore(record.nameTh || record.nameEn);
    const meaningWeight = meaningAvailable ? 0.25 : 0;
    const availableWeight = meaningWeight + 0.25 + 0.25 + 0.15 + 0.10;
    const weightedTotal = (
        (meaningAvailable ? record.meaningScore * meaningWeight : 0)
        + record.pronunciationScore * 0.25
        + suitability.score * 0.25
        + auspicious.score * 0.15
        + record.distinctivenessScore * 0.10
    ) / availableWeight;

    const reasons = [...suitability.reasons];
    if (record.pronunciationScore >= 90) reasons.push('เรียกง่ายและจดจำชัด');
    if (record.meaningScore >= 90 && meaningAvailable) reasons.push('ความหมายเชิงบวกเด่น');
    if (auspicious.score >= 90) reasons.push(`ผลรวมเลขศาสตร์ ${auspicious.numerologyValue} อยู่ในกลุ่มมงคล`);
    if (reasons.length === 0) reasons.push('เสียงอ่านชัดและใช้เรียกในชีวิตประจำวันได้ง่าย');

    return {
        ...record,
        totalScore: Math.round(weightedTotal),
        numerologyValue: auspicious.numerologyValue,
        scoreBreakdown: {
            meaning: meaningAvailable ? record.meaningScore : null,
            pronunciation: record.pronunciationScore,
            suitability: suitability.score,
            auspicious: auspicious.score,
            distinctiveness: record.distinctivenessScore,
        },
        reasons: reasons.slice(0, 3),
        meaningAvailable,
    };
}

export function filterAndScorePetNames(records: PetNameRecord[], filters: PetNameFilters, limit = 12) {
    const initial = normalize(filters.initial);
    const excluded = [...normalize(filters.excludedLetters)];

    return records
        .filter((record) => record.isActive)
        .filter((record) => filters.petType === 'all' || record.petTypes.includes(filters.petType))
        .filter((record) => filters.gender === 'all' || record.genders.includes(filters.gender) || record.genders.includes('neutral'))
        .filter((record) => filters.language === 'all' || record.language === filters.language)
        .filter((record) => filters.syllables === 'all' || record.syllables === filters.syllables)
        .filter((record) => !initial || normalize(record.nameTh).startsWith(initial) || normalize(record.nameEn).startsWith(initial))
        .filter((record) => excluded.length === 0 || excluded.every((letter) => !normalize(`${record.nameTh}${record.nameEn}`).includes(letter)))
        .map((record) => scorePetName(record, filters))
        .sort((left, right) => right.totalScore - left.totalScore || right.pronunciationScore - left.pronunciationScore || left.nameTh.localeCompare(right.nameTh, 'th'))
        .slice(0, limit);
}

export function analyzeExistingPetName(name: string, records: PetNameRecord[], filters: PetNameFilters) {
    const normalizedName = normalize(name);
    const matched = records.find((record) => normalize(record.nameTh) === normalizedName || normalize(record.nameEn) === normalizedName);
    if (matched) return scorePetName(matched, filters, true);

    const visibleLength = [...normalizedName].length;
    const pronunciationScore = visibleLength <= 8 ? 88 : visibleLength <= 12 ? 80 : 70;
    const synthetic: PetNameRecord = {
        slug: `custom-${encodeURIComponent(normalizedName)}`,
        nameTh: name.trim(),
        nameEn: '',
        pronunciation: name.trim(),
        meaning: '',
        language: /[a-z]/i.test(name) ? 'english' : 'thai',
        petTypes: filters.petType === 'all' ? ['dog', 'cat', 'other'] : [filters.petType],
        genders: filters.gender === 'all' ? ['neutral'] : [filters.gender],
        traits: filters.traits,
        styles: filters.style === 'all' ? ['เรียบง่าย'] : [filters.style],
        intents: filters.intents,
        syllables: filters.syllables === 'all' ? 2 : filters.syllables,
        initial: name.trim().charAt(0),
        meaningScore: 0,
        pronunciationScore,
        distinctivenessScore: visibleLength <= 10 ? 84 : 76,
        isActive: true,
    };

    return scorePetName(synthetic, filters, false);
}
