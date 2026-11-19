import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// PNG originals stay outside the repository. These paths are immutable and versioned by checksum.
export const assets = [
    { id: 'eight-horses-jade-mist', file: 'ม้าแปดตัวในสายหมอกภูผาหยก.png', preview: 'eight-horses-jade-mountains-chinese-mobile-wallpaper.webp', width: 852, height: 1846, bytes: 2823355, sha256: 'a7825179d4d6efa270deed159acba8bab7e6c91b2ab9cc8393f5763193b7995a' },
    { id: 'eight-horses-waterfall', file: 'ฝูงม้าแปดตัวควบใต้ม่านน้ำตก.png', preview: 'eight-horses-waterfall-sunlight-wallpaper.webp', width: 852, height: 1846, bytes: 3192514, sha256: '42fafd2566604dbffafec8e24ba3e06cacc9fb52cd4925e3ba97a071e0ae687c' },
    { id: 'eight-horses-sunlit-river', file: 'ม้าแปดตัวควบผ่านสายน้ำใต้ภูผา.png', preview: 'eight-horses-waterfall-sunlight-desktop-wallpaper.webp', width: 1672, height: 941, bytes: 3421774, sha256: '736427245a0b330d7f8aa3590cc4734f9a6c35797ac0f28e4b386a4e1693f2d8' },
    { id: 'eight-horses-mountain-stream', file: 'แปดอาชาท่ามกลางภูผาและสายน้ำ.png', preview: 'eight-horses-jade-mountains-chinese-wallpaper.webp', width: 1672, height: 941, bytes: 3035262, sha256: 'ea9cf1e1bb9792f485967b319a83d3457313f67cbb4572f7e68f1173d34a026d' },
];
const bucket = 'premium-wallpaper-originals';
const checksum = bytes => createHash('sha256').update(bytes).digest('hex');

async function main() {
    const upload = process.argv.includes('--upload');
    const preview = process.argv.includes('--previews');
    if (!upload && !preview) throw new Error('Choose --previews or --upload (or both).');
    dotenv.config({ path: '.env.local', quiet: true });
    const sourceDir = process.env.WALLPAPER_SOURCE_DIR || path.join(os.homedir(), 'Downloads');
    const originals = await Promise.all(assets.map(async asset => {
        const bytes = await readFile(path.join(sourceDir, asset.file));
        const meta = await sharp(bytes).metadata();
        if (checksum(bytes) !== asset.sha256 || bytes.length !== asset.bytes || meta.width !== asset.width || meta.height !== asset.height) throw new Error(`Source mismatch: ${asset.id}`);
        return { ...asset, bytes, originalPath: `eight-horses/${asset.id}-${asset.sha256}.png` };
    }));
    if (preview) {
        const target = path.join(process.cwd(), 'public/wallpapers/eight-horses');
        await mkdir(target, { recursive: true });
        for (const asset of originals) {
            const bytes = await sharp(asset.bytes).resize({ width: asset.width > asset.height ? 960 : 480, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
            await writeFile(path.join(target, asset.preview), bytes);
            console.log(`Preview: ${asset.id} (${bytes.length} bytes)`);
        }
    }
    if (!upload) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Configure SUPABASE_SERVICE_ROLE_KEY in .env.local. Never pass it on the command line.');
    const service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: config, error: bucketError } = await service.storage.getBucket(bucket);
    if (bucketError || !config || config.public) throw new Error('Install the migration and verify the originals bucket is private before uploading.');
    const { data: products, error: catalogError } = await service.from('wallpaper_products').select('id,sha256,original_path').in('id', assets.map(asset => asset.id));
    if (catalogError || products?.length !== originals.length) throw new Error('Install the catalog migration before uploading.');
    for (const asset of originals) {
        const product = products.find(product => product.id === asset.id);
        if (product?.sha256 !== asset.sha256 || product.original_path !== asset.originalPath) throw new Error(`Catalog mismatch: ${asset.id}`);
        const { data: existing } = await service.storage.from(bucket).download(asset.originalPath);
        if (!existing) {
            const { error } = await service.storage.from(bucket).upload(asset.originalPath, asset.bytes, { contentType: 'image/png', upsert: false });
            if (error) throw new Error(`Upload failed: ${asset.id}`);
        }
        const { data: file, error } = await service.storage.from(bucket).download(asset.originalPath);
        if (error || !file || checksum(new Uint8Array(await file.arrayBuffer())) !== asset.sha256) throw new Error(`Verification failed: ${asset.id}`);
        console.log(`Verified private original: ${asset.id}`);
    }
    // Activate all four together only after every upload has been read back and verified.
    const { error } = await service.from('wallpaper_products').update({ active: true }).in('id', originals.map(asset => asset.id));
    if (error) throw new Error('Files verified but catalog activation failed; no downloads were enabled.');
    console.log('All four products ready. No member credits changed.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
