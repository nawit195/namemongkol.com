import { DayKey } from '@/types';
import { thaksaConfig } from '@/data/thaksaConfig';
import { PetNameVisibleResult } from '@/lib/petNameAccess';
import { calculateScore } from '@/utils/calculateScore';
import { analyzeThaksa } from '@/utils/analyzeThaksa';
import { AUSPICIOUS_SUMS } from '@/utils/gradeResult';

export interface CompatibilityScoreBreakdown {
    total: number;
    birthdaySuitability: number; // 25%
    thaksaLetters: number;       // 20%
    meaning: number;             // 20%
    pronunciation: number;       // 15%
    petSuitability: number;      // 10%
    nameRelationship: number;    // 10%
}

export interface DaySuitability {
    dayKey: DayKey;
    dayName: string;
    level: 'ดีมาก' | 'ดี' | 'ปานกลาง' | 'ควรพิจารณา';
    score: number; // 0 - 100
    hasKalakinee: boolean;
}

export interface CompatibilityAnalysisResult {
    scoreBreakdown: CompatibilityScoreBreakdown;
    daySuitability: DaySuitability[];
    ownerDayResult: DaySuitability | null;
    kalakineeChars: string[];
    ownerNameScore: number;
    combinedAuspicious: boolean;
}

export type CompatibilityTone = 'excellent' | 'good' | 'consider' | 'warning';

export interface CompatibilityInsight {
    key: keyof CompatibilityScoreBreakdown;
    label: string;
    score: number;
    detail: string;
}

export interface CompatibilityPresentation {
    verdict: string;
    tone: CompatibilityTone;
    summary: string;
    strengths: CompatibilityInsight[];
    cautions: CompatibilityInsight[];
    cautionNote: string | null;
    recommendation: string;
}

const COMPATIBILITY_FACTORS: Array<{
    key: Exclude<keyof CompatibilityScoreBreakdown, 'total'>;
    label: string;
    detail: string;
}> = [
    { key: 'birthdaySuitability', label: 'เหมาะกับวันเกิดเจ้าของ', detail: 'ชื่อนี้สอดคล้องกับหลักทักษาประจำวันเกิดในระดับที่แสดง' },
    { key: 'thaksaLetters', label: 'อักษรทักษาส่งเสริม', detail: 'องค์ประกอบตัวอักษรมีส่วนสนับสนุนความเหมาะสมของชื่อ' },
    { key: 'meaning', label: 'ความหมายของชื่อ', detail: 'ความหมายช่วยเสริมภาพรวมและความรู้สึกที่ดีเมื่อเรียกใช้' },
    { key: 'pronunciation', label: 'เสียงเรียกชัดเจน', detail: 'ชื่อออกเสียงง่ายและเหมาะกับการเรียกใช้ในชีวิตประจำวัน' },
    { key: 'petSuitability', label: 'เข้ากับคาแรกเตอร์น้อง', detail: 'รูปแบบชื่อเหมาะกับการใช้เป็นชื่อสัตว์เลี้ยง' },
    { key: 'nameRelationship', label: 'สัมพันธ์กับชื่อเจ้าของ', detail: 'ผลรวมชื่อเจ้าของและชื่อน้องมีความสอดคล้องกันตามเกณฑ์ของระบบ' },
];

export function getCompatibilityPresentation(result: CompatibilityAnalysisResult): CompatibilityPresentation {
    const total = result.scoreBreakdown.total;
    const hasKalakinee = result.kalakineeChars.length > 0;
    const tone: CompatibilityTone = hasKalakinee ? 'warning' : total >= 90 ? 'excellent' : total >= 70 ? 'good' : 'consider';
    const verdict = tone === 'warning' ? 'แนะนำให้เปลี่ยนชื่อ' : tone === 'excellent' ? 'เข้ากันได้ดีเยี่ยม' : tone === 'good' ? 'เข้ากันได้ดี' : 'เข้ากันได้ระดับปานกลาง';
    const summary = tone === 'warning'
        ? 'แม้คะแนนด้านอื่นอาจอยู่ในเกณฑ์ดี แต่พบอักษรกาลกิณีตามวันเกิดเจ้าของ จึงแนะนำให้เลือกชื่ออื่นก่อนนำไปใช้จริง'
        : tone === 'excellent'
        ? 'ชื่อมีองค์ประกอบที่สอดคล้องกับเจ้าของหลายด้าน เหมาะสำหรับเก็บไว้เป็นตัวเลือกอันดับต้น ๆ'
        : tone === 'good'
            ? 'ชื่อมีจุดสนับสนุนที่ชัดเจนและสามารถนำไปใช้ได้ ควรพิจารณาข้อสังเกตด้านล่างร่วมด้วย'
            : 'ชื่อนี้ยังใช้ได้ แต่มีบางองค์ประกอบที่ควรเปรียบเทียบกับชื่ออื่นก่อนตัดสินใจ';

    const factors = COMPATIBILITY_FACTORS.map((factor) => ({
        ...factor,
        score: result.scoreBreakdown[factor.key],
    }));
    const strengths = [...factors].sort((a, b) => b.score - a.score).slice(0, 2);
    const cautions = [...factors].sort((a, b) => a.score - b.score).slice(0, 2);
    const cautionNote = hasKalakinee
        ? `พบอักษรกาลกิณีตามวันเกิดเจ้าของ: ${result.kalakineeChars.join(', ')}`
        : null;
    const recommendation = tone === 'warning'
        ? 'ควรเปลี่ยนเป็นชื่อที่ไม่พบอักษรกาลกิณี แล้วตรวจความเข้ากันใหม่ก่อนตัดสินใจ'
        : tone === 'excellent'
        ? 'สามารถใช้ชื่อนี้ได้อย่างมั่นใจ หรือบันทึกไว้เปรียบเทียบกับชื่อโปรดอีก 1–2 ชื่อ'
        : tone === 'good'
            ? 'ชื่อนี้เป็นตัวเลือกที่ดี แนะนำให้ลองเรียกจริงและเทียบกับชื่อที่ชอบอีกหนึ่งชื่อ'
            : 'แนะนำให้ทดลองค้นหาชื่ออื่นเพิ่มเติม แล้วเลือกชื่อที่ได้คะแนนสูงกว่าและเรียกแล้วรู้สึกเป็นธรรมชาติ';

    return { verdict, tone, summary, strengths, cautions, cautionNote, recommendation };
}

const ALL_DAYS: DayKey[] = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'wednesday_night', 'thursday', 'friday', 'saturday'
];

export function evaluateDaySuitability(petNameTh: string, dayKey: DayKey): DaySuitability {
    const thaksaResult = analyzeThaksa(petNameTh, dayKey);
    const config = thaksaConfig[dayKey];

    if (!thaksaResult) {
         return {
             dayKey,
             dayName: config?.name || 'ไม่ระบุ',
             level: 'ปานกลาง',
             score: 50,
             hasKalakinee: false
         };
    }

    const hasKali = thaksaResult.hasKali;

    // Count good letters (Sri, Dech, Montri)
    const goodLettersCount = (thaksaResult.analysis?.si?.length || 0) +
                             (thaksaResult.analysis?.dech?.length || 0) +
                             (thaksaResult.analysis?.montri?.length || 0);

    let score = 70; // Base score
    if (hasKali) {
        score -= 30; // Significant drop for Kalakinee
    } else {
        score += 15; // Bonus for no Kalakinee
        score += Math.min(15, goodLettersCount * 5); // Bonus for good letters
    }

    let level: DaySuitability['level'] = 'ปานกลาง';
    if (score >= 90) level = 'ดีมาก';
    else if (score >= 75) level = 'ดี';
    else if (score >= 60) level = 'ปานกลาง';
    else level = 'ควรพิจารณา';

    return {
        dayKey,
        dayName: config.name,
        level,
        score: Math.max(0, Math.min(100, score)),
        hasKalakinee: hasKali
    };
}

export function calculateCompatibility(
    petResult: PetNameVisibleResult,
    ownerName: string,
    ownerBirthDay: DayKey | null
): CompatibilityAnalysisResult {
    const ownerScore = calculateScore(ownerName);
    const ownerPetSum = ownerScore + petResult.numerologyValue;

    // Evaluate 7 days (actually 8 tracking wednesday night)
    const allDaysSuitability = ALL_DAYS.map(day => evaluateDaySuitability(petResult.nameTh, day));

    let birthdaySuitability = 70;
    let thaksaLetters = 70;
    let kaliChars: string[] = [];
    let ownerDayResult: DaySuitability | null = null;

    if (ownerBirthDay) {
        ownerDayResult = evaluateDaySuitability(petResult.nameTh, ownerBirthDay);
        birthdaySuitability = ownerDayResult.score;

        const thaksaAnalysis = analyzeThaksa(petResult.nameTh, ownerBirthDay);
        if (thaksaAnalysis) {
            kaliChars = thaksaAnalysis.kaliChars;
            thaksaLetters = ownerDayResult.hasKalakinee ? 40 : 95;
            // Add bonus for Sri / Dech / Montri
            const goodLet = (thaksaAnalysis.analysis?.si?.length || 0) + (thaksaAnalysis.analysis?.dech?.length || 0) + (thaksaAnalysis.analysis?.montri?.length || 0);
            if (!ownerDayResult.hasKalakinee && goodLet > 0) thaksaLetters = Math.min(100, thaksaLetters + (goodLet * 2));
        }
    } else {
         // If no owner birthday provided, average suitability across days without kalakinee
         const noKaliDays = allDaysSuitability.filter(d => !d.hasKalakinee);
         birthdaySuitability = noKaliDays.length / 8 * 100;
         thaksaLetters = noKaliDays.length / 8 * 100;
    }

    // Name relationship
    const combinedAuspicious = AUSPICIOUS_SUMS.includes(ownerPetSum);
    let nameRelationship = 60;
    if (combinedAuspicious) nameRelationship += 30; // 90
    if (ownerScore % 9 === petResult.numerologyValue % 9) nameRelationship += 10;
    nameRelationship = Math.min(100, nameRelationship);

    const breakdown = 'scoreBreakdown' in petResult ? petResult.scoreBreakdown : null;

    const meaning = petResult.meaningAvailable ? (breakdown?.meaning || 80) : 80;
    const pronunciation = breakdown?.pronunciation || 80;
    const petSuitability = breakdown?.suitability || 80;

    const weightedTotal = Math.round(
        (birthdaySuitability * 0.25) +
        (thaksaLetters * 0.20) +
        (meaning * 0.20) +
        (pronunciation * 0.15) +
        (petSuitability * 0.10) +
        (nameRelationship * 0.10)
    );

    return {
        scoreBreakdown: {
            total: weightedTotal,
            birthdaySuitability: Math.round(birthdaySuitability),
            thaksaLetters: Math.round(thaksaLetters),
            meaning: Math.round(meaning),
            pronunciation: Math.round(pronunciation),
            petSuitability: Math.round(petSuitability),
            nameRelationship: Math.round(nameRelationship)
        },
        daySuitability: allDaysSuitability,
        ownerDayResult,
        kalakineeChars: kaliChars,
        ownerNameScore: ownerScore,
        combinedAuspicious
    };
}
