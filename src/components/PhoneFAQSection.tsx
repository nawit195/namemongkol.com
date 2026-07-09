import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { phoneFaqs } from '@/lib/phoneSeo';

export const PhoneFAQSection = () => {
    return (
        <section id="phone-faq" className="relative overflow-hidden py-14 md:py-20">
            <div className="container relative z-10 mx-auto max-w-5xl px-4">
                <div className="mb-10 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ddddf0] bg-slate-50 px-3 py-1 text-sm text-[#5a5a82]">
                        <HelpCircle size={16} />
                        <span>คำถามที่พบบ่อย</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1a1a3e] md:text-4xl">
                        คำถามที่พบบ่อยเกี่ยวกับการวิเคราะห์เบอร์มงคล
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5a5a82] md:text-base">
                        รวมคำตอบเกี่ยวกับการเช็คเบอร์โทรศัพท์ คู่เลขมงคล ผลรวมเบอร์ เกรด A-F และกราฟพลังงาน 6 ด้าน
                        เพื่อช่วยให้คุณเข้าใจผลวิเคราะห์ก่อนตัดสินใจเลือกใช้เบอร์
                    </p>
                </div>

                <div className="mx-auto max-w-3xl space-y-4">
                    {phoneFaqs.map((faq) => (
                        <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    return (
        <details className="group overflow-hidden rounded-2xl border border-[#ddddf0] bg-white shadow-sm transition-colors hover:border-amber-300 open:border-amber-300 open:bg-slate-50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-base font-bold text-[#1a1a3e] md:text-lg">
                <span>{question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-[#5a5a82] transition-transform duration-300 group-open:rotate-180 group-open:text-amber-600" />
            </summary>
            <div className="border-t border-dashed border-[#ddddf0] px-5 pb-5 pt-4 text-sm leading-8 text-[#5a5a82] md:text-base">
                {answer}
            </div>
        </details>
    );
};
