'use client';

import React, { useEffect, useState } from 'react';
import { Users, BarChart3, Star } from 'lucide-react';
import { LIVE_STATS_FETCH_INIT } from './heroLiveStats';

interface PublicStats {
    totalAnalyses: number;
    totalUsers: number;
    avgRating: number;
    reviewCount: number;
}

interface LiveStatsResponse {
    success?: boolean;
    totals?: {
        analyses?: number;
        members?: number;
    };
    stats?: Partial<PublicStats>;
}

export const TrustStrip = () => {
    const [stats, setStats] = useState<PublicStats | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadStats = async () => {
            try {
                const res = await fetch('/api/live-stats', LIVE_STATS_FETCH_INIT);
                if (!res.ok) return;

                const data = await res.json() as LiveStatsResponse;
                if (!isMounted) return;

                setStats({
                    totalAnalyses: data.totals?.analyses ?? data.stats?.totalAnalyses ?? 0,
                    totalUsers: data.totals?.members ?? data.stats?.totalUsers ?? 0,
                    avgRating: data.stats?.avgRating ?? 0,
                    reviewCount: data.stats?.reviewCount ?? 0,
                });
            } catch {
                // Silent: this strip can disappear if public stats are unavailable.
            }
        };

        loadStats();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!stats) return null;

    const items = [
        {
            icon: BarChart3,
            value: stats.totalAnalyses.toLocaleString('th-TH'),
            label: 'ครั้งที่วิเคราะห์แล้ว',
            color: 'text-amber-400',
        },
        {
            icon: Users,
            value: stats.totalUsers.toLocaleString('th-TH'),
            label: 'สมาชิก',
            color: 'text-emerald-400',
        },
        ...(stats.avgRating > 0 && stats.reviewCount > 0 ? [{
            icon: Star,
            value: `${stats.avgRating}/5`,
            label: `จาก ${stats.reviewCount.toLocaleString('th-TH')} รีวิว`,
            color: 'text-yellow-400',
        }] : []),
    ];

    return (
        <div className="mt-4 w-full max-w-lg animate-fade-in">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                        <span className="text-xs font-bold text-slate-200">{item.value}</span>
                        <span className="text-[10px] text-slate-400">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
