'use client';

import { useEffect, useState } from 'react';
import { buildPremiumNameCatalog, fallbackPremiumNameCatalog } from '@/lib/premiumNameCatalog';
import type { PremiumNameData, PremiumNameDetailInput } from '@/utils/premiumDataParser';

type PremiumNameCatalogState = {
    names: PremiumNameData[];
    loading: boolean;
};

export function usePremiumNameCatalog(): PremiumNameCatalogState {
    const [names, setNames] = useState<PremiumNameData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

        async function loadCatalog() {
            try {
                const response = await fetch('/api/public/premium-names', { signal: controller.signal });
                if (!response.ok) {
                    if (active) setNames(fallbackPremiumNameCatalog);
                    return;
                }

                const payload = await response.json() as {
                    success?: boolean;
                    data?: PremiumNameDetailInput[];
                };
                const details = Array.isArray(payload.data) ? payload.data : [];
                if (active) {
                    setNames(payload.success ? buildPremiumNameCatalog(details) : fallbackPremiumNameCatalog);
                }
            } catch (error) {
                if (active) setNames(fallbackPremiumNameCatalog);
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error('Error fetching public premium names:', error);
                }
            } finally {
                window.clearTimeout(timeoutId);
                if (active) setLoading(false);
            }
        }

        void loadCatalog();
        return () => {
            active = false;
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, []);

    return { names, loading };
}
