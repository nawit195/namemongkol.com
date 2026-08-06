import { z } from 'zod';
import { THAI_NAME_ROOTS, type ThaiNameRoot } from '@/data/thaiNameRoots';

export type RootCoverage = {
    roots: ThaiNameRoot[];
    unmatched: string;
    coverage: number;
};

const THAI_MARKS = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;

function letterLength(value: string) {
    return value.replace(THAI_MARKS, '').length;
}

export function analyzeNameRoots(name: string): RootCoverage {
    let cursor = name.trim();
    const roots: ThaiNameRoot[] = [];
    let unmatched = '';

    while (cursor.length > 0) {
        const matched = THAI_NAME_ROOTS.find((entry) => cursor.startsWith(entry.root));
        if (matched) {
            roots.push(matched);
            cursor = cursor.slice(matched.root.length);
            continue;
        }

        const [first = ''] = Array.from(cursor);
        unmatched += first;
        cursor = cursor.slice(first.length);
    }

    const total = Math.max(1, letterLength(name));
    const matchedLength = roots.reduce((sum, entry) => sum + letterLength(entry.root), 0);
    return { roots, unmatched, coverage: Math.min(1, matchedLength / total) };
}

export function canGenerateMeaningDraft(coverage: RootCoverage) {
    return coverage.roots.length > 0 && coverage.coverage >= 0.8;
}

const GeminiMeaningSchema = z.object({
    meaning: z.string().trim().min(10).max(240),
});

const GeminiMeaningBatchSchema = z.object({
    results: z.array(z.object({
        id: z.string().uuid(),
        meaning: z.string().trim().min(10).max(240),
    })).max(20),
});

export function parseGeminiMeaningResponse(value: unknown) {
    const parsed = GeminiMeaningSchema.safeParse(value);
    return parsed.success ? parsed.data.meaning : null;
}

export function parseGeminiMeaningBatchResponse(value: unknown) {
    const parsed = GeminiMeaningBatchSchema.safeParse(value);
    return parsed.success ? parsed.data.results : null;
}

export function buildMeaningPrompt(name: string, coverage: RootCoverage) {
    const groundedRoots = coverage.roots.map((entry) => `${entry.root}: ${entry.meaning}`).join('\n');
    return [
        `ชื่อ: ${name}`,
        'เรียบเรียงความหมายชื่อภาษาไทยเป็นประโยคเดียว กระชับ สุภาพ และไม่กล่าวอ้างผลลัพธ์ชีวิต',
        'ใช้ได้เฉพาะความหมายของรากศัพท์ด้านล่าง ห้ามเพิ่มรากศัพท์หรือความหมายอื่น',
        groundedRoots,
        'ตอบ JSON รูปแบบ {"meaning":"..."} เท่านั้น',
    ].join('\n');
}

export function buildMeaningBatchPrompt(items: Array<{ id: string; name: string; coverage: RootCoverage }>) {
    const groundedItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        roots: item.coverage.roots.map((entry) => ({ root: entry.root, meaning: entry.meaning })),
    }));

    return [
        'เรียบเรียงความหมายชื่อภาษาไทยเป็นประโยคเดียวต่อชื่อ กระชับ สุภาพ และไม่กล่าวอ้างผลลัพธ์ชีวิต',
        'ใช้ได้เฉพาะความหมายของรากศัพท์ที่ให้มา ห้ามเพิ่มรากศัพท์ คำแปล หรือความหมายอื่น',
        JSON.stringify(groundedItems),
        'ตอบ JSON รูปแบบ {"results":[{"id":"uuid","meaning":"..."}]} เท่านั้น และต้องคง id เดิม',
    ].join('\n');
}
