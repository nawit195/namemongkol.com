/** Only individually checked public identities belong here. The workbook is a candidate list. */
export type CelebrityOccupation = 'นักแสดง' | 'นักร้อง';
export interface CelebrityPortrait {
    src: string;
    alt: string;
    width: number;
    height: number;
    credit: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
    objectPosition: string;
}

export interface CelebrityNameCase {
    slug: string;
    name: string;
    surname: string;
    nickname: string;
    englishName: string;
    occupations: readonly CelebrityOccupation[];
    occupationSources: readonly { title: string; url: string }[];
    portrait: CelebrityPortrait;
    source: { title: string; url: string };
    verifiedAt: string;
    workbookSum: number;
    status: 'published' | 'draft';
}

export const celebrityNamesUpdatedAt = '2026-11-26';
export const celebrityNamesNote = 'กรณีศึกษาเพื่ออธิบายวิธีคำนวณชื่อด้วยเกณฑ์เลขศาสตร์ตามความเชื่อของ NameMongkol เกรดใช้กับข้อความที่ระบุ ไม่ได้แสดงถึงการรับรองบริการโดยบุคคลที่กล่าวถึง และไม่รับประกันผลลัพธ์ชีวิต';

export const celebrityNameCases: readonly CelebrityNameCase[] = [
    {
        slug: 'nanon-korapat-name-analysis',
        name: 'กรภัทร์', surname: 'เกิดพันธุ์', nickname: 'นนน', englishName: 'Korapat Kirdpan',
        occupations: ['นักแสดง', 'นักร้อง'],
        occupationSources: [{ title: 'Make You Mine โดย NANON จาก RISER MUSIC', url: 'https://www.youtube.com/watch?v=-6gK50tr0Jg' }],
        portrait: {
            src: '/images/celebrity-names/nanon-korapat.png', alt: 'นนน กรภัทร์ เกิดพันธุ์ ในงานแถลงข่าว GMMTV ปี 2567', width: 574, height: 838,
            credit: 'THHeadline', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nanon_Korapat_Kirdpan_at_GMMTV%27s_2024_Up%26Above_Part_2_event,_23_April_2024.png',
            license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/', objectPosition: '50% 10%',
        },
        source: { title: 'ประวัติ NANON: Korapat Kirdpan จาก GMMTV', url: 'https://www.gmm-tv.com/artists/view/96/' },
        verifiedAt: celebrityNamesUpdatedAt, workbookSum: 24, status: 'published',
    },
    {
        slug: 'love-pattranite-name-analysis',
        name: 'ภัทรานิษฐ์', surname: 'ลิ้มปติยากร', nickname: 'เลิฟ', englishName: 'Pattranite Limpatiyakorn',
        occupations: ['นักแสดง'],
        occupationSources: [{ title: 'School Rangers ร่วมกับนักแสดง 23.5 องศาที่โลกเอียง จาก GMMTV', url: 'https://www.gmm-tv.com/contents/playlist/dMjr9/?v=8jbEE' }],
        portrait: {
            src: '/images/celebrity-names/love-pattranite.png', alt: 'เลิฟ ภัทรานิษฐ์ ลิ้มปติยากร ในงานแถลงข่าว GMMTV เดือนพฤศจิกายน 2567', width: 1024, height: 1380,
            credit: 'THHeadline', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pattranite_2024-11-27.png',
            license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/', objectPosition: '50% 12%',
        },
        source: { title: 'ประวัติ LOVE: Pattranite Limpatiyakorn จาก GMMTV', url: 'https://www.gmm-tv.com/artists/view/76/' },
        verifiedAt: celebrityNamesUpdatedAt, workbookSum: 42, status: 'published',
    },
    {
        slug: 'fourth-nattawat-name-analysis',
        name: 'ณัฐวรรธน์', surname: 'จิโรชน์ธิกุล', nickname: 'โฟร์ท', englishName: 'Nattawat Jirochtikul',
        occupations: ['นักแสดง', 'นักร้อง'],
        occupationSources: [{ title: 'Heavenly โดย GEMINI, FOURTH จาก GMMTV RECORDS', url: 'https://www.youtube.com/watch?v=6DB7wFVaebs' }],
        portrait: {
            src: '/images/celebrity-names/fourth-nattawat.png', alt: 'โฟร์ท ณัฐวรรธน์ จิโรชน์ธิกุล ในงานแถลงข่าว GMMTV', width: 488, height: 549,
            credit: 'THHeadline', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fourth%40_GMMTV_2024.png',
            license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/', objectPosition: '50% 12%',
        },
        source: { title: 'ประวัติ FOURTH: Nattawat Jirochtikul จาก GMMTV', url: 'https://www.gmm-tv.com/artists/view/142/1000' },
        verifiedAt: celebrityNamesUpdatedAt, workbookSum: 50, status: 'published',
    },
];
