export type ArticleTopicCluster = {
    title: string;
    description: string;
    links: ReadonlyArray<{
        href: string;
        label: string;
    }>;
};

export const topicClusters: ReadonlyArray<ArticleTopicCluster> = [
    {
        title: 'เริ่มต้นตั้งชื่อลูก',
        description: 'เหมาะสำหรับพ่อแม่ที่ต้องการชื่อจริง ความหมายดี และไม่ชนอักษรกาลกิณี',
        links: [
            { href: '/search', label: 'ค้นหาชื่อมงคล 5,000+ ชื่อ' },
            { href: '/articles/naming-baby-year-of-horse-2569', label: 'ตั้งชื่อลูกปีมะเมีย 2569' },
            { href: '/articles/naming-tips-2026-year-of-horse', label: 'ชื่อมงคลลูกชายปีมะเมีย' },
            { href: '/articles/100-auspicious-women-names-2026', label: '100 ชื่อมงคลลูกสาว' },
        ],
    },
    {
        title: 'เข้าใจศาสตร์ชื่อมงคล',
        description: 'อ่านพื้นฐานเลขศาสตร์ ทักษา อายตนะ และพลังเงาก่อนเลือกชื่อจริง',
        links: [
            { href: '/articles/4-pillars-of-naming', label: '4 ศาสตร์การตั้งชื่อมงคล' },
            { href: '/articles/numerology-0-9-power-guide', label: 'เลขศาสตร์ 0-9' },
            { href: '/articles/shadow-power-ayatana-6-meaning', label: 'พลังเงาและอายตนะ 6' },
        ],
    },
    {
        title: 'เช็กข้อห้ามก่อนใช้ชื่อ',
        description: 'ลดความเสี่ยงจากอักษรกาลกิณี คู่เลขเสีย และจังหวะที่ไม่เหมาะกับวันเกิด',
        links: [
            { href: '/articles/forbidden-letters-kalakini', label: 'อักษรกาลกิณีที่ควรเลี่ยง' },
            { href: '/articles/nickname-kalakini-effect', label: 'ชื่อเล่นมีอักษรกาลกิณีได้ไหม' },
            { href: '/articles/micro-analysis-lucky-number-pairs', label: 'คู่เลขมงคลและคู่เลขเสีย' },
        ],
    },
    {
        title: 'ต่อยอดเสริมดวงรายวัน',
        description: 'รวมบทความสำหรับเบอร์มือถือ สีมงคล และวอลเปเปอร์เสริมเป้าหมายชีวิต',
        links: [
            { href: '/articles/auspicious-phone-number-guide-2026', label: 'คู่มือเบอร์มงคล 2026' },
            { href: '/articles/auspicious-colors-2569-guide', label: 'สีมงคลตามวันเกิด 2569' },
            { href: '/articles/caishen-wallpaper-free-download', label: 'วอลเปเปอร์ไฉ่ซิงเอี้ย' },
        ],
    },
    {
        title: 'ตั้งชื่อสัตว์เลี้ยง',
        description: 'รวมชื่อน่ารัก มงคล และหลายภาษา สำหรับน้องหมา น้องแมว และสัตว์เลี้ยงทุกชนิด',
        links: [
            { href: '/articles/pet-names', label: '500 ชื่อสัตว์เลี้ยงน่ารักและมงคล' },
            { href: '/pet-name', label: 'ระบบค้นหาชื่อสัตว์เลี้ยงมงคล' },
            { href: '/pet-name/dog', label: 'ชื่อสุนัขมงคล' },
            { href: '/pet-name/cat', label: 'ชื่อแมวมงคล' },
        ],
    },
];
