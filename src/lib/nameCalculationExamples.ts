import { calculateScore } from '@/utils/calculateScore';
import { analyzePairs } from '@/utils/analyzePairs';
import { calculateGrade } from '@/utils/gradeResult';

/** Generic example strings, without namesakes, portraits, biographies, or birthday assumptions. */
export function getNameCalculationExamples() {
    return ['กานต์', 'นที', 'ธารา'].map(name => {
        const sum = calculateScore(name);
        return { name, sum, grade: calculateGrade(sum, analyzePairs(name)) };
    });
}
