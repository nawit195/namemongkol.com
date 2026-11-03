import { boyNamesCurated } from '@/data/boyNamesCurated';
import { girlNamesCurated } from '@/data/girlNamesCurated';
import type { PublicNameRecord } from '@/lib/publicNames';

export const babyNamingTitle = 'ตั้งชื่อลูก พร้อมความหมาย เลือกชื่อลูกชาย–ลูกสาว | NameMongkol';
export const babyNamingDescription = 'ตั้งชื่อลูกจากความหมายและเสียงอ่าน เลือกชื่อลูกชาย ลูกสาว ชื่อเล่น หรือชื่อตามวันเกิด พร้อมแนวทางเลือกชื่อและเครื่องมือวิเคราะห์ร่วมกับนามสกุลฟรี';

export const babyNamingCategories = [
    { href: '/names/boys', label: 'ตั้งชื่อลูกชาย', text: 'รายชื่อพร้อมความหมายและตัวเลือกตามวันเกิด', image: '/images/names/categories/baby-boy.webp', imageAlt: 'ทารกนอนหลับในผ้าถักสีฟ้า สื่อถึงหมวดตั้งชื่อลูกชาย' },
    { href: '/names/girls', label: 'ตั้งชื่อลูกสาว', text: 'ชื่อที่อ่านง่าย พร้อมแนวคิดเลือกความหมาย', image: '/images/names/categories/baby-girl.webp', imageAlt: 'ทารกนอนหลับกับที่คาดผมดอกไม้และผ้าถักสีชมพู สื่อถึงหมวดตั้งชื่อลูกสาว' },
    { href: '/names/boys/nicknames', label: 'ชื่อเล่นลูกชาย', text: 'ไอเดียชื่อสั้นที่เรียกใช้ในครอบครัว', image: '/images/names/categories/boy-nickname.webp', imageAlt: 'เด็กชายยิ้มขณะเล่นบล็อกไม้กับตุ๊กตาหมี สื่อถึงหมวดชื่อเล่นลูกชาย' },
    { href: '/names/girls/nicknames', label: 'ชื่อเล่นลูกสาว', text: 'เลือกเสียงเรียกที่ทุกคนในบ้านชอบ', image: '/images/names/categories/girl-nickname.webp', imageAlt: 'เด็กหญิงยิ้มและกอดตุ๊กตากระต่าย สื่อถึงหมวดชื่อเล่นลูกสาว' },
    { href: '/names/boys/english-names', label: 'ชื่อภาษาอังกฤษลูกชาย', text: 'ตัวเลือกสำหรับครอบครัวที่ใช้หลายภาษา', image: '/images/names/categories/boy-english.webp', imageAlt: 'หนังสืออักษร ABC และบล็อกไม้สีฟ้า สำหรับหมวดชื่อภาษาอังกฤษลูกชาย' },
    { href: '/names/girls/english-names', label: 'ชื่อภาษาอังกฤษลูกสาว', text: 'พิจารณาความหมายและการออกเสียงร่วมกัน', image: '/images/names/categories/girl-english.webp', imageAlt: 'หนังสืออักษร ABC และบล็อกไม้สีชมพู สำหรับหมวดชื่อภาษาอังกฤษลูกสาว' },
] as const;

export const namingBirthdayLinks = [
    ['sunday', 'วันอาทิตย์'], ['monday', 'วันจันทร์'], ['tuesday', 'วันอังคาร'],
    ['wednesday', 'วันพุธกลางวัน'], ['wednesday_night', 'วันพุธกลางคืน'],
    ['thursday', 'วันพฤหัสบดี'], ['friday', 'วันศุกร์'], ['saturday', 'วันเสาร์'],
] as const;

export const babyNamingSteps = [
    { name: 'เริ่มจากความหมายที่ครอบครัวชอบ', text: 'เลือกแนวคิด เช่น ความรู้ ความสุข หรือความเมตตา แล้วจดชื่อที่สื่อความหมายนั้น โดยไม่จำเป็นต้องผูกความหมายกับเพศของลูก' },
    { name: 'ลองออกเสียงและตรวจตัวสะกด', text: 'ให้คนในบ้านลองอ่านชื่อโดยไม่บอกคำอ่านก่อน ตรวจว่ามีเสียงที่อาจฟังสับสนหรือสะกดผิดได้ง่ายหรือไม่' },
    { name: 'อ่านคู่กับนามสกุล', text: 'ลองเรียกชื่อเต็มทั้งช้าและเร็ว พิจารณาความยาว จังหวะเสียง และการใช้งานในเอกสาร หากใช้หลายภาษาให้ลองอ่านในภาษานั้นด้วย' },
    { name: 'คัดตามความเชื่อที่เลือกใช้', text: 'หากครอบครัวให้ความสำคัญกับทักษาหรือเลขศาสตร์ สามารถตรวจวันเกิดและผลรวมประกอบได้ โดยแยกการตีความตามความเชื่อออกจากความหมายทางภาษา' },
    { name: 'เปรียบเทียบก่อนเลือกใช้จริง', text: 'คัดไว้ 3–5 ชื่อ พูดคุยกับครอบครัว และตรวจชื่อร่วมกับนามสกุลในเครื่องมือฟรี ผลวิเคราะห์เป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่การรับประกันอนาคตของลูก' },
] as const;

export const babyNamingFaqs = [
    { question: 'ยังไม่รู้วันเกิดลูก เริ่มตั้งชื่อได้ไหม?', answer: 'เริ่มจากความหมาย เสียงอ่าน และความเข้ากันกับนามสกุลก่อนได้ คัดชื่อที่ชอบไว้หลายตัวเลือก แล้วค่อยตรวจทักษาตามวันเกิดจริงหากครอบครัวเลือกใช้หลักนี้ ไม่ควรใช้วันกำหนดคลอดแทนวันเกิดจริงในการสรุปผล' },
    { question: 'ตั้งชื่อลูกต้องดูเลขศาสตร์หรือไม่?', answer: 'เลขศาสตร์เป็นทางเลือกตามความเชื่อของแต่ละครอบครัว ชื่อที่ใช้ได้จริงควรมีความหมายที่ชอบ อ่านและสะกดได้ชัดเจน และเหมาะเมื่อใช้ร่วมกับนามสกุล คะแนนในเครื่องมือไม่ได้ยืนยันความสำเร็จหรือบุคลิกของลูก' },
    { question: 'ชื่อลูกชายและลูกสาวใช้ชื่อเดียวกันได้ไหม?', answer: 'ได้ หลายชื่อใช้ได้กับทุกเพศ หมวดลูกชายและลูกสาวเป็นเพียงแนวทางค้นหา ควรเลือกจากความหมาย เสียงเรียก และความพอใจของครอบครัวมากกว่าจำกัดลักษณะของลูกจากชื่อ' },
    { question: 'คำอ่านของชื่อจำเป็นต้องมีแบบเดียวไหม?', answer: 'ชื่อเฉพาะอาจอ่านได้หลายแบบตามเจตนาของผู้ตั้งชื่อ คำอ่านที่แสดงเป็นแนวทางจากข้อมูลที่ผ่านการอนุมัติแล้ว หากยังไม่มีคำอ่าน ให้ตรวจสอบกับผู้รู้ด้านภาษาและตกลงการอ่านกับครอบครัวก่อนใช้จริง' },
    { question: 'เลือกชื่อแล้ววิเคราะห์กับนามสกุลฟรีได้อย่างไร?', answer: 'กดวิเคราะห์ชื่อนี้จากตัวอย่าง ระบบจะส่งชื่อไปหน้าวิเคราะห์ชื่อฟรี จากนั้นกรอกนามสกุลและเลือกวันเกิดเพื่อดูผลตามหลักที่ระบบใช้ เริ่มใช้งานได้โดยไม่ต้องเข้าสู่ระบบ ส่วนการบันทึกผลและบริการเพิ่มเติมมีเงื่อนไขแยกต่างหาก' },
] as const;

// Legacy rows without review status use the existing editorially curated meaning.
// Never promote a pending/rejected meaning, invent a pronunciation, or re-add a hidden name.
export function selectBabyNameExamples(records: readonly PublicNameRecord[]): PublicNameRecord[] {
    const curated = new Map([...boyNamesCurated, ...girlNamesCurated].map((item) => [item.name, item.meaning]));
    const boys = new Set(boyNamesCurated.map((item) => item.name));
    const girls = new Set(girlNamesCurated.map((item) => item.name));
    const seen = new Set<string>();
    const eligible = records.flatMap((item) => {
        if (seen.has(item.name)) return [];
        const meaning = item.meaningStatus === 'approved' ? item.meaning?.trim()
            : item.meaningStatus === undefined ? curated.get(item.name) : undefined;
        if (!meaning) return [];
        seen.add(item.name);
        // Older datasets classify all names as neutral. Use only existing editorial categories,
        // and leave names present in both categories neutral rather than guessing.
        const gender = item.gender !== 'neutral' ? item.gender
            : boys.has(item.name) && !girls.has(item.name) ? 'male'
            : girls.has(item.name) && !boys.has(item.name) ? 'female' : 'neutral';
        return [{ ...item, meaning, gender } satisfies PublicNameRecord];
    });
    return ['male', 'female'].flatMap((gender) => eligible
        .filter((item) => item.gender === gender)
        .sort((a, b) => a.name.localeCompare(b.name, 'th'))
        .slice(0, 6));
}
