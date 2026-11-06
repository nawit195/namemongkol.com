import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateGrade } from '@/utils/gradeResult';
import type { AnalysisNameRow } from '@/lib/adminAnalysisResults';

// Imported by the admin API, keeping the calculation datasets out of the admin page bundle.
export function buildAnalyzedNameRows(names: readonly string[]): AnalysisNameRow[] {
    return names.map((name) => {
        const nameScore = calculateScore(name);
        return { name, nameScore, grade: calculateGrade(nameScore, analyzePairs(name)) };
    });
}
