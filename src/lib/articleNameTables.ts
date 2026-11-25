import { analyzeThaksa } from '@/utils/analyzeThaksa';
import { thaksaConfig } from '@/data/thaksaConfig';

const groups: Record<string, string> = { charm: 'เมตตาและเสน่ห์', wealth: 'ทรัพย์และความมั่นคง', wisdom: 'ความรู้และปัญญา', modern: 'ชื่อสั้นและร่วมสมัย', 'names-by-personality': 'ตัวอย่างรวม', 'group-wisdom': 'ความรู้และปัญญา', 'group-wealth': 'ทรัพย์และความเจริญ', 'group-charm': 'เมตตาและความรัก', 'group-leader': 'ผู้นำและความมั่นใจ', 'group-serene': 'ความสุขและความสงบ' };
export const NAME_TABLE_ARTICLES = ['monday-girl-names-2569-no-sara', '100-auspicious-women-names-2026'] as const;
export const textFromCell = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
export type ArticleNameGroup = { id: string; label: string; count: number };
type MeaningLink = { name: string; path: string; meaning?: string; pronunciation?: string | null };

/** Optional enrichment must not prevent the repository-owned article from rendering. */
export async function prepareNameArticleTables(html: string, slug: string, loadMeanings: () => Promise<readonly MeaningLink[]>) {
    if (!(NAME_TABLE_ARTICLES as readonly string[]).includes(slug)) return enhanceNameArticleTables(html, slug);
    const meanings = await loadMeanings().catch(() => []);
    return enhanceNameArticleTables(html, slug, meanings);
}

/** Enhance only the two bounded, repository-owned tables; never parse arbitrary CMS HTML as a catalog. */
export function enhanceNameArticleTables(html: string, slug: string, meanings: readonly MeaningLink[] = []) {
    const result = { html, groups: [] as ArticleNameGroup[], total: 0, unique: 0, suitable: 0 };
    if (!(NAME_TABLE_ARTICLES as readonly string[]).includes(slug)) return result;
    const links = new Map(meanings.map(entry => [entry.name, entry]));
    const unique = new Set<string>();
    const monday = slug === NAME_TABLE_ARTICLES[0];
    result.html = html.replace(/<table\b[\s\S]*?<\/table>/g, (table, offset: number) => {
        const headers = [...table.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(match => textFromCell(match[1]));
        const nameIndex = headers.findIndex(value => /^ชื่อ(?:จริง| \(Thai\))?$/.test(value));
        const readingIndex = headers.indexOf('คำอ่าน');
        if (nameIndex < 0 || !headers.includes('ความหมาย')) return table;
        const section = [...html.slice(0, offset).matchAll(/<div\s+id="([^"]+)"/g)].at(-1)?.[1];
        if (!section || !groups[section]) return table;
        let count = 0;
        const enhanced = table.replace(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g, (row, attrs: string, body: string) => {
            const cells = [...body.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)];
            if (!cells.length) return row;
            const name = textFromCell(cells[nameIndex]?.[2] ?? '').normalize('NFC');
            if (!name) return row;
            count++; result.total++; unique.add(name);
            const suitable = monday ? analyzeThaksa(name, 'monday')?.hasKali === false : true;
            if (suitable) result.suitable++;
            const entry = links.get(name);
            const content = cells.map((cell, index) => {
                let value = cell[2];
                if (index === nameIndex) {
                    value = entry ? `<a href="${escape(entry.path)}">${escape(name)}</a>` : escape(name);
                    value += `<a class="name-table-analysis" href="/name-check?name=${encodeURIComponent(name)}">วิเคราะห์ชื่อ ↗</a>`;
                } else if (index === readingIndex) value = entry?.pronunciation ? escape(entry.pronunciation) : '<span class="name-table-pending">รอตรวจคำอ่าน</span>';
                else if (headers[index] === 'ความหมาย' && entry?.meaning) value = escape(entry.meaning);
                else if (headers[index] === 'วันเกิดที่เหมาะ') value = Object.entries(thaksaConfig).filter(([day]) => analyzeThaksa(name, day)?.hasKali === false).map(([, day]) => escape(day.name)).join(', ') || 'ไม่พบวันที่ผ่านตัวกรอง';
                return `<td${cell[1]} data-name-field="${index === nameIndex ? 'name' : index === readingIndex ? 'reading' : headers[index] === '#' ? 'number' : headers[index] === 'ความหมาย' ? 'meaning' : 'other'}">${value}</td>`;
            }).join('');
            const searchText = [name, entry?.meaning ?? textFromCell(cells[headers.indexOf('ความหมาย')]?.[2] ?? ''), entry?.pronunciation ?? ''].join(' ');
            return `<tr${attrs} data-name-row data-name-search="${escape(searchText)}" data-name-group="${section}" data-name-suitable="${suitable}">${content}</tr>`;
        });
        result.groups.push({ id: section, label: groups[section], count });
        return enhanced.replace('<table', `<table data-name-table="${section}"`).replace('วันเกิดที่เหมาะ', 'วันเกิดตามตัวกรองระบบ');
    });
    result.unique = unique.size;
    for (const group of result.groups) result.html = result.html.replace(`<div id="${group.id}">`, `<div id="${group.id}" data-name-section>`);
    return result;
}

export function articleAbsoluteTitle(title: string) {
    return `${title.replace(/(?:\s*[|\-–]\s*NameMongkol)+\s*$/i, '').trim()} | NameMongkol`;
}
