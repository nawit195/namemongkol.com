/** Canonical page identity without search terms, fragments or technical routes. */
export function normalizeTrafficPath(value: string): string | null {
    if (!value.startsWith('/') || value.startsWith('//') || value.length > 1500 || /[\\\u0000-\u001f]/.test(value)) return null;
    try {
        const path = decodeURI(new URL(value, 'https://traffic.invalid').pathname)
            .normalize('NFC').replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
        if (path.length > 500 || /^\/(?:api|admin|auth|_next|_not-found)(?:\/|$)/.test(path) || /\.(?:png|jpe?g|svg|webp|ico|css|js|xml|txt)$/i.test(path)) return null;
        // The meaning lookup may contain a name entered in a form. Count the
        // detail surface together, without retaining that name in analytics.
        if (/^\/meaning\/[^/]+$/.test(path)) return '/meaning/:name';
        return path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi, '/:id');
    } catch { return null; }
}
