import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    ChevronLeft,
    FileText,
    HeartHandshake,
    Image as ImageIcon,
    Layers,
    Lock,
    MessageCircle,
    Phone,
    ScanLine,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';

const founderImage = '/images/about/teacher-nut-namemongkol.webp';

const services = [
    {
        title: 'วิเคราะห์ชื่อฟรี',
        description: 'ตรวจชื่อ นามสกุล วันเกิด คะแนนรวม พลังเงา และคำแนะนำเบื้องต้นก่อนตัดสินใจต่อยอด',
        href: '/name-check',
        icon: Search,
    },
    {
        title: 'วิเคราะห์ชื่อจำนวนมาก',
        description: 'เหมาะกับครอบครัว ทีมงาน หรือผู้ที่ต้องการเปรียบเทียบชื่อหลายรายการอย่างเป็นระบบ',
        href: '/name-analysis',
        icon: Layers,
    },
    {
        title: 'วิเคราะห์เบอร์มงคล',
        description: 'อ่านคู่เลข พลังรวม จุดเด่น จุดที่ควรระวัง และความเหมาะสมกับเป้าหมายชีวิต',
        href: '/phone-analysis',
        icon: Phone,
    },
    {
        title: 'วิเคราะห์ลายมือ',
        description: 'ใช้ภาพฝ่ามือเพื่ออ่านแนวโน้มเส้นหลัก พร้อมคำแนะนำเชิงภาพรวม',
        href: '/palm-analysis',
        icon: ScanLine,
    },
    {
        title: 'วิเคราะห์ออร่า',
        description: 'อ่านโทนพลังงาน สีออร่า และแนวทางเสริมสมดุลให้เหมาะกับตัวคุณ',
        href: '/aura-analysis',
        icon: Sparkles,
    },
    {
        title: 'วอลเปเปอร์มงคล',
        description: 'รวมวอลเปเปอร์ตามวันเกิด ราศี และเป้าหมาย เช่น งาน เงิน ความรัก',
        href: '/wallpapers',
        icon: ImageIcon,
    },
];

const principles = [
    {
        title: 'เลขศาสตร์',
        description: 'พิจารณาค่าตัวอักษร ผลรวมชื่อและนามสกุล เพื่อดูภาพรวมของพลังตัวเลข',
        icon: Star,
    },
    {
        title: 'ทักษาปกรณ์',
        description: 'เทียบวันเกิดกับอักษรกลุ่มเดช ศรี มนตรี และกาลกิณี เพื่อดูความกลมกลืนของชื่อ',
        icon: Calendar,
    },
    {
        title: 'อายตนะ 6',
        description: 'อ่านความสัมพันธ์ของเสียง ตัวอักษร และความรู้สึกที่ชื่อส่งต่อผู้เรียกและผู้ฟัง',
        icon: HeartHandshake,
    },
    {
        title: 'คำอธิบายด้วย AI',
        description: 'ช่วยสรุปผลให้อ่านง่าย เป็นกลาง และเชื่อมโยงข้อมูลหลายมิติให้นำไปตัดสินใจต่อได้',
        icon: ShieldCheck,
    },
];

const trustLinks = [
    { label: 'วิธีคำนวณและข้อจำกัด', href: '/methodology', icon: ShieldCheck },
    { label: 'อ่านบทความความรู้', href: '/articles', icon: BookOpen },
    { label: 'ดูรีวิวจากผู้ใช้', href: '/reviews', icon: MessageCircle },
    { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy', icon: Lock },
    { label: 'เงื่อนไขการใช้งาน', href: '/terms', icon: FileText },
];

const highlights = [
    'ศาสตร์ตัวอักษร',
    'เลขศาสตร์ประยุกต์',
    'AI ช่วยสรุปผล',
    'ออกแบบเพื่อคนไทย',
];

const storyParagraphs = [
    'NameMongkol เกิดขึ้นจากปัญหาที่หลายคนพบเหมือนกันในการตั้งชื่อและเปลี่ยนชื่อ การตั้งชื่อมงคลอาจดูเหมือนเป็นเรื่องง่าย เพียงแค่เลือกชื่อที่ฟังดูไพเราะและมีความหมายดี แต่ในความเป็นจริง การได้ชื่อที่ถูกใจและเหมาะสมตามหลักมงคลพร้อมกันนั้นไม่ใช่เรื่องง่ายเลย',
    'หลายคนเริ่มต้นจากความไม่รู้ว่า การตั้งชื่อที่ดีควรพิจารณาจากอะไรบ้าง ต้องดูแค่ความหมายของชื่อ หรือควรดูวันเกิด อักษร เลขศาสตร์ ผลรวมชื่อ และคู่เลขประกอบด้วยหรือไม่ ยิ่งเมื่อต้องการชื่อที่ทั้งอ่านไพเราะ มีความหมายดี เข้ากับนามสกุล และได้ผลรวมมงคลตามหลักศาสตร์ต่าง ๆ กระบวนการเลือกชื่อจึงกลายเป็นเรื่องที่ใช้เวลานานและซับซ้อนกว่าที่คิด',
    'บางคนต้องค้นหาชื่อเองเป็นจำนวนมาก แล้วนำแต่ละชื่อไปวิเคราะห์ทีละชื่อ บางคนต้องคำนวณผลรวม ถอดรหัสคู่เลข ตรวจความหมาย ตรวจเสียงอ่าน และเปรียบเทียบหลายรอบกว่าจะได้ชื่อที่พอใจ หรือบางครั้งอาจเลือกใช้บริการตั้งชื่อจากผู้เชี่ยวชาญ แต่ก็ต้องตัดสินใจจ่ายเงินก่อน โดยที่ยังไม่แน่ใจว่าชื่อที่ได้รับมาจะตรงใจหรือเหมาะกับตัวเองจริงหรือไม่',
    'ปัญหาที่หลายคนเจอคือ แม้จะได้ชื่อที่ดูดีหรือฟังไพเราะแล้ว เมื่อนำไปตรวจวิเคราะห์กับเครื่องมืออื่น กลับพบว่าผลรวมไม่ดี คู่เลขไม่เหมาะ หรือชื่อยังไม่สอดคล้องกับสิ่งที่ต้องการ ทำให้ต้องกลับมาเริ่มต้นค้นหาใหม่อีกครั้ง',
    'จากปัญหาเหล่านี้ จึงกลายเป็นจุดเริ่มต้นของ NameMongkol.com เว็บไซต์ที่ถูกพัฒนาขึ้นเพื่อช่วยให้การตั้งชื่อและเปลี่ยนชื่อเป็นเรื่องที่เข้าใจง่ายขึ้น ตรวจสอบได้มากขึ้น และตัดสินใจได้อย่างมั่นใจมากขึ้น โดยนำหลักการวิเคราะห์ชื่อมงคลมาจัดระบบให้ผู้ใช้งานสามารถค้นหา วิเคราะห์ และคัดกรองชื่อได้ด้วยตัวเองก่อนตัดสินใจ',
    'NameMongkol ไม่ได้ถูกสร้างขึ้นเพื่อบอกว่าชื่อใดดีที่สุดเพียงชื่อเดียว แต่ถูกออกแบบมาเพื่อเป็นเครื่องมือช่วยให้ผู้ใช้มองเห็นข้อมูลรอบด้าน ทั้งความหมายของชื่อ ความไพเราะ ผลรวมเลขศาสตร์ ความเหมาะสมของชื่อ และองค์ประกอบที่เกี่ยวข้อง เพื่อให้ทุกคนมีตัวเลือกที่ชัดเจนขึ้นก่อนนำชื่อไปใช้จริง',
    'เป้าหมายของเราคือการทำให้การตั้งชื่อมงคลไม่ใช่เรื่องยุ่งยาก ไม่ต้องเดาสุ่ม ไม่ต้องเสียเวลาค้นหาทีละชื่อโดยไม่มีแนวทาง และไม่ต้องตัดสินใจจากความรู้สึกเพียงอย่างเดียว แต่สามารถใช้ข้อมูลประกอบการเลือกชื่อได้อย่างเป็นระบบมากขึ้น',
    'เพราะเราเชื่อว่า ชื่อที่ดีควรเป็นชื่อที่ทั้งไพเราะ มีความหมายดี เหมาะกับผู้ใช้ และทำให้เจ้าของชื่อรู้สึกมั่นใจเมื่อนำไปใช้ในชีวิตจริง',
];

const storyTimeline = [
    {
        label: 'ปัญหาเดิม',
        title: 'ชื่อที่เพราะอาจยังไม่ครบ',
        description: 'ต้องดูความหมาย วันเกิด อักษร เลขศาสตร์ ผลรวมชื่อ คู่เลข และนามสกุลร่วมกัน',
        icon: Search,
    },
    {
        label: 'ขั้นตอนที่ซับซ้อน',
        title: 'วิเคราะห์ซ้ำหลายรอบ',
        description: 'หลายคนต้องค้นหาชื่อเอง คำนวณเอง และเปรียบเทียบหลายเว็บก่อนตัดสินใจ',
        icon: Layers,
    },
    {
        label: 'แนวทางของเรา',
        title: 'จัดข้อมูลให้ตรวจสอบได้',
        description: 'NameMongkol ช่วยให้เห็นเหตุผล คะแนน และองค์ประกอบสำคัญก่อนเลือกใช้ชื่อจริง',
        icon: ShieldCheck,
    },
];

export default function AboutSection() {
    return (
        <section className="site-grid-surface relative w-full min-h-screen overflow-hidden pt-24 pb-20 font-sans text-[#5a5a82] md:pt-32">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(201,147,58,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f8fc_38%,#f3f3f9_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(#1a1a3e_1px,transparent_1px),linear-gradient(90deg,#1a1a3e_1px,transparent_1px)] [background-size:44px_44px]" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-[#ddddf0] bg-white/90 px-4 py-2 text-sm font-semibold text-[#5a5a82] shadow-sm transition-colors hover:border-[#c9933a]/40 hover:text-[#1a1a3e]"
                >
                    <ChevronLeft className="h-4 w-4" />
                    กลับหน้าแรก
                </Link>

                <header className="mt-8 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                    <div className="space-y-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c87e]/70 bg-white px-4 py-2 text-sm font-bold text-[#a67828] shadow-sm">
                            <ShieldCheck className="h-4 w-4" />
                            NameMongkol Expert System
                        </div>

                        <div className="space-y-5">
                            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-[#1a1a3e] md:text-6xl">
                                เกี่ยวกับ NameMongkol
                                <span className="mt-4 block text-2xl font-bold leading-snug text-[#c9933a] md:text-4xl">
                                    วิเคราะห์ชื่อมงคลด้วยศาสตร์ไทย เลขศาสตร์ และ AI
                                </span>
                            </h1>
                            <p className="max-w-3xl text-lg leading-relaxed text-[#5a5a82] md:text-xl">
                                NameMongkol คือแพลตฟอร์มสำหรับตรวจชื่อ ตั้งชื่อ วิเคราะห์เบอร์ ลายมือ ออร่า
                                และพลังมงคล โดยออกแบบให้ผลลัพธ์อ่านง่าย โปร่งใส และมีเหตุผลประกอบ
                                เพื่อช่วยให้คุณตัดสินใจเรื่องชื่อและพลังตัวเลขได้มั่นใจขึ้น
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {highlights.map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#ddddf0] bg-white px-4 py-3 text-sm font-bold text-[#1a1a3e] shadow-sm">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-[#f6c453]">
                                        <Star className="h-4 w-4 fill-current" />
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/name-check"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 font-bold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-[#1a1a3e]"
                            >
                                วิเคราะห์ชื่อฟรี
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/reviews"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c9933a]/35 bg-white px-6 py-3 font-bold text-[#1a1a3e] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#c9933a] hover:text-[#a67828]"
                            >
                                ดูรีวิวผู้ใช้งานจริง
                                <MessageCircle size={18} />
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-3 rounded-[2rem] border border-[#e8c87e]/60" />
                        <figure className="relative overflow-hidden rounded-[1.75rem] border border-[#e8c87e] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                            <Image
                                src={founderImage}
                                alt="อาจารย์ณัฐ ผู้พัฒนา NameMongkol และผู้จัดทำเนื้อหาเรื่องชื่อมงคล"
                                width={1124}
                                height={1354}
                                priority
                                unoptimized
                                sizes="(min-width: 1024px) 48vw, 100vw"
                                className="h-auto w-full"
                            />
                            <figcaption className="border-t border-[#e8c87e]/60 bg-white/95 px-5 py-4">
                                <p className="text-sm font-bold text-[#a67828]">อาจารย์ณัฐ (NameMongkol)</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#5a5a82]">
                                    ผู้พัฒนาแนวคิดและระบบวิเคราะห์ชื่อมงคล ที่ต้องการทำให้การตั้งชื่อและเปลี่ยนชื่อเป็นเรื่องที่เข้าใจง่ายขึ้น โดยผสานหลักศาสตร์ชื่อ ความหมาย ผลรวมเลขศาสตร์ และเทคโนโลยี AI เพื่อช่วยให้ผู้ใช้มีตัวเลือกชื่อที่เหมาะสมและมั่นใจมากขึ้น
                                </p>
                            </figcaption>
                        </figure>
                    </div>
                </header>

                <section className="mt-14 grid gap-4 rounded-[1.5rem] border border-[#ddddf0] bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['6+', 'บริการหลัก'],
                        ['4', 'หลักวิเคราะห์ชื่อ'],
                        ['24/7', 'ใช้งานออนไลน์'],
                        ['PDPA', 'ให้ความสำคัญกับข้อมูล'],
                    ].map(([value, label]) => (
                        <div key={label} className="rounded-2xl border border-[#eeeeF6] bg-[#fafafd] p-5 text-center">
                            <div className="text-3xl font-extrabold text-[#0f172a]">{value}</div>
                            <div className="mt-2 text-sm font-semibold text-[#5a5a82]">{label}</div>
                        </div>
                    ))}
                </section>

                <section className="mt-20 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                    <article className="max-w-[75ch]">
                        <p className="text-sm font-extrabold text-[#c9933a]">จุดเริ่มต้นของเรา</p>
                        <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#1a1a3e] md:text-5xl">
                            จากปัญหาการเลือกชื่อ สู่ NameMongkol
                        </h2>
                        <div className="mt-7 space-y-5 text-base leading-[1.9] text-[#4f5178] md:text-lg">
                            {storyParagraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/name-check"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-[#1a1a3e]"
                            >
                                ลองวิเคราะห์ชื่อฟรี
                                <ArrowRight size={17} />
                            </Link>
                            <Link
                                href="/name-generator"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c9933a]/35 bg-white px-6 py-3 text-sm font-bold text-[#1a1a3e] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#c9933a] hover:text-[#a67828]"
                            >
                                สร้างชื่อมงคลด้วย AI
                                <Sparkles size={17} />
                            </Link>
                        </div>
                    </article>

                    <aside className="rounded-[1.5rem] border border-[#e8c87e]/50 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] lg:sticky lg:top-24">
                        <p className="text-sm font-extrabold text-[#a67828]">จากปัญหา สู่ระบบที่ใช้ได้จริง</p>
                        <div className="mt-5 space-y-5">
                            {storyTimeline.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="grid grid-cols-[2.5rem_1fr] gap-4">
                                        <div className="flex flex-col items-center">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f172a] text-[#f6c453] shadow-sm">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            {index < storyTimeline.length - 1 ? (
                                                <span className="mt-3 h-full min-h-8 w-px bg-[#e8c87e]/70" />
                                            ) : null}
                                        </div>
                                        <div className="pb-1">
                                            <p className="text-xs font-extrabold text-[#c9933a]">{item.label}</p>
                                            <h3 className="mt-1 font-bold text-[#1a1a3e]">{item.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-[#5a5a82]">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>

                    <div className="rounded-[1.5rem] border border-[#e8c87e]/40 bg-[#0f172a] p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] lg:col-span-2 md:p-8">
                        <p className="text-sm font-extrabold text-[#f6c453]">Mission</p>
                        <p className="mt-3 max-w-4xl text-lg font-semibold leading-relaxed text-slate-100 md:text-xl">
                            ภารกิจของ NameMongkol คือการทำให้การตั้งชื่อและเปลี่ยนชื่อเป็นเรื่องที่เข้าใจง่าย ตรวจสอบได้ และเข้าถึงได้มากขึ้น ด้วยระบบวิเคราะห์ชื่อที่ช่วยให้ผู้ใช้เห็นข้อมูลประกอบการตัดสินใจอย่างรอบด้าน ก่อนเลือกชื่อที่เหมาะสมกับตัวเอง คนที่รัก หรือธุรกิจของตนเอง
                        </p>
                    </div>
                </section>

                <section className="mt-20 grid gap-7 md:grid-cols-3">
                    <div className="space-y-3 md:col-span-1">
                        <p className="text-sm font-extrabold text-[#c9933a]">บริการของเรา</p>
                        <h2 className="text-2xl font-extrabold text-[#1a1a3e] md:text-3xl">เราแบ่งเครื่องมือตามเป้าหมายของผู้ใช้</h2>
                        <p className="leading-relaxed text-[#5a5a82]">
                            เลือกใช้ได้ตั้งแต่การตรวจชื่อฟรี ไปจนถึงบริการวิเคราะห์เชิงลึกสำหรับคนที่ต้องการคำอธิบายและตัวเลือกที่ละเอียดขึ้น
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <Link
                                    href={service.href}
                                    key={service.title}
                                    className="group rounded-2xl border border-[#ddddf0] bg-white p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#c9933a]/60 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]"
                                >
                                    <Icon className="mb-4 text-[#c9933a] transition-transform group-hover:scale-110" size={28} />
                                    <h3 className="text-lg font-bold text-[#1a1a3e]">{service.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#5a5a82]">{service.description}</p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#a67828]">
                                        ไปที่เครื่องมือ <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-20 rounded-[1.5rem] border border-[#ddddf0] bg-white p-6 shadow-sm md:p-10">
                    <div className="max-w-3xl space-y-4">
                        <p className="text-sm font-extrabold text-[#c9933a]">หลักการวิเคราะห์</p>
                        <h2 className="text-2xl font-extrabold text-[#1a1a3e] md:text-3xl">ข้อมูลต้องอ่านง่ายและตรวจสอบต่อได้</h2>
                        <p className="leading-relaxed text-[#5a5a82]">
                            ผลลัพธ์บนเว็บไซต์เป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่คำยืนยันชะตาชีวิตแบบตายตัว
                            เราจึงแสดงคะแนน เหตุผล และข้อควรพิจารณา เพื่อให้ผู้ใช้ประเมินต่อได้ด้วยตัวเอง
                        </p>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        {principles.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="rounded-2xl border border-[#ddddf0] bg-[#fafafd] p-5 shadow-sm">
                                    <Icon className="mb-4 text-[#c9933a]" size={26} />
                                    <h3 className="font-bold text-[#1a1a3e]">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#5a5a82]">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-20 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div className="rounded-[1.5rem] border border-[#ddddf0] bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8c87e]/60 bg-[#fff8e7] text-[#a67828]">
                            <Users size={28} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#1a1a3e]">เหมาะกับใคร</h2>
                        <ul className="mt-5 space-y-3 text-[#5a5a82]">
                            {[
                                'ผู้ปกครองที่ต้องการไอเดียตั้งชื่อลูกพร้อมเหตุผลประกอบ',
                                'ผู้ที่อยากตรวจชื่อหรือนามสกุลก่อนเปลี่ยนชื่อ',
                                'เจ้าของธุรกิจ ทีมขาย หรือผู้ใช้ที่ต้องเปรียบเทียบชื่อและเบอร์หลายรายการ',
                                'ผู้ที่ต้องการอ่านบทความประกอบก่อนเลือกใช้เครื่องมือ',
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#c9933a]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#ddddf0] bg-[#0f172a] p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] md:p-8">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8c87e]/40 bg-white/10 text-[#f6c453]">
                            <Lock size={28} />
                        </div>
                        <h2 className="text-2xl font-extrabold">ความโปร่งใสและความเป็นส่วนตัว</h2>
                        <p className="mt-4 leading-relaxed text-slate-300">
                            ข้อมูลที่ผู้ใช้กรอก เช่น ชื่อ วันเกิด เบอร์โทร หรือภาพที่อัปโหลด
                            ถูกใช้เพื่อประมวลผลบริการที่เลือก และอธิบายไว้ในนโยบายความเป็นส่วนตัวอย่างชัดเจน
                            เราแยกหน้ากฎหมาย รีวิว และบทความไว้ให้ตรวจสอบได้ง่าย
                        </p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {trustLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        href={link.href}
                                        key={link.href}
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition-colors hover:border-[#e8c87e]/60 hover:text-[#f6c453]"
                                    >
                                        <Icon size={17} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="mt-20 rounded-[1.5rem] border border-[#e8c87e]/70 bg-white p-8 text-center shadow-[0_18px_48px_rgba(201,147,58,0.13)] md:p-12">
                    <p className="text-sm font-extrabold text-[#c9933a]">เริ่มต้นได้ฟรี</p>
                    <h2 className="mt-3 text-3xl font-extrabold text-[#1a1a3e] md:text-5xl">ลองเริ่มจากชื่อของคุณได้เลย</h2>
                    <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[#5a5a82]">
                        ตรวจชื่อฟรีก่อน แล้วค่อยต่อยอดไปยังบทความ วิเคราะห์เชิงลึก หรือบริการที่เหมาะกับเป้าหมายของคุณ
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/name-check"
                            className="inline-flex items-center gap-2 rounded-full bg-[#c9933a] px-8 py-4 font-bold text-white shadow-lg shadow-[#c9933a]/20 transition-all hover:-translate-y-0.5 hover:bg-[#a67828]"
                        >
                            วิเคราะห์ชื่อมงคลฟรี
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </div>
        </section>
    );
}
