import { describe, expect, it } from 'vitest';
import { selectNameSuggestions } from './nameSuggestions';

describe('public name suggestions', () => {
  it('ranks exact, prefix, then substring matches with Thai ordering and a limit of 8', () => {
    const records = ['ธนกร', 'กรวิชญ์', 'ภัคกร', 'กร', 'กรกานต์', 'กฤษกร', 'กรณัฐ', 'กรชัย', 'กรธีร์', 'กรภพ', 'กรพล'];
    const result = selectNameSuggestions(records.map(name => ({ name })), 'กร');
    expect(result).toHaveLength(8);
    expect(result[0].name).toBe('กร');
    expect(result.slice(1).every(row => row.name.startsWith('กร'))).toBe(true);
  });
  it('matches vowels and tone marks and ignores case for supported Latin names', () => {
    expect(selectNameSuggestions([{ name: 'น้ำฝน' }], 'น้ำ')[0].name).toBe('น้ำฝน');
    expect(selectNameSuggestions([{ name: 'James' }], 'ja')[0].name).toBe('James');
    expect(selectNameSuggestions([{ name: 'ธนกร' }], 'ณิ')).toEqual([]);
    expect(selectNameSuggestions([{ name: 'ธนกร' }], 'ธ')).toEqual([]);
  });
  it('returns only display fields and suppresses rejected reading and meaning', () => {
    const result = selectNameSuggestions([{
      name: 'ธนกร', pronunciation: 'ทะ-นะ-กอน', meaning: 'ทรัพย์',
      pronunciationStatus: 'rejected', meaningStatus: 'rejected',
      grade: 'A+', secret: 'do not expose',
    }], 'ธน');
    expect(result).toEqual([{ name: 'ธนกร', pronunciationStatus: 'rejected', meaningStatus: 'rejected' }]);
  });
  it('preserves review labels, deduplicates names and caps query length', () => {
    const row = { name: 'ธนกร', meaning: 'ทรัพย์', meaningStatus: 'draft' as const };
    expect(selectNameSuggestions([row, row], ' ธน ')).toEqual([row]);
    expect(selectNameSuggestions([row], 'ธ'.repeat(101))).toEqual([]);
  });
});
