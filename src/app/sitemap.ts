import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { articles as localArticles } from '@/data/articles';
import { siteUrl } from '@/lib/seo';
import { isRedirectedArticleSlug } from '@/lib/articleRedirects';

export const revalidate = 86400;

const popularNames = [
    'ภูมิพัฒน์',
    'ธนกร',
    'ปภาวรินทร์',
    'ณัฐชา',
    'พิชญา',
    'กานต์พงศ์',
    'สิรภพ',
    'อภิชญา',
    'พิมพ์ชนก',
    'ชนิดาภา',
    'กิตติภัทร',
    'วรินทร',
    'ภัคพล',
    'ธนัช',
    'นภัสสร',
    'ปุณยวีร์',
    'ณิชา',
    'ชนมน',
    'กฤษณ์',
    'ศุภกร',
    'ธีรภัทร',
    'ปัณณวิชญ์',
    'พิชญธิดา',
    'กรวิชญ์',
    'ณัฐกฤตา',
    'ปวริศา',
    'จิรัชญา',
    'วีรภัทร',
    'ธัญชนก',
    'พิมพ์มาดา',
    'ณฐพร',
    'กัญญาณัฐ',
    'ภูริพัฒน์',
    'ชญาดา',
    'ปัณฑิตา',
    'กมลลักษณ์',
    'อัครวินท์',
    'พัชรพร',
    'ธนภูมิ',
    'สุพิชฌาย์',
    'นันท์นภัส',
];

const toDate = (value: string | Date | null | undefined) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export function dedupeSitemapEntries(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
    return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteUrl;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    const routes = [
        '',
        '/name-check',
        '/about',
        '/methodology',
        '/articles',
        '/name-analysis',
        '/name-generator',
        '/pet-name',
        '/pet-name/dog',
        '/pet-name/cat',
        '/phone-analysis',
        '/premium-analysis',
        '/aura-analysis',
        '/premium-search',
        '/privacy',
        '/reviews',
        '/search',
        '/names/girls',
        '/names/girls/by-birthday',
        '/names/girls/english-names',
        '/names/girls/nicknames',
        '/names/boys',
        '/names/boys/by-birthday',
        '/names/boys/english-names',
        '/names/boys/nicknames',
        '/terms',
        '/palm-analysis',
        '/wallpapers',
        '/wallpapers/custom',
    ];

    const staticUrls: MetadataRoute.Sitemap = routes.map((path) => ({
        url: `${baseUrl}${path}`,
    }));

    const meaningUrls: MetadataRoute.Sitemap = popularNames.map((name) => ({
        url: `${baseUrl}/meaning/${encodeURIComponent(name)}`,
    }));

    const wallpaperDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'wednesday_night', 'thursday', 'friday', 'saturday'];
    const wallpaperZodiac = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

    const wallpaperCategoryUrls: MetadataRoute.Sitemap = [
        ...wallpaperDays.map((day) => ({
            url: `${baseUrl}/wallpapers/day/${day}`,
        })),
        { url: `${baseUrl}/wallpapers/zodiac` },
        ...wallpaperZodiac.map((sign) => ({
            url: `${baseUrl}/wallpapers/zodiac/${sign}`,
        })),
        { url: `${baseUrl}/wallpapers/intent/finance` },
        { url: `${baseUrl}/wallpapers/intent/love` },
        { url: `${baseUrl}/wallpapers/intent/work` },
    ];

    const namingDayUrls: MetadataRoute.Sitemap = [
        ...['boys', 'girls'].flatMap((gender) => wallpaperDays
            .filter((day) => !(gender === 'girls' && day === 'monday'))
            .map((day) => ({
            url: `${baseUrl}/names/${gender}/by-birthday/${day}`,
        }))),
    ];

    const namingOverviewUrls: MetadataRoute.Sitemap = wallpaperDays.map((day) => ({
        url: `${baseUrl}/names/by-birthday/${day}`,
    }));

    let articleUrls: MetadataRoute.Sitemap = [];
    try {
        if (supabase) {
            const { data: articles } = await supabase
                .from('articles')
                .select('slug, date, date_modified')
                .eq('is_published', true);

            if (articles) {
                articleUrls = articles
                    .filter((article) => !isRedirectedArticleSlug(article.slug))
                    .map((article) => ({
                    url: `${baseUrl}/articles/${encodeURIComponent(article.slug)}`,
                    lastModified: toDate(article.date_modified || article.date),
                }));
            }
        }
    } catch (error) {
        console.error('Sitemap generation error (articles):', error);
    }

    const localArticleUrls: MetadataRoute.Sitemap = localArticles
        .filter((article) => !isRedirectedArticleSlug(article.slug))
        .map((article) => ({
        url: `${baseUrl}/articles/${encodeURIComponent(article.slug)}`,
        lastModified: toDate(article.dateModified || article.date),
    }));

    const localArticleUrlsSet = new Set(localArticleUrls.map((article) => article.url));
    const dbOnlyArticles = articleUrls.filter((article) => !localArticleUrlsSet.has(article.url));

    return dedupeSitemapEntries([
        ...staticUrls,
        ...meaningUrls,
        ...wallpaperCategoryUrls,
        ...namingOverviewUrls,
        ...namingDayUrls,
        ...localArticleUrls,
        ...dbOnlyArticles,
    ]);
}
