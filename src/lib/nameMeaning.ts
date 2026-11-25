import type { Metadata } from 'next';
import type { PublicNameRecord } from './publicNames';
import { prepareReviewedNames } from './reviewedNames';
import { ogImageUrl, siteUrl } from './seo';
import { meaningDiscoverySeeds, meaningGroups } from '@/data/meaningDiscovery';
export { meaningDiscoverySeeds, meaningGroups } from '@/data/meaningDiscovery';
const seedSet = new Set(meaningDiscoverySeeds);

export type NameMeaningEntry = {
    name: string;
    path: string;
    meaning: string;
    pronunciation: string | null;
    pronunciationVariants: string[];
    source: 'catalog' | 'editorial';
};
export type NameMeaningModel = {
    name: string;
    path: string;
    entry: NameMeaningEntry | null;
    indexable: boolean;
    related: Array<NameMeaningEntry & { reason: string }>;
};

/** Names are Thai letters/marks only. Never turn arbitrary URL text into an indexed page. */
export function normalizeMeaningName(raw: string): string | null {
    let value = raw;
    try { if (value.includes('%')) value = decodeURIComponent(value); } catch { return null; }
    value = value.normalize('NFC').trim();
    return value.length <= 60 && /^[ก-ฮเแโใไ][ก-ฮะัาำิีึืฺุูเแโใไๅ็่้๊๋์ํ๎]*$/u.test(value) ? value : null;
}

export function meaningPath(name: string) {
    return `/meaning/${encodeURIComponent(name.normalize('NFC'))}`;
}

export function buildMeaningCatalog(records: readonly PublicNameRecord[], names: readonly string[] = meaningDiscoverySeeds): NameMeaningEntry[] {
    const allowed = new Set(names);
    // Filter before review preparation, which also calculates name-analysis fields.
    // A detail request must not recalculate the complete public catalog.
    const selected = records.filter(item => allowed.has(item.name.normalize('NFC').trim()));
    return prepareReviewedNames(selected).flatMap(item => {
        const name = normalizeMeaningName(item.name);
        if (!name || !item.meaning?.trim()) return [];
        return [{
            name, path: meaningPath(name), meaning: item.meaning.trim(),
            pronunciation: item.pronunciationStatus === 'approved' ? item.pronunciation?.trim() || null : null,
            pronunciationVariants: item.pronunciationStatus === 'approved' ? [...new Set((item.pronunciationVariants ?? []).map(value => value.trim()).filter(Boolean))] : [],
            source: item.meaningStatus === 'approved' ? 'catalog' as const : 'editorial' as const,
        }];
    }).sort((a, b) => a.name.localeCompare(b.name, 'th'));
}

export function createNameMeaningModel(raw: string, catalog: readonly NameMeaningEntry[]): NameMeaningModel | null {
    const name = normalizeMeaningName(raw);
    if (!name) return null;
    const entry = catalog.find(item => item.name === name) ?? null;
    const related = new Map<string, NameMeaningEntry & { reason: string }>();
    if (entry) {
        for (const group of meaningGroups) {
            if (!(group.names as readonly string[]).includes(name) || !group.tokens.some(token => entry.meaning.includes(token))) continue;
            for (const candidate of catalog) {
                if (candidate.name === name || !(group.names as readonly string[]).includes(candidate.name)) continue;
                const token = group.tokens.find(value => candidate.meaning.includes(value));
                if (token) related.set(candidate.name, { ...candidate, reason: `กลุ่ม${group.title}: ความหมายที่เผยแพร่มีคำว่า “${token}”` });
            }
        }
    }
    return { name, path: meaningPath(name), entry, indexable: !!entry && seedSet.has(name), related: [...related.values()].slice(0, 4) };
}

export function nameMeaningMetadata(model: NameMeaningModel): Metadata {
    const title = model.entry ? `ความหมายชื่อ ${model.name} และข้อมูลคำอ่าน` : `ตรวจข้อมูลความหมายชื่อ ${model.name}`;
    const description = model.entry
        ? `${model.name} หมายถึง ${model.entry.meaning} อ่านข้อมูลคำอ่าน แหล่งข้อมูล และชื่อที่เกี่ยวข้อง โดยแยกความหมายออกจากเลขศาสตร์`.slice(0, 180)
        : `ยังไม่มีความหมายชื่อ ${model.name} ที่พร้อมเผยแพร่ในชุดหน้าความหมายที่คัดเลือกนี้ เลือกดูชื่ออื่นหรือไปยังเครื่องมือวิเคราะห์ชื่อ`;
    const image = ogImageUrl({ variant: 'article', title, subtitle: 'ความหมาย คำอ่าน และที่มาของข้อมูล', tag: 'ความหมายชื่อ' });
    return {
        title, description, alternates: { canonical: siteUrl + model.path },
        robots: { index: model.indexable, follow: true },
        openGraph: { title: `${title} | NameMongkol`, description, url: siteUrl + model.path, type: 'website', locale: 'th_TH', siteName: 'NameMongkol', images: [image] },
        twitter: { card: 'summary_large_image', title: `${title} | NameMongkol`, description, images: [image] },
    };
}

export function nameMeaningSchema(model: NameMeaningModel) {
    const url = siteUrl + model.path;
    return {
        '@context': 'https://schema.org', '@graph': [
            { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: `ความหมายชื่อ ${model.name}`, inLanguage: 'th-TH', ...(model.entry ? { description: model.entry.meaning, mainEntity: { '@id': `${url}#meaning` } } : {}) },
            { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'หน้าหลัก', item: siteUrl },
                { '@type': 'ListItem', position: 2, name: 'ความหมายชื่อ', item: `${siteUrl}/meaning` },
                { '@type': 'ListItem', position: 3, name: model.name, item: url },
            ] },
            ...(model.entry ? [{ '@type': 'DefinedTerm', '@id': `${url}#meaning`, name: model.name, description: model.entry.meaning, url, inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'รายการความหมายชื่อ NameMongkol', url: `${siteUrl}/meaning` } }] : []),
        ],
    };
}

export function meaningHubSchema(entries: readonly NameMeaningEntry[]) {
    return { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'ความหมายชื่อและข้อมูลคำอ่าน', url: `${siteUrl}/meaning`, inLanguage: 'th-TH', mainEntity: {
        '@type': 'ItemList', numberOfItems: entries.length, itemListElement: entries.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: siteUrl + item.path })),
    } };
}

export const serializeMeaningSchema = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
