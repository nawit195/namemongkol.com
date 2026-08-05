import type { Article } from './articles';

type GradeAName = {
    name: string;
    meaning: string;
    sum: number;
    eligibleDays: string;
};

const gradeANames: GradeAName[] = [
    { name: 'ธนภัทร', meaning: 'ผู้มีทรัพย์และความเจริญอันดี', sum: 19, eligibleDays: 'อา., อ., พ.กลางวัน, พฤ.' },
    { name: 'จิรภัทร', meaning: 'ความดีงามและความเจริญที่ยั่งยืน', sum: 24, eligibleDays: 'อา., อ., พฤ.' },
    { name: 'ปริญญา', meaning: 'ความรู้รอบและความสำเร็จทางปัญญา', sum: 19, eligibleDays: 'อา., อ., พฤ., ส.' },
    { name: 'อัครินทร์', meaning: 'ผู้เป็นใหญ่และมีความโดดเด่น', sum: 41, eligibleDays: 'อา., พ.กลางวัน, พฤ., พ.กลางคืน' },
    { name: 'กนกจันทร์', meaning: 'พระจันทร์สีทอง สื่อถึงคุณค่าและความสว่าง', sum: 36, eligibleDays: 'อา., พฤ., พ.กลางคืน' },
    { name: 'กมลนันท์', meaning: 'ผู้เป็นความยินดีของหัวใจ', sum: 36, eligibleDays: 'อา., พ.กลางวัน, พฤ.' },
    { name: 'กมลโรจน์', meaning: 'หัวใจหรือดอกบัวที่รุ่งเรืองสว่างไสว', sum: 40, eligibleDays: 'อา., พฤ.' },
    { name: 'กมลลักษณ์', meaning: 'ผู้มีลักษณะงดงามดุจดอกบัว', sum: 41, eligibleDays: 'พ.กลางวัน, ส.' },
    { name: 'กมลโลจน์', meaning: 'ผู้มีดวงตางดงามดุจดอกบัว', sum: 42, eligibleDays: 'อา., พฤ.' },
    { name: 'กวินธร', meaning: 'ผู้ทรงไว้ซึ่งปัญญาและศิลปะแห่งถ้อยคำ', sum: 24, eligibleDays: 'อา., พ.กลางวัน, พฤ., พ.กลางคืน' },
    { name: 'กวินวิชญ์', meaning: 'ผู้รอบรู้และเชี่ยวชาญด้านถ้อยคำ', sum: 41, eligibleDays: 'อา., พฤ., พ.กลางคืน' },
    { name: 'กอบคุณ', meaning: 'ผู้สร้างคุณความดีและคุณประโยชน์', sum: 19, eligibleDays: 'อา., พ.กลางวัน, ศ., ส.' },
    { name: 'กอบโชค', meaning: 'ผู้รวบรวมและนำพาโชคดี', sum: 19, eligibleDays: 'อา., พฤ., ศ., ส.' },
    { name: 'กังวาน', meaning: 'เสียงที่ชัดเจน ไพเราะ และแผ่ไกล', sum: 19, eligibleDays: 'อา., พ.กลางวัน, พฤ., พ.กลางคืน' },
    { name: 'กัญญา', meaning: 'หญิงสาวผู้มีคุณค่าและความงาม', sum: 14, eligibleDays: 'อา., พฤ., ศ., ส., พ.กลางคืน' },
    { name: 'กันตนา', meaning: 'หญิงผู้เป็นที่รักและน่าชื่นชม', sum: 19, eligibleDays: 'อา., พ.กลางวัน, พฤ., ศ., พ.กลางคืน' },
    { name: 'กันธิมา', meaning: 'ผู้มีกลิ่นหอมและความงามละมุน', sum: 24, eligibleDays: 'อา., พ.กลางวัน, พฤ., ศ.' },
    { name: 'ขวัญลักษณ์', meaning: 'ผู้มีลักษณะงามและเป็นที่รัก', sum: 45, eligibleDays: 'ส., พ.กลางคืน' },
    { name: 'ขจรอุษา', meaning: 'แสงรุ่งอรุณที่แผ่ไกล', sum: 24, eligibleDays: 'พฤ., ส., พ.กลางคืน' },
    { name: 'ไกรโรจน์', meaning: 'ผู้มีความรุ่งเรืองและความสว่างอันยิ่งใหญ่', sum: 42, eligibleDays: 'อา., พฤ., พ.กลางคืน' },
];

const faqItems: NonNullable<Article['faqItems']> = [
    {
        question: 'ชื่อ Grade A+ หมายถึงอะไร?',
        answer: 'ในระบบ NameMongkol ชื่อ Grade A+ คือชื่อที่ผลรวมอยู่ในกลุ่มมงคลและไม่พบคู่เลขที่ระบบจัดเป็นกลุ่มเสี่ยง การจัดเกรดในบทความนี้เป็นการตรวจชื่อเดี่ยว จึงยังไม่ใช่ผลสรุปเมื่อใช้ร่วมกับนามสกุลจริง',
    },
    {
        question: 'ชื่อในบทความใช้ได้กับทุกวันเกิดหรือไม่?',
        answer: 'ไม่ควรเหมารวมว่าใช้ได้กับทุกวันเกิด ตารางระบุเฉพาะวันที่ไม่พบอักษรกาลกิณีในชื่อเดี่ยวตามเกณฑ์ของระบบ ผู้ใช้ควรตรวจซ้ำร่วมกับนามสกุลและวันเกิดจริงก่อนเลือกใช้',
    },
    {
        question: 'ผลรวมชื่อที่ดีรับประกันว่าจะเป็นชื่อมงคลหรือไม่?',
        answer: 'ไม่รับประกัน ผลรวมเป็นเพียงหนึ่งองค์ประกอบ ควรดูความหมาย เสียงอ่าน การเขียน คู่เลข วันเกิด และความเหมาะสมกับนามสกุลร่วมกัน',
    },
    {
        question: 'ปี 2569 มีผลต่อคะแนนของชื่อหรือไม่?',
        answer: 'คะแนนเลขศาสตร์ของตัวอักษรไม่ได้เปลี่ยนตามปี 2569 ปีในหัวข้อใช้บอกช่วงเวลาที่รวบรวมและทบทวนรายชื่อ ส่วนความเหมาะสมเฉพาะบุคคลต้องอาศัยข้อมูลวันเกิดและนามสกุล',
    },
    {
        question: 'ควรเลือกชื่อจากตารางอย่างไร?',
        answer: 'เริ่มจากเลือกชื่อที่ชอบความหมายและออกเสียงเข้ากับนามสกุล จากนั้นตรวจวันเกิด คู่เลข และผลรวมชื่อกับนามสกุล ก่อนเปรียบเทียบตัวเลือกสุดท้ายอีกครั้ง',
    },
    {
        question: 'สามารถนำชื่อไปวิเคราะห์กับนามสกุลได้ที่ไหน?',
        answer: 'นำชื่อที่สนใจไปตรวจต่อได้ที่ระบบวิเคราะห์ชื่อมงคลของ NameMongkol เพื่อดูผลรวมชื่อและนามสกุล อักษรกาลกิณี คู่เลข และรายละเอียดประกอบการตัดสินใจ',
    },
];

const nameRows = gradeANames.map((item, index) => `
    <tr class="border-b border-slate-700/70 last:border-0">
        <td class="px-4 py-4 text-slate-400">${index + 1}</td>
        <td class="px-4 py-4">
            <strong class="block text-base text-white">${item.name}</strong>
            <span class="mt-1 block text-sm leading-6 text-slate-400">${item.meaning}</span>
        </td>
        <td class="px-4 py-4"><span class="inline-flex min-w-10 justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-bold text-amber-300">${item.sum}</span></td>
        <td class="px-4 py-4 text-sm leading-6 text-slate-300">${item.eligibleDays}</td>
    </tr>
`).join('');

export const articleLuckyNamesGradeA2569: Article = {
    id: '27',
    slug: 'lucky-names-for-2026-grade-a-plus',
    title: '20 ชื่อมงคล 2569 Grade A+ พร้อมความหมายและวิธีเลือกให้เหมาะกับวันเกิด',
    excerpt: 'รวม 20 ชื่อที่ผ่านเกณฑ์ Grade A+ ของ NameMongkol ในการตรวจชื่อเดี่ยว พร้อมความหมาย ผลรวมเลขศาสตร์ วันที่ไม่พบอักษรกาลกิณีเบื้องต้น และขั้นตอนตรวจร่วมกับนามสกุลก่อนใช้จริง',
    coverImage: '/images/articles/grade-a-names-cover-2026-v2.webp',
    coverImageAlt: 'สมุดคัดชื่อมงคล 2569 พร้อมตารางอักษรไทยและเลขศาสตร์ Grade A+',
    date: '2026-01-01',
    dateModified: '2026-08-05',
    reviewedAt: '2026-08-05',
    author: 'อาจารย์ณัฐ (NameMongkol)',
    category: 'วิเคราะห์ชื่อมงคล',
    keywords: [
        'ชื่อมงคล 2569',
        'ชื่อ Grade A+',
        'ชื่อมงคลพร้อมความหมาย',
        'ชื่อมงคลตามวันเกิด',
        'ผลรวมเลขศาสตร์ชื่อ',
        'วิเคราะห์ชื่อมงคล',
    ],
    metaTitle: '20 ชื่อมงคล 2569 Grade A+ พร้อมความหมาย | NameMongkol',
    metaDescription: 'รวม 20 ชื่อมงคล 2569 Grade A+ พร้อมความหมาย ผลรวมเลขศาสตร์ และวันที่ไม่พบอักษรกาลกิณีเบื้องต้น รวมวิธีตรวจชื่อกับนามสกุลก่อนใช้จริง',
    relatedSlugs: [
        'auspicious-names-by-birthday-2026',
        'micro-analysis-lucky-number-pairs',
        'naming-tips-2026-year-of-horse',
        'what-is-name-analysis',
    ],
    toc: [
        { title: 'ชื่อมงคล Grade A+ คืออะไร', id: 'direct-answer', level: 2 },
        { title: 'เกณฑ์คัดเลือก 20 รายชื่อ', id: 'methodology', level: 2 },
        { title: '20 ชื่อมงคล 2569 พร้อมความหมาย', id: 'name-list', level: 2 },
        { title: 'วิธีเลือกชื่อให้เหมาะกับผู้ใช้จริง', id: 'selection-guide', level: 2 },
        { title: 'คำถามที่พบบ่อย', id: 'faq-section', level: 2 },
    ],
    faqItems,
    sources: [
        {
            title: 'หลักเกณฑ์และวิธีวิเคราะห์ชื่อของ NameMongkol',
            url: '/methodology',
            note: 'อธิบายขอบเขตการใช้เลขศาสตร์ ทักษา และข้อจำกัดของผลวิเคราะห์',
            kind: 'methodology',
        },
    ],
    content: `
        <div class="space-y-10">
            <section id="direct-answer" class="space-y-5">
                <p class="text-xl leading-9 text-slate-200">
                    หากกำลังมองหา<strong class="text-white">ชื่อมงคล 2569 Grade A+</strong> ให้เริ่มจากรายชื่อที่มีความหมายดี ออกเสียงชัด ผลรวมอยู่ในกลุ่มมงคล และไม่พบคู่เลขเสี่ยงในการตรวจชื่อเดี่ยว รายชื่อ 20 ชื่อด้านล่างผ่านเกณฑ์ดังกล่าวตามระบบ NameMongkol และผ่านการตรวจทานล่าสุดวันที่ 5 สิงหาคม 2569
                </p>
                <div class="rounded-lg border border-amber-400/30 bg-amber-400/10 p-5">
                    <h2 class="text-lg font-bold text-amber-300">คำตอบสั้น: Grade A+ ยังไม่ใช่คำตัดสินสุดท้าย</h2>
                    <p class="mt-2 leading-7 text-slate-300">
                        เกรดในหน้านี้คำนวณจาก<strong class="text-white">ชื่อจริงเพียงอย่างเดียว</strong> เมื่อเติมนามสกุล ผลรวมและคู่เลขจะเปลี่ยนได้ อีกทั้งแต่ละวันเกิดมีอักษรกาลกิณีต่างกัน จึงควรนำชื่อที่สนใจไปตรวจร่วมกับนามสกุลก่อนใช้จริง
                    </p>
                </div>
            </section>

            <section id="methodology" class="space-y-5">
                <h2 class="text-2xl font-bold text-white">เกณฑ์คัดเลือก 20 รายชื่อ</h2>
                <ol class="grid gap-3 md:grid-cols-2">
                    <li class="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-slate-300"><strong class="text-white">1. ความหมายชัดเจน</strong><br />ไม่ใช้ชื่อที่สะกดผิดหรือสร้างคำโดยไม่มีคำอธิบายรองรับ</li>
                    <li class="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-slate-300"><strong class="text-white">2. ผลรวมอยู่ในกลุ่มมงคล</strong><br />คำนวณค่าตัวอักษรตามตารางเลขศาสตร์ที่ระบบใช้อยู่</li>
                    <li class="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-slate-300"><strong class="text-white">3. คู่เลขผ่านเกณฑ์</strong><br />ไม่พบคู่เลขที่ระบบจัดอยู่ในกลุ่มเสี่ยงของชื่อเดี่ยว</li>
                    <li class="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-slate-300"><strong class="text-white">4. ตรวจทักษาเบื้องต้น</strong><br />ระบุวันที่ไม่พบอักษรกาลกิณีในชื่อ แต่ยังต้องตรวจนามสกุลแยกอีกครั้ง</li>
                </ol>
                <p class="text-sm leading-6 text-slate-400">
                    เลขศาสตร์และทักษาเป็นศาสตร์ตามความเชื่อ ใช้เป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่หลักฐานรับรองผลลัพธ์ในชีวิต และปี 2569 ไม่ได้ทำให้ค่าตัวอักษรเปลี่ยนไป
                </p>
            </section>

            <section id="name-list" class="space-y-5">
                <div>
                    <h2 class="text-2xl font-bold text-white">20 ชื่อมงคล 2569 Grade A+ พร้อมความหมาย</h2>
                    <p class="mt-2 leading-7 text-slate-300">คอลัมน์วันเกิดหมายถึงวันที่ไม่พบอักษรกาลกิณีในชื่อเดี่ยวตามเกณฑ์ของระบบ ไม่ได้หมายความว่าชื่อนั้นเหมาะกับทุกนามสกุล</p>
                </div>
                <div class="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/60">
                    <table class="w-full min-w-[760px] text-left">
                        <thead class="bg-slate-800 text-sm text-slate-200">
                            <tr>
                                <th class="px-4 py-3">ลำดับ</th>
                                <th class="px-4 py-3">ชื่อและความหมาย</th>
                                <th class="px-4 py-3">ผลรวมชื่อ</th>
                                <th class="px-4 py-3">ไม่พบกาลกิณีเบื้องต้น</th>
                            </tr>
                        </thead>
                        <tbody>${nameRows}</tbody>
                    </table>
                </div>
            </section>

            <section id="selection-guide" class="space-y-5">
                <h2 class="text-2xl font-bold text-white">วิธีเลือกชื่อให้เหมาะกับผู้ใช้จริง</h2>
                <div class="space-y-4 text-slate-300">
                    <p><strong class="text-white">1. เริ่มจากความหมายและเสียงอ่าน:</strong> เลือกชื่อที่สะท้อนบุคลิกที่ต้องการ ออกเสียงร่วมกับนามสกุลแล้วไม่ติดขัด และเขียนไม่สับสนง่าย</p>
                    <p><strong class="text-white">2. ตรวจวันเกิด:</strong> ตัดชื่อที่มีอักษรกาลกิณีตามวันที่ผู้ใช้เกิด รวมถึงตรวจกรณีพุธกลางวันและพุธกลางคืนให้ถูกต้อง</p>
                    <p><strong class="text-white">3. คำนวณชื่อพร้อมนามสกุล:</strong> อย่าตัดสินจากผลรวมชื่อเดี่ยว เพราะนามสกุลทำให้ผลรวมและลำดับคู่เลขเปลี่ยนได้</p>
                    <p><strong class="text-white">4. เปรียบเทียบตัวเลือกสุดท้าย:</strong> เก็บ 3–5 ชื่อที่ชอบ แล้วเปรียบเทียบความหมาย ความไพเราะ ความง่ายในการใช้ และผลวิเคราะห์ร่วมกัน</p>
                </div>
                <div class="flex flex-col gap-3 rounded-lg border border-[#d6b45c]/40 bg-[#11162a] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="font-bold text-white">มีชื่อที่สนใจแล้วหรือยัง?</h3>
                        <p class="mt-1 text-sm leading-6 text-slate-300">นำชื่อไปตรวจร่วมกับนามสกุล วันเกิด ผลรวม และคู่เลขก่อนตัดสินใจ</p>
                    </div>
                    <a href="/name-analysis" class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-amber-400 px-5 py-2.5 font-bold text-slate-950 hover:bg-amber-300">วิเคราะห์ชื่อกับนามสกุล</a>
                </div>
            </section>

            <section class="rounded-lg border border-slate-700 p-5">
                <h2 class="text-lg font-bold text-white">อ่านและตรวจสอบต่อ</h2>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <a href="/articles/auspicious-names-by-birthday-2026" class="rounded-lg border border-slate-700 p-4 text-slate-200 hover:border-amber-400/50">หลักตั้งชื่อมงคลตามวันเกิด 2569</a>
                    <a href="/articles/micro-analysis-lucky-number-pairs" class="rounded-lg border border-slate-700 p-4 text-slate-200 hover:border-amber-400/50">ทำความเข้าใจคู่เลขในชื่อ</a>
                    <a href="/name-generator" class="rounded-lg border border-slate-700 p-4 text-slate-200 hover:border-amber-400/50">สร้างชื่อมงคลด้วย AI</a>
                    <a href="/search" class="rounded-lg border border-slate-700 p-4 text-slate-200 hover:border-amber-400/50">ค้นหารายชื่อมงคลเพิ่มเติม</a>
                </div>
            </section>
        </div>
    `,
};
