import { expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

it.each(['before.json', 'plan.json', 'import.sql'])('preserves existing %s and refuses both planners before connecting to Supabase', file => {
    const directory = mkdtempSync(join(tmpdir(), 'namemongkol-import-guard-'));
    const backup = join(directory, file);
    writeFileSync(backup, 'original backup');
    try {
        for (const [script, source] of [
            ['scripts/plan-ab-workbook-import.mjs', 'scripts/data/filtered-names-ab-2026-11-17.json'],
            ['scripts/plan-premium-workbook-import.mjs', 'scripts/data/premium-aplus-2026-11-17.json'],
        ]) {
            const result = spawnSync(process.execPath, [script, source, directory], {
                encoding: 'utf8', timeout: 5000,
                env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: 'invalid-url' },
            });
            expect(result.status).toBe(1);
            expect(result.stderr).toContain(`Backup exists: ${file}`);
            expect(readFileSync(backup, 'utf8')).toBe('original backup');
        }
    } finally {
        unlinkSync(backup);
        rmdirSync(directory);
    }
});
