import 'server-only';
import type { Metadata } from 'next';
import catalog from '@/data/auspiciousNicknames.json';
import type { AuspiciousNickname, VisibleNickname } from '@/types/auspiciousNickname';
import { siteUrl } from './seo';
import { NICKNAME_COLLECTION_LINKS, type NicknameCollectionKey } from './nicknameCollectionLinks';

type Entry = { id: string; reason: string };
type CollectionDefinition = {
    description: string;
    intro: string;
    guide: string;
    question: string;
    answer: string;
    entries: Entry[];
};
const entry = (id: string, reason: string): Entry => ({ id, reason });

// Editorial membership is explicit. Source meanings/grades remain unchanged.
// Category fit was checked against the supplied A/B dataset; this is not a linguistic certification.
const definitions: Record<NicknameCollectionKey, CollectionDefinition> = {
    'meaning/light': {
        description: 'ไอเดียชื่อเล่นที่สื่อถึงแสงสว่าง รุ่งอรุณ และประกาย พร้อมความหมายจากชุดข้อมูลชื่อเล่นฟรี และเหตุผลที่คัดแต่ละชื่อเข้าหมวด',
        intro: 'ถ้าชอบภาพของแสงยามเช้า ความสว่าง หรือประกายที่มองเห็น หมวดนี้รวบรวมชื่อเล่นที่มีความหมายเชื่อมโยงกับภาพเหล่านั้น บางชื่อกล่าวถึงแสงโดยตรง บางชื่อสื่อผ่านช่วงเวลาหรือปรากฏการณ์บนท้องฟ้า',
        guide: 'ลองเรียกชื่อทั้งแบบสั้นและเมื่ออยู่คู่กับชื่อจริง เลือกเสียงที่คนในครอบครัวออกเสียงได้ตรงกัน และอ่านเหตุผลการคัดหมวดประกอบความหมายเดิมก่อนตัดสินใจ',
        question: 'ชื่อในหมวดนี้ทุกชื่อแปลว่าแสงสว่างโดยตรงหรือไม่?',
        answer: 'แต่ละชื่อเชื่อมโยงกับแสงต่างกัน เช่น อรุณกล่าวถึงเวลาก่อนพระอาทิตย์ขึ้น ส่วนกลดมีความหมายหนึ่งเกี่ยวกับวงกลมมีแสง จึงใช้คำว่า “สื่อถึง” และอธิบายเหตุผลของแต่ละชื่อไว้แยกกัน',
        entries: [
            entry('nn_12ae465baf876b393eed', 'คัดจากความหมายเรื่องเวลาใกล้พระอาทิตย์ขึ้น จึงเชื่อมกับภาพแสงยามเช้า'),
            entry('nn_f2b18b78288c1de0cef8', 'ความหมายต้นฉบับกล่าวถึงความใสสว่างและแสงที่วาบแวบ'),
            entry('nn_9e7dec60341a8d74b379', 'ความหมายกล่าวถึงแสงแพรวพราว เหมาะกับคนที่ชอบภาพประกายระยิบระยับ'),
            entry('nn_cf4bc003a18fbdd55729', 'ความหมายกล่าวถึงแสงที่เห็นเคลื่อนไหว เป็นอีกภาพหนึ่งของแสงในหมวดนี้'),
            entry('nn_6464bfca17855caf9ff4', 'คัดจากคำอธิบาย “รุ่งเรือง, สว่าง” ในชุดข้อมูลเดิม'),
            entry('nn_f22ff31f90fb27ffbeda', 'ชุดข้อมูลระบุคำภาษาอังกฤษ Light และความหมายว่าแสงสว่าง'),
            entry('nn_50cbe95065374cec01f8', 'ความหมายเชื่อมกับแสงยามพระอาทิตย์ขึ้นตามคำ Sunrise ที่ระบุไว้ในต้นฉบับ'),
            entry('nn_ead5f4fca7920aafe156', 'คัดจากความหมายหนึ่งที่กล่าวถึงวงกลมมีแสง โดยยังแสดงความหมายอื่นในต้นฉบับไว้ครบ'),
        ],
    },
    'meaning/happiness': {
        description: 'รวมไอเดียชื่อเล่นที่สื่อถึงความสุข ความยินดี ความอิ่มใจ และเสียงหัวเราะ พร้อมความหมายและเหตุผลการคัดจากชุดชื่อเล่นฟรี',
        intro: 'ความสุขมีหลายภาพ ทั้งความยินดี ความสบายใจ ความเพลิดเพลิน และเสียงหัวเราะ หมวดนี้เลือกชื่อจากความหมายที่สัมพันธ์กับภาพเหล่านี้ เพื่อช่วยให้ครอบครัวเริ่มเลือกจากความรู้สึกที่ชอบ',
        guide: 'อ่านความหมายแต่ละชื่อให้ครบก่อนเลือก บางชื่อกล่าวถึงอารมณ์โดยตรง ขณะที่บางชื่อสื่อผ่านการหัวเราะ ลองเรียกจริงและเลือกชื่อที่เจ้าของชื่อกับครอบครัวรู้สึกสบายใจ',
        question: 'ชื่อที่สื่อถึงความสุขจำเป็นต้องมีเสียงหรือรูปแบบเหมือนกันไหม?',
        answer: 'หมวดนี้จัดจากความหมาย ไม่ได้กำหนดเสียงขึ้นต้นหรือจำนวนพยางค์ ครอบครัวจึงเลือกได้ทั้งชื่อสั้นและชื่อที่มีเสียงเรียกยาวขึ้นตามความชอบ',
        entries: [
            entry('nn_17d43af71285a690ee6f', 'ต้นฉบับระบุความสนุกและความยินดี จึงอยู่ในกลุ่มอารมณ์แห่งความสุข'),
            entry('nn_5ac982a98f5f7dc0c809', 'คัดจากความหมายเรื่องความชอบใจและความยินดี'),
            entry('nn_65fd780e80c801083412', 'ความหมายกล่าวถึงความปลื้มใจและสบายใจ ซึ่งเป็นภาพความสุขที่สงบ'),
            entry('nn_6887c1cf2183f768e871', 'ความเพลิดเพลิน ความยินดี และความปลื้มใจปรากฏอยู่ในคำอธิบายต้นฉบับ'),
            entry('nn_91b47ea42e041537ba5e', 'คัดจากความหมาย “น่ายินดี” และ “น่าชอบใจ” ในชุดข้อมูล'),
            entry('nn_f16300f6fa9d292cd3b4', 'ความหมายระบุความรื่นเริงและความยินดีอย่างชัดเจน'),
            entry('nn_e2a14b9b398872f7597c', 'คัดจากความสบาย ความรื่นรมย์ และความอิ่มใจที่กล่าวถึงในต้นฉบับ'),
            entry('nn_ceb0007ddd5ee02a798a', 'สื่อผ่านการหัวเราะเพราะขบขันหรือชอบใจ ตามคำอธิบายของชุดข้อมูล'),
        ],
    },
    unisex: {
        description: 'ไอเดียชื่อเล่นที่ชุดข้อมูลระบุว่าใช้ได้ทุกเพศ พร้อมความหมาย แนวคิดเลือกจากเสียงเรียก และรายชื่อฟรีที่เก็บไว้คุยกับครอบครัวได้',
        intro: 'ถ้าอยากเริ่มจากเสียงเรียกและความหมายโดยไม่แยกหมวดลูกชายหรือลูกสาว ลองดูชุดนี้ รายชื่อทั้งหมดมีการระบุ “ใช้ได้ทุกเพศ” ในข้อมูลต้นฉบับ และมีความหมายหลายแนวให้เลือก',
        guide: 'การระบุเพศเป็นหมวดค้นหาของชุดข้อมูล เลือกชื่อจากความชอบของเจ้าของชื่อและครอบครัว ไม่ใช้ชื่อเพื่อกำหนดบุคลิก ความสามารถ หรืออนาคตของเด็ก',
        question: 'คำว่าใช้ได้ทุกเพศในหน้านี้อ้างอิงจากอะไร?',
        answer: 'อ้างอิงช่องเพศในชุดข้อมูลชื่อเล่นที่เว็บไซต์นำเข้า โดยเลือกเฉพาะรายการที่ระบุว่าใช้ได้ทุกเพศ แต่ละบ้านยังสามารถเลือกเสียงเรียกและความหมายตามความพอใจของตนเองได้',
        entries: [
            entry('nn_03147952bcfe5a0c3b54', 'แนวธรรมชาติจากความหมายเรื่องใบกล้วยในต้นฉบับ'),
            entry('nn_08a6636c774f56f62707', 'แนวเสียงเรียกสั้นจากความหมายเรื่องรสหวานและความอ่อนช้อย'),
            entry('nn_09bd920742a3b6dd5e68', 'แนวธรรมชาติจากภาพกลิ่นดินหลังฝนตก'),
            entry('nn_12ae465baf876b393eed', 'แนวช่วงเวลาจากความหมายเรื่องเวลาใกล้พระอาทิตย์ขึ้น'),
            entry('nn_16681ddab56f61a4aa99', 'แนวคำยืมที่ต้นฉบับเชื่อมกับการแสดงหรือทำสิ่งหนึ่งเพียงคนเดียว'),
            entry('nn_16751926d36151c2a610', 'แนวธรรมชาติจากคำ Snow และความหมายว่าหิมะในต้นฉบับ'),
            entry('nn_18702db0761a1e92d428', 'แนวต้นไม้จากชื่อไม้พุ่มที่อธิบายไว้ในชุดข้อมูล'),
            entry('nn_1bafb6909a0837ea2326', 'แนวความหมายสั้นกระชับจากคำอธิบายว่าลมหายใจ'),
            entry('nn_28080c26418810f46723', 'แนวสิ่งของจากความหมายเรื่องแก้วหรืออัญมณีในต้นฉบับ'),
            entry('nn_3084fb4300820cb5e9ee', 'แนวการกระทำจากความหมายว่าแบ่งหรือแจก'),
            entry('nn_4dbc73a9dbe3e00ed20a', 'แนวช่วงเวลาจากภาพเช้าวันใหม่ที่ระบุในต้นฉบับ'),
            entry('nn_50cbe95065374cec01f8', 'แนวแสงยามเช้าจากคำ Sunrise ในชุดข้อมูล'),
            entry('nn_901ebf670542e44f4ebc', 'แนวธรรมชาติจากคำ Earth และความหมายเรื่องแผ่นดินหรือพื้นโลก'),
            entry('nn_a7c5cf384ba75495915c', 'แนวสีและธรรมชาติจากความหมายเรื่องสีฟ้า ท้องฟ้า และท้องทะเล'),
            entry('nn_d52905ca868ab9cc6c29', 'แนวความหมายที่ต้นฉบับระบุทั้งบัวและหัวใจ'),
            entry('nn_f16300f6fa9d292cd3b4', 'แนวอารมณ์จากความหมายเรื่องความรื่นเริงและยินดี'),
            entry('nn_e2a14b9b398872f7597c', 'แนวอารมณ์จากภาพความสบายและอิ่มใจในชุดข้อมูล'),
            entry('nn_fb4f5d1bcbc66d8442fa', 'แนวสิ่งของจากความหมายว่าทองคำในต้นฉบับ'),
            entry('nn_c79a78993d0567c2d37f', 'แนวความหมายสั้นจากคำอธิบายว่า “คิด”'),
            entry('nn_fe3ae5490b8d4d151940', 'แนวดนตรีจากความหมายเรื่องขลุ่ยเสียงทุ้มในต้นฉบับ'),
        ],
    },
};

const records = new Map((catalog.records as AuspiciousNickname[]).map(item => [item.id, item]));

function resolveCollection(link: (typeof NICKNAME_COLLECTION_LINKS)[number]) {
    const definition = definitions[link.key];
    if (definition.entries.length < 8 || new Set(definition.entries.map(item => item.id)).size !== definition.entries.length) {
        throw new Error(`Nickname collection ${link.key} requires at least eight distinct public names`);
    }
    const entries = definition.entries.map(({ id, reason }) => {
        const source = records.get(id);
        if (!source || !['A', 'B'].includes(source.grade) || !source.meaning.trim() || source.meaning.trim() === '-' || !reason.trim() || (link.key === 'unisex' && source.gender !== 'unisex')) {
            throw new Error(`Nickname collection ${link.key} needs source review`);
        }
        const item: VisibleNickname = { ...source, access: 'free' };
        return { item, reason };
    });
    return { ...link, ...definition, entries };
}

// Fail the build on invalid membership instead of publishing an incomplete or newly paid selection.
const publishedCollections = NICKNAME_COLLECTION_LINKS.map(resolveCollection);
export type NicknameCollection = (typeof publishedCollections)[number];
export function getPublishedNicknameCollections() { return publishedCollections; }
export function getNicknameCollection(key: string) { return publishedCollections.find(collection => collection.key === key) ?? null; }

export function nicknameCollectionMetadata(collection: NicknameCollection): Metadata {
    const url = siteUrl + collection.path;
    const image = `${siteUrl}/api/og?${new URLSearchParams({ variant: 'default', title: collection.title, subtitle: `${collection.entries.length} ไอเดียจากชุดชื่อเล่นฟรี` })}`;
    return {
        title: collection.title, description: collection.description,
        alternates: { canonical: url },
        openGraph: { title: collection.title, description: collection.description, url, type: 'website', locale: 'th_TH', images: [{ url: image, width: 1200, height: 630, alt: collection.title }] },
        twitter: { card: 'summary_large_image', title: collection.title, description: collection.description, images: [image] },
    };
}

export function nicknameCollectionSchema(collection: NicknameCollection) {
    const url = siteUrl + collection.path;
    return {
        '@context': 'https://schema.org',
        '@graph': [
            { '@type': 'CollectionPage', '@id': url, url, name: collection.title, description: collection.description, inLanguage: 'th-TH', mainEntity: { '@id': `${url}#names` } },
            { '@type': 'ItemList', '@id': `${url}#names`, name: collection.title, numberOfItems: collection.entries.length, itemListElement: collection.entries.map(({ item }, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'DefinedTerm', name: item.name, description: item.meaning } })) },
            { '@type': 'BreadcrumbList', itemListElement: [{ name: 'หน้าแรก', url: siteUrl }, { name: 'ชื่อเล่นมงคล', url: `${siteUrl}/nicknames` }, { name: collection.title, url }].map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.name, item: crumb.url })) },
        ],
    };
}
