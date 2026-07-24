'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Facebook, Eye, EyeOff, Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function RegisterClientPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                    },
                },
            });

            if (error) throw error;

            // Check if session is established immediately (Email Confirm disabled)
            if (data.session) {
                setSuccessMessage('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
                router.refresh();
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                // Email Confirm enabled -> Show OTP Input
                setOtpSent(true);
                setSuccessMessage('ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบและกรอกรหัสยืนยัน');
            }

        } catch (error: unknown) {
            console.error('Registration error:', error);
            const errorMessage = (error as Error).message;
            if (errorMessage.includes('already registered') || errorMessage.includes('duplicate')) {
                setError('อีเมลนี้มีผู้ใช้งานแล้ว กรุณาเข้าสู่ระบบ');
            } else {
                setError(errorMessage || 'เกิดข้อผิดพลาดในการลงทะเบียน');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup',
            });

            if (error) throw error;

            setSuccessMessage('ยืนยันตัวตนสำเร็จ! กำลังเข้าสู่ระบบ...');

            // Redirect to dashboard or home after short delay
            setTimeout(() => {
                router.push('/');
            }, 1500);

        } catch (error: unknown) {
            console.error('OTP verification error:', error);
            setError((error as Error).message || 'รหัส OTP ไม่ถูกต้อง หรือหมดอายุ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: formData.email,
            });

            if (error) throw error;
            setSuccessMessage('ส่งรหัส OTP ใหม่เรียบร้อยแล้ว');
        } catch (error: unknown) {
            setError((error as Error).message || 'ไม่สามารถส่ง OTP ใหม่ได้');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            console.error('Google login error:', err);
            setError((err as Error).message || 'เกิดข้อผิดพลาดในการลงทะเบียนด้วย Google');
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            console.error('Facebook login error:', err);
            setError((err as Error).message || 'เกิดข้อผิดพลาดในการลงทะเบียนด้วย Facebook');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-amber-500 selection:text-white relative overflow-hidden flex items-center justify-center px-4 pt-24 pb-28 md:py-4">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-200 mb-2">
                            {otpSent ? 'ยืนยันรหัส OTP' : 'สมัครสมาชิก'}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {otpSent
                                ? `กรุณากรอกรหัสยืนยันที่ส่งไปยัง ${formData.email}`
                                : 'เริ่มต้นใช้งาน NameMongkol ฟรีวันนี้'}
                        </p>
                    </div>

                    {/* Benefits Strip */}
                    {!otpSent && (
                        <div className="mb-6 grid grid-cols-2 gap-2">
                            {[
                                { emoji: '🎁', text: 'รับฟรี 30 เครดิต ทันที' },
                                { emoji: '💾', text: 'บันทึกผลวิเคราะห์ทุกครั้ง' },
                                { emoji: '🔮', text: 'คำทำนาย + พลังเงาเชิงลึก' },
                                { emoji: '🖼️', text: 'แลกวอลเปเปอร์มงคล' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                                    <span className="text-sm">{item.emoji}</span>
                                    <span className="text-[11px] text-slate-300 font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Alerts */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-2">
                            <span className="mt-0.5 block w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            {successMessage}
                        </div>
                    )}

                    {!otpSent ? (
                        // Registration Form
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300 ml-1">ชื่อ-นามสกุล</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="ชื่อของคุณ"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300 ml-1">อีเมล</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="name@example.com"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300 ml-1">รหัสผ่าน</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-12 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300 ml-1">ยืนยันรหัสผ่าน</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-12 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>กำลังลงทะเบียน...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>สมัครสมาชิก</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        // OTP Verification Form
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">รหัสยืนยัน (OTP)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={handleOtpChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all tracking-widest text-center text-lg"
                                        placeholder="000000"
                                        maxLength={8}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length < 6}
                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>กำลังตรวจสอบ...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>ยืนยันข้อมูล</span>
                                        <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    เปลี่ยนอีเมล
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                    className="text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                                >
                                    ขอรหัส OTP ใหม่
                                </button>
                            </div>
                        </form>
                    )}

                    {!otpSent && (
                        <>
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 text-slate-500 bg-[#0f172a]/50 backdrop-blur-sm">หรือสมัครด้วย</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full py-3 px-4 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.52 12.29C23.52 11.43 23.44 10.71 23.3 10.05H12V14.53H18.57C18.3 16.08 17.38 17.5 15.93 18.53V21.75H19.75C21.99 19.66 23.52 16.47 23.52 12.29Z" fill="#4285F4" />
                                        <path d="M12 24C15.24 24 17.96 22.92 19.98 21.05L16.2 17.7C15.09 18.45 13.67 18.9 12 18.9C8.84 18.9 6.16 16.71 5.2 13.8L1.35 16.79C3.36 20.9 7.42 24 12 24Z" fill="#34A853" />
                                        <path d="M5.21 13.8C4.95 12.98 4.79 12.11 4.79 11.99C4.79 11.1 4.93 10.23 5.19 9.4L1.35 6.42C0.49 8.13 0 10.02 0 11.99C0 14.12 0.53 16.14 1.48 17.97L5.21 13.8Z" fill="#FBBC05" />
                                        <path d="M12 5.1C14.33 5.1 15.91 6.11 16.8 6.96L20.08 3.73C18.06 1.84 15.34 0 12 0C7.42 0 3.36 3.1 1.35 7.21L5.2 10.2C6.16 7.28 8.84 5.1 12 5.1Z" fill="#EA4335" />
                                    </svg>
                                    <span>Google</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFacebookLogin}
                                    className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    <Facebook className="w-5 h-5 fill-current" />
                                    <span>Facebook</span>
                                </button>
                            </div>

                            <div className="mt-8 text-center text-sm text-slate-400">
                                มีบัญชีอยู่แล้ว?{' '}
                                <Link prefetch={false} href="/login" className={`text-amber-400 hover:text-amber-300 font-medium transition-colors ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                                    เข้าสู่ระบบ
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
