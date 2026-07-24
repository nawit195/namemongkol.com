'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Receipt, Menu, X, LogOut, ArrowLeft, CreditCard, Image, BookOpen, Smartphone, MessageCircle, BarChart3, PawPrint } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export const AdminSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'จัดการรายชื่อ', icon: FileText, path: '/admin/names' },
        { name: 'ชื่อสัตว์เลี้ยง', icon: PawPrint, path: '/admin/pet-names' },
        { name: 'จัดการผู้ใช้งาน', icon: Users, path: '/admin/users' },
        { name: 'จัดการแพ็กเกจ', icon: CreditCard, path: '/admin/pricing' },
        { name: 'จัดการวอลเปเปอร์', icon: Image, path: '/admin/wallpapers' },
        { name: 'จัดการบทความ', icon: BookOpen, path: '/admin/articles' },
        { name: 'จัดการความหมายคู่เลข', icon: Smartphone, path: '/admin/phone-meanings' },
        { name: 'จัดการรีวิว', icon: MessageCircle, path: '/admin/reviews' },
        { name: 'รายการแจ้งโอน', icon: Receipt, path: '/admin/slips' },
        { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`lg:hidden fixed top-4 right-4 z-[70] p-2 bg-slate-800 text-white rounded-md shadow-lg`}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-2 mb-8 mt-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <span className="text-white font-bold">A</span>
                        </div>
                        <span className="text-xl font-bold text-slate-100">Admin Panel</span>
                    </div>

                    {/* Menu */}
                    <nav className="space-y-1 flex-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link prefetch={false}
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="border-t border-slate-700 pt-4 space-y-2">
                        <Link prefetch={false}
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">กลับหน้าหลัก</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
