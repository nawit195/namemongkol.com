import React from 'react';

export interface FAQ {
    question: string;
    answer: string;
}

export function NamingFAQSection({ title = 'คำถามที่พบบ่อย', faqs }: { title?: string, faqs: FAQ[] }) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="w-full bg-[#f8f8fc] px-4 py-12 text-[#1a1a3e]">
            <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl font-bold sm:text-3xl mb-8">{title}</h2>
                <div className="grid gap-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="font-semibold text-lg text-[#1a1a3e]">{faq.question}</h3>
                            <p className="mt-2 text-sm leading-7 text-[#5a5a82] sm:text-base">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
