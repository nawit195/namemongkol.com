import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readSource = (filePath: string) => readFileSync(path.join(root, filePath), 'utf8');

describe('keyword broadening architecture', () => {
    test('creates eight gender-neutral birthday hubs with distinct ownership', () => {
        const overview = readSource('src/app/names/by-birthday/[day]/page.tsx');
        const genderPage = readSource('src/components/names/BirthdayDayLandingPage.tsx');
        const config = readSource('next.config.ts');

        for (const day of ['sunday', 'monday', 'tuesday', 'wednesday', 'wednesday_night', 'thursday', 'friday', 'saturday']) {
            expect(overview).toContain(`'${day}'`);
        }
        expect(overview).toContain('ชื่อมงคลคนเกิด${dayLabel} 2569');
        expect(overview).toContain("'@type': 'ItemList'");
        expect(overview).toContain("'@type': 'FAQPage'");
        expect(genderPage).toContain('/names/by-birthday/${day}');
        expect(config).toContain("source: '/names/girls/by-birthday/monday'");
        expect(config).toContain("destination: '/articles/monday-girl-names-2569-no-sara'");
    });

    test('publishes dog and cat landing pages without replacing the pet tool', () => {
        const category = readSource('src/app/pet-name/PetNameCategoryPage.tsx');
        const dog = readSource('src/app/pet-name/dog/page.tsx');
        const cat = readSource('src/app/pet-name/cat/page.tsx');
        const sitemap = readSource('src/app/sitemap.ts');

        expect(category).toContain("'@type': 'ItemList'");
        expect(category).toContain("'@type': 'FAQPage'");
        expect(dog).toContain("canonical: `${siteUrl}/pet-name/dog`");
        expect(cat).toContain("canonical: `${siteUrl}/pet-name/cat`");
        expect(sitemap).toContain("'/pet-name/dog'");
        expect(sitemap).toContain("'/pet-name/cat'");
        expect(sitemap).toContain('/names/by-birthday/${day}');
    });

    test('tracks head, long-tail and pet keyword cohorts in GSC reporting', () => {
        const report = readSource('scripts/generate-gsc-weekly-report.js');
        const packageJson = readSource('package.json');

        expect(report).toContain("key: 'birthday-head'");
        expect(report).toContain("key: 'birthday-gender-long-tail'");
        expect(report).toContain("'pet-names':");
        expect(packageJson).toContain('gsc:weekly:pet-names');
    });
});
