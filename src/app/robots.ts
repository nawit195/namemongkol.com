import { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export const PRIVATE_CRAWL_PATHS = [
    '/admin',
    '/profile',
    '/history',
    '/api',
    '/slip-verification',
    '/dev-pricing-demo',
] as const;

export const RETRIEVAL_CRAWLERS = [
    'Bingbot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Claude-SearchBot',
    'Claude-User',
] as const;

export const TRAINING_CRAWLERS = [
    'GPTBot',
    'Google-Extended',
    'ClaudeBot',
    'Anthropic-AI',
] as const;

export default function robots(): MetadataRoute.Robots {
    const baseUrl = siteUrl;

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/api/og/'],
                disallow: [...PRIVATE_CRAWL_PATHS],
            },
            {
                userAgent: [...RETRIEVAL_CRAWLERS],
                allow: ['/', '/api/og/'],
                disallow: [...PRIVATE_CRAWL_PATHS],
            },
            {
                userAgent: [...TRAINING_CRAWLERS],
                disallow: '/',
            },
        ],
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/image-sitemap.xml`,
        ],
    }
}
