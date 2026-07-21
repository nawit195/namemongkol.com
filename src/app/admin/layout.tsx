import React from 'react';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/AdminSidebar';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-emerald-500/30">
            <AdminSidebar />
            <main className="lg:ml-64 min-h-screen relative transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
