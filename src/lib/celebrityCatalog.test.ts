import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import catalog from '@/data/celebrityCatalog.json';
import photoReviews from '@/data/celebrityImageReviews.json';
import { celebrityNameArticles, revisedCelebrityArticles } from '@/data/article-celebrity-names';
import { celebrityPublicationHolds } from '@/data/celebrityEditorialPolicy';
import { celebrityNameCases } from '@/data/celebrityNames';
import type { CelebrityCatalogGroup } from '@/types/celebrityCatalog';
import { getCelebrityCatalog } from './celebrityCatalog';
import { celebrityAnalysisHref, CELEBRITY_PAGE_SIZE, searchCelebrityCatalog } from './celebrityCatalogSearch';
import { celebrityImageEvidence, reviewedCelebrityPortrait } from './celebrityImageReview';
import { calculateScore } from '@/utils/calculateScore';
import { calculateGrade } from '@/utils/gradeResult';
import { analyzePairs } from '@/utils/analyzePairs';

describe('editorial celebrity name directory', () => {
    const entries = getCelebrityCatalog();
    it('preserves the original source hash while exporting only publishable identity records', () => {
        expect(catalog.sourceSha256).toBe('30fe69dc222adc2e09ea65a11d41de88aecae8fd08110f316ad86ddb55c9b42f');
        expect(catalog.inputSummary).toEqual({ nameCount: 156, personOptions: 185, withheldIdentityOptions: 1, withheldAgeReviewOptions: 3 });
        expect(entries).toHaveLength(153);
        expect(entries.flatMap(entry => entry.people)).toHaveLength(181);
        expect(new Set(entries.map(entry => entry.name)).size).toBe(153);
        expect(catalog.groups.map(group => group.sourceRow)).toEqual(Array.from({ length: 156 }, (_, index) => index + 2).filter(row => ![3, 19, 86].includes(row)));
        const fingerprint = createHash('sha256').update(JSON.stringify(catalog.groups.map(group => [group.name, group.workbookSum, group.people.map(person => person.surname)]))).digest('hex');
        expect(fingerprint).toBe('1766a7e8de943a191a5f1a27ccb72587b4835fe5617aa69fc8705810b1de67a8');
        const exported = JSON.stringify(catalog);
        for (const id of [...celebrityPublicationHolds.unresolvedIdentity, ...celebrityPublicationHolds.ageReview]) expect(exported).not.toContain(id);
        expect(entries.find(entry => entry.name === 'ลุลา')?.people[0].surname).toBe('');
        expect(entries.find(entry => entry.name === 'เบญจมินทร์')?.people[0].surname).toBe('');
        expect(entries.flatMap(entry => entry.people).every(person => !/[\r\n]/.test(person.surname))).toBe(true);
    });

    it('rechecks identity holds before serialization, even if a future import accidentally restores a held record', () => {
        const original = catalog.groups[0] as CelebrityCatalogGroup;
        const template = original.people[0];
        const incoming: CelebrityCatalogGroup = { ...original, people: [template,
            { ...template, id: 'test-unconfirmed', referenceStatus: 'unconfirmed', source: null },
            ...[...celebrityPublicationHolds.unresolvedIdentity, ...celebrityPublicationHolds.ageReview].map(id => ({ ...template, id })),
        ] };
        expect(getCelebrityCatalog([incoming])[0].people.map(person => person.id)).toEqual([template.id]);
    });

    it('reproduces every input grade with the personal tool and keeps the three editorial URLs', () => {
        for (const entry of entries) {
            expect(entry.sum).toBe(calculateScore(entry.name));
            expect(calculateGrade(entry.sum, analyzePairs(entry.name))).toBe('A+');
            expect(entry.goodPairs).toBe(entry.pairCount);
        }
        expect(entries.flatMap(entry => entry.articleHref ? [entry.articleHref] : []).sort()).toEqual([
            '/articles/fourth-nattawat-name-analysis', '/articles/love-pattranite-name-analysis', '/articles/nanon-korapat-name-analysis',
        ]);
        expect(celebrityNameArticles).toHaveLength(3);
        for (const article of [...celebrityNameArticles, ...revisedCelebrityArticles]) {
            expect(article.content).not.toContain('/premium-search');
            expect(article.content).toContain('/celebrity-names/editorial-policy#requests');
            expect(article.content).toContain('ไม่ได้แสดงถึงการรับรองบริการ');
        }
    });

    it('selects the matching identity across aliases and does not prefill a celebrity surname or birthday', () => {
        const [august] = searchCelebrityCatalog(entries, 'ไพศาลกุลวงศ์');
        expect(august.entry.name).toBe('วชิรวิชญ์');
        expect(august.entry.people.find(person => person.id === august.personId)?.nickname).toBe('ออกัส');
        expect(august.entry.people).toHaveLength(4);
        const [pope] = searchCelebrityCatalog(entries, 'วรรธนะภูติ');
        expect(pope.entry.people).toHaveLength(1);
        const url = new URL(celebrityAnalysisHref(august.entry.name), 'https://www.namemongkol.com');
        expect([...url.searchParams.keys()]).toEqual(['name', 'mode']);
        expect(url.searchParams.get('mode')).toBe('prefill');
        expect(url.searchParams.get('name')).toBe('วชิรวิชญ์');
    });

    it('includes every remaining name once across seven pages and finds names at the end of the source', () => {
        expect(searchCelebrityCatalog(entries, '  ถิร ชุติกุล  ')[0].entry.name).toBe('ถิร');
        expect(searchCelebrityCatalog(entries, 'วาทยกร')[0].entry.name).toBe('นรอรรถ');
        expect(searchCelebrityCatalog(entries, 'ไม่พบชื่อแน่นอน')).toEqual([]);
        const results = searchCelebrityCatalog(entries, '');
        const pages = Array.from({ length: Math.ceil(results.length / CELEBRITY_PAGE_SIZE) }, (_, index) => results.slice(index * CELEBRITY_PAGE_SIZE, (index + 1) * CELEBRITY_PAGE_SIZE));
        expect(pages).toHaveLength(7);
        expect(pages.at(-1)).toHaveLength(9);
        expect(new Set(pages.flat().map(result => result.entry.slug)).size).toBe(153);
    });

    it('serves only images with evidence, source status, licenses, and matching local dimensions', async () => {
        const people = entries.flatMap(entry => entry.people);
        expect(people.filter(person => person.portrait)).toHaveLength(44);
        for (const person of people) {
            expect(person.referenceStatus).toBe('matched');
            expect(person.source?.url).toMatch(/^https:\/\//);
            expect(person.referenceName.length).toBeGreaterThan(0);
            expect(person.occupations.length).toBeGreaterThan(0);
            if (!person.portrait) { expect(person.portraitEvidence).toBeUndefined(); continue; }
            const image = person.portrait;
            const filename = path.join(process.cwd(), 'public', image.src);
            expect(existsSync(filename)).toBe(true);
            expect(image.credit.length).toBeGreaterThan(0);
            expect(image.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\/(licenses\/(by|by-sa)\/|publicdomain\/)/);
            expect(person.portraitEvidence?.evidenceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/w\/index\.php\?oldid=\d+$/);
            const metadata = await sharp(filename).metadata();
            expect([metadata.width, metadata.height]).toEqual([image.width, image.height]);
        }
    });

    it('keeps withheld image bytes out of public and never restores a held image via editorial overrides', () => {
        const held = photoReviews.filter(review => review.status === 'withheld');
        expect(held).toHaveLength(35);
        for (const review of held) expect(existsSync(path.join(process.cwd(), 'public', review.src))).toBe(false);
        const love = entries.find(entry => entry.name === 'ภัทรานิษฐ์')!.people[0];
        expect(love.portrait).toBeNull();
        expect(love.portraitStatus).toBe('awaiting-evidence');
        const good = entries.flatMap(entry => entry.people).find(person => person.portrait)!.portrait!;
        expect(reviewedCelebrityPortrait({ ...good, src: '/images/celebrity-names/unreviewed.jpg' })).toBeNull();
        expect(celebrityImageEvidence({ ...good, license: 'unverified' })).toBeNull();
        expect(celebrityImageEvidence({ ...good, credit: 'Unverified creator' })).toBeNull();
        expect(celebrityImageEvidence({ ...good, licenseUrl: 'https://creativecommons.org/licenses/by/9.9/' })).toBeNull();
        expect(celebrityImageEvidence({ ...good, sourceUrl: 'https://example.com/unrelated-file' })).toBeNull();
    });

    it('rejects a stale bulk portrait after its source is held, even when the import supplies old evidence', () => {
        const group = catalog.groups.find(group => group.name === 'วชิรวิชญ์')! as CelebrityCatalogGroup;
        const oldEvidence = entries.flatMap(entry => entry.people).find(person => person.portraitEvidence)!.portraitEvidence;
        const stale: CelebrityCatalogGroup = { ...group, people: [{ ...group.people[0],
            portrait: celebrityNameCases[1].portrait, portraitStatus: 'available', portraitEvidence: oldEvidence,
        }] };
        const person = getCelebrityCatalog([stale])[0].people[0];
        expect(person.portrait).toBeNull();
        expect(person.portraitStatus).toBe('awaiting-evidence');
        expect(person.portraitEvidence).toBeUndefined();
    });
});
