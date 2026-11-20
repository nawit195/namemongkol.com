import { mkdtemp, readFile, unlink, writeFile, rmdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';
import { removeArchivedPublicSource } from '../../scripts/finance-wallpaper-assets.mjs';

test('asset preparation preserves a newer public file with the same name', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'finance-wallpaper-review-'));
    const source = path.join(directory, 'wallpaper.webp');
    try {
        await writeFile(source, 'new user image');
        await expect(removeArchivedPublicSource(source, Buffer.from('archived original'))).rejects.toThrow('Public source differs');
        expect(await readFile(source, 'utf8')).toBe('new user image');
    } finally {
        await unlink(source).catch(error => { if (error.code !== 'ENOENT') throw error; });
        await rmdir(directory);
    }
});

test('asset preparation removes only a matching archived source and permits reruns', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'finance-wallpaper-review-'));
    const source = path.join(directory, 'wallpaper.webp');
    try {
        const original = Buffer.from('archived original');
        await writeFile(source, original);
        await removeArchivedPublicSource(source, original);
        await expect(readFile(source)).rejects.toMatchObject({ code: 'ENOENT' });
        await expect(removeArchivedPublicSource(source, original)).resolves.toBeUndefined();
    } finally {
        await unlink(source).catch(error => { if (error.code !== 'ENOENT') throw error; });
        await rmdir(directory);
    }
});
