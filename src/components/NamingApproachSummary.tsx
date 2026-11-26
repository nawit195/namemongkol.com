import Link from 'next/link';
import React from 'react';
import { namingBrandDescription, premiumCurationDescription, personalNameCheckNote, namingApproachFaqs, namingFaqJsonLd } from '@/data/namingApproach';

export function NamingApproachSummary({ premium = false }: { premium?: boolean }) {
    return <section className="mx-auto my-10 max-w-5xl px-4 text-[#1a1a3e] sm:px-6" aria-label="แนวทางวิเคราะห์และคัดสรรชื่อ">
        <div className="border-y border-[#ddddf0] py-8">
            <h2 className="text-xl font-bold leading-relaxed sm:text-2xl">{premium ? 'ฐานรายชื่อพรีเมียม คัดกรองล่วงหน้าด้วย 4 ศาสตร์' : '4 ศาสตร์และจุดเด่นของ NameMongkol'}</h2>
            <p className="mt-4 max-w-[70ch] leading-8 text-[#5a5a82]">{namingBrandDescription}</p>
            <p className="mt-3 max-w-[70ch] leading-8 text-[#5a5a82]">{premiumCurationDescription}</p>
            <p className="mt-3 max-w-[70ch] text-sm leading-7 text-[#5a5a82]">{personalNameCheckNote}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <Link href="/methodology#premium-curation" className="inline-flex min-h-11 items-center text-amber-800 underline underline-offset-4">วิธีคำนวณและการคัดรายชื่อ</Link>
                <Link href="/name-check" className="inline-flex min-h-11 items-center underline underline-offset-4">วิเคราะห์ชื่อกับนามสกุลฟรี</Link>
                {premium && <Link href="/celebrity-names" className="inline-flex min-h-11 items-center underline underline-offset-4">ดูกรณีศึกษาวิธีคำนวณชื่อพร้อมแหล่งอ้างอิง →</Link>}
            </div>
        </div>
    </section>;
}

export function NamingApproachFaq() {
    return <section className="mx-auto my-10 max-w-5xl px-4 text-[#1a1a3e] sm:px-6" aria-label="คำถามเรื่อง 4 ศาสตร์และการคัดรายชื่อ">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(namingFaqJsonLd) }} />
        <h2 className="text-xl font-bold leading-relaxed sm:text-2xl">คำถามเรื่อง 4 ศาสตร์และการคัดรายชื่อ</h2>
        <div className="mt-5 divide-y divide-[#ddddf0] border-y border-[#ddddf0]">
            {namingApproachFaqs.map(faq => <details key={faq.question} className="py-2">
                <summary className="min-h-11 cursor-pointer py-2 font-semibold leading-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700">{faq.question}</summary>
                <p className="max-w-[70ch] pb-4 pt-2 leading-8 text-[#5a5a82]">{faq.answer}</p>
            </details>)}
        </div>
    </section>;
}
