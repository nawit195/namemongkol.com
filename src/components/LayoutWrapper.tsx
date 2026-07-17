'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { MobileSecondaryNav } from './MobileSecondaryNav';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import type { User } from '@supabase/supabase-js';

const Sidebar = dynamic(() => import('./Sidebar').then((mod) => mod.Sidebar), {
    ssr: false,
});
const TopNav = dynamic(() => import('./TopNav').then((mod) => mod.TopNav), {
    ssr: false,
});

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const updateDesktop = () => setIsDesktop(mediaQuery.matches);

        updateDesktop();
        mediaQuery.addEventListener('change', updateDesktop);
        return () => mediaQuery.removeEventListener('change', updateDesktop);
    }, []);

    useEffect(() => {
        let cancelled = false;
        let timeoutId: number | null = null;
        let unsubscribe: (() => void) | null = null;

        timeoutId = window.setTimeout(() => {
            void import('@/utils/supabase').then(async ({ supabase }) => {
                if (cancelled) return;

                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (!cancelled) setUser(currentUser);

                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setUser(session?.user ?? null);
                });
                unsubscribe = () => subscription.unsubscribe();
            });
        }, 1800);

        return () => {
            cancelled = true;
            if (timeoutId !== null) window.clearTimeout(timeoutId);
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Admin pages use their own layout (AdminSidebar) — skip the main site shell
    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="cosmic-app-shell flex min-h-screen overflow-x-hidden">
            <div className="site-grid-backdrop" aria-hidden="true" />
            {(isDesktop || isSidebarOpen || pathname !== '/') ? (
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            ) : null}
            <div className="relative z-10 flex-1 min-w-0 lg:pl-[360px] transition-all duration-300 bg-transparent">
                <MobileHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
                {isDesktop ? <TopNav /> : null}
                <MobileSecondaryNav />
                <div className="site-theme-content min-h-screen">{children}</div>
            </div>
            <BottomNav />
        </div>
    );
};
