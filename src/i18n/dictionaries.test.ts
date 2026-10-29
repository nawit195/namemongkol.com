import { describe, expect, it } from 'vitest';
import { getDictionary, getDictionaryValue } from './dictionaries';

describe('Thai navigation labels', () => {
    it('describes the premium name analysis by its surname-matching outcome', () => {
        expect(getDictionaryValue(getDictionary('th'), 'sidebar.premiumAnalysis'))
            .toBe('คัดชื่อให้เหมาะกับนามสกุล');
    });
});
