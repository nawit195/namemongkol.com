import type { DayKey } from '@/types';

type NamingProfile = {
    intent: 'real' | 'nickname' | 'comparison' | 'meaning';
    gender?: 'boys' | 'girls';
    day?: DayKey;
    birthday?: boolean;
    discovery?: 'search';
};
type JourneyLink = { href: string; label: string; description: string };
export type ArticleNamingJourney = {
    title: string;
    description: string;
    steps: JourneyLink[];
    related: { href: string; label: string }[];
};

// Only editorially selected human-naming articles receive this journey. Category or
// keyword matching would also select pet, phone, wallpaper and mixed numerology posts.
export const NAMING_ARTICLE_PROFILES: Readonly<Record<string, NamingProfile>> = {
    'baby-naming-guide-2569': { intent: 'real' },
    'naming-baby-year-of-horse-2569': { intent: 'real', birthday: true },
    'auspicious-names-by-birthday-2026': { intent: 'real', birthday: true },
    'thaksa-pakorn-naming-guide': { intent: 'real', birthday: true },
    'forbidden-letters-kalakini': { intent: 'real', birthday: true },
    'naming-tips-2026-year-of-horse': { intent: 'real', gender: 'boys' },
    'boy-names-2569-50-auspicious': { intent: 'real', gender: 'boys' },
    'girl-names-2569-auspicious-modern': { intent: 'real', gender: 'girls' },
    'girl-names-2569-50-auspicious': { intent: 'real', gender: 'girls' },
    '100-auspicious-women-names-2026': { intent: 'real', gender: 'girls' },
    'monday-girl-names-2569-no-sara': { intent: 'real', gender: 'girls', day: 'monday' },
    'monday-girl-names-2569-no-vowels-meaning': { intent: 'real', gender: 'girls', day: 'monday' },
    'sunday-boy-names-2569-avoid-kalakini': { intent: 'real', gender: 'boys', day: 'sunday' },
    'boy-names-wednesday-night-2569': { intent: 'real', gender: 'boys', day: 'wednesday_night' },
    'what-is-name-analysis': { intent: 'real', discovery: 'search' },
    'free-name-analysis-numerology-guide': { intent: 'real', discovery: 'search' },
    'change-auspicious-name-checklist-numerology-thaksa-ayatana-surname': { intent: 'real', discovery: 'search' },
    'nickname-kalakini-effect': { intent: 'nickname' },
    '131-grade-a-auspicious-digital-nicknames': { intent: 'nickname' },
    'real-name-nickname-numerology': { intent: 'comparison' },
    'name-meaning-vs-numerology': { intent: 'meaning', discovery: 'search' },
};

const dayLabels: Record<DayKey, string> = {
    sunday: 'วันอาทิตย์', monday: 'วันจันทร์', tuesday: 'วันอังคาร',
    wednesday: 'วันพุธกลางวัน', wednesday_night: 'วันพุธกลางคืน',
    thursday: 'วันพฤหัสบดี', friday: 'วันศุกร์', saturday: 'วันเสาร์',
};
const meaningGuide = { href: '/articles/name-meaning-vs-numerology', label: 'ความหมายของชื่อกับคะแนนเลขศาสตร์ต่างกันอย่างไร' };
const roleGuide = { href: '/articles/real-name-nickname-numerology', label: 'ชื่อจริงกับชื่อเล่นควรใช้เลขศาสตร์อย่างไร' };

function categoryLink(profile: NamingProfile): JourneyLink {
    if (profile.discovery === 'search') return {
        href: '/search', label: 'ค้นหาตัวเลือกชื่อจริงพร้อมความหมาย',
        description: 'ถ้าต้องการชื่อทางเลือก เริ่มจากความหมายที่ชอบแล้วคัดตัวเลือกก่อนตรวจร่วมกับนามสกุล',
    };
    const genderLabel = profile.gender === 'boys' ? 'ลูกชาย' : profile.gender === 'girls' ? 'ลูกสาว' : '';
    if (profile.day) {
        // The girls/Monday category redirects to its owner article; use the
        // real mixed-gender day collection instead of a link back to that article.
        const useGender = profile.gender && !(profile.gender === 'girls' && profile.day === 'monday');
        return {
            href: `/names/${useGender ? `${profile.gender}/` : ''}by-birthday/${profile.day}`,
            label: `เลือกชื่อ${useGender ? genderLabel : 'จริง'}เกิด${dayLabels[profile.day]}`,
            description: 'ดูรายชื่อและความหมายในหมวดวันเกิดเดียวกับบทความ แล้วคัดเสียงเรียกที่ครอบครัวชอบ',
        };
    }
    return {
        href: profile.gender ? `/names/${profile.gender}` : profile.birthday ? '/names#naming-birthdays' : '/names',
        label: profile.gender ? `เลือกชื่อ${genderLabel}พร้อมความหมาย` : profile.birthday ? 'เลือกหมวดชื่อตามวันเกิด' : 'เลือกชื่อจริงพร้อมความหมาย',
        description: 'เริ่มจากรายชื่อที่ตรงแนวของบทความ เก็บตัวเลือกไว้ก่อนตัดสินใจ',
    };
}

export function getArticleNamingJourney(slug: string): ArticleNamingJourney | null {
    if (!Object.hasOwn(NAMING_ARTICLE_PROFILES, slug)) return null;
    const profile = NAMING_ARTICLE_PROFILES[slug];
    if (profile.intent === 'nickname') {
        return {
            title: 'เลือกชื่อเล่นจากความหมาย แล้วแยกตรวจชื่อจริง',
            description: 'ชื่อเล่นกับชื่อจริงใช้ข้อมูลคนละชุด ลองเลือกเสียงเรียกและความหมายก่อน โดยไม่ใช้เกรดชื่อเล่นแทนผลวิเคราะห์ชื่อจริง',
            steps: [
                { href: '/nicknames', label: 'เลือกชื่อเล่นและดูวันเกิดที่ใช้ได้', description: 'ค้นชื่อเล่นเกรด A และ B ฟรี พร้อมความหมายและตัวกรอง' },
                { href: '/nicknames/meaning/happiness', label: 'ลองชื่อเล่นแนวความสุขและความยินดี', description: 'อ่านตัวอย่างพร้อมเหตุผลที่เลือกเข้าหมวด จากชุดชื่อเล่นที่เปิดดูฟรี' },
                { href: '/name-check', label: 'วิเคราะห์ชื่อจริงร่วมกับนามสกุล', description: 'ถ้าต้องการตรวจชื่อจริง ให้ใส่ชื่อจริงแยกจากชื่อเล่นและพิจารณานามสกุลร่วมด้วย' },
            ],
            related: [roleGuide],
        };
    }
    const category = categoryLink(profile);
    const related = profile.intent === 'comparison'
        ? [{ href: '/nicknames', label: 'เลือกชื่อเล่นจากชุดข้อมูลชื่อเล่นโดยเฉพาะ' }, meaningGuide]
        : profile.intent === 'meaning' ? [roleGuide] : [meaningGuide];
    return {
        title: profile.intent === 'meaning' ? 'ใช้ความหมายกับคะแนนประกอบกันทีละขั้น' : 'จากบทความสู่ชื่อที่เลือกใช้ได้จริง',
        description: 'เลือกหมวดที่ตรงกับโจทย์ อ่านความหมายของชื่อที่สนใจ แล้วค่อยวิเคราะห์ตัวสะกดร่วมกับนามสกุล ผลเลขศาสตร์เป็นข้อมูลตามความเชื่อประกอบการพิจารณา',
        steps: [
            category,
            { href: '/meaning', label: 'อ่านความหมายและสถานะคำอ่านของชื่อจริง', description: 'ดูความหมายและที่มาของข้อมูล แยกคำแปลทางภาษาออกจากคำตีความเลขศาสตร์' },
            { href: '/name-check', label: 'วิเคราะห์ชื่อจริงและนามสกุลฟรี', description: 'นำตัวเลือกมาตรวจร่วมกับนามสกุลและวันเกิด ก่อนตัดสินใจใช้จริง' },
        ],
        related: related.filter(link => link.href !== `/articles/${slug}`),
    };
}
