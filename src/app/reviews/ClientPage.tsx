'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BadgeCheck,
    CheckCircle2,
    CreditCard,
    Edit,
    Filter,
    ImageOff,
    MessageCircle,
    Plus,
    Quote,
    Search,
    Share2,
    ShieldCheck,
    Sparkles,
    Star,
    ThumbsUp,
    Trash2,
    Users,
    WandSparkles,
} from 'lucide-react';
import { Review, ReviewServiceType } from '@/types';
import { ReviewFormModal } from '@/components/ReviewFormModal';
import { SoftYellowGlowBackground } from '@/components/ui/background-components';
import { supabase } from '@/utils/supabase';
import { useLanguage } from '@/components/LanguageProvider';

type ClientPageProps = {
    initialReviews?: Review[];
};

type ServiceInfo = {
    name: string;
    url: string;
    shortName: string;
    labelKey: string;
    fallbackLabel: string;
};

type ReviewStats = {
    averageRating: number;
    reviewCount: number;
    verifiedCount: number;
    serviceCount: number;
};

type ReviewCardTone = {
    card: string;
    avatar: string;
    quote: string;
    service: string;
    tag: string;
    helpful: string;
    helpfulActive: string;
    share: string;
    decoration: string;
    accent: string;
};

const REVIEW_COPY_TH = {
    statsTitle: 'คะแนนจากผู้ใช้งานจริง',
    totalReviewsLabel: 'รีวิวทั้งหมด',
    verifiedReviewsLabel: 'รีวิวที่ยืนยันแล้ว',
    serviceTypesLabel: 'บริการที่ถูกรีวิว',
    approvedLabel: 'ผ่านระบบอนุมัติ',
    verifiedBadge: 'รีวิวที่ยืนยันแล้ว',
    verifiedExplainer: 'รีวิวที่ติดป้ายยืนยันมาจากสมาชิกที่เข้าสู่ระบบ ส่งผ่านแบบฟอร์มจริง และผ่านการตรวจสอบก่อนแสดงบนเว็บไซต์',
    featuredEyebrow: 'รีวิวเด่น',
    featuredTitle: 'เสียงจากผู้ใช้งานจริงที่ช่วยให้ตัดสินใจง่ายขึ้น',
    featuredLink: 'ดูบริการ Premium',
    featuredCta: 'ดูบริการนี้',
    midCtaTitle: 'อยากรู้ว่าชื่อของคุณส่งเสริมดวงแค่ไหน?',
    midCtaDesc: 'เริ่มวิเคราะห์ชื่อฟรีได้ทันที แล้วค่อยเลือกบริการ Premium เมื่อพร้อม',
    midCtaButton: 'เริ่มวิเคราะห์ชื่อฟรี',
    generatorCta: 'สร้างชื่อมงคล AI',
    serviceFilterEyebrow: 'เลือกตามบริการ',
    serviceFilterDesc: 'กรองรีวิวตามบริการที่คุณสนใจ เพื่อดูประสบการณ์ที่ใกล้เคียงกับสิ่งที่คุณกำลังตัดสินใจ',
    emptyDesc: 'ลองเลือกประเภทบริการอื่น หรือเป็นคนแรกที่แบ่งปันประสบการณ์ของบริการนี้',
    bottomEyebrow: 'เริ่มจากข้อมูลของคุณ',
    packageCta: 'ซื้อแพ็กเกจเครดิต',
};

const SERVICE_FILTER_LABELS_TH: Record<'all' | ReviewServiceType, string> = {
    all: 'ทั้งหมด',
    'name-analysis': 'วิเคราะห์ชื่อ',
    'phone-analysis': 'วิเคราะห์เบอร์',
    'premium-search': 'ค้นหาชื่อ Pro',
    'premium-analysis': 'วิเคราะห์ Premium',
    wallpapers: 'วอลเปเปอร์',
    general: 'ทั่วไป',
};

const REVIEW_CARD_TONES: ReviewCardTone[] = [
    {
        card: 'border-[#ead7aa] bg-[#fffefd] shadow-[0_8px_8px_rgba(15,23,42,0.08)]',
        avatar: 'border-[#ead7aa] bg-[#f8f1e3] text-[#8a5a12]',
        quote: 'text-[#f3c56b]/55',
        service: 'text-[#0f1b34] hover:text-[#9a650d]',
        tag: 'border-[#ead7aa] bg-[#fff7e7] text-[#8a5a12] hover:border-[#d8b56d]',
        helpful: 'border-[#d8b56d] bg-white text-[#8a5a12] hover:bg-[#fff7e7]',
        helpfulActive: 'border-[#d8b56d] bg-[#fff0c9] text-[#5f3b05]',
        share: 'border-[#d9e0ea] bg-white text-[#0f1b34] hover:border-[#d8b56d] hover:bg-[#fff7e7]',
        decoration: 'text-[#d8b56d]',
        accent: 'bg-[#0f1b34]',
    },
    {
        card: 'border-[#ead7aa] bg-[#fffefd] shadow-[0_8px_8px_rgba(15,23,42,0.08)]',
        avatar: 'border-[#b9ddd6] bg-[#eefaf7] text-[#137466]',
        quote: 'text-[#f3c56b]/55',
        service: 'text-[#0f1b34] hover:text-[#137466]',
        tag: 'border-[#b9ddd6] bg-[#effaf8] text-[#137466] hover:border-[#7cc6b8]',
        helpful: 'border-[#b9ddd6] bg-white text-[#137466] hover:bg-[#effaf8]',
        helpfulActive: 'border-[#7cc6b8] bg-[#dff7f2] text-[#0f5f54]',
        share: 'border-[#d9e0ea] bg-white text-[#0f1b34] hover:border-[#7cc6b8] hover:bg-[#effaf8]',
        decoration: 'text-[#d8b56d]',
        accent: 'bg-[#0f1b34]',
    },
    {
        card: 'border-[#ead7aa] bg-[#fffefd] shadow-[0_8px_8px_rgba(15,23,42,0.08)]',
        avatar: 'border-[#f0c7d9] bg-[#fff1f6] text-[#bd3c73]',
        quote: 'text-[#f3c56b]/55',
        service: 'text-[#0f1b34] hover:text-[#bd3c73]',
        tag: 'border-[#f0c7d9] bg-[#fff4f8] text-[#bd3c73] hover:border-[#e89cbc]',
        helpful: 'border-[#f0c7d9] bg-white text-[#bd3c73] hover:bg-[#fff4f8]',
        helpfulActive: 'border-[#e89cbc] bg-[#ffe4ef] text-[#9f285d]',
        share: 'border-[#d9e0ea] bg-white text-[#0f1b34] hover:border-[#e89cbc] hover:bg-[#fff4f8]',
        decoration: 'text-[#d8b56d]',
        accent: 'bg-[#0f1b34]',
    },
    {
        card: 'border-[#ead7aa] bg-[#fffefd] shadow-[0_8px_8px_rgba(15,23,42,0.08)]',
        avatar: 'border-[#d3c7f6] bg-[#f5f2ff] text-[#6a4fd1]',
        quote: 'text-[#f3c56b]/55',
        service: 'text-[#0f1b34] hover:text-[#6a4fd1]',
        tag: 'border-[#d3c7f6] bg-[#f6f3ff] text-[#6a4fd1] hover:border-[#b8a7ef]',
        helpful: 'border-[#d3c7f6] bg-white text-[#6a4fd1] hover:bg-[#f6f3ff]',
        helpfulActive: 'border-[#b8a7ef] bg-[#ece6ff] text-[#5238b5]',
        share: 'border-[#d9e0ea] bg-white text-[#0f1b34] hover:border-[#b8a7ef] hover:bg-[#f6f3ff]',
        decoration: 'text-[#d8b56d]',
        accent: 'bg-[#0f1b34]',
    },
    {
        card: 'border-[#ead7aa] bg-[#fffefd] shadow-[0_8px_8px_rgba(15,23,42,0.08)]',
        avatar: 'border-[#bfd8ef] bg-[#eff7ff] text-[#246899]',
        quote: 'text-[#f3c56b]/55',
        service: 'text-[#0f1b34] hover:text-[#246899]',
        tag: 'border-[#bfd8ef] bg-[#f0f8ff] text-[#246899] hover:border-[#91bee5]',
        helpful: 'border-[#bfd8ef] bg-white text-[#246899] hover:bg-[#f0f8ff]',
        helpfulActive: 'border-[#91bee5] bg-[#e4f2ff] text-[#1c557f]',
        share: 'border-[#d9e0ea] bg-white text-[#0f1b34] hover:border-[#91bee5] hover:bg-[#f0f8ff]',
        decoration: 'text-[#d8b56d]',
        accent: 'bg-[#0f1b34]',
    },
];

const SERVICE_INFO: Record<ReviewServiceType, ServiceInfo> = {
    'name-analysis': {
        name: 'วิเคราะห์ชื่อมงคล',
        url: '/name-analysis',
        shortName: 'วิเคราะห์ชื่อ',
        labelKey: 'pages.reviews.serviceFilters.nameAnalysis',
        fallbackLabel: 'วิเคราะห์ชื่อ',
    },
    'phone-analysis': {
        name: 'วิเคราะห์เบอร์มงคล',
        url: '/phone-analysis',
        shortName: 'วิเคราะห์เบอร์',
        labelKey: 'pages.reviews.serviceFilters.phoneAnalysis',
        fallbackLabel: 'วิเคราะห์เบอร์',
    },
    'premium-search': {
        name: 'ค้นหาชื่อมงคล Pro',
        url: '/premium-search',
        shortName: 'ค้นหาชื่อ Pro',
        labelKey: 'pages.reviews.serviceFilters.premiumSearch',
        fallbackLabel: 'ค้นหาชื่อ Pro',
    },
    'premium-analysis': {
        name: 'วิเคราะห์ชื่อ Premium',
        url: '/premium-analysis',
        shortName: 'วิเคราะห์ Premium',
        labelKey: 'pages.reviews.serviceFilters.premiumAnalysis',
        fallbackLabel: 'วิเคราะห์ Premium',
    },
    wallpapers: {
        name: 'วอลเปเปอร์มงคล',
        url: '/wallpapers',
        shortName: 'วอลเปเปอร์',
        labelKey: 'pages.reviews.serviceFilters.wallpapers',
        fallbackLabel: 'วอลเปเปอร์',
    },
    general: {
        name: 'บริการ NameMongkol',
        url: '/',
        shortName: 'ทั่วไป',
        labelKey: 'pages.reviews.serviceFilters.general',
        fallbackLabel: 'ทั่วไป',
    },
};

const SERVICE_FILTERS: Array<{ id: 'all' | ReviewServiceType; labelKey: string; fallbackLabel: string }> = [
    { id: 'all', labelKey: 'pages.reviews.serviceFilters.all', fallbackLabel: 'ทั้งหมด' },
    { id: 'name-analysis', ...SERVICE_INFO['name-analysis'] },
    { id: 'phone-analysis', ...SERVICE_INFO['phone-analysis'] },
    { id: 'premium-search', ...SERVICE_INFO['premium-search'] },
    { id: 'premium-analysis', ...SERVICE_INFO['premium-analysis'] },
    { id: 'wallpapers', ...SERVICE_INFO.wallpapers },
    { id: 'general', ...SERVICE_INFO.general },
];

const TAG_URLS: Record<string, string> = {
    การเงิน: '/reviews?category=การเงิน',
    การงาน: '/reviews?category=การงาน',
    ความรัก: '/reviews?category=ความรัก',
    สุขภาพ: '/reviews?category=สุขภาพ',
    โชคลาภ: '/reviews?category=โชคลาภ',
};

const inferServiceType = (tags: string[] = []): ReviewServiceType => {
    if (tags.some(tag => tag.includes('เบอร์') || tag.includes('โทร'))) return 'phone-analysis';
    if (tags.some(tag => tag.includes('ชื่อ'))) return 'name-analysis';
    if (tags.some(tag => tag.includes('วอลเปเปอร์'))) return 'wallpapers';
    return 'general';
};

const normalizeReview = (review: Review): Review => {
    const tags = Array.isArray(review.tags) && review.tags.length > 0
        ? review.tags
        : review.category
            ? [review.category]
            : [];
    const images = Array.isArray(review.images)
        ? review.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
        : [];

    return {
        ...review,
        date: review.date || review.created_at || '',
        tags,
        service_type: review.service_type || inferServiceType(tags),
        is_verified: review.is_verified ?? Boolean(review.user_id),
        helpful_count: review.helpful_count || 0,
        images,
    };
};

const getReviewStats = (reviews: Review[]): ReviewStats => {
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const services = new Set(reviews.map(review => review.service_type || 'general'));

    return {
        averageRating: reviewCount > 0 ? totalRating / reviewCount : 0,
        reviewCount,
        verifiedCount: reviews.filter(review => review.is_verified || review.user_id).length,
        serviceCount: services.size,
    };
};

const getFeaturedReviews = (reviews: Review[]) => {
    return [...reviews]
        .sort((a, b) => {
            const aScore = (a.is_verified ? 40 : 0) + (a.rating || 0) * 10 + (a.helpful_count || 0) + ((a.images?.length || 0) > 0 ? 8 : 0);
            const bScore = (b.is_verified ? 40 : 0) + (b.rating || 0) * 10 + (b.helpful_count || 0) + ((b.images?.length || 0) > 0 ? 8 : 0);
            return bScore - aScore;
        })
        .slice(0, 2);
};

const matchesServiceFilter = (review: Review, selectedService: 'all' | ReviewServiceType) => {
    if (selectedService === 'all') return true;
    return (review.service_type || 'general') === selectedService;
};

const formatReviewCount = (value: number) => value.toLocaleString('th-TH');

const formatAvgRating = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return '0.0';
    return value.toFixed(1);
};

const isHeicReviewImage = (url: string) => {
    const pathname = url.split('?')[0]?.toLowerCase() ?? '';
    return pathname.endsWith('.heic') || pathname.endsWith('.heif');
};

const formatDateForSEO = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    return {
        isoDate: date.toISOString().split('T')[0],
        thaiDate: date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
        }),
    };
};

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <span className="inline-flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                size={size}
                className={index < rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'fill-slate-200 text-slate-200'}
            />
        ))}
    </span>
);

export default function ClientPage({ initialReviews = [] }: ClientPageProps) {
    const [selectedService, setSelectedService] = useState<'all' | ReviewServiceType>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
    const [userVotedReviews, setUserVotedReviews] = useState<Set<string>>(new Set());
    const [dbReviews, setDbReviews] = useState<Review[]>(() => initialReviews.map(normalizeReview));
    const router = useRouter();
    const { t, language } = useLanguage();
    const tr = useCallback((key: string, thaiFallback: string) => {
        if (language === 'th') return thaiFallback;
        return t(key, thaiFallback);
    }, [language, t]);

    const stats = useMemo(() => getReviewStats(dbReviews), [dbReviews]);
    const featuredReviews = useMemo(() => getFeaturedReviews(dbReviews), [dbReviews]);
    const filteredReviews = useMemo(
        () => dbReviews.filter(review => matchesServiceFilter(review, selectedService)),
        [selectedService, dbReviews],
    );

    const hydrateVotes = useCallback((reviews: Review[]) => {
        const votesMap: Record<string, number> = {};
        reviews.forEach(review => {
            votesMap[review.id] = review.helpful_count || 0;
        });
        setHelpfulVotes(votesMap);
    }, []);

    const fetchReviews = useCallback(async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return;
        }

        const formatted = (data || []).map((review: Review) => normalizeReview(review));
        setDbReviews(formatted);
        hydrateVotes(formatted);
    }, [hydrateVotes]);

    useEffect(() => {
        hydrateVotes(dbReviews);
        // run once for server-provided reviews; later refreshes call hydrateVotes after fetch.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUser(session?.user || null);

            if (session?.user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                setIsAdmin(data?.role === 'admin');
            }
        };

        checkUser();
    }, []);

    useEffect(() => {
        try {
            const storedVotes = JSON.parse(localStorage.getItem('helpfulVotes') || '[]');
            setUserVotedReviews(new Set(storedVotes));
        } catch {
            setUserVotedReviews(new Set());
        }
    }, []);

    useEffect(() => {
        if (initialReviews.length === 0) {
            fetchReviews();
        }
    }, [fetchReviews, initialReviews.length]);

    const handleWriteStory = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            const Swal = (await import('sweetalert2')).default;

            Swal.fire({
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'ต้องเข้าสู่ระบบก่อนจึงจะเขียนรีวิวได้ เพื่อให้รีวิวมาจากผู้ใช้งานจริง',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#c9933a',
                cancelButtonColor: '#d33',
                confirmButtonText: 'เข้าสู่ระบบ',
                cancelButtonText: 'ยกเลิก',
                background: '#1e293b',
                color: '#fff',
            }).then((result: any) => {
                if (result.isConfirmed) router.push('/login');
            });
            return;
        }

        setEditingReview(null);
        setIsModalOpen(true);
    };

    const handleEdit = (review: Review) => {
        setEditingReview(review);
        setIsModalOpen(true);
    };

    const handleDelete = async (reviewId: string) => {
        const Swal = (await import('sweetalert2')).default;

        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'คุณต้องการลบรีวิวนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบรีวิว',
            cancelButtonText: 'ยกเลิก',
            background: '#1e293b',
            color: '#fff',
        }).then(async (result: any) => {
            if (!result.isConfirmed) return;

            try {
                const { error } = await supabase
                    .from('reviews')
                    .delete()
                    .eq('id', reviewId);

                if (error) throw error;

                await fetchReviews();

                Swal.fire({
                    title: 'ลบสำเร็จ',
                    text: 'รีวิวของคุณถูกลบเรียบร้อยแล้ว',
                    icon: 'success',
                    background: '#1e293b',
                    color: '#fff',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } catch (error: any) {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: error.message || 'ไม่สามารถลบรีวิวได้',
                    icon: 'error',
                    background: '#1e293b',
                    color: '#fff',
                });
            }
        });
    };

    const handleHelpfulVote = async (reviewId: string) => {
        if (userVotedReviews.has(reviewId)) return;

        const nextCount = (helpfulVotes[reviewId] || 0) + 1;

        try {
            setHelpfulVotes(prev => ({ ...prev, [reviewId]: nextCount }));
            setUserVotedReviews(prev => new Set(prev).add(reviewId));

            const storedVotes = JSON.parse(localStorage.getItem('helpfulVotes') || '[]');
            storedVotes.push(reviewId);
            localStorage.setItem('helpfulVotes', JSON.stringify(storedVotes));

            await supabase
                .from('reviews')
                .update({ helpful_count: nextCount })
                .eq('id', reviewId);
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleShareReview = async (review: Review) => {
        const shareUrl = `${window.location.origin}/reviews#review-${review.id}`;
        const shareText = `รีวิวจาก ${review.nickname}: "${review.content.substring(0, 100)}..."`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'รีวิวจาก NameMongkol',
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                // User cancelled or native share failed.
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            const Swal = (await import('sweetalert2')).default;
            Swal.fire({
                title: 'คัดลอกลิงก์แล้ว',
                icon: 'success',
                background: '#1e293b',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    const renderVerifiedBadge = (review: Review, compact = false) => {
        if (!review.is_verified) return null;

        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full border border-[#d8b56d]/70 bg-[#0f1b34] text-white shadow-[0_4px_6px_rgba(15,23,42,0.14)] ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} font-bold`}>
                <BadgeCheck className="h-3.5 w-3.5 fill-[#f59e0b]/20 text-[#f8c56a]" />
                {tr('pages.reviews.verifiedBadge', REVIEW_COPY_TH.verifiedBadge)}
            </span>
        );
    };

    const renderReviewActions = (review: Review) => {
        if (!currentUser || (currentUser.id !== review.user_id && !isAdmin)) return null;

        return (
            <div className="absolute right-4 top-4 z-20 flex gap-2">
                <button
                    onClick={(event) => { event.stopPropagation(); handleEdit(review); }}
                    className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100"
                    title="แก้ไข"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={(event) => { event.stopPropagation(); handleDelete(review.id); }}
                    className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100"
                    title="ลบ"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        );
    };

    const renderReviewMedia = (review: Review) => {
        if (!review.images || review.images.length === 0) return null;

        return (
            <div className={`mb-4 grid gap-2.5 sm:mb-5 ${review.images.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {review.images.slice(0, 2).map((image, index) => (
                    <div
                        key={image}
                        className={`relative overflow-hidden rounded-xl border border-[#ead7aa] bg-[#fffefd] shadow-sm ${review.images!.length === 1 ? 'aspect-video' : 'aspect-video sm:aspect-[4/3]'}`}
                    >
                        {isHeicReviewImage(image) ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#fff8ea] px-4 text-center text-xs font-semibold text-[#8a641d]">
                                <ImageOff className="h-6 w-6 text-[#c9933a]" />
                                <span>ไฟล์ HEIC จาก iPhone ไม่รองรับบน Chrome</span>
                                <span className="text-[11px] font-medium text-[#a38445]">กรุณาอัปโหลดเป็น JPG, PNG หรือ WebP</span>
                            </div>
                        ) : (
                            <Image
                                src={image}
                                alt={`ภาพรีวิวจาก ${review.nickname} รูปที่ ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                                loading="lazy"
                                unoptimized
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderReviewCard = (review: Review, index: number) => {
        const serviceInfo = SERVICE_INFO[review.service_type || 'general'] || SERVICE_INFO.general;
        const formattedDate = formatDateForSEO(review.date);
        const isHighSignal = review.is_verified || review.rating >= 5 || (review.helpful_count || 0) > 0;
        const tone = REVIEW_CARD_TONES[index % REVIEW_CARD_TONES.length];

        return (
            <motion.article
                layout
                key={review.id}
                id={`review-${review.id}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25 }}
                className={`break-inside-avoid overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_10px_rgba(15,23,42,0.10)] max-sm:-mx-1 ${tone.card} ${isHighSignal ? 'ring-1 ring-[#f3c56b]/45' : ''}`}
            >
                <div className={`h-2.5 ${tone.accent}`} />
                <div className="relative p-5 sm:p-5 lg:p-6">
                    {renderReviewActions(review)}
                    <Quote className={`pointer-events-none absolute right-5 top-5 h-10 w-10 sm:h-12 sm:w-12 ${tone.quote}`} />

                    <div className="mb-4 flex items-start gap-3 pr-10 sm:pr-12">
                        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-sm font-extrabold shadow-sm sm:h-14 sm:w-14 sm:text-base ${tone.avatar}`}>
                            {review.avatar ? (
                                <Image
                                    src={review.avatar}
                                    alt={`รูปโปรไฟล์ของ ${review.nickname}`}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                review.nickname.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-[#0f1b34]">
                                    <span>{review.nickname}</span>
                                </span>
                                {renderVerifiedBadge(review, true)}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#667085]">
                                {review.role ? <span>{review.role}</span> : null}
                                {review.role ? <span className="h-1 w-1 rounded-full bg-[#d8b56d]" /> : null}
                                <Link href={serviceInfo.url} className={`${tone.service} hover:underline`}>
                                    {serviceInfo.shortName}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs font-semibold tabular-nums text-[#667085]">{formatAvgRating(review.rating)}</span>
                    </div>

                    <p className="mb-4 line-clamp-7 text-[0.96rem] font-semibold leading-7 text-[#18233f] sm:mb-5 sm:line-clamp-6 sm:leading-7">
                        &quot;{review.content}&quot;
                    </p>

                    {renderReviewMedia(review)}

                    {review.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 border-t border-[#efe3c9] pt-4">
                            {review.tags.map(tag => (
                                <Link
                                    key={`${review.id}-${tag}`}
                                    href={TAG_URLS[tag] || `/reviews?category=${encodeURIComponent(tag)}`}
                                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${tone.tag}`}
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    ) : null}

                    <div className="mt-4 border-t border-[#efe3c9] pt-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#667085]">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 fill-emerald-50 text-emerald-600" />
                                รีวิวจริง
                            </span>
                            {formattedDate ? (
                                <time dateTime={formattedDate.isoDate}>
                                    {formattedDate.thaiDate}
                                </time>
                            ) : null}
                        </div>
                        <div className="flex items-center justify-between gap-2 max-[380px]:flex-col max-[380px]:items-stretch">
                            <button
                                onClick={(event) => { event.stopPropagation(); handleHelpfulVote(review.id); }}
                                disabled={userVotedReviews.has(review.id)}
                                className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${userVotedReviews.has(review.id)
                                    ? tone.helpfulActive
                                    : tone.helpful
                                    }`}
                            >
                                <ThumbsUp size={14} className={userVotedReviews.has(review.id) ? 'fill-amber-500 text-amber-500' : ''} />
                                <span>{t('pages.reviews.helpful')}</span>
                                {(helpfulVotes[review.id] || 0) > 0 ? (
                                    <span className="tabular-nums">{helpfulVotes[review.id]}</span>
                                ) : null}
                            </button>
                            <button
                                onClick={(event) => { event.stopPropagation(); handleShareReview(review); }}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${tone.share}`}
                            >
                                <Share2 size={14} />
                                <span>{t('pages.reviews.share')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.article>
        );
    };

    return (
        <SoftYellowGlowBackground className="pb-20 text-[#5a5a82] sm:pb-28">
            <main className="relative z-10">
                <section className="px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8 lg:pt-20 xl:pt-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-center gap-7 sm:gap-9 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.78fr)]">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: -12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 shadow-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-xs"
                                >
                                    <MessageCircle size={16} />
                                    <span>{t('pages.reviews.badge')}</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="max-w-4xl text-[2.15rem] font-extrabold leading-[1.1] tracking-normal text-[#1a1a3e] min-[390px]:text-[2.35rem] sm:text-5xl lg:text-6xl"
                                >
                                    {t('pages.reviews.title')}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mt-4 max-w-2xl text-sm leading-7 text-[#5a5a82] sm:mt-5 sm:text-lg sm:leading-8"
                                >
                                    {t('pages.reviews.description')}
                                </motion.p>

                                <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
                                    <button
                                        onClick={handleWriteStory}
                                        className="group relative inline-flex w-full items-center justify-center gap-3 overflow-visible rounded-2xl border border-amber-400/80 bg-[#0f172a] px-5 py-4 text-left text-white shadow-[0_16px_36px_rgba(245,158,11,0.30)] transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-[#111c31] focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 sm:w-auto sm:min-w-[330px] sm:justify-start sm:px-6 sm:py-4"
                                    >
                                        <span className="absolute -top-3 right-4 rounded-full bg-[linear-gradient(135deg,#ff4fb2_0%,#ff2e7e_58%,#ff8a00_100%)] px-3 py-1 text-[11px] font-extrabold text-white shadow-[0_8px_18px_rgba(236,72,153,0.32)] ring-2 ring-white/80 sm:-top-4 sm:right-5 sm:rotate-6">
                                            รับ 30 เครดิตฟรี!
                                        </span>
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400/10 text-amber-300 shadow-sm transition-transform group-hover:scale-105">
                                            <MessageCircle size={22} />
                                        </span>
                                        <span className="min-w-0 pt-1">
                                            <span className="block text-base font-extrabold leading-tight text-amber-300 sm:text-lg">
                                                เขียนเรื่องราวของคุณ
                                            </span>
                                            <span className="mt-1 block text-xs font-semibold leading-5 text-amber-400/90 sm:text-sm">
                                                แบ่งปันประสบการณ์เพื่อเป็นวิทยาทาน
                                            </span>
                                        </span>
                                    </button>
                                    <Link
                                        href="/name-analysis"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ddddf0] bg-white px-5 py-3.5 text-sm font-bold text-[#1a1a3e] shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-700 sm:w-auto sm:text-base"
                                    >
                                        <Search size={18} className="text-amber-500" />
                                        {t('pages.reviews.ctaAnalyze')}
                                    </Link>
                                    <Link
                                        href="/name-generator"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-5 py-3.5 text-sm font-bold text-pink-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-pink-300 hover:bg-pink-100 sm:w-auto sm:text-base"
                                    >
                                        <WandSparkles size={18} className="text-pink-500" />
                                        {tr('pages.reviews.generatorCta', REVIEW_COPY_TH.generatorCta)}
                                    </Link>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="rounded-2xl border border-[#d8b56d]/60 bg-[#0f172a] p-3.5 text-white shadow-[0_8px_8px_rgba(15,23,42,0.12)] min-[390px]:p-4 sm:p-5"
                            >
                                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                            {tr('pages.reviews.statsTitle', REVIEW_COPY_TH.statsTitle)}
                                        </p>
                                        <div className="mt-2 flex items-end gap-2">
                                            <span className="text-3xl font-extrabold tabular-nums text-white min-[390px]:text-4xl">
                                                {formatAvgRating(stats.averageRating)}
                                            </span>
                                            <span className="pb-2 text-sm font-bold text-slate-300">/ 5</span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-2.5">
                                        <Star className="h-6 w-6 fill-amber-400 text-amber-400 sm:h-7 sm:w-7" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 pt-4">
                                    {[
                                        { icon: MessageCircle, value: formatReviewCount(stats.reviewCount), label: tr('pages.reviews.totalReviewsLabel', REVIEW_COPY_TH.totalReviewsLabel) },
                                        { icon: ShieldCheck, value: formatReviewCount(stats.verifiedCount), label: tr('pages.reviews.verifiedReviewsLabel', REVIEW_COPY_TH.verifiedReviewsLabel) },
                                        { icon: Sparkles, value: formatReviewCount(stats.serviceCount), label: tr('pages.reviews.serviceTypesLabel', REVIEW_COPY_TH.serviceTypesLabel) },
                                        { icon: Users, value: '100%', label: tr('pages.reviews.approvedLabel', REVIEW_COPY_TH.approvedLabel) },
                                    ].map(item => (
                                        <div key={item.label} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3">
                                            <item.icon className="mb-2 h-4 w-4 text-amber-300" />
                                            <div className="text-lg font-extrabold tabular-nums text-white sm:text-xl">{item.value}</div>
                                            <div className="mt-1 break-words text-[11px] font-medium leading-4 text-slate-300 sm:text-xs sm:leading-5">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-3 text-xs font-medium leading-6 text-emerald-800 sm:mt-8 sm:px-4 sm:text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 sm:h-5 sm:w-5" />
                            <span className="min-w-0">
                                {tr('pages.reviews.verifiedExplainer', REVIEW_COPY_TH.verifiedExplainer)}
                            </span>
                        </div>
                    </div>
                </section>

                {featuredReviews.length > 0 ? (
                    <section className="px-3 py-7 sm:px-6 sm:py-8 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-end">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                        {tr('pages.reviews.featuredEyebrow', REVIEW_COPY_TH.featuredEyebrow)}
                                    </p>
                                    <h2 className="mt-2 text-[1.55rem] font-bold leading-tight text-[#1a1a3e] sm:text-3xl">
                                        {tr('pages.reviews.featuredTitle', REVIEW_COPY_TH.featuredTitle)}
                                    </h2>
                                </div>
                                <Link href="/premium-search" className="text-sm font-bold text-amber-700 hover:text-amber-800 hover:underline sm:shrink-0">
                                    {tr('pages.reviews.featuredLink', REVIEW_COPY_TH.featuredLink)}
                                </Link>
                            </div>

                            <div className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:overflow-visible lg:px-0 lg:pb-0">
                                {featuredReviews.map((review, index) => {
                                    const serviceInfo = SERVICE_INFO[review.service_type || 'general'] || SERVICE_INFO.general;
                                    const formattedDate = formatDateForSEO(review.date);
                                    const isPrimary = index === 0;
                                    const tone = REVIEW_CARD_TONES[(index + 1) % REVIEW_CARD_TONES.length];

                                    return (
                                        <article
                                            key={`featured-${review.id}`}
                                            className={`relative w-[84vw] max-w-[84vw] shrink-0 snap-start overflow-hidden rounded-2xl border transition-all sm:w-[58vw] sm:max-w-[58vw] lg:w-auto lg:max-w-none lg:shrink ${tone.card}`}
                                        >
                                            <div className={`h-2.5 ${tone.accent}`} />
                                            <Quote className={`pointer-events-none absolute right-4 top-7 h-10 w-10 sm:right-5 sm:top-8 sm:h-12 sm:w-12 lg:right-6 lg:top-9 lg:h-16 lg:w-16 ${tone.quote}`} />
                                            <div className="relative z-10 p-4 sm:p-5 lg:p-8">
                                                <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:mb-4 sm:gap-2 lg:mb-5">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7e7] px-2.5 py-1.5 text-[11px] font-extrabold text-[#9a650d] ring-1 ring-[#ead7aa] sm:px-3 sm:text-xs">
                                                        <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                                                        {index === 0 ? 'รีวิวแนะนำ' : tr('pages.reviews.featuredEyebrow', REVIEW_COPY_TH.featuredEyebrow)}
                                                    </span>
                                                    {renderVerifiedBadge(review)}
                                                    <span className={`rounded-full border px-2.5 py-1.5 text-[11px] font-bold sm:px-3 sm:text-xs ${tone.tag}`}>
                                                        {serviceInfo.shortName}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <StarRating rating={review.rating} size={18} />
                                                    <span className="text-sm font-semibold tabular-nums text-[#667085]">{formatAvgRating(review.rating)}</span>
                                                </div>
                                                <p className={`mt-3 font-extrabold leading-7 sm:mt-4 lg:mt-5 lg:leading-9 ${isPrimary
                                                    ? 'line-clamp-4 text-base text-[#1a1a3e] sm:line-clamp-5 sm:text-lg lg:line-clamp-6 lg:text-2xl'
                                                    : 'line-clamp-4 text-base text-[#1a1a3e] sm:text-lg lg:line-clamp-5 lg:text-xl'
                                                    }`}>
                                                    &quot;{review.content}&quot;
                                                </p>
                                                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#efe3c9] pt-3 text-xs text-[#667085] sm:gap-3 sm:text-sm lg:mt-6 lg:pt-4">
                                                    <span className="font-bold text-[#1a1a3e]">{review.nickname}</span>
                                                    {review.role ? <span>{review.role}</span> : null}
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                                        <CheckCircle2 className="h-4 w-4 fill-emerald-50 text-emerald-600" />
                                                        รีวิวจริง
                                                    </span>
                                                    {formattedDate ? <time dateTime={formattedDate.isoDate}>{formattedDate.thaiDate}</time> : null}
                                                </div>
                                                <Link
                                                    href={serviceInfo.url}
                                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8b56d] bg-[#0f1b34] px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_5px_6px_rgba(15,23,42,0.14)] transition-colors hover:bg-[#172744] sm:mt-5 sm:w-auto sm:px-4 sm:py-2.5 sm:text-sm lg:mt-7"
                                                >
                                                    <Sparkles size={16} className="text-[#f8c56a]" />
                                                    {tr('pages.reviews.featuredCta', REVIEW_COPY_TH.featuredCta)}
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-[0_10px_34px_rgba(201,147,58,0.10)] sm:mt-8 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:rounded-3xl sm:p-6">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1a1a3e] sm:text-xl">
                                        {tr('pages.reviews.midCtaTitle', REVIEW_COPY_TH.midCtaTitle)}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-[#5a5a82]">
                                        {tr('pages.reviews.midCtaDesc', REVIEW_COPY_TH.midCtaDesc)}
                                    </p>
                                </div>
                                <Link
                                    href="/name-analysis"
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-extrabold text-[#1a1a3e] shadow-[0_8px_24px_rgba(245,158,11,0.22)] transition-all hover:-translate-y-0.5 hover:bg-amber-400 sm:mt-0 sm:w-auto"
                                >
                                    <Search size={17} />
                                    {tr('pages.reviews.midCtaButton', REVIEW_COPY_TH.midCtaButton)}
                                </Link>
                            </div>
                        </div>
                    </section>
                ) : null}

                <section className="px-3 py-7 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-5 flex flex-col gap-3 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                    {tr('pages.reviews.serviceFilterEyebrow', REVIEW_COPY_TH.serviceFilterEyebrow)}
                                </p>
                                <h2 className="mt-2 text-[1.55rem] font-bold leading-tight text-[#1a1a3e] sm:text-3xl">
                                    {t('pages.reviews.subheading')}
                                </h2>
                            </div>
                            <p className="max-w-xl text-sm leading-6 text-[#5a5a82] lg:text-right">
                                {tr('pages.reviews.serviceFilterDesc', REVIEW_COPY_TH.serviceFilterDesc)}
                            </p>
                        </div>

                        <div className="-mx-3 mb-5 flex snap-x gap-1.5 overflow-x-auto px-3 pb-2 sm:mx-0 sm:mb-8 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0">
                            {SERVICE_FILTERS.map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setSelectedService(filter.id)}
                                    className={`min-h-8 shrink-0 snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold leading-5 transition-all sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm ${selectedService === filter.id
                                        ? 'border-[#d8b56d] bg-[#0f1b34] text-white shadow-[0_5px_6px_rgba(15,23,42,0.14)]'
                                        : 'border-[#d9e0ea] bg-white text-[#1a1a3e] shadow-sm hover:border-[#d8b56d] hover:bg-[#fff7e7] hover:text-[#8a5a12]'
                                        }`}
                                >
                                    {language === 'th' ? SERVICE_FILTER_LABELS_TH[filter.id] : t(filter.labelKey, filter.fallbackLabel)}
                                </button>
                            ))}
                        </div>

                        <motion.div layout className="columns-1 gap-5 space-y-5 md:columns-2 lg:gap-6 lg:space-y-6 xl:columns-3">
                            <AnimatePresence>
                                {filteredReviews.map((review, index) => renderReviewCard(review, index))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredReviews.length === 0 ? (
                            <div className="rounded-2xl border border-[#ddddf0] bg-white px-5 py-10 text-center shadow-sm sm:rounded-3xl sm:px-6 sm:py-14">
                                <Filter className="mx-auto mb-4 h-12 w-12 text-amber-500" />
                                <h3 className="text-xl font-bold text-[#1a1a3e]">
                                    {t('pages.reviews.empty')}
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a5a82]">
                                    {tr('pages.reviews.emptyDesc', REVIEW_COPY_TH.emptyDesc)}
                                </p>
                                <button
                                    onClick={handleWriteStory}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1e293b]"
                                >
                                    <Plus size={17} className="text-amber-400" />
                                    {t('pages.reviews.ctaWrite')}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    <div className="mx-auto max-w-5xl rounded-2xl border border-[#1e293b] bg-[#0f172a] p-5 text-center text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)] sm:rounded-3xl sm:p-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            {tr('pages.reviews.bottomEyebrow', REVIEW_COPY_TH.bottomEyebrow)}
                        </p>
                        <h2 className="mx-auto mt-3 max-w-2xl text-[1.55rem] font-extrabold leading-tight sm:text-4xl">
                            {t('pages.reviews.bottomTitle')}
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                            {t('pages.reviews.bottomDesc')}
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/name-analysis"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-[#1a1a3e] transition-colors hover:bg-amber-400 sm:w-auto"
                            >
                                <Search size={17} />
                                {t('pages.reviews.bottomCta')}
                            </Link>
                            <Link
                                href="/topup"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-amber-400/40 hover:bg-white/10 sm:w-auto"
                            >
                                <CreditCard size={17} className="text-amber-300" />
                                {tr('pages.reviews.packageCta', REVIEW_COPY_TH.packageCta)}
                            </Link>
                            <Link
                                href="/name-generator"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-pink-300/35 bg-pink-400/10 px-5 py-3 text-sm font-bold text-pink-100 transition-colors hover:border-pink-300/70 hover:bg-pink-400/20 sm:w-auto"
                            >
                                <WandSparkles size={17} className="text-pink-300" />
                                {tr('pages.reviews.generatorCta', REVIEW_COPY_TH.generatorCta)}
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
                    <div className="mx-auto max-w-3xl border-t border-slate-200 pt-8 sm:pt-12">
                        <h2 className="mb-5 text-center text-xl font-bold text-[#1a1a3e] sm:mb-8 sm:text-2xl">
                            {t('pages.reviews.faqTitle')}
                        </h2>
                        <div className="space-y-4">
                            {[
                                { q: t('pages.reviews.faq1Q'), a: t('pages.reviews.faq1A') },
                                { q: t('pages.reviews.faq2Q'), a: t('pages.reviews.faq2A') },
                            ].map(item => (
                                <details key={item.q} className="group rounded-2xl border border-[#ddddf0] bg-white p-4 shadow-sm sm:p-5" open>
                                    <summary className="cursor-pointer list-none text-sm font-bold text-[#1a1a3e] marker:hidden sm:text-base">
                                        {item.q}
                                    </summary>
                                    <p className="mt-3 text-sm leading-6 text-[#5a5a82] sm:leading-7">
                                        {item.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <ReviewFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingReview(null); }}
                initialData={editingReview}
                onSuccess={fetchReviews}
            />
        </SoftYellowGlowBackground>
    );
}
