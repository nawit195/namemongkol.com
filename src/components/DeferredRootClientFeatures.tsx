'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Analytics } from '@vercel/analytics/next';
import type { User } from '@supabase/supabase-js';

const AnalyticsProvider = dynamic(
    () => import('@/components/AnalyticsProvider').then((mod) => mod.AnalyticsProvider),
    { ssr: false },
);
const CookieConsentWrapper = dynamic(() => import('@/components/CookieConsentWrapper'), {
    ssr: false,
});
const FloatingContactFAB = dynamic(
    () => import('@/components/FloatingContactFAB').then((mod) => mod.FloatingContactFAB),
    { ssr: false },
);
const ScrollToTop = dynamic(
    () => import('@/components/ScrollToTop').then((mod) => mod.ScrollToTop),
    { ssr: false },
);
const WelcomeCreditModal = dynamic(
    () => import('@/components/WelcomeCreditModal').then((mod) => mod.WelcomeCreditModal),
    { ssr: false },
);

type DeferredRootClientFeaturesProps = {
    isProduction: boolean;
};

type WindowWithIdleCallback = Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
};

export function DeferredRootClientFeatures({ isProduction }: DeferredRootClientFeaturesProps) {
    const [canLoad, setCanLoad] = React.useState(false);
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        const win = window as WindowWithIdleCallback;
        let timeoutId: number | null = null;
        let idleId: number | null = null;

        const load = () => setCanLoad(true);

        timeoutId = window.setTimeout(() => {
            if (win.requestIdleCallback) {
                idleId = win.requestIdleCallback(load, { timeout: 2500 });
            } else {
                load();
            }
        }, 1200);

        return () => {
            if (timeoutId !== null) window.clearTimeout(timeoutId);
            if (idleId !== null && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
        };
    }, []);

    React.useEffect(() => {
        if (!canLoad) return;

        let cancelled = false;
        let unsubscribe: (() => void) | null = null;

        void import('@/utils/supabase').then(async ({ supabase }) => {
            if (cancelled) return;

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!cancelled) setUser(currentUser);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });
            unsubscribe = () => subscription.unsubscribe();
        });

        return () => {
            cancelled = true;
            if (unsubscribe) unsubscribe();
        };
    }, [canLoad]);

    if (!canLoad) return null;

    return (
        <>
            <ScrollToTop />
            <CookieConsentWrapper />
            <FloatingContactFAB />
            {isProduction ? <Analytics /> : null}
            <AnalyticsProvider />
            <WelcomeCreditModal user={user} />
        </>
    );
}
