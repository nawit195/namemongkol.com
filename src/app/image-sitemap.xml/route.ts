import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { articles, type Article } from '@/data/articles';
import { INITIAL_WALLPAPERS, ZODIAC_WALLPAPERS } from '@/data/wallpapers';
import { absoluteSiteUrl, getArticleImages } from '@/lib/articleImageMeta';
import { siteUrl } from '@/lib/seo';
import { isRedirectedArticleSlug } from '@/lib/articleRedirects';

export const revalidate = 86400;

type SitemapImage = {
    loc: string;
};

type SitemapEntry = {
    pageUrl: string;
    images: SitemapImage[];
};

type DbArticleImageRow = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string | null;
    cover_image: string | null;
    cover_image_alt: string | null;
    date: string;
    author: string;
    category: string;
    keywords: string[] | null;
    meta_title: string | null;
    meta_description: string | null;
    date_modified: string | null;
};

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function imageToXml(image: SitemapImage) {
    return [
        '    <image:image>',
        `      <image:loc>${escapeXml(image.loc)}</image:loc>`,
        '    </image:image>',
    ].join('\n');
}

function entryToXml(entry: SitemapEntry) {
    return [
        '  <url>',
        `    <loc>${escapeXml(entry.pageUrl)}</loc>`,
        ...entry.images.map(imageToXml),
        '  </url>',
    ].join('\n');
}

function resolveArticleCoverImage(dbImage?: string | null, localImage?: string) {
    const image = dbImage?.trim() || '';

    if (!image) return localImage || '';

    const isLegacyLocalArticlePath = image.startsWith('/images/article/') || image.startsWith('/images/article-');
    if (isLegacyLocalArticlePath && localImage) return localImage;

    return image;
}

function toArticleImageEntry(article: Article): SitemapEntry | null {
    if (isRedirectedArticleSlug(article.slug)) return null;

    const images = Array.from(
        new Map(getArticleImages(article).map((image) => [image.src, { loc: image.src }])).values()
    );

    if (images.length === 0) return null;

    return {
        pageUrl: `${siteUrl}/articles/${encodeURIComponent(article.slug)}`,
        images,
    };
}

function getLocalArticleImageEntries(): SitemapEntry[] {
    return articles
        .map(toArticleImageEntry)
        .filter((entry): entry is SitemapEntry => Boolean(entry));
}

async function getDbArticleImageEntries(): Promise<SitemapEntry[]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return [];

    try {
        const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const { data, error } = await supabase
            .from('articles')
            .select('id, slug, title, excerpt, content, cover_image, cover_image_alt, date, author, category, keywords, meta_title, meta_description, date_modified')
            .eq('is_published', true);

        if (error || !data) return [];

        return (data as DbArticleImageRow[])
            .filter((row) => !isRedirectedArticleSlug(row.slug))
            .map((row) => {
                const localMatch = articles.find((article) => article.slug === row.slug)
                    || articles.find((article) => article.title === row.title);

                const article: Article = {
                    id: row.id,
                    slug: row.slug,
                    title: row.title,
                    excerpt: row.excerpt,
                    content: row.content || localMatch?.content || '',
                    coverImage: resolveArticleCoverImage(row.cover_image, localMatch?.coverImage),
                    coverImageAlt: row.cover_image_alt || localMatch?.coverImageAlt,
                    date: row.date,
                    author: row.author,
                    category: row.category,
                    keywords: row.keywords ?? localMatch?.keywords ?? [],
                    images: localMatch?.images ?? [],
                    metaTitle: row.meta_title || localMatch?.metaTitle,
                    metaDescription: row.meta_description || localMatch?.metaDescription,
                    relatedSlugs: localMatch?.relatedSlugs ?? [],
                    toc: localMatch?.toc ?? [],
                    faqItems: localMatch?.faqItems ?? [],
                    dateModified: row.date_modified || localMatch?.dateModified || row.date,
                };

                return toArticleImageEntry(article);
            })
            .filter((entry): entry is SitemapEntry => Boolean(entry));
    } catch (error) {
        console.error('Image sitemap article fetch failed:', error);
        return [];
    }
}

function getWallpaperImageEntry(): SitemapEntry | null {
    const seen = new Set<string>();
    const wallpapers = [...INITIAL_WALLPAPERS, ...ZODIAC_WALLPAPERS].filter((wallpaper) => {
        const loc = absoluteSiteUrl(wallpaper.image);
        if (!loc || seen.has(loc)) return false;
        seen.add(loc);
        return true;
    });

    if (wallpapers.length === 0) return null;

    return {
        pageUrl: `${siteUrl}/wallpapers`,
        images: wallpapers.map((wallpaper) => ({
            loc: absoluteSiteUrl(wallpaper.image),
        })),
    };
}

export async function GET() {
    const articleEntryMap = new Map<string, SitemapEntry>();
    for (const entry of getLocalArticleImageEntries()) {
        articleEntryMap.set(entry.pageUrl, entry);
    }
    for (const entry of await getDbArticleImageEntries()) {
        articleEntryMap.set(entry.pageUrl, entry);
    }

    const wallpaperEntry = getWallpaperImageEntry();
    const entries = [
        ...articleEntryMap.values(),
        ...(wallpaperEntry ? [wallpaperEntry] : []),
    ];

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        ...entries.map(entryToXml),
        '</urlset>',
    ].join('\n');

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
    });
}
