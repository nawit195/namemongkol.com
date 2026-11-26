const fs = require('node:fs');
const path = require('node:path');
const inputArgument = process.argv.slice(2).find(argument => !argument.startsWith('--'));
const root = path.resolve(inputArgument || 'scratch/celebrity-name-import/2026-11-26');
const checkedAt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const portraits = JSON.parse(fs.readFileSync(path.join(root, 'research/portraits.json'), 'utf8'));
const headers = { 'User-Agent': 'NameMongkol image source review (https://www.namemongkol.com/about)' };
const clean = value => (value || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number))).replace(/\s+/g, ' ').trim();
async function query(titles) {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', titles: titles.join('|'), prop: 'categories|revisions|imageinfo', cllimit: 'max', rvprop: 'ids|timestamp|content', rvslots: 'main', iiprop: 'extmetadata|url' });
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw Error(`Commons HTTP ${response.status}`);
    const data = await response.json();
    if (data.error || data.continue) throw Error(`Incomplete Commons audit ${JSON.stringify(data.error || data.continue)}`);
    return data.query.pages;
}
(async () => {
    const pages = [];
    for (let offset = 0; offset < portraits.length; offset += 12) {
        const cache = path.join(root, 'research', `evidence-${offset}.json`);
        let batch;
        if (!process.argv.includes('--refresh') && fs.existsSync(cache)) batch = JSON.parse(fs.readFileSync(cache, 'utf8'));
        else { batch = await query(portraits.slice(offset, offset + 12).map(item => `File:${item.filename.replace(/_/g, ' ')}`)); fs.writeFileSync(cache, JSON.stringify(batch, null, 2)); }
        pages.push(...batch);
    }
    const reviews = portraits.map(item => {
        const page = pages.find(page => page.title.replace(/_/g, ' ') === `File:${item.filename.replace(/_/g, ' ')}`);
        const revision = page?.revisions?.[0];
        const content = revision?.slots?.main?.content || '';
        const categories = (page?.categories || []).map(category => category.title);
        const metadata = page?.imageinfo?.[0]?.extmetadata || {};
        const freshAuthor = clean(metadata.Artist?.value);
        const freshDeclaration = clean(metadata.LicenseShortName?.value);
        const freshLicenseUrl = (page?.imageinfo?.[0]?.extmetadata?.LicenseUrl?.value || '').replace(/^http:/, 'https:').replace(/^\/\//, 'https://').replace(/\/+$/, '');
        const licenseMatches = freshLicenseUrl === item.portrait.licenseUrl.replace(/\/+$/, '');
        const held = categories.filter(category => /review needed|no permission|copyright violation|possibly unfree|speedy deletion|deletion requests|disputed copyright/i.test(category));
        const passed = categories.includes('Category:Files from external sources with reviewed licenses');
        const own = /\{\{\s*own\s*(?:\||\}\})/i.test(content);
        const pd = /creativecommons\.org\/publicdomain\//.test(item.portrait.licenseUrl);
        if (!licenseMatches) held.push('License URL differs from the stored portrait record');
        if (freshAuthor !== item.portrait.credit) held.push('Creator credit differs from the stored portrait record');
        if (freshDeclaration !== item.portrait.license) held.push('License declaration differs from the stored portrait record');
        const status = held.length ? 'withheld' : passed ? 'external-review-recorded' : own ? 'own-work-declaration' : pd ? 'public-domain-declaration' : 'withheld';
        return { src: item.portrait.src, fileTitle: page?.title, status, checkedAt, revisionId: revision?.revid, evidenceUrl: revision ? `https://commons.wikimedia.org/w/index.php?oldid=${revision.revid}` : item.portrait.sourceUrl, reasons: held.length ? held : status === 'withheld' ? ['External-source license evidence needs further review'] : [], declaration: freshDeclaration, author: freshAuthor, licenseUrl: freshLicenseUrl, sourceUrl: page?.imageinfo?.[0]?.descriptionurl || item.portrait.sourceUrl };
    });
    fs.writeFileSync(path.join(root, 'research', 'photo-evidence.json'), JSON.stringify(reviews, null, 2));
    console.log(JSON.stringify({ total: reviews.length, statuses: reviews.reduce((counts, review) => ({ ...counts, [review.status]: (counts[review.status] || 0) + 1 }), {}), withheldCount: reviews.filter(review => review.status === 'withheld').length }));
})().catch(error => { console.error(error); process.exit(1); });
