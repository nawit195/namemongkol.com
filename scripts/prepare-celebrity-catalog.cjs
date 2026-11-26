/* Offline preparation only. Research snapshots and the private workbook stay in ignored scratch. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const publicationHolds = require('../src/data/celebrityPublicationHolds.json');

const inputDirectory = path.resolve(process.argv[2] || 'scratch/celebrity-name-import/2026-11-26');
const read = file => JSON.parse(fs.readFileSync(path.join(inputDirectory, file), 'utf8'));
const input = read('candidates.json');
assert.equal(input.sha256, '30fe69dc222adc2e09ea65a11d41de88aecae8fd08110f316ad86ddb55c9b42f');
assert.equal(input.rows.length, 156);
const batches = read('research/wiki-pages.json');
const entities = read('research/entities.json');
const portraits = read('research/portraits.json');
const photoReviews = read('research/photo-evidence.json');
const english = read('research/english-pages.json').query.pages;
const checkedAt = '2026-11-26';
const normalize = text => text.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
const source = (title, url) => ({ title, url });

// Explicit exceptions: never identify an AF/The Star contestant with a season page or show image.
const overrides = {
    'ธณวิน ธีรโพสุการ': { nickname: 'หลุยส์', occupations: ['นักแสดง', 'นักร้อง'], source: source('LOUIS: Thanawin Teeraphosukarn — GMMTV', 'https://www.gmm-tv.com/artists/view/75/'), roleSource: source('Check Me — เพลงประกอบ Only Boo โดยหลุยส์ ธณวิน (GMMTV)', 'https://www.gmm-tv.com/contents/Vkj1j/') },
    'ธนัท ด่านเจษฎา': { nickname: 'นัท', occupations: ['นักแสดง', 'นักร้อง'], entityId: 'Q124255240', source: source('NUT: Thanat Danjesda — GMMTV', 'https://www.gmm-tv.com/artists/view/100/') },
    'พชร ศิลปสุนทร': { nickname: 'เซิร์ฟ', occupations: ['นักแสดง', 'นักร้อง'], entityId: 'Q136351568', source: source('SURF: Patchara Silapasoonthorn — GMMTV', 'https://www.gmm-tv.com/artists/view/140/'), roleSource: source('เพื่อนข้างๆ (Friend Next Door) โดย SURF, JAVA — GMMTV', 'https://www.gmm-tv.com/contents/playlist/g9ngJ/?v=8DOJk') },
    'ณภัทร พัชรชวลิต': { nickname: 'อั๋น', occupations: ['นักแสดง'], entityId: 'Q110798802', source: source('AUN: Napat Patcharachavalit — GMMTV', 'https://www.gmm-tv.com/artists/view/9/') },
    'วรินทร จตุรภุช': { nickname: 'สต๊อป', occupations: ['นักร้อง'], source: source('ประวัติสต๊อป วรินทร — Sanook', 'https://www.sanook.com/campus/1370662/'), excludeEntity: true },
    'นิธินันท์ ฉายัษเฐียร': { nickname: 'นิวตี้', occupations: ['นักร้อง'], source: source('นิวตี้ นิธินันท์ — MONOMAX', 'https://monomaxsports.tv/star/2084.html'), excludeEntity: true },
    'จันษกร กิตติวัฒนากร': { nickname: 'หงหยก', occupations: ['นักร้อง', 'นักแสดง'], source: source('หงหยก AF10 จัดงานแฟนมีต — ดาราเดลี่', 'https://www.daradaily.com/news/125158/read'), excludeEntity: true },
    'กรธัช สมบุญธรรม': { nickname: 'บีม', occupations: ['นักร้อง'], source: source('สัมภาษณ์บีม กรธัช AF10 — ผู้จัดการออนไลน์', 'https://mgronline.com/motoring/detail/9560000130407'), excludeEntity: true },
    'คณาคำ อภิรดี': { nickname: 'บี๋', occupations: ['นักร้อง', 'นักแต่งเพลง'], excludeEntity: true },
    'วิทวัจน์ สุนทรวิเนตร์': { nickname: 'วีที', occupations: ['พิธีกร'] },
    'นรอรรถ จันทร์กล่ำ': { occupations: ['นักดนตรี', 'วาทยกร'] },
    'นิรมล เมธีสุวกุล': { nickname: 'นก', occupations: ['พิธีกร', 'ผู้ผลิตรายการ'] },
    'ลุลา': { nickname: 'ลุลา', occupations: ['นักร้อง'] },
    'เบญจมินทร์': { nickname: 'เบญจมินทร์', occupations: ['นักร้อง', 'นักแต่งเพลง'] },
    'ลำไย ไหทองคำ': { nickname: 'ลำไย', occupations: ['นักร้อง'] },
    'นิ่ม สีฟ้า': { nickname: 'นิ่ม สีฟ้า', occupations: ['นักแต่งเพลง'] },
    'ลิณธิภรณ์ วริณวัชรโรจน์': { occupations: ['นักการเมือง'] },
    'วรินทร ผดุงวิถี': { nickname: 'อ้วนตาน', occupations: ['นางงาม'] },
    'ปวิชญา วลีสุขสันต์': { nickname: 'อะตอม', occupations: ['นายทหารล่าม'], confirmed: true },
    'ทักษิณ แจ่มผล': { occupations: ['นักแสดง', 'ผู้กำกับ'], confirmed: true },
    'ชัชชญา ทวินันท์': { nickname: 'ธัญญ่า', occupations: ['นักร้อง', 'นักแสดง'], confirmed: true },
    'อัญษนา บุรานันท์': { nickname: 'หมวย', occupations: ['นักแสดง', 'นักเดินแบบ'] },
    'อำนาจ สอนอิ่มสาตร์': { nickname: 'ดุ่ย ณ บางน้อย', occupations: ['นักพากย์', 'พิธีกร'] },
    'รัชย์ณมนทร์ รัชย์จิราธรรม': { nickname: 'เกรซ' },
    'รภัทร แก้วมีชัย': { nickname: 'มิ้น' },
    'ภคมน บุณยะภูติ': { nickname: 'ลูกโป่ง' },
    'ปริษา ทนาวิวัฒน์': { nickname: 'เดียร์' },
    'ธชย ประทุมวรรณ': { nickname: 'เก่ง' },
    'ณฐมน ภูวะปัจฉิม': { nickname: 'ปอ' },
    'ไชย ขุนศรีรักษา': { nickname: 'ทองขาว' },
    'ณธัช ศิริพงษ์ธร': { nickname: 'ฟลุ้ค' },
    'กัญญา ลีนุตพงษ์': { nickname: 'ผึ้ง' },
    'ณธษา เวชประสิทธิ์': { nickname: 'ไอซ์' },
};

const occupationIds = {
    นักแสดง: ['Q33999', 'Q10800557', 'Q10798782', 'Q970153'], นักร้อง: ['Q177220'],
    พิธีกร: ['Q947873', 'Q13590141', 'Q2722764'], นักเดินแบบ: ['Q4610556'],
    นักดนตรี: ['Q639669'], นักแต่งเพลง: ['Q753110'], นักเขียน: ['Q36180'],
    ผู้กำกับ: ['Q2526255', 'Q3455803'], ดีเจ: ['Q130857', 'Q3922505'],
    นักเขียนบท: ['Q28389'], แร็ปเปอร์: ['Q2252262'], นักพากย์: ['Q2405480'],
};

function pageFor(title) {
    for (const batch of batches) {
        if (!batch.requested.some(value => normalize(value) === normalize(title))) continue;
        let resolved = title;
        for (let depth = 0; depth < 8; depth++) {
            const redirect = [...batch.normalized, ...batch.redirects].find(item => normalize(item.from) === normalize(resolved));
            if (!redirect) break;
            resolved = redirect.to;
        }
        return batch.pages.find(page => !page.missing && normalize(page.title) === normalize(resolved));
    }
}

const withheldIdentity = new Set(publicationHolds.unresolvedIdentity);
const withheldAgeReview = new Set(publicationHolds.ageReview);
const groups = input.rows.flatMap(row => {
    const data = row.sourceData;
    const name = normalize(data['รายชื่อ']);
    const surnames = String(data['นามสกุล'] || '').split(/\r?\n/).map(normalize).filter(Boolean);
    const people = (surnames.length ? surnames : ['']).flatMap((surname, index) => {
        const id = `person-${row.sourceRow}-${index + 1}`;
        if (withheldIdentity.has(id) || withheldAgeReview.has(id)) return [];
        const fullName = [name, surname].filter(Boolean).join(' ');
        const override = overrides[fullName] || {};
        const page = pageFor(fullName);
        const entityId = override.entityId || page?.pageprops?.wikibase_item;
        const entity = entities.find(item => item.id === entityId);
        const intro = (page?.extract || '').split('\n')[0];
        const occupationIntro = intro.slice(0, 500).split(/(?:เป็นบุตร|เป็นลูก|มีพี่|มีน้อง)/)[0];
        const occupations = override.occupations || Object.entries(occupationIds)
            .filter(([role, ids]) => ids.some(id => entity?.occupations.includes(id)) || occupationIntro.includes(role))
            .map(([role]) => role).slice(0, 3);
        const nickname = normalize(override.nickname ?? intro.match(/ชื่อเล่น\s*(?:ว่า|คือ)?\s*[:：]?\s*([^\s(),;]+)/)?.[1] ?? name);
        const matched = !override.unconfirmed && Boolean(override.source || (page && (override.confirmed || entity?.types.includes('Q5') || fullName === 'คณาคำ อภิรดี')));
        const candidatePortrait = matched && !override.excludeEntity ? portraits.find(item => item.id === entityId)?.portrait || null : null;
        const photoReview = candidatePortrait ? photoReviews.find(review => review.src === candidatePortrait.src) : null;
        const portrait = photoReview && photoReview.status !== 'withheld' ? candidatePortrait : null;
        const reference = matched ? override.source || source(`ประวัติ ${page.title} — วิกิพีเดีย`, `https://th.wikipedia.org/w/index.php?curid=${page.pageid}&oldid=${page.lastrevid}`) : null;
        const englishPage = entityId ? english.find(item => !item.missing && item.pageprops?.wikibase_item === entityId) : undefined;
        const roleSource = override.roleSource || (override.source && englishPage ? source(`ประวัติ ${englishPage.title} — Wikipedia`, `https://en.wikipedia.org/wiki/${encodeURIComponent(englishPage.title.replace(/ /g, '_'))}`) : reference);
        assert(matched, `Unreviewed identity must be withheld: ${id}`);
        return [{
            id, surname, nickname: nickname || name,
            referenceName: !override.source && page ? page.title : fullName,
            occupations: matched ? occupations : [], portrait,
            portraitStatus: portrait ? 'available' : candidatePortrait ? 'awaiting-evidence' : 'not-available',
            ...(portrait ? { portraitEvidence: { status: photoReview.status, checkedAt: photoReview.checkedAt, revisionId: photoReview.revisionId, evidenceUrl: photoReview.evidenceUrl, title: photoReview.fileTitle.replace(/^File:/, '') } } : {}),
            source: reference, ...(roleSource && roleSource.url !== reference?.url ? { roleSource } : {}),
            referenceStatus: matched ? 'matched' : 'unconfirmed', ...(matched ? { checkedAt } : {}),
        }];
    });
    return people.length ? [{ sourceRow: row.sourceRow, name, workbookSum: data['ผลรวมชื่อ'], people }] : [];
});
assert.equal(new Set(groups.map(group => group.name)).size, 153);
assert.equal(groups.flatMap(group => group.people).length, 181);
const destination = path.resolve('src/data/celebrityCatalog.json');
fs.writeFileSync(destination, `${JSON.stringify({ updatedAt: checkedAt, sourceSha256: input.sha256, inputSummary: { nameCount: 156, personOptions: 185, withheldIdentityOptions: 1, withheldAgeReviewOptions: 3 }, groups }, null, 2)}\n`);
const aliases = { '/images/celebrity-names/catalog/q25542310.png': '/images/celebrity-names/nanon-korapat.png', '/images/celebrity-names/catalog/q110525808.png': '/images/celebrity-names/love-pattranite.png', '/images/celebrity-names/catalog/q115468451.png': '/images/celebrity-names/fourth-nattawat.png' };
const publicReviews = photoReviews.flatMap(review => [review, ...(aliases[review.src] ? [{ ...review, src: aliases[review.src] }] : [])]);
fs.writeFileSync(path.resolve('src/data/celebrityImageReviews.json'), `${JSON.stringify(publicReviews, null, 2)}\n`);
console.log(JSON.stringify({ groups: groups.length, people: groups.flatMap(group => group.people).length, portraits: groups.flatMap(group => group.people).filter(person => person.portrait).length, unconfirmed: groups.flatMap(group => group.people).filter(person => person.referenceStatus !== 'matched').map(person => person.id), missingRoles: groups.filter(group => group.people.some(person => !person.occupations.length)).map(group => group.name) }));
