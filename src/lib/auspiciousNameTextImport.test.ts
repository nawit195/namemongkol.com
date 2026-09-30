import { describe, expect, it, vi } from 'vitest';
import {
    combineNameTextRecords,
    parseNameTextCsv,
    runNameTextImport,
} from '../../scripts/import-auspicious-name-text.mjs';

const csv = [
    'ชื่อมงคล,คำอ่าน,ความหมาย,วัน,ผลรวมเลขศาสตร์',
    'กมล,"กะ – มน","ใจ, ดวงใจ",วันจันทร์,15',
].join('\n');

function createFakeClient(rows: Array<{ id: string; name: string; pronunciation: string; meaning: string }>) {
    const state = new Map(rows.map((row) => [row.name, { ...row }]));
    const rpc = vi.fn(async (_name: string, args: { records: Array<{ name: string; pronunciation: string; meaning: string }> }) => {
        for (const record of args.records) {
            const existing = state.get(record.name);
            if (!existing) return { data: null, error: { message: 'name missing' } };
            state.set(record.name, { ...existing, pronunciation: record.pronunciation, meaning: record.meaning });
        }
        return { data: [{ updated_rows: args.records.length, matched_names: args.records.length }], error: null };
    });
    return {
        client: {
            from: () => ({
                select: () => ({
                    in: async (_column: string, names: string[]) => ({ data: names.map((name) => state.get(name)).filter(Boolean), error: null }),
                }),
            }),
            rpc,
        },
        rpc,
        state,
    };
}

describe('auspicious-name text import', () => {
    it('accepts the five-column source format and preserves quoted punctuation', () => {
        expect(parseNameTextCsv(csv, 'source.csv')).toEqual([{ name: 'กมล', pronunciation: 'กะ-มน', meaning: 'ใจ, ดวงใจ' }]);
    });

    it('rejects blank data, invalid pronunciations and conflicting duplicate names', () => {
        expect(() => parseNameTextCsv('ชื่อมงคล,คำอ่าน,ความหมาย\nกมล,,ใจ', 'blank.csv')).toThrow('blank');
        expect(() => parseNameTextCsv('ชื่อมงคล,คำอ่าน,ความหมาย\nกมล,เ-กี-ยะด,ใจ', 'invalid.csv')).toThrow('invalid pronunciation');
        expect(() => combineNameTextRecords([
            { file: 'one.csv', content: 'ชื่อมงคล,คำอ่าน,ความหมาย\nกมล,กะ-มน,ใจ' },
            { file: 'two.csv', content: 'ชื่อมงคล,คำอ่าน,ความหมาย\nกมล,กะ-มน,ดวงใจ' },
        ])).toThrow('Duplicate name has conflicting data: กมล');
    });

    it('dry-runs without an RPC and reports only changed values', async () => {
        const fake = createFakeClient([{ id: '1', name: 'กมล', pronunciation: 'กะ-มน', meaning: 'ใจเดิม' }]);
        const result = await runNameTextImport({ files: ['source.csv'] }, {
            dotenv: { config: vi.fn() },
            createClient: () => fake.client,
            supabaseUrl: 'https://example.supabase.co',
            serviceRoleKey: 'service-role',
            fileExists: () => true,
            readFile: () => csv,
        });
        expect(result).toMatchObject({ mode: 'dry-run', summary: { sourceRows: 1, recordsToChange: 1 } });
        expect(fake.rpc).not.toHaveBeenCalled();
    });

    it('backs up, applies, verifies and revalidates after a successful import', async () => {
        const fake = createFakeClient([{ id: '1', name: 'กมล', pronunciation: 'กม-ล', meaning: 'ใจเดิม' }]);
        const writeBackup = vi.fn(() => 'backup.json');
        const revalidate = vi.fn(async () => undefined);
        await expect(runNameTextImport({ files: ['source.csv'], apply: true }, {
            dotenv: { config: vi.fn() }, createClient: () => fake.client,
            supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'service-role', writeBackup, revalidate,
            fileExists: () => true, readFile: () => csv,
        })).resolves.toMatchObject({ mode: 'apply', verifiedRows: 1, revalidated: true, backupPath: 'backup.json' });
        expect(fake.rpc).toHaveBeenCalledOnce();
        expect(writeBackup).toHaveBeenCalledOnce();
        expect(revalidate).toHaveBeenCalledOnce();
        expect(fake.state.get('กมล')).toMatchObject({ pronunciation: 'กะ-มน', meaning: 'ใจ, ดวงใจ' });
    });

    it('rejects missing database names before calling the RPC', async () => {
        const fake = createFakeClient([]);
        await expect(runNameTextImport({ files: ['source.csv'] }, {
            dotenv: { config: vi.fn() }, createClient: () => fake.client,
            supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'service-role',
            fileExists: () => true, readFile: () => csv,
        })).rejects.toThrow('Database name mismatch');
        expect(fake.rpc).not.toHaveBeenCalled();
    });
});
