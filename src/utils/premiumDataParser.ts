import { calculateScore } from './calculateScore';
import { analyzePairs } from './numerologyUtils';
import { thaksaConfig, DayKey } from '../data/thaksa';
import { predictGender, Gender } from './genderPrediction';

export interface PremiumNameData {
    name: string;
    totalScore: number;
    suitableDays: string[];
    scoreBreakdown: string[];
    gender: Gender;
    pronunciation?: string;
    pronunciationVariants?: string[];
    pronunciationStatus?: 'pending' | 'draft' | 'approved' | 'rejected';
    meaning?: string;
    meaningStatus?: 'pending' | 'draft' | 'approved' | 'rejected';
}

export type PremiumNameDetailInput = Pick<
    PremiumNameData,
    'name' | 'pronunciation' | 'pronunciationVariants' | 'pronunciationStatus' | 'meaning' | 'meaningStatus'
>;

const SHORT_DAY_NAMES: Record<DayKey, string> = {
    sunday: 'อาทิตย์',
    monday: 'จันทร์',
    tuesday: 'อังคาร',
    wednesday: 'พุธ(กลางวัน)',
    wednesday_night: 'พุธ(กลางคืน)',
    thursday: 'พฤหัสบดี',
    friday: 'ศุกร์',
    saturday: 'เสาร์'
};

export type PremiumNameLocalDetail = PremiumNameDetailInput & {
    suitableDays?: string[];
};

export const parsePremiumNames = (rawData: string): PremiumNameData[] => {
    // Split by newlines and handle potential empty lines
    const lines = rawData.split('\n').map(line => line.normalize('NFC').trim()).filter(line => line !== '');
    const results: PremiumNameData[] = [];
    const seenNames = new Set<string>();

    for (const name of lines) {
        // Skip comments or empty lines if any slipped through
        if (name.startsWith('//') || !name) continue;

        // Skip duplicates
        if (seenNames.has(name)) continue;
        seenNames.add(name);

        // 1. Calculate Score
        const totalScore = calculateScore(name);

        // 2. Identify Suitable Days (No Kali/Galkinee)
        const suitableDays: string[] = [];
        (Object.keys(thaksaConfig) as DayKey[]).forEach((key) => {
            const dayConfig = thaksaConfig[key];
            const kaliChars = dayConfig.kali;

            // Check if name contains any kali char for this day
            let hasKali = false;
            for (const char of name) {
                if (kaliChars.includes(char)) {
                    hasKali = true;
                    break;
                }
            }

            if (!hasKali) {
                suitableDays.push(SHORT_DAY_NAMES[key]);
            }
        });

        // 3. Generate Score Breakdown (Pairs)
        const pairData = analyzePairs(name);
        // Format: "16🟢"
        const scoreBreakdown = pairData.map(p => `${p.pair}🟢`);

        // 4. Predict Gender
        const gender = predictGender(name);

        results.push({
            name,
            totalScore,
            suitableDays,
            scoreBreakdown,
            gender
        });
    }

    return results;
};

export const mergePremiumNameDetails = (
    names: PremiumNameData[],
    details: PremiumNameDetailInput[],
): PremiumNameData[] => {
    const detailsByName = new Map<string, PremiumNameDetailInput>();
    for (const detail of details) {
        const name = detail.name.normalize('NFC').trim();
        const merged = { ...detailsByName.get(name), name };
        if (detail.pronunciationStatus === 'rejected') {
            merged.pronunciation = undefined;
            merged.pronunciationVariants = [];
            merged.pronunciationStatus = 'rejected';
        } else if (detail.pronunciation?.trim()) {
            merged.pronunciation = detail.pronunciation.trim();
            merged.pronunciationVariants = detail.pronunciationVariants ?? [];
            merged.pronunciationStatus = detail.pronunciationStatus;
        }
        if (detail.meaningStatus === 'rejected') {
            merged.meaning = undefined;
            merged.meaningStatus = 'rejected';
        } else if (detail.meaning?.trim()) {
            merged.meaning = detail.meaning.trim();
            merged.meaningStatus = detail.meaningStatus;
        }
        detailsByName.set(name, merged);
    }
    return names.map((item) => {
        const detail = detailsByName.get(item.name.normalize('NFC').trim());
        if (!detail) return item;
        return {
            ...item,
            pronunciation: detail.pronunciation,
            pronunciationVariants: detail.pronunciationVariants ?? [],
            pronunciationStatus: detail.pronunciationStatus,
            meaning: detail.meaning,
            meaningStatus: detail.meaningStatus,
        };
    });
};

export const mergePremiumNameSources = (
    localRawData: string,
    localDetails: PremiumNameLocalDetail[],
    remoteDetails: PremiumNameDetailInput[] = [],
): PremiumNameData[] => {
    const combinedRawData = [
        localRawData,
        ...remoteDetails.map((detail) => detail.name),
    ].join('\n');

    const daysByName = new Map(localDetails
        .filter((detail) => detail.suitableDays !== undefined)
        .map((detail) => [detail.name.normalize('NFC').trim(), detail.suitableDays!]));

    return mergePremiumNameDetails(
        parsePremiumNames(combinedRawData),
        [...localDetails, ...remoteDetails],
    ).map((item) => {
        const days = daysByName.get(item.name);
        return days ? { ...item, suitableDays: [...days] } : item;
    });
};
