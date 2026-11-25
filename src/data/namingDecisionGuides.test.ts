import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { articles } from './articles';
import { decisionGuideExample, decisionGuideScores, namingDecisionGuides } from './article-naming-decision-guides';
import { calculateScore } from '@/utils/calculateScore';
import { siteUrl } from '@/lib/seo';

describe('naming decision guides', () => {
    it('publishes two distinct decision intents once in the existing article catalog', () => {
        expect(namingDecisionGuides.map(article => article.slug)).toEqual(['real-name-nickname-numerology', 'name-meaning-vs-numerology']);
        for (const guide of namingDecisionGuides) {
            expect(articles.filter(article => article.slug === guide.slug)).toHaveLength(1);
            expect(articles.find(article => article.slug === guide.slug)?.content).toBe(guide.content);
            expect(articles.filter(article => article.title === guide.title)).toHaveLength(1);
            expect(guide.metaTitle).not.toContain('NameMongkol');
            expect(guide.metaDescription).not.toBe(guide.excerpt);
            expect(guide.date).toBe('2026-11-25');
            expect(guide.dateModified).toBe(guide.date);
            expect(guide.keywords).not.toContain('วิเคราะห์ชื่อฟรี');
        }
        expect(new Set(namingDecisionGuides.map(article => article.metaTitle)).size).toBe(2);
        expect(new Set(namingDecisionGuides.map(article => article.metaDescription)).size).toBe(2);
    });

    it('keeps illustrative calculations consistent with the live analysis formula and the selected inputs', () => {
        expect(decisionGuideScores).toEqual({ realName: 14, alternative: 23, nickname: 10, surname: 26, fullName: 40, alternativeFullName: 49 });
        expect(decisionGuideScores.fullName).toBe(calculateScore(decisionGuideExample.realName) + calculateScore(decisionGuideExample.surname));
        expect(decisionGuideScores.alternativeFullName).toBe(calculateScore(decisionGuideExample.alternative) + calculateScore(decisionGuideExample.surname));
        for (const guide of namingDecisionGuides) {
            const exampleLink = [...guide.content.matchAll(/href="([^"]+)"/g)]
                .map(match => match[1].replace(/&amp;/g, '&'))
                .find(href => href.startsWith('/name-check?'))!;
            const parsed = new URL(exampleLink, siteUrl);
            expect(parsed.searchParams.get('name')).toBe(decisionGuideExample.realName);
            expect(parsed.searchParams.get('surname')).toBe(decisionGuideExample.surname);
        }
        expect(namingDecisionGuides[0].content).toContain(`= ${decisionGuideScores.fullName}`);
        expect(namingDecisionGuides[1].content).toContain(`<td>${decisionGuideScores.alternativeFullName}</td>`);
    });

    it('provides real content sections, explicit direct answers and guide-specific FAQ data', () => {
        expect(namingDecisionGuides[0].content).toContain('ไม่มีเงื่อนไขบังคับว่าชื่อจริงกับชื่อเล่นต้องมีผลรวมเท่ากัน');
        expect(namingDecisionGuides[1].content).toContain('ไม่จำเป็นต้องตัดชื่อที่ชอบทิ้งเพราะผลรวมไม่ตรงตัวเลขที่ตั้งไว้เพียงข้อเดียว');
        for (const guide of namingDecisionGuides) {
            expect(guide.content).not.toMatch(/<h1\b/);
            expect(guide.content).toContain('ความเชื่อ');
            expect(guide.content).toContain('คำอ่าน');
            expect(guide.content).toContain('สมมติ');
            const ids = [...guide.content.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
            expect(new Set(ids).size).toBe(ids.length);
            for (const item of guide.toc ?? []) {
                // The article renderer owns the common FAQ section outside article.content.
                if (item.id !== 'faq-section') expect(ids).toContain(item.id);
            }
            expect(guide.faqItems).toHaveLength(4);
            expect(new Set(guide.faqItems?.map(item => item.question)).size).toBe(4);
            expect(guide.faqItems?.every(item => item.answer.length > 80)).toBe(true);
        }
    });

    it('uses crawlable tool links, real local artwork and existing related articles', () => {
        for (const guide of namingDecisionGuides) {
            const hrefs = [...guide.content.matchAll(/<a\s+href="([^"]+)"/g)].map(match => match[1]);
            expect(hrefs).toContain('/meaning');
            expect(hrefs).toContain('/methodology');
            expect(hrefs).toContain('/names');
            expect(hrefs).toContain('/compare-names');
            expect(hrefs.some(href => href.startsWith('/name-check?'))).toBe(true);
            expect(hrefs.every(href => href.startsWith('/'))).toBe(true);
            expect(existsSync(path.join(process.cwd(), 'public', guide.coverImage))).toBe(true);
            for (const slug of guide.relatedSlugs ?? []) {
                expect(articles.some(article => article.slug === slug)).toBe(true);
            }
        }
        expect(namingDecisionGuides[0].content).toContain('href="/nicknames"');
        expect(namingDecisionGuides[0].content).toContain('href="/articles/name-meaning-vs-numerology"');
        expect(namingDecisionGuides[1].content).toContain('href="/articles/real-name-nickname-numerology"');
    });

    it('identifies the website team and scopes its sources without inventing a personal case or expert review', () => {
        for (const guide of namingDecisionGuides) {
            expect(guide.author).toBe('ทีมงาน NameMongkol');
            expect(guide.reviewer).toBeUndefined();
            expect(guide.reviewedAt).toBeUndefined();
            expect(guide.sources).toHaveLength(1);
            expect(guide.sources?.[0]).toMatchObject({ url: `${siteUrl}/methodology`, kind: 'methodology' });
            expect(guide.sources?.[0].note).toContain('ไม่ใช่หลักฐานรับรองผลต่อชีวิต');
            expect(guide.content).not.toContain('ผู้เชี่ยวชาญรับรอง');
        }
    });
});
