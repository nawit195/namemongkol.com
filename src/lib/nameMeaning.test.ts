import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicNameRecord } from './publicNames';

const state = vi.hoisted(() => ({ records: [] as PublicNameRecord[], cachedOptions: [] as unknown[] }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/publicNames', () => ({ fetchAllPublicNames: vi.fn(async () => state.records) }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown, _key: unknown, options: unknown) => { state.cachedOptions.push(options); return fn; } }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); }, redirect: (path: string) => { throw new Error(`NEXT_REDIRECT:${path}`); } }));
import { buildMeaningCatalog, createNameMeaningModel, meaningDiscoverySeeds, meaningHubSchema, meaningPath, nameMeaningMetadata, nameMeaningSchema, normalizeMeaningName, serializeMeaningSchema } from './nameMeaning';
import { getMeaningDiscoveryNames, getNameMeaningModel } from './nameMeaningCatalog';
import MeaningDetail from '@/app/meaning/MeaningDetail';
import MeaningHub, { generateMetadata as hubMetadata } from '@/app/meaning/page';
import MeaningPage, { generateMetadata as detailMetadata } from '@/app/meaning/[name]/page';
import { siteUrl } from './seo';
import { fetchAllPublicNames } from './publicNames';

const record = (name: string, extra: Partial<PublicNameRecord> = {}): PublicNameRecord => ({
    name, gender: 'neutral', meaning: 'ความหมายในฐานข้อมูล', meaningStatus: 'approved', numerology: 999, suitableDays: [], grade: 'C', ...extra,
});

beforeAll(() => vi.stubGlobal('React', React));
afterAll(() => vi.unstubAllGlobals());
beforeEach(() => { state.records = []; vi.mocked(fetchAllPublicNames).mockClear(); });

describe('reviewed meaning pages', () => {
    it('publishes only approved meanings or existing editorial meanings, conservatively blocking rejected duplicates', () => {
        const entries = buildMeaningCatalog([
            record('ธนกร', { meaning: 'ผู้สร้างทรัพย์', pronunciation: 'ทะ-นะ-กอน' }),
            record('ณัฐชา', { meaningStatus: 'pending', meaning: 'อย่าเผยแพร่' }),
            record('ณิชา', { meaningStatus: 'rejected' }),
            record('กฤติน', { meaningStatus: undefined, meaning: 'ความหมายร่าง' }),
            record('กฤษณ์'), record('กฤษณ์', { meaningStatus: 'rejected' }),
            record('ชื่อใหม่ที่ไม่มีในรายการ', { meaningStatus: undefined }),
        ]);
        expect(entries.map(item => item.name)).toEqual(['กฤติน', 'ธนกร']);
        expect(entries[0].meaning).toBe('ผู้คงแก่เรียน, ผู้รู้');
        expect(entries[0].source).toBe('editorial');
        expect(entries[1].meaning).toBe('ผู้สร้างทรัพย์');
        expect(entries[1].source).toBe('catalog');
        expect(entries[1].pronunciation).toBeNull();
    });

    it('hides legacy, pending and rejected readings; only an approved reading can be shown', () => {
        for (const pronunciationStatus of [undefined, 'pending', 'draft', 'rejected'] as const) {
            const entry = buildMeaningCatalog([record('ธนกร', { pronunciationStatus, pronunciation: 'เดิมไม่ตรวจ', pronunciationVariants: ['ร่าง'] })])[0];
            expect(entry.pronunciation).toBeNull();
            expect(entry.pronunciationVariants).toEqual([]);
        }
        const entry = buildMeaningCatalog([record('ธนกร', { pronunciationStatus: 'approved', pronunciation: ' ทะ-นะ-กอน ', pronunciationVariants: [' ทน-นะ-กอน ', 'ทน-นะ-กอน'] })])[0];
        expect(entry.pronunciation).toBe('ทะ-นะ-กอน');
        expect(entry.pronunciationVariants).toEqual(['ทน-นะ-กอน']);
    });

    it('normalizes Thai paths and rejects malformed, non-Thai and executable input', () => {
        expect(normalizeMeaningName(' ธนกร ')).toBe('ธนกร');
        expect(normalizeMeaningName(encodeURIComponent('ณิชา'))).toBe('ณิชา');
        expect(normalizeMeaningName('ฤๅดี')).toBe('ฤๅดี');
        for (const name of ['', 'Alice', '123', '../ธนกร', 'ธน กร', '<script>alert(1)</script>', '%E0%A4%A', '่ก', 'ก'.repeat(61)]) expect(normalizeMeaningName(name)).toBeNull();
        expect(meaningPath('ธนกร')).toBe(`/meaning/${encodeURIComponent('ธนกร'.normalize('NFC'))}`);
    });

    it('keeps publication bounded and leaves unknown or non-discovery utility pages noindex', async () => {
        expect(meaningDiscoverySeeds.length).toBeLessThan(70);
        state.records = [record('ธนกร', { meaning: 'ผู้สร้างทรัพย์' }), record('ชื่อใหม่'), record('ณิชา', { meaningStatus: 'pending' })];
        expect(await getMeaningDiscoveryNames()).toEqual([{ name: 'ธนกร', meaning: 'ผู้สร้างทรัพย์', path: meaningPath('ธนกร') }]);
        expect(state.cachedOptions).toContainEqual({ revalidate: 600, tags: ['public-names'] });
        expect((await getNameMeaningModel('ธนกร'))?.indexable).toBe(true);
        vi.mocked(fetchAllPublicNames).mockClear();
        expect((await getNameMeaningModel('ชื่อใหม่'))?.entry).toBeNull();
        expect((await getNameMeaningModel('ชื่อใหม่'))?.indexable).toBe(false);
        expect(fetchAllPublicNames).not.toHaveBeenCalled();
        for (const name of ['ณิชา', 'ไม่พบข้อมูล']) {
            const model = await getNameMeaningModel(name);
            expect(model?.entry).toBeNull();
            expect(model && nameMeaningMetadata(model).robots).toEqual({ index: false, follow: true });
            expect(model && JSON.stringify(nameMeaningSchema(model))).not.toContain('DefinedTerm');
        }
    });

    it('relates only explicit members supported by actual meaning text and explains why', () => {
        const catalog = buildMeaningCatalog([
            record('ธนกร', { meaning: 'ผู้สร้างทรัพย์' }), record('ธนพัฒน์', { meaning: 'ผู้เจริญด้วยทรัพย์' }),
            record('ธนภูมิ', { meaning: 'พื้นแผ่นดิน' }), record('พิมพ์ชนก', { meaning: 'ทรัพย์มากมาย' }),
            record('กรวิชญ์', { meaning: 'ความรู้ในการกระทำ' }), record('ณัฐชา', { meaning: 'นักปราชญ์' }),
            record('กฤติน', { meaningStatus: 'rejected', meaning: 'ผู้รู้' }),
        ]);
        const wealth = createNameMeaningModel('ธนกร', catalog)!;
        expect(wealth.related.map(item => item.name)).toEqual(['ธนพัฒน์']);
        expect(wealth.related[0].reason).toContain('ความหมายที่เผยแพร่มีคำว่า “ทรัพย์”');
        expect(createNameMeaningModel('กรวิชญ์', catalog)?.related.map(item => item.name)).toEqual(['ณัฐชา']);
    });

    it('uses the actual meaning in metadata/DefinedTerm and safely serializes source text', () => {
        const meaning = 'ผู้สร้างทรัพย์ </script><script>alert("x")</script> & ความดี';
        const model = createNameMeaningModel('ธนกร', buildMeaningCatalog([record('ธนกร', { meaning })]))!;
        const metadata = nameMeaningMetadata(model);
        expect(metadata.title).toBe('ความหมายชื่อ ธนกร และข้อมูลคำอ่าน');
        expect(metadata.title).not.toContain('NameMongkol');
        expect(metadata.alternates?.canonical).toBe(siteUrl + meaningPath('ธนกร'));
        expect(metadata.openGraph).toHaveProperty('url', siteUrl + meaningPath('ธนกร'));
        const schema = nameMeaningSchema(model);
        const term = schema['@graph'].find(item => item['@type'] === 'DefinedTerm');
        expect(term).toHaveProperty('description', meaning);
        expect(JSON.stringify(schema)).not.toContain('ผลรวมเลขศาสตร์');
        const serialized = serializeMeaningSchema(schema);
        expect(serialized).not.toContain('</script>');
        expect(JSON.parse(serialized)).toEqual(schema);
        const html = renderToStaticMarkup(React.createElement(MeaningDetail, { model }));
        expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
        expect(html).toContain('&lt;/script&gt;');
        expect(html).not.toContain('<script>alert');
        expect(html.indexOf('ผู้สร้างทรัพย์')).toBeLessThan(html.indexOf('ดูอีกด้านของชื่อ'));
        expect(html).toContain('/name-check?name=');
        expect(html).toContain('ยังไม่มีคำอ่านที่ยืนยัน');
        expect(html).toContain('ยังไม่มีเอกสารอ้างอิงภายนอกแนบ');
        expect(html).toContain('/articles/name-meaning-vs-numerology');
        expect(html).not.toContain('ผลรวมเลขศาสตร์</');
    });

    it('server-renders real hub examples and a working GET lookup, preserving invalid input transparently', async () => {
        state.records = [record('ธนกร', { meaning: 'ผู้สร้างทรัพย์' }), record('ณิชา', { meaning: 'บริสุทธิ์' }), record('พิชญา', { meaningStatus: 'pending' })];
        const html = renderToStaticMarkup(await MeaningHub({ searchParams: Promise.resolve({}) }));
        expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
        expect(html).toContain('ผู้สร้างทรัพย์'); expect(html).toContain('บริสุทธิ์');
        expect(html).not.toContain('พิชญา');
        expect(html).toContain('action="/meaning"'); expect(html).toContain('method="get"');
        const entries = buildMeaningCatalog(state.records);
        expect(meaningHubSchema(entries).mainEntity.numberOfItems).toBe(2);
        await expect(MeaningHub({ searchParams: Promise.resolve({ name: 'ธนกร' }) })).rejects.toThrow(`NEXT_REDIRECT:${meaningPath('ธนกร')}`);
        const invalid = renderToStaticMarkup(await MeaningHub({ searchParams: Promise.resolve({ name: '<script>' }) }));
        expect(invalid).toContain('role="alert"'); expect(invalid).not.toContain('<script>');
        expect((await hubMetadata({ searchParams: Promise.resolve({ name: 'invalid' }) })).robots).toEqual({ index: false, follow: true });
    });

    it('returns 404 for malformed detail paths and transparent noindex for valid unavailable names', async () => {
        for (const name of ['bad-name', '<script>']) {
            await expect(MeaningPage({ params: Promise.resolve({ name }) })).rejects.toThrow('NEXT_NOT_FOUND');
            await expect(detailMetadata({ params: Promise.resolve({ name }) })).rejects.toThrow('NEXT_NOT_FOUND');
        }
        const props = { params: Promise.resolve({ name: 'ไม่พบข้อมูล' }) };
        expect((await detailMetadata(props)).robots).toEqual({ index: false, follow: true });
        const html = renderToStaticMarkup(await MeaningPage(props));
        expect(html).toContain('ยังไม่มีความหมายที่พร้อมเผยแพร่');
        expect(html).not.toContain('DefinedTerm');
        expect(html).toContain('href="/meaning"');
    });
});
