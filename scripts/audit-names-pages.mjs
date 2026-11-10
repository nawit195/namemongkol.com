// Run against a local production build: node scripts/audit-names-pages.mjs http://localhost:3155
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:3155';
const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'wednesday_night', 'thursday', 'friday', 'saturday'];
const routes = [{ path: '/names', back: '/' }];
for (const gender of ['boys', 'girls']) {
    routes.push({ path: `/names/${gender}`, back: '/names' });
    for (const category of ['nicknames', 'english-names', 'by-birthday']) {
        routes.push({ path: `/names/${gender}/${category}`, back: `/names/${gender}` });
    }
    for (const day of days) routes.push({ path: `/names/${gender}/by-birthday/${day}`, back: `/names/${gender}/by-birthday` });
}
for (const day of days) routes.push({ path: `/names/by-birthday/${day}`, back: '/names#naming-birthdays' });

const schemasOf = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => {
    const schema = JSON.parse(match[1]);
    return schema['@graph'] || [schema];
});
let totalLists = 0;
for (const { path, back } of routes) {
    const response = await fetch(base + path, { redirect: 'manual' });
    if (path === '/names/girls/by-birthday/monday') {
        assert.equal(response.status, 308);
        const destination = response.headers.get('location');
        assert.ok(destination?.endsWith('/articles/monday-girl-names-2569-no-sara'));
        const article = await (await fetch(new URL(destination, base))).text();
        assert.ok(article.includes(`href="${back}"`), 'Monday article needs a naming return link');
        console.log('PASS', path, '→ article');
        continue;
    }
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
    assert.equal((title.match(/NameMongkol/g) || []).length, 1, `${path}: duplicate brand`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: H1`);
    assert.ok(html.includes(`href="https://www.namemongkol.com${path}"`), `${path}: canonical`);
    assert.ok(html.includes(`href="${back}"`), `${path}: back link`);
    assert.ok(html.includes('.webp'), `${path}: illustration`);
    const schemas = schemasOf(html);
    assert.ok(schemas.some(item => item['@type'] === 'BreadcrumbList'), `${path}: breadcrumb schema`);
    assert.ok(schemas.some(item => item['@type'] === 'FAQPage'), `${path}: FAQ schema`);
    const lists = schemas.filter(item => item['@type'] === 'ItemList');
    let listedNames = 0;
    for (const list of lists) {
        assert.equal(list.numberOfItems, list.itemListElement.length, `${path}: visible list count`);
        const names = list.itemListElement.map(item => item.item.name);
        assert.equal(new Set(names).size, names.length, `${path}: duplicate names`);
        listedNames += names.length;
        totalLists++;
    }
    assert.equal((html.match(/<article\b/g) || []).length, listedNames, `${path}: SSR names/schema`);
    console.log('PASS', path, `${listedNames} names in server HTML`);
}
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
assert.ok(!sitemap.includes('https://www.namemongkol.com/names/girls/by-birthday/monday<'));
console.log(`PASS ${routes.length} routes, ${totalLists} visible lists, Monday redirect, sitemap`);
