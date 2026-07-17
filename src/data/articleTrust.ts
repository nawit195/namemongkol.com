import type { ArticleSource } from './articles';

export interface ArticleAnswerProfile {
    directAnswer: string;
    summary: {
        recommended: string;
        avoid: string;
        nextStep: string;
    };
    sources: ArticleSource[];
    reviewedAt: string;
    clusterLinks?: { href: string; label: string }[];
}

const methodologySource: ArticleSource = {
    title: 'วิธีคำนวณและข้อจำกัดของ NameMongkol',
    url: '/methodology',
    note: 'อธิบายตารางที่ระบบใช้ ขั้นตอนคำนวณ และขอบเขตของผลลัพธ์',
    kind: 'methodology',
};

const dictionarySource: ArticleSource = {
    title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2554',
    url: 'https://dictionary.orst.go.th/',
    note: 'ใช้ตรวจสอบความหมายและรูปคำภาษาไทยเมื่อจัดทำคำอธิบายชื่อ',
    kind: 'reference',
};

const personalNameLawSource: ArticleSource = {
    title: 'พระราชบัญญัติชื่อบุคคล พ.ศ. 2505 และฉบับแก้ไขเพิ่มเติม',
    url: 'https://www.dopa.go.th/news/preview/7645',
    note: 'ข้อมูลทางการจากกรมการปกครองสำหรับตรวจข้อกำหนดด้านชื่อบุคคล',
    kind: 'primary',
};

const namingSources = [methodologySource, dictionarySource, personalNameLawSource];
const beliefSources = [methodologySource, dictionarySource];

export const articleAnswerProfiles: Record<string, ArticleAnswerProfile> = {
    'monday-girl-names-2569-no-sara': {
        directAnswer: 'ตามหลักทักษาปกรณ์ ผู้หญิงที่เกิดวันจันทร์มักหลีกเลี่ยงอักษร อ และรูปสระในชื่อ แล้วเลือกชื่อจากความหมาย เสียงอ่าน และอักษรหมวดที่ต้องการส่งเสริม บทความนี้รวบรวมตัวเลือกสำหรับปี 2569 ไว้เป็นจุดเริ่มต้น แต่ควรตรวจชื่อร่วมกับนามสกุลและข้อกำหนดทางทะเบียนก่อนใช้จริง',
        summary: {
            recommended: 'เลือกชื่อความหมายดี อ่านชัด และตรวจอักษรตามวันเกิดครบทุกตำแหน่ง',
            avoid: 'อย่าสรุปจากอักษรนำหรือผลรวมชื่ออย่างเดียว และไม่ควรตีความผลลัพธ์เป็นคำรับประกันชีวิต',
            nextStep: 'คัด 3–5 ชื่อ แล้ววิเคราะห์ร่วมกับนามสกุลในหน้า /name-check',
        },
        sources: namingSources,
        reviewedAt: '2026-07-15',
        clusterLinks: [
            { href: '/names/girls/by-birthday', label: 'ชื่อลูกสาวแยกตามวันเกิด' },
            { href: '/articles/auspicious-names-by-birthday-2026', label: 'คู่มือตั้งชื่อมงคลตามวันเกิด' },
        ],
    },
    'naming-tips-2026-year-of-horse': {
        directAnswer: 'การตั้งชื่อลูกชายปีมะเมีย 2569 ควรเริ่มจากชื่อที่ความหมายดีและใช้ได้จริง จากนั้นตรวจอักษรกาลกิณีตามวันเกิด เสียงเมื่ออ่านกับนามสกุล และผลเลขศาสตร์ร่วมกัน หน้านี้รวมรายชื่อเด็กชายพร้อมความหมาย โดยใช้ปีเกิดเป็นบริบทเสริม ไม่ใช่เกณฑ์ตัดสินเพียงอย่างเดียว',
        summary: {
            recommended: 'เริ่มจากความหมาย การออกเสียง และความเหมาะสมกับวันเกิดของลูก',
            avoid: 'ไม่เลือกเพราะคำว่า “รวย” หรือคะแนนสูงเพียงค่าเดียว',
            nextStep: 'เปรียบเทียบรายชื่อที่ชอบ แล้วตรวจชื่อกับนามสกุลจริง',
        },
        sources: namingSources,
        reviewedAt: '2026-07-15',
        clusterLinks: [
            { href: '/names/boys', label: 'ค้นหาชื่อลูกชายเพิ่มเติม' },
            { href: '/names/boys/by-birthday', label: 'ชื่อลูกชายแยกตามวันเกิด' },
        ],
    },
    'naming-baby-year-of-horse-2569': {
        directAnswer: 'พ่อแม่ที่ตั้งชื่อลูกปีมะเมีย 2569 ควรใช้ปีเกิดเป็นเพียงบริบทหนึ่ง แล้วพิจารณาเพศ วันและเวลาเกิด ความหมาย เสียงอ่าน อักษรตามทักษาปกรณ์ และความเข้ากันกับนามสกุลร่วมกัน คู่มือนี้แยกแนวทางสำหรับลูกชายและลูกสาว พร้อมทางไปยังรายชื่อเฉพาะกลุ่มเพื่อไม่ให้ต้องเลือกจากรายการซ้ำจำนวนมาก',
        summary: {
            recommended: 'ใช้คู่มือนี้ทำความเข้าใจหลัก ก่อนเปิดหน้ารายชื่อเฉพาะเพศและวันเกิด',
            avoid: 'ไม่ใช้ปีนักษัตรแทนวันเกิด ความหมาย หรือการตรวจนามสกุล',
            nextStep: 'เลือกเพศและวันเกิด แล้วคัดชื่อไปวิเคราะห์แบบรายบุคคล',
        },
        sources: namingSources,
        reviewedAt: '2026-07-15',
        clusterLinks: [
            { href: '/names/boys/by-birthday', label: 'ชื่อลูกชายตามวันเกิด' },
            { href: '/names/girls/by-birthday', label: 'ชื่อลูกสาวตามวันเกิด' },
        ],
    },
    '100-auspicious-women-names-2026': {
        directAnswer: 'ชื่อมงคลผู้หญิง 2569 ที่เหมาะใช้งานควรมีความหมายชัด อ่านและเขียนไม่ซับซ้อน สื่อบุคลิกที่เจ้าของชื่อต้องการ และตรวจร่วมกับวันเกิดกับนามสกุล รายชื่อในหน้านี้จัดตามความหมายและภาพลักษณ์แบบกว้าง ส่วนคำค้นเฉพาะวันเกิดจะเชื่อมไปยังหน้ารายวันโดยไม่ทำเนื้อหาซ้ำ',
        summary: {
            recommended: 'เลือกจากความหมาย บุคลิก เสียงอ่าน และการใช้งานจริงทั้งไทยและสากล',
            avoid: 'ไม่ใช้หน้ารวมนี้แทนการตรวจอักษรกาลกิณีเฉพาะวันเกิด',
            nextStep: 'เปิดหน้ารายวันหรือวิเคราะห์ชื่อกับนามสกุลก่อนตัดสินใจ',
        },
        sources: namingSources,
        reviewedAt: '2026-07-15',
        clusterLinks: [
            { href: '/names/girls', label: 'คลังชื่อลูกสาว' },
            { href: '/names/girls/by-birthday', label: 'ชื่อลูกสาวแยกตามวันเกิด' },
            { href: '/articles/monday-girl-names-2569-no-sara', label: 'ชื่อผู้หญิงเกิดวันจันทร์ 2569' },
        ],
    },
    'forbidden-letters-kalakini': {
        directAnswer: 'อักษรกาลกิณีคือกลุ่มอักษรที่ตำราทักษาปกรณ์จัดแตกต่างกันตามวันเกิด และผู้ที่ยึดแนวทางนี้มักหลีกเลี่ยงเมื่อตั้งชื่อ ตารางในบทความใช้เพื่อคัดกรองเบื้องต้นตามความเชื่อ ไม่ใช่ข้อพิสูจน์ว่าตัวอักษรจะกำหนดเหตุการณ์ในชีวิต และควรตรวจการสะกดทั้งชื่อกับนามสกุลก่อนใช้จริง',
        summary: {
            recommended: 'ตรวจวันเกิดให้ถูกต้องและดูตัวอักษรทุกตำแหน่งในชื่อ',
            avoid: 'ไม่ตีความคำว่า “กาลกิณี” เป็นการรับประกันผลดีหรือผลเสียในชีวิต',
            nextStep: 'ใช้ตารางคัดกรอง แล้วตรวจชื่อเต็มในเครื่องมือวิเคราะห์ชื่อ',
        },
        sources: beliefSources,
        reviewedAt: '2026-07-15',
        clusterLinks: [
            { href: '/methodology', label: 'ตารางคำนวณและข้อจำกัด' },
            { href: '/name-check', label: 'ตรวจอักษรในชื่อและนามสกุล' },
        ],
    },
    'auspicious-names-by-birthday-2026': {
        directAnswer: 'การตั้งชื่อมงคลตามวันเกิดใช้วันเกิดเพื่อดูหมวดอักษรตามหลักทักษาปกรณ์ แล้วพิจารณาความหมาย เสียงอ่าน เลขศาสตร์ และนามสกุลประกอบ หน้านี้เป็นคู่มือหลักที่อธิบายวิธีเลือกและเชื่อมไปยังรายชื่อเฉพาะเพศกับวันเกิด จึงไม่ทำรายการชื่อซ้ำกับหน้าลูกแต่ละหน้า',
        summary: {
            recommended: 'อ่านหลักการก่อน แล้วเลือกหน้ารายชื่อให้ตรงเพศและวันเกิด',
            avoid: 'ไม่คัดลอกชื่อจากวันอื่นมาใช้โดยไม่ตรวจอักษรและนามสกุล',
            nextStep: 'ไปยังหน้ารายวัน เลือกชื่อ และตรวจชื่อเต็มอีกครั้ง',
        },
        sources: namingSources,
        reviewedAt: '2026-07-15',
        clusterLinks: [
            { href: '/names/boys/by-birthday', label: 'หน้ารวมชื่อลูกชายตามวันเกิด' },
            { href: '/names/girls/by-birthday', label: 'หน้ารวมชื่อลูกสาวตามวันเกิด' },
            { href: '/search', label: 'ค้นหาชื่อจากฐานข้อมูล' },
        ],
    },
};
