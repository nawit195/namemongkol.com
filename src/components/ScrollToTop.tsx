'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop = () => {
    const pathname = usePathname();
    const naming = pathname.startsWith('/names') || pathname === '/articles/monday-girl-names-2569-no-sara';
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let ticking = false;

        const toggleVisibility = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const nextVisible = window.scrollY > 300;
                setIsVisible((current) => (current === nextVisible ? current : nextVisible));
                ticking = false;
            });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                ticking = false;
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed ${naming ? 'bottom-40 lg:bottom-28' : 'bottom-16 lg:bottom-10'} right-4 lg:right-10 min-h-11 min-w-11 motion-reduce:transition-none z-[50] bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 hover:text-amber-400 p-2.5 rounded-full shadow-lg shadow-black/10 border border-[#1e293b] hover:border-amber-500/30 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90 pointer-events-none'
                }`}
            aria-label="กลับขึ้นบนสุด"
        >
            <ChevronUp size={18} strokeWidth={2.5} />
        </button>
    );
};
