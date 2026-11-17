/** Editorial facts confirmed by the site owner; these do not change calculation rules. */
export const namingSciences = [
    { name: 'เลขศาสตร์', description: 'ถอดค่าตัวอักษรเพื่ออ่านผลรวมและคู่เลขในชื่อและนามสกุลตามตารางที่ระบบใช้' },
    { name: 'ทักษาปกรณ์', description: 'ตรวจหมวดอักษร เช่น เดช ศรี มนตรี และกาลกิณี ตามวันเกิดที่เลือก' },
    { name: 'อายตนะ 6', description: 'แสดงค่าอายตนะและคำอธิบายตามศาสตร์ความเชื่อ โดยอ่านแยกจากเกรดเลขศาสตร์' },
    { name: 'นิรันดร์ศาสตร์', description: 'เป็นหลักหนึ่งที่ทีมงานใช้คัดรายชื่อพรีเมียมล่วงหน้า ส่วนเครื่องหมายในหน้าวิเคราะห์ตรวจว่าชื่ออยู่ในชุดข้อมูลอ้างอิงที่ระบบใช้อยู่หรือไม่' },
] as const;

export const namingScienceNames = namingSciences.map(science => science.name);
export const namingScienceList = namingScienceNames.join(', ');
export const namingBrandDescription = `NameMongkol ผสาน 4 ศาสตร์ ได้แก่ ${namingScienceList} ในการวิเคราะห์และคัดสรรชื่อ`;
export const premiumCurationDescription = 'ฐานรายชื่อพรีเมียมของ NameMongkol รวบรวมและคัดกรองล่วงหน้าโดยทีมงานตามหลักทั้ง 4 ศาสตร์ก่อนนำเข้าระบบ เพื่อให้ผู้ใช้เริ่มเลือกจากรายชื่อที่ผ่านการคัดสรรแล้ว';
export const premiumSearchDescription = `คัดชื่อจากฐานพรีเมียมที่ทีมงานคัดล่วงหน้าตาม${namingScienceList} พร้อมตัวเลือกวันเกิดและผลรวมชื่อ`;
export const premiumAnalysisDescription = `เลือกชื่อจากฐานพรีเมียมที่ทีมงานคัดล่วงหน้าตาม${namingScienceList} แล้วคัดตามวันเกิด นามสกุล และเป้าหมาย`;
export const personalNameCheckNote = 'การคัดรายชื่อไว้ล่วงหน้าเป็นจุดเริ่มต้นในการเลือกชื่อ ผู้ใช้ควรตรวจความเหมาะสมกับวันเกิดและนามสกุลของตนเองอีกครั้งก่อนใช้จริง ชื่อหนึ่งจึงไม่ได้เหมาะกับทุกวันเกิดหรือทุกนามสกุล';
export const namingContentUpdatedAt = '2026-11-17';

export const namingApproachFaqs = [
    { question: 'NameMongkol ใช้ศาสตร์อะไรในการวิเคราะห์และคัดสรรชื่อ?', answer: namingBrandDescription },
    { question: 'รายชื่อพรีเมียมผ่านการคัดกรอง 4 ศาสตร์อย่างไร?', answer: `${premiumCurationDescription} เป็นการคัดเลือกก่อนนำเข้าฐานข้อมูล ส่วนหน้าเครื่องมือใช้ตัวกรองตามเงื่อนไขที่ผู้ใช้เลือก ไม่ได้คำนวณทั้ง 4 ศาสตร์ใหม่ทุกครั้งที่กรองชื่อ` },
    { question: 'ฐานรายชื่อฟรีกับฐานพรีเมียมใช้เกณฑ์เดียวกันหรือไม่?', answer: 'ข้อความว่าทีมงานคัดกรองล่วงหน้าครบ 4 ศาสตร์ใช้เฉพาะฐานพรีเมียมในบริการ Pro และ Premium Analysis ฐานฟรีเป็นแหล่งค้นหาและเลือกชื่อที่แสดงข้อมูลตามเกณฑ์ของแต่ละบริการ ไม่ได้กล่าวว่าทุกชื่อในฐานฟรีผ่านการคัดครบทั้ง 4 ศาสตร์' },
    { question: 'ชื่อที่ผ่านการคัดแล้ว ยังต้องวิเคราะห์กับนามสกุลหรือไม่?', answer: personalNameCheckNote },
    { question: 'เครื่องหมายนิรันดร์ศาสตร์ในหน้าวิเคราะห์หมายถึงอะไร?', answer: `${namingSciences[3].description} การตรวจชุดข้อมูลนี้ไม่ใช่การคำนวณความสมพงศ์ระหว่างชื่อกับนามสกุลขึ้นใหม่` },
] as const;

export const namingFaqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: namingApproachFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
};
