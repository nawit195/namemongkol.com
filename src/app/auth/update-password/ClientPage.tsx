'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/utils/supabase';

const MIN_PASSWORD_LENGTH = 8;

type VerificationState = 'verifying' | 'ready' | 'invalid';

export default function UpdatePasswordClientPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationState, setVerificationState] = useState<VerificationState>('verifying');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const resolvedRef = useRef(false);

    const passwordTooShort = useMemo(() => {
        return password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
    }, [password]);

    useEffect(() => {
        const markReady = () => {
            if (!resolvedRef.current) {
                resolvedRef.current = true;
                setVerificationState('ready');
            }
        };

        const markInvalid = (msg: string) => {
            if (!resolvedRef.current) {
                resolvedRef.current = true;
                setVerificationState('invalid');
                setError(msg);
            }
        };

        // 1. Listen for PASSWORD_RECOVERY event from Supabase
        //    Supabase fires this regardless of which flow was used (PKCE, implicit, magic link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                markReady();
            }
        });

        // 2. Try to handle recovery based on URL params and existing session
        const handleRecovery = async () => {
            const code = searchParams.get('code');
            const tokenHash = searchParams.get('token_hash');
            const type = searchParams.get('type');

            try {
                // PKCE flow: Supabase redirects with ?code=xxx
                if (code) {
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) throw exchangeError;
                    markReady();
                    return;
                }

                // Token hash flow: ?token_hash=xxx&type=recovery
                if (tokenHash && type === 'recovery') {
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        type: 'recovery',
                        token_hash: tokenHash,
                    });
                    if (verifyError) throw verifyError;
                    markReady();
                    return;
                }

                // Hash fragment flow (implicit): #access_token=xxx&type=recovery
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                if (hashParams.get('type') === 'recovery') {
                    markReady();
                    return;
                }

                // Supabase may have already established the recovery session before redirect
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    markReady();
                    return;
                }

                // Give onAuthStateChange a moment to fire (some flows are async)
                setTimeout(() => {
                    markInvalid('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง');
                }, 3000);
            } catch (err: unknown) {
                markInvalid((err as Error).message || 'ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่');
            }
        };

        handleRecovery();

        return () => {
            subscription.unsubscribe();
        };
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`);
            return;
        }

        if (password !== confirmPassword) {
            setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) throw updateError;

            setSuccessMessage('ตั้งรหัสผ่านใหม่สำเร็จ กำลังพากลับไปหน้าเข้าสู่ระบบ...');
            setTimeout(() => {
                router.push('/login?reset=success');
            }, 1200);
        } catch (err: unknown) {
            setError((err as Error).message || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาลองอีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-amber-500 selection:text-white relative overflow-hidden flex items-center justify-center px-4 pt-24 pb-28 md:py-4">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-200 mb-2">
                            ตั้งรหัสผ่านใหม่
                        </h1>
                        <p className="text-slate-400 text-sm">
                            กรอกรหัสผ่านใหม่เพื่อเข้าใช้งานบัญชีของคุณ
                        </p>
                    </div>

                    {verificationState === 'verifying' && (
                        <div className="py-8 text-center">
                            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
                            <p className="text-slate-300">กำลังตรวจสอบลิงก์รีเซ็ตรหัสผ่าน...</p>
                        </div>
                    )}

                    {verificationState === 'invalid' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span>{error || 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ'}</span>
                            </div>
                            <Link prefetch={false}
                                href="/login"
                                className="block w-full py-3 px-4 text-center bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                            >
                                กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    )}

                    {verificationState === 'ready' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {successMessage && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300 ml-1">รหัสผ่านใหม่</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="อย่างน้อย 8 ตัวอักษร"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {passwordTooShort && (
                                    <p className="text-xs text-amber-300 ml-1">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300 ml-1">ยืนยันรหัสผ่านใหม่</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                                        disabled={isSubmitting}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !!successMessage}
                                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:active:scale-100"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                                    </>
                                ) : (
                                    <span>ยืนยันการตั้งรหัสผ่านใหม่</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
