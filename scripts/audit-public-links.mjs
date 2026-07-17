const DEFAULT_BASE_URL = 'http://localhost:3000';
const CONCURRENCY = 6;
const TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 2;

const excludedPathPrefixes = [
    '/_next/',
    '/admin',
    '/api',
    '/auth',
    '/dev-pricing-demo',
    '/history',
    '/profile',
    '/topup',
];

const assetExtensionPattern = /\.(?:avif|css|gif|ico|jpe?g|js|json|map|pdf|png|svg|txt|webmanifest|webp|xml)$/i;

function readBaseUrl(argv) {
    const equalsArg = argv.find((arg) => arg.startsWith('--base-url='));
    if (equalsArg) return equalsArg.slice('--base-url='.length);

    const index = argv.indexOf('--base-url');
    if (index >= 0 && argv[index + 1]) return argv[index + 1];

    return DEFAULT_BASE_URL;
}

function normalizeBaseUrl(value) {
    const url = new URL(value);
    url.hash = '';
    url.pathname = url.pathname.replace(/\/$/, '');
    url.search = '';
    return url.toString().replace(/\/$/, '');
}

function normalizePublicUrl(value, baseUrl) {
    let url;

    try {
        url = new URL(value, baseUrl);
    } catch {
        return null;
    }

    const base = new URL(baseUrl);
    if (url.origin !== base.origin) return null;
    if (!['http:', 'https:'].includes(url.protocol)) return null;

    url.hash = '';
    const pathname = url.pathname.replace(/\/$/, '') || '/';

    if (excludedPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
        return null;
    }

    if (assetExtensionPattern.test(pathname)) return null;

    url.pathname = pathname;
    return `${url.pathname}${url.search}`;
}

function extractSitemapUrls(xml, baseUrl) {
    return [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)]
        .map((match) => {
            try {
                const canonicalUrl = new URL(match[1].trim());
                return normalizePublicUrl(`${canonicalUrl.pathname}${canonicalUrl.search}`, baseUrl);
            } catch {
                return null;
            }
        })
        .filter(Boolean);
}

function extractInternalLinks(html, baseUrl) {
    return [...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)]
        .map((match) => normalizePublicUrl(match[1].trim(), baseUrl))
        .filter(Boolean);
}

async function fetchWithTimeout(url, options = {}, readBody = false) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'user-agent': 'NameMongkol-Public-Link-Audit/1.0',
                ...options.headers,
            },
        });
        const body = readBody ? await response.text() : '';
        return { response, body };
    } finally {
        clearTimeout(timeout);
    }
}

async function inspectUrl(route, baseUrl, referrers) {
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            const { response, body } = await fetchWithTimeout(
                `${baseUrl}${route}`,
                { redirect: 'follow' },
                true
            );
            const contentType = response.headers.get('content-type') || '';
            const html = contentType.includes('text/html') ? body : '';
            const result = {
                route,
                status: response.status,
                finalUrl: response.url,
                redirected: response.redirected,
                referrers: [...referrers],
                html,
            };

            if (response.status < 500 || attempt === MAX_ATTEMPTS) return result;
        } catch (error) {
            lastError = error;
            if (attempt === MAX_ATTEMPTS) {
                return {
                    route,
                    status: 0,
                    finalUrl: '',
                    redirected: false,
                    referrers: [...referrers],
                    html: '',
                    error: error instanceof Error ? error.name : 'UnknownError',
                };
            }
        }
    }

    return {
        route,
        status: 0,
        finalUrl: '',
        redirected: false,
        referrers: [...referrers],
        html: '',
        error: lastError instanceof Error ? lastError.name : 'UnknownError',
    };
}

async function inspectPool(routes, baseUrl, referrerMap) {
    const results = [];
    let index = 0;

    async function worker() {
        while (index < routes.length) {
            const route = routes[index];
            index += 1;
            const referrers = referrerMap.get(route) || new Set(['unknown']);
            results.push(await inspectUrl(route, baseUrl, referrers));
        }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, routes.length) }, () => worker()));
    return results;
}

function addReferrer(referrerMap, route, referrer) {
    if (!referrerMap.has(route)) referrerMap.set(route, new Set());
    referrerMap.get(route).add(referrer);
}

function printFailure(result) {
    const status = result.status === 0 ? result.error || 'NETWORK_ERROR' : result.status;
    console.error(`  [${status}] ${result.route}`);
    if (result.finalUrl) console.error(`    final: ${result.finalUrl}`);
    console.error(`    found on: ${result.referrers.slice(0, 5).join(', ')}`);
}

async function main() {
    const baseUrl = normalizeBaseUrl(readBaseUrl(process.argv.slice(2)));
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    console.log(`Auditing public links at ${baseUrl}`);

    const { response: sitemapResponse, body: sitemapXml } = await fetchWithTimeout(
        sitemapUrl,
        { redirect: 'follow' },
        true
    );
    if (!sitemapResponse.ok) {
        throw new Error(`Unable to load sitemap: HTTP ${sitemapResponse.status} ${sitemapUrl}`);
    }

    const sitemapRoutes = [...new Set(extractSitemapUrls(sitemapXml, baseUrl))];
    if (sitemapRoutes.length === 0) {
        throw new Error(`Sitemap contains no auditable public URLs: ${sitemapUrl}`);
    }
    const referrerMap = new Map();
    sitemapRoutes.forEach((route) => addReferrer(referrerMap, route, 'sitemap.xml'));

    const sitemapResults = await inspectPool(sitemapRoutes, baseUrl, referrerMap);

    for (const page of sitemapResults) {
        for (const route of extractInternalLinks(page.html, baseUrl)) {
            addReferrer(referrerMap, route, page.route);
        }
    }

    const sitemapSet = new Set(sitemapRoutes);
    const discoveredRoutes = [...referrerMap.keys()].filter((route) => !sitemapSet.has(route));
    const discoveredResults = await inspectPool(discoveredRoutes, baseUrl, referrerMap);
    const results = [...sitemapResults, ...discoveredResults];
    const failures = results.filter((result) => result.status === 0 || result.status === 404 || result.status >= 500);
    const redirects = results.filter((result) => result.redirected);

    console.log(`Sitemap URLs: ${sitemapRoutes.length}`);
    console.log(`Additional internal URLs: ${discoveredRoutes.length}`);
    console.log(`Total checked: ${results.length}`);
    console.log(`Redirected: ${redirects.length}`);

    if (failures.length > 0) {
        console.error(`Failures: ${failures.length}`);
        failures.sort((a, b) => a.route.localeCompare(b.route)).forEach(printFailure);
        process.exitCode = 1;
        return;
    }

    console.log('Failures: 0');
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
