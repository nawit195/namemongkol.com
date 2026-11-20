import { readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

export const assets = [
    { id: 'finance-golden-tree', source: 'ต้นไม้ทองกลางสายน้ำมรกต.webp', preview: 'golden-tree-4289.webp', width: 841, height: 1870, bytes: 2659152, sha256: 'd0c7342c1aa1a13fe8152d1c7a3c303d1ceb56fe51ba3586d6f074b25b87d25f' },
    { id: 'finance-koi', source: 'ปลาคาร์ปในสายน้ำกับเลข 4289-2.webp', preview: 'golden-koi-4289.webp', width: 830, height: 1895, bytes: 2976024, sha256: '3e4063af6b2c88cf0bd47f90a0d55b53da32caca0628548a44d342c833062277' },
    { id: 'finance-emerald-horses', source: 'ฝูงม้าในหุบเขามรกต.webp', preview: 'emerald-horses-4289.webp', width: 841, height: 1870, bytes: 3137100, sha256: 'ea982ce9ac874622657c39063910a653bfd57bc02a2b5b9ca83441a560499adc' },
    { id: 'finance-golden-junk', source: 'เลข 4289 บนผืนน้ำสงบ-1.webp', preview: 'golden-junk-4289.webp', width: 931, height: 1689, bytes: 3040430, sha256: 'eeeccc6023745fbb6d80562cd25ce3fac35853626fffdd9711db489746b54fdb' },
];
const checksum = bytes => createHash('sha256').update(bytes).digest('hex');
const bucket = 'premium-wallpaper-originals';

export async function removeArchivedPublicSource(publicSource, archivedBytes) {
    let current;
    try { current = await readFile(publicSource); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    // A rerun must never delete a newer file that happens to reuse the original name.
    if (checksum(current) !== checksum(archivedBytes)) throw new Error(`Public source differs from preserved original: ${path.basename(publicSource)}`);
    await unlink(publicSource);
}

async function main() {
    const prepare = process.argv.includes('--prepare');
    const upload = process.argv.includes('--upload');
    if (!prepare && !upload) throw new Error('Choose --prepare or --upload.');
    dotenv.config({ path: '.env.local', quiet: true });
    const archive = path.resolve('.local/wallpaper-originals/finance');
    const previews = path.resolve('public/wallpapers/finance');
    if (prepare) { await mkdir(archive, { recursive: true }); await mkdir(previews, { recursive: true }); }
    const originals = [];
    for (const asset of assets) {
        const privatePng = path.join(archive, `${asset.id}.png`);
        if (prepare) {
            const publicSource = path.resolve('public/wallpapers', asset.source);
            const backup = path.join(archive, asset.source);
            let source;
            try { source = await readFile(backup); }
            catch (error) { if (error.code !== 'ENOENT') throw error; source = await readFile(publicSource); }
            const meta = await sharp(source).metadata();
            if (meta.width !== asset.width || meta.height !== asset.height) throw new Error(`Dimensions changed: ${asset.id}`);
            const png = await sharp(source).png({ compressionLevel: 9 }).toBuffer();
            if (png.length !== asset.bytes || checksum(png) !== asset.sha256) throw new Error(`Source changed: ${asset.id}`);
            const before = await sharp(source).ensureAlpha().raw().toBuffer();
            const after = await sharp(png).ensureAlpha().raw().toBuffer();
            if (!before.equals(after)) throw new Error(`Pixel verification failed: ${asset.id}`);
            // Preserve the full-size WebP before removing its public copy.
            await writeFile(backup, source, { flag: 'wx' }).catch(error => { if (error.code !== 'EEXIST') throw error; });
            if (checksum(await readFile(backup)) !== checksum(source)) throw new Error('Backup mismatch');
            await writeFile(privatePng, png);
            await sharp(source).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 75 }).toFile(path.join(previews, asset.preview));
            await removeArchivedPublicSource(publicSource, source);
            console.log(`Prepared preview and preserved original: ${asset.id}`);
        }
        const bytes = await readFile(privatePng);
        if (bytes.length !== asset.bytes || checksum(bytes) !== asset.sha256) throw new Error(`PNG mismatch: ${asset.id}`);
        originals.push({ ...asset, data: bytes, originalPath: `finance/${asset.id}-${asset.sha256}.png` });
    }
    if (!upload) return;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Configure server credentials in .env.local.');
    const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: config, error: bucketError } = await service.storage.getBucket(bucket);
    if (bucketError || !config || config.public) throw new Error('Originals bucket must exist and be private.');
    const { data: products, error: catalogError } = await service.from('wallpaper_products').select('id,cost,sha256,original_path,bytes').in('id', assets.map(asset => asset.id));
    if (catalogError || products?.length !== 4) throw new Error('Install the finance catalog migration first.');
    for (const asset of originals) {
        const product = products.find(product => product.id === asset.id);
        if (product?.sha256 !== asset.sha256 || product.original_path !== asset.originalPath || product.bytes !== asset.bytes || product.cost !== 15) throw new Error(`Catalog mismatch: ${asset.id}`);
        const filename = path.posix.basename(asset.originalPath);
        const { data: existing, error: listError } = await service.storage.from(bucket).list('finance', { search: filename, limit: 10 });
        if (listError) throw new Error(`Storage listing failed: ${asset.id} (${listError.message})`);
        if (!existing.some(file => file.name === filename)) {
            const { error } = await service.storage.from(bucket).upload(asset.originalPath, asset.data, { contentType: 'image/png', upsert: false });
            if (error) throw new Error(`Upload failed: ${asset.id} (${error.message})`);
        }
        const { data: file, error } = await service.storage.from(bucket).download(asset.originalPath);
        if (error || !file || file.size !== asset.bytes || checksum(new Uint8Array(await file.arrayBuffer())) !== asset.sha256) throw new Error(`Read-back failed: ${asset.id}`);
        console.log(`Verified private PNG: ${asset.id}`);
    }
    const { error } = await service.from('wallpaper_products').update({ active: true }).in('id', originals.map(asset => asset.id));
    if (error) throw new Error('Catalog activation failed.');
    console.log('Finance collection ready. No member credits changed.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
