'use client';

import { useEffect } from 'react';
import { attachAutoCapture, trackEvent } from '@/lib/analytics';

/**
 * Mount once in root layout — attaches a global click listener
 * that auto-tracks any element with a `data-track` attribute.
 */
export function AnalyticsProvider() {
    useEffect(() => {
        attachAutoCapture();

        const referrer = document.referrer.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const isOrganic = /google\.|bing\.|yahoo\.|duckduckgo\./.test(referrer)
            || params.get('utm_medium') === 'organic';

        if (isOrganic) {
            void trackEvent('funnel.organic_landing', {
                metadata: { landingPath: window.location.pathname },
            });
        }
    }, []);

    return null;
}
