import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { boyNamesCurated } from '@/data/boyNamesCurated';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import { babyNamingFaqs, selectBabyNameExamples } from '@/data/babyNaming';
import { fetchAllPublicNames, type PublicNameRecord } from '@/lib/publicNames';
import BabyNamesPage, { metadata } from './page';

vi.mock('@/lib/publicNames', () => ({ fetchAllPublicNames: vi.fn() }));

const records: PublicNameRecord[] = [
    ...boyNamesCurated.slice(0, 14).map((item) => ({ ...item, gender: 'male' as const, grade: 'A' as const })),
    ...girlNamesCurated.slice(0, 14).map((item) => ({ ...item, gender: 'female' as const, grade: 'A' as const })),
];

beforeEach(() => vi.mocked(fetchAllPublicNames).mockResolvedValue(records));

describe('baby naming landing page', () => {
    test('selects twelve names of each gender without promoting unreviewed meanings', () => {
        const rejected = { ...records[0], meaningStatus: 'rejected' as const };
        const pending = { ...records[1], meaning: 'คำแปลที่ยังไม่ตรวจ', meaningStatus: 'pending' as const };
        const selected = selectBabyNameExamples([rejected, pending, ...records.slice(2)]);
        expect(selected).toHaveLength(24);
        expect(selected.filter((item) => item.gender === 'male')).toHaveLength(12);
        expect(selected.filter((item) => item.gender === 'female')).toHaveLength(12);
        expect(selected.map((item) => item.name)).not.toContain(rejected.name);
        expect(selected.map((item) => item.name)).not.toContain(pending.name);
        expect(new Set(selected.map((item) => item.name)).size).toBe(24);
    });

    test('renders crawlable examples and FAQs that match JSON-LD before hydration', async () => {
        const html = renderToStaticMarkup(await BabyNamesPage());
        const schemas = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
        const itemList = schemas.find(item => item['@type'] === 'ItemList');
        const faq = schemas.find(item => item['@type'] === 'FAQPage');
        expect(html.match(/<h1\b/g)).toHaveLength(1);
        expect(html.match(/<article\b/g)).toHaveLength(24);
        expect(itemList.numberOfItems).toBe(24);
        expect(itemList.itemListElement).toHaveLength(24);
        for (const item of itemList.itemListElement) {
            expect(html).toContain(item.item.name);
            expect(html).toContain(item.item.description);
            expect(html).toContain(`/name-check?name=${encodeURIComponent(item.item.name)}`);
        }
        expect(faq.mainEntity.map((item: { name: string }) => item.name)).toEqual(babyNamingFaqs.map((item) => item.question));
        for (const item of faq.mainEntity) {
            expect(html).toContain(item.name);
            expect(html).toContain(item.acceptedAnswer.text);
        }
        expect(metadata.title).toEqual({ absolute: 'ตั้งชื่อลูก พร้อมความหมาย เลือกชื่อลูกชาย–ลูกสาว | NameMongkol' });
        expect(metadata.alternates?.canonical).toBe('https://www.namemongkol.com/names');
    });

    test('uses existing editorial categories and meanings for a legacy neutral-only dataset', () => {
        const legacy = records.map((item) => ({ ...item, gender: 'neutral' as const, meaning: 'ความหมายจากข้อมูลเก่าที่ยังไม่ได้ตรวจ' }));
        const examples = selectBabyNameExamples(legacy);
        expect(examples).toHaveLength(24);
        expect(examples.filter((item) => item.gender === 'male')).toHaveLength(12);
        expect(examples.filter((item) => item.gender === 'female')).toHaveLength(12);
        expect(examples.every((item) => item.meaning !== 'ความหมายจากข้อมูลเก่าที่ยังไม่ได้ตรวจ')).toBe(true);
    });

    test('publishes only approved pronunciations and keeps tracking free of names', async () => {
        vi.mocked(fetchAllPublicNames).mockResolvedValue([
            { ...records[0], pronunciation: 'คำอ่านร่างที่ไม่ควรเผยแพร่', pronunciationStatus: 'pending' },
            { ...records[1], pronunciation: 'คำอ่านตรวจแล้ว', pronunciationStatus: 'approved' },
            ...records.slice(2),
        ]);
        const html = renderToStaticMarkup(await BabyNamesPage());
        expect(html).not.toContain('คำอ่านร่างที่ไม่ควรเผยแพร่');
        expect(html).toContain('คำอ่านตรวจแล้ว');
        expect(html).toContain('data-track="funnel.search.name_analyze"');
        for (const match of html.matchAll(/data-track-meta="([^"]*)"/g)) {expect(Object.keys(JSON.parse(match[1].replaceAll('&quot;','"'))).sort()).toEqual(['count','kind']);}
    });

    test('does not reintroduce unavailable names when reviewed data is missing', async () => {
        vi.mocked(fetchAllPublicNames).mockResolvedValue([]);
        const html = renderToStaticMarkup(await BabyNamesPage());
        expect(html).toContain('กำลังเตรียมตัวอย่างที่ตรวจสอบความหมายแล้ว');
        expect(html).not.toContain('<article');
        expect(html).not.toContain('"@type":"ItemList"');
        expect(html).toContain('href="/names/boys"');
    });
});
