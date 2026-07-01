import React from 'react';
import { Search, Layers, Activity } from 'lucide-react';

export const UspSection = () => {
    return (
        <section className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-20 relative z-10">
            <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[#1a1a3e] mb-5 tracking-tight">
                    จุดเด่นของการตั้งชื่อมงคล กับ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">NameMongkol</span>
                </h2>
                <p className="text-[#5a5a82] max-w-[65ch] mx-auto text-base sm:text-lg leading-relaxed">
                    เช็คชื่อตัวเองหรือตั้งชื่อลูกใหม่ได้อย่างแม่นยำและใช้งานฟรี ผสาน 4 ศาสตร์หลักของไทยไว้ในหน้าเดียว ช่วยให้คุณได้ชื่อมงคลที่ดีที่สุด
                </p>
            </div>

            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-2 pb-6 sm:gap-6 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0 md:snap-none">
                {/* USP 1 */}
                <div className="w-[85%] shrink-0 snap-center bg-white border border-[#ddddf0] p-6 sm:p-8 rounded-[1.75rem] hover:shadow-[0_12px_40px_rgba(251,191,36,0.12)] hover:border-amber-200 transition-all duration-300 hover:-translate-y-1.5 group md:w-auto md:shrink md:snap-none relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10">
                        <Search size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    
                    <h3 className="text-[17px] sm:text-[19px] font-bold text-[#1a1a3e] mb-3 tracking-tight group-hover:text-amber-600 transition-colors relative z-10">
                        วิเคราะห์เจาะลึกคู่เลขมงคล
                    </h3>
                    
                    <p className="text-[#5a5a82] leading-relaxed text-[14px] sm:text-[15px] relative z-10">
                        ไม่ใช่แค่ดูผลรวม แต่เราถอดรหัส <strong className="text-amber-700 font-semibold">&quot;ทุกคู่ตัวเลข&quot;</strong> ในชื่อ-นามสกุล เพื่อหาจุดเด่นและแนวทางแก้ไขก่อนตัดสินใจเปลี่ยนชื่อจริง
                    </p>
                </div>

                {/* USP 2 */}
                <div className="w-[85%] shrink-0 snap-center bg-white border border-[#ddddf0] p-6 sm:p-8 rounded-[1.75rem] hover:shadow-[0_12px_40px_rgba(251,191,36,0.12)] hover:border-amber-200 transition-all duration-300 hover:-translate-y-1.5 group md:w-auto md:shrink md:snap-none relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10">
                        <Layers size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    
                    <h3 className="text-[17px] sm:text-[19px] font-bold text-[#1a1a3e] mb-3 tracking-tight group-hover:text-amber-600 transition-colors relative z-10">
                        ผสาน 4 ศาสตร์สำคัญ
                    </h3>
                    
                    <p className="text-[#5a5a82] leading-relaxed text-[14px] sm:text-[15px] relative z-10">
                        วิเคราะห์ครบมิติด้วย <strong className="text-amber-700 font-semibold">เลขศาสตร์ ทักษาปกรณ์ อายตนะ 6 และนิรันดร์ศาสตร์</strong> ดูง่าย ครบจบในหน้าจอเดียว
                    </p>
                </div>

                {/* USP 3 */}
                <div className="w-[85%] shrink-0 snap-center bg-white border border-[#ddddf0] p-6 sm:p-8 rounded-[1.75rem] hover:shadow-[0_12px_40px_rgba(251,191,36,0.12)] hover:border-amber-200 transition-all duration-300 hover:-translate-y-1.5 group md:w-auto md:shrink md:snap-none relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10">
                        <Activity size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    
                    <h3 className="text-[17px] sm:text-[19px] font-bold text-[#1a1a3e] mb-3 tracking-tight group-hover:text-amber-600 transition-colors relative z-10">
                        ถอดรหัสลึกถึงพลังเงา
                    </h3>
                    
                    <p className="text-[#5a5a82] leading-relaxed text-[14px] sm:text-[15px] relative z-10">
                        เช็กชื่อฟรีเบื้องต้น พร้อมตัวเลือกปลดล็อกดู <strong className="text-amber-700 font-semibold">&quot;พลังเงา&quot;</strong> และคำทำนายพรีเมียม เพื่อกรองชื่อที่ดีที่สุดสำหรับคุณ
                    </p>
                </div>
            </div>
        </section>
    );
};
