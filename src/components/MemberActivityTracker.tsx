'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
    thaiActivityDate,
    isMemberActivityPath,
} from '@/lib/memberActivityDates';

// Independent of sampled click analytics. No identity, path or tool content in the body.
export function MemberActivityTracker({ user }: { user: User | null }) {
    const pathname = usePathname();
    const acknowledged = useRef('');
    const userId = user?.id,
        anonymous = user?.is_anonymous;
    useEffect(() => {
        if (!userId || anonymous || !isMemberActivityPath(pathname)) return;
        let cancelled = false,
            inFlight = false,
            retryAfter = 0;
        const controller = new AbortController();
        const storageKey = `nm_member_activity:v1:${userId}`;
        async function record() {
            if (
                cancelled ||
                inFlight ||
                document.visibilityState !== 'visible' ||
                Date.now() < retryAfter
            )
                return;
            const day = thaiActivityDate(),
                key = `${userId}:${day}`;
            if (acknowledged.current === key) return;
            try {
                if (sessionStorage.getItem(storageKey) === day) {
                    acknowledged.current = key;
                    return;
                }
            } catch {
                /* Memory and SQL deduplication still work. */
            }
            inFlight = true;
            try {
                const response = await fetch('/api/member-activity', {
                    method: 'POST',
                    cache: 'no-store',
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error('Activity unavailable');
                const body = await response.json();
                if (cancelled) return;
                if (!body.success || typeof body.activityDate !== 'string')
                    throw new Error('Invalid activity response');
                if (body.recorded !== true) {
                    retryAfter = Date.now() + 60_000;
                    return;
                }
                acknowledged.current = key;
                try {
                    sessionStorage.setItem(storageKey, day);
                } catch {
                    /* Optional per-tab persistence. */
                }
            } catch {
                if (!cancelled) retryAfter = Date.now() + 60_000;
            } finally {
                inFlight = false;
            }
        }
        const request = () => {
            void record();
        };
        request();
        window.addEventListener('focus', request);
        document.addEventListener('visibilitychange', request);
        document.addEventListener('pointerdown', request, { passive: true });
        document.addEventListener('keydown', request);
        return () => {
            cancelled = true;
            controller.abort();
            window.removeEventListener('focus', request);
            document.removeEventListener('visibilitychange', request);
            document.removeEventListener('pointerdown', request);
            document.removeEventListener('keydown', request);
        };
    }, [userId, anonymous, pathname]);
    return null;
}
