import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MethodologyPage from '@/app/methodology/page';
import { NamingApproachSummary } from '@/components/NamingApproachSummary';
import { namingSciences, namingBrandDescription, premiumCurationDescription, namingApproachFaqs } from './namingApproach';

describe('four-science naming facts', () => {
    it('renders all four sciences, premium-only curation, and personal checks without running the tools', () => {
        const html = renderToStaticMarkup(createElement(MethodologyPage));
        expect(html.match(/<h1\b/g)).toHaveLength(1);
        for (const science of namingSciences) expect(html).toContain(science.name);
        expect(html).toContain(premiumCurationDescription);
        expect(html).toContain('ไม่ครอบคลุมทุกรายชื่อในฐานฟรี');
        expect(html).toContain('ไม่ใช่สูตรคำนวณความสมพงศ์ขึ้นใหม่');
        expect(html).toContain('id="premium-curation"');
        const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
        const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
        expect(faq.mainEntity.map((question: { name: string; acceptedAnswer: { text: string } }) => ({ question: question.name, answer: question.acceptedAnswer.text }))).toEqual(namingApproachFaqs);
        for (const item of namingApproachFaqs) {
            expect(html).toContain(item.question);
            expect(html).toContain(item.answer);
        }
    });

    it('keeps the same core facts in server summaries and both AI reference files', () => {
        for (const premium of [true, false]) {
            const html = renderToStaticMarkup(createElement(NamingApproachSummary, { premium }));
            expect(html).toContain(namingBrandDescription);
            expect(html).toContain(premiumCurationDescription);
            expect(html).toContain('href="/methodology#premium-curation"');
        }
        for (const path of ['public/llms.txt', 'public/llms-full.txt']) {
            const text = readFileSync(path, 'utf8');
            for (const science of namingSciences) expect(text).toContain(science.name);
            expect(text).toContain(premiumCurationDescription);
            expect(text).toContain('applies only to the premium catalog');
            expect(text).toContain('not a new name-surname compatibility formula');
        }
    });
});
