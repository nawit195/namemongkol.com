import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compareNames } from '@/lib/nameComparison';
import { ComparisonTable } from './ComparisonTable';

describe('ComparisonTable', () => {
  it('คงหัวข้อความหมายไว้และซ่อนคำอธิบายใน disclosure ที่เปิดด้วยการแตะหรือคีย์บอร์ดได้', () => {
    const rows = compareNames(['กานต์', 'ธนา'], '', 'monday');
    const markup = renderToStaticMarkup(createElement(ComparisonTable, { rows }));
    const firstDisclosure = markup.match(/<details[^>]*>([\s\S]*?)<\/details>/);
    const summary = firstDisclosure?.[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1];

    expect(firstDisclosure).not.toBeNull();
    expect(firstDisclosure?.[0]).not.toMatch(/^<details[^>]*\sopen(?:=|\s|>)/);
    expect(summary).toContain('แข็งกร้าว ไม่ยอมคน');
    expect(summary).not.toContain('ทิฐิมานะแรงกล้า');
    expect(firstDisclosure?.[1]).toContain('<p>ทิฐิมานะแรงกล้า');
  });
});
