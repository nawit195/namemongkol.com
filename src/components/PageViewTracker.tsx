'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordBrowserPageView } from '@/lib/pageTrafficClient';

export function PageViewTracker() {
    const pathname = usePathname();
    useEffect(() => {
        const record = () => recordBrowserPageView(pathname);
        const restore = (event: PageTransitionEvent) => { if (event.persisted) recordBrowserPageView(pathname, true); };
        record();
        document.addEventListener('visibilitychange', record);
        window.addEventListener('pageshow', restore);
        return () => {
            document.removeEventListener('visibilitychange', record);
            window.removeEventListener('pageshow', restore);
        };
    }, [pathname]);
    return null;
}
