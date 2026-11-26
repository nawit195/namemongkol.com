import type { Article } from './articles';
import { celebrityNamesNote, celebrityNamesUpdatedAt, type CelebrityNameCase } from './celebrityNames';
import { analyzeCelebrityName, getPublishedCelebrityNames } from '@/lib/celebrityNames';
import { ogImageUrl, siteUrl } from '@/lib/seo';

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
type EditorialCase = Pick<CelebrityNameCase, 'slug' | 'name' | 'surname' | 'nickname' | 'englishName' | 'source' | 'verifiedAt'>;

function createCaseStudy(entry: EditorialCase, originalDate = celebrityNamesUpdatedAt): Article {
    const result = analyzeCelebrityName(entry);
    const fullName = `${entry.name} ${entry.surname}`;
    const displayName = entry.nickname === entry.name ? fullName : `${entry.nickname} ${fullName}`;
    const title = `วิเคราะห์ชื่อ ${displayName}: แยกชื่อกับชื่อเต็มอย่างไร`;
    const checkedDate = new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeZone: 'Asia/Bangkok' }).format(new Date(`${entry.verifiedAt}T00:00:00+07:00`));
    const excerpt = `ชื่อ “${entry.name}” ได้ผลรวม ${result.nameSum} และเกรด ${result.nameGrade} ตามเกณฑ์ชื่อเดี่ยวของ NameMongkol ส่วนชื่อเต็ม “${fullName}” ได้ผลรวม ${result.fullNameSum} ต้องพิจารณานามสกุลและคู่เลขร่วมกัน กรณีศึกษานี้แสดงวิธีคำนวณ ไม่ใช่คำอธิบายความสำเร็จของบุคคล`;
    const studyHref = `/name-check?${new URLSearchParams({ name: entry.name, surname: entry.surname, day: 'sunday' })}`;
    const formatPairs = (pairs: typeof result.namePairs) => pairs.map(pair => `<tr><th scope="row">${pair.pair}</th><td>${pair.grade === 'good' ? 'ดี' : pair.grade === 'neutral' ? 'กลาง' : 'ควรพิจารณา'}</td><td>${escapeHtml(pair.title)} (คำตีความตามความเชื่อ)</td></tr>`).join('');
    return {
        id: `case-${entry.slug}`, slug: entry.slug, title, excerpt,
        metaTitle: `วิเคราะห์ชื่อ ${displayName} พร้อมผังตัวเลข`,
        metaDescription: `ดูวิธีคำนวณชื่อ ${entry.name} ผลรวม ${result.nameSum} เกรด ${result.nameGrade} พร้อมแยกนามสกุล ผลรวมชื่อเต็ม ${result.fullNameSum} และแหล่งยืนยันตัวบุคคล`,
        coverImage: ogImageUrl({ variant: 'celebrity', title: fullName, subtitle: `ผลรวมชื่อ ${result.nameSum} · เกรด ${result.nameGrade} เฉพาะชื่อ · ชื่อเต็ม ${result.fullNameSum}`, tag: 'ผลคำนวณตามเกณฑ์ NameMongkol' }),
        coverImageAlt: `ผังสรุปผลรวมชื่อ ${entry.name} ${result.nameSum} และชื่อเต็ม ${result.fullNameSum} ตามเกณฑ์ NameMongkol`,
        date: originalDate, dateModified: celebrityNamesUpdatedAt, reviewedAt: entry.verifiedAt,
        author: 'ทีมงาน NameMongkol', category: 'วิเคราะห์ชื่อคนดัง',
        keywords: [`วิเคราะห์ชื่อ ${fullName}`, `ผลรวมชื่อ ${entry.name}`, 'ชื่อคนดัง', 'เกรดชื่อเดี่ยว'],
        relatedSlugs: ['real-name-nickname-numerology', 'name-meaning-vs-numerology'],
        sources: [
            { ...entry.source, kind: 'primary', note: 'ใช้ยืนยันตัวสะกด ชื่อเล่น และตัวบุคคลเท่านั้น ไม่ใช่แหล่งรับรองผลเลขศาสตร์หรือบริการของเว็บ' },
            { title: 'วิธีคำนวณและข้อจำกัดของ NameMongkol', url: `${siteUrl}/methodology`, kind: 'methodology', note: 'เกณฑ์ผลรวม คู่เลข และทักษาที่เครื่องมือของเว็บไซต์ใช้' },
        ],
        toc: [
            { id: 'given-name', title: 'ผังตัวอักษรและผลรวมชื่อ', level: 2 },
            { id: 'number-pairs', title: 'คู่เลขในชื่อและเกณฑ์ให้เกรด', level: 2 },
            { id: 'full-name', title: 'แยกชื่อ นามสกุล และชื่อเต็ม', level: 2 },
            { id: 'reading-and-meaning', title: 'คำอ่าน ความหมาย และทักษา', level: 2 },
            { id: 'case-sources', title: 'แหล่งข้อมูลและวันที่ตรวจ', level: 2 },
        ],
        faqItems: [
            { question: `เกรด ${result.nameGrade} ของชื่อ ${entry.name} ใช้แทนเกรดชื่อเต็มได้ไหม?`, answer: `ไม่ได้ เกรดนี้คำนวณจากข้อความ “${entry.name}” เท่านั้น เมื่อเพิ่มนามสกุล ผลรวมและคู่เลขที่นำมาพิจารณาเปลี่ยนไป ต้องตรวจชื่อเต็มแยกอีกครั้ง` },
            { question: 'วันเกิดที่ชื่อนี้ผ่านเกณฑ์ คือวันเกิดจริงของบุคคลหรือไม่?', answer: 'ไม่ใช่ เป็นการลองตรวจชื่อเดี่ยวกับทักษาของแต่ละวันตามเกณฑ์ของเว็บ กรณีศึกษานี้ไม่ได้ใช้ข้อมูลเวลาเกิดของบุคคลเพื่อวิเคราะห์ดวงเฉพาะตัว' },
            { question: 'กรณีศึกษานี้แสดงว่าบุคคลดังกล่าวใช้บริการ NameMongkol หรือไม่?', answer: 'ไม่แสดงถึงการใช้บริการหรือรับรองบริการ เป็นการยกชื่อที่เปิดเผยต่อสาธารณะมาอธิบายวิธีคำนวณ และไม่ยืนยันว่าชื่อเป็นสาเหตุของความสำเร็จ' },
        ],
        content: `<div class="celebrity-study">
          <p class="celebrity-study-note">${celebrityNamesNote}</p>
          <section id="given-name"><h2>ผังตัวอักษร: ${entry.name} ได้ผลรวม ${result.nameSum} อย่างไร</h2>
            <p>เริ่มจากตัวสะกด “${entry.name}” ตามชื่อที่แหล่งข้อมูลระบุ คำนวณเฉพาะอักษรไทย รวมสระและวรรณยุกต์ที่มีค่าในตารางของระบบ โดยไม่นำชื่อเล่นหรือชื่อภาษาอังกฤษมารวม</p>
            <div class="celebrity-character-flow" aria-label="ค่าของตัวอักษรแต่ละตัว">${result.characters.map(item => `<span class="celebrity-character"><strong>${escapeHtml(item.character)}</strong><span>${item.value}</span></span>`).join('')}</div>
            <p><strong>${result.characters.map(item => item.value).join(' + ')} = ${result.nameSum}</strong></p>
            <p>ตัวเลขนี้มาจากการบวกค่าตัวอักษรตามตารางของเว็บ ไม่ใช่ความหมายทางภาษาของชื่อ ดู <a href="/methodology">ตารางและวิธีวิเคราะห์</a> เพื่อตรวจขั้นตอนซ้ำ</p>
          </section>
          <section id="number-pairs"><h2>คู่เลขในชื่อและเกณฑ์ให้เกรด ${result.nameGrade}</h2>
            <p>ระบบอ่านค่าตัวเลขที่เรียงติดกันทีละคู่ ชื่อ “${entry.name}” มี ${result.namePairs.length} คู่ เกณฑ์ชื่อเดี่ยว A+ ต้องมีผลรวมในชุดที่เว็บกำหนดและคู่เลขอยู่ในกลุ่มดีทุกคู่ สีหรือเกรดเป็นการจัดกลุ่มตามความเชื่อของระบบ ไม่ใช่การประเมินคุณค่าของบุคคล</p>
            <table><caption>คู่เลขของชื่อ ${entry.name} ตามลำดับตัวอักษร</caption><thead><tr><th scope="col">คู่เลข</th><th scope="col">กลุ่ม</th><th scope="col">หัวข้อคำตีความ</th></tr></thead><tbody>${formatPairs(result.namePairs)}</tbody></table>
          </section>
          <section id="full-name"><h2>ชื่อ นามสกุล และชื่อเต็ม ให้ผลต่างกัน</h2>
            <table><caption>แยกข้อความที่ใช้คำนวณให้ชัดเจน</caption><thead><tr><th scope="col">ส่วนที่คำนวณ</th><th scope="col">ข้อความ</th><th scope="col">ผลรวม</th></tr></thead><tbody>
              <tr><th scope="row">ชื่อเดี่ยว</th><td>${entry.name}</td><td>${result.nameSum}</td></tr>
              <tr><th scope="row">นามสกุล</th><td>${entry.surname}</td><td>${result.surnameSum}</td></tr>
              <tr><th scope="row">ชื่อเต็ม</th><td>${fullName}</td><td>${result.nameSum} + ${result.surnameSum} = ${result.fullNameSum}</td></tr>
            </tbody></table>
            <p>เกรดชื่อเดี่ยวคือ <strong>${result.nameGrade}</strong> ส่วนเกรดชื่อเต็มตามผลรวมและคู่เลขร่วมกันคือ <strong>${result.fullNameGrade}</strong> ระบบใช้คู่เลขในชื่อและคู่เลขในนามสกุลร่วมกัน โดยไม่สร้างคู่ใหม่ข้ามรอยต่อชื่อกับนามสกุล เกรดเหล่านี้เป็นผลของข้อความที่คำนวณ ไม่ใช่คำพยากรณ์ชีวิตของ ${entry.nickname}</p>
            <details><summary>ดูคู่เลขของนามสกุล ${entry.surname}</summary><table><thead><tr><th scope="col">คู่เลข</th><th scope="col">กลุ่ม</th><th scope="col">หัวข้อคำตีความ</th></tr></thead><tbody>${formatPairs(result.surnamePairs)}</tbody></table></details>
            <p><a href="${escapeHtml(studyHref)}">ตรวจตัวอย่าง ${fullName} ในเครื่องมือ (สมมติวันอาทิตย์)</a> ตัวอย่างนี้ใช้วันอาทิตย์เป็นเงื่อนไขสมมติเพื่อเปิดเครื่องมือ ไม่ใช่วันเกิดจริงของบุคคล สามารถเปลี่ยนวันตามเงื่อนไขที่ต้องการทดลองได้</p>
          </section>
          <section id="reading-and-meaning"><h2>คำอ่าน ความหมาย และวันเกิดที่ชื่อผ่านเกณฑ์</h2>
            <p><strong>คำอ่านและความหมาย:</strong> ยังไม่ยืนยันคำอ่านเฉพาะบุคคลและรากศัพท์ของชื่อนี้ จึงยังไม่ใช้คำอ่านหรือความหมายจากไฟล์คัดกรองเป็นข้อเท็จจริง สามารถอ่าน <a href="/articles/name-meaning-vs-numerology">ความแตกต่างระหว่างความหมายชื่อกับเลขศาสตร์</a> ประกอบได้</p>
            <p><strong>ชื่อภาษาอังกฤษ:</strong> ${entry.englishName ? `${escapeHtml(entry.englishName)} ตามแหล่งประวัติที่อ้างอิง ระบุเพื่ออ้างอิงตัวบุคคล ไม่นำมาคำนวณร่วมกับชื่อไทย` : 'ยังไม่ยืนยันการสะกดจากแหล่งข้อมูลที่อ้างอิง จึงยังไม่แสดงชื่อภาษาอังกฤษ'}</p>
            <p><strong>วันเกิดที่ชื่อเดี่ยวผ่านเกณฑ์ทักษาของเว็บ:</strong> ${result.suitableDays.length ? result.suitableDays.join(', ') : 'ไม่มีวันที่ผ่านเงื่อนไขนี้'} รายการนี้มาจากการลองชื่อกับแต่ละวัน ไม่ใช่วันเกิดจริงของเจ้าของชื่อ และไม่ใช่ผลวิเคราะห์ชื่อเต็มตามเวลาเกิด</p>
          </section>
          <section id="case-sources"><h2>แหล่งข้อมูลและวันที่ตรวจ</h2>
            <ul><li><a href="${escapeHtml(entry.source.url)}" rel="noopener noreferrer">${escapeHtml(entry.source.title)}</a>: ตรวจข้อมูลชื่อและตัวบุคคลที่แหล่งนี้ระบุ แหล่งนี้ไม่ได้รับรองผลวิเคราะห์หรือบริการของ NameMongkol</li><li><a href="/methodology">วิธีคำนวณของ NameMongkol</a>: เกณฑ์เลขศาสตร์ คู่เลข และทักษาของเว็บ</li></ul>
            <p>จัดทำและตรวจตัวสะกดกับแหล่งข้อมูลโดย <a href="/about">ทีมงาน NameMongkol</a> · ตรวจแหล่งข้อมูลและคำนวณวันที่ <time datetime="${entry.verifiedAt}">${checkedDate}</time></p>
            <p>กรณีศึกษานี้เลือกจากชุดชื่อที่คัดไว้ จึงไม่ใช่สถิติของคนดังทั้งหมด และไม่ใช้ยืนยันความสัมพันธ์ระหว่างเกรดชื่อกับความสำเร็จ</p>
          </section>
          <section class="celebrity-study-next"><h2>ตรวจผลคำนวณด้วยเกณฑ์เดียวกัน</h2><p>เริ่มจากตัวสะกดที่ต้องการทดลอง แล้วเลือกนามสกุลและเงื่อนไขวันเกิดในฟอร์ม ผลที่ได้ใช้กับข้อความที่กรอกตามเกณฑ์ของเว็บ</p><div class="celebrity-study-actions"><a href="/name-check">เปิดเครื่องมือวิเคราะห์ชื่อ →</a><a href="/methodology">อ่านวิธีคำนวณและข้อจำกัด →</a></div><p><a href="/celebrity-names">กรณีศึกษาวิธีคำนวณชื่อ</a> · <a href="/celebrity-names/editorial-policy">แนวทางข้อมูลและภาพประกอบ</a> · <a href="/celebrity-names/editorial-policy#requests">ขอแก้ไขหรือถอดข้อมูล</a></p></section>
        </div>`,
    };
}

export const celebrityNameArticles = getPublishedCelebrityNames().map(entry => createCaseStudy(entry));

/** Preserve existing URLs, but replace unverified success claims and hand-written scores. */
export const revisedCelebrityArticles: Article[] = [
    createCaseStudy({
        slug: 'case-study-khemanit-name-analysis', name: 'เขมนิจ', surname: 'จามิกรณ์', nickname: 'แพนเค้ก', englishName: '',
        source: { title: 'รายการเปิดโลกเปิดเล่ม: แพนเค้ก เขมนิจ จามิกรณ์ จาก Thai PBS', url: 'https://www.thaipbs.or.th/program/OpenBook/episodes/33557' }, verifiedAt: celebrityNamesUpdatedAt,
    }, '2026-01-31'),
    createCaseStudy({
        slug: 'supajee-suthampun-numerology-a-plus', name: 'ศุภจี', surname: 'สุธรรมพันธุ์', nickname: 'ศุภจี', englishName: 'Suphajee Suthumpun',
        source: { title: 'ประวัติ Suphajee Suthumpun จาก Sasin School of Management', url: 'https://www.sasin.edu/team/profile/suphajee-suthumpun' }, verifiedAt: celebrityNamesUpdatedAt,
    }, '2026-02-12'),
];
