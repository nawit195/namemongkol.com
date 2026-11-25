import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PageTrafficView, type PageTrafficViewProps } from './PageTrafficView';
import styles from './pageTraffic.module.css';

const props: PageTrafficViewProps = {
    today: '2026-11-24', draft: { from: '2026-11-23', to: '2026-11-24', q: '' },
    query: { from: '2026-11-23', to: '2026-11-24', q: '', page: 1 },
    loading: false, denied: false, error: '', setDraft() {}, setQuery() {}, setError() {},
    data: {
        rows: [
            { day: '2026-11-24', path: '/nicknames', views: 1234, visitors: 640 },
            { day: '2026-11-24', path: '/search', views: 300, visitors: 240 },
            { day: '2026-11-23', path: '/articles/ชื่อเล่นมงคล', views: 90, visitors: 60 },
        ],
        daily: [{ day: '2026-11-24', views: 1534, visitors: 700 }, { day: '2026-11-23', views: 90, visitors: 60 }],
        summary: { views: 1624, visitorDays: 760, pages: 3 }, total: 3, page: 1, pageSize: 50,
    },
};
const render = (patch: Partial<PageTrafficViewProps> = {}) => renderToStaticMarkup(React.createElement(PageTrafficView, { ...props, ...patch }));
describe('daily traffic report presentation', () => {
    it('distinguishes daily browsers from view counts and provides the route/date report', () => {
        const html = render();
        expect(html).toContain('/nicknames'); expect(html).toContain('1,234'); expect(html).toContain('640');
        expect(html).toContain('ผู้เข้าชมไม่ซ้ำ'); expect(html).toContain('เปิดหน้า (ครั้ง)');
        expect(html).toContain('เบราว์เซอร์-วัน'); expect(html).toContain('2569');
        const css = readFileSync('src/app/admin/page-traffic/pageTraffic.module.css', 'utf8')
            .replace(/\.([a-zA-Z_][\w-]*)/g, (token, key: string) => styles[key] ? '.' + styles[key] : token);
        mkdirSync('.local/page-traffic-qa', { recursive: true });
        writeFileSync('.local/page-traffic-qa/report-sample.html', `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0f172a;font-family:Tahoma,sans-serif}*{box-sizing:border-box}h1,h2,p,dl,dd{margin:0}${css}</style></head><body>${html}</body></html>`);
    });
    it('renders empty, loading and access-denied states without claiming historical measurements', () => {
        expect(render({ loading: true, data: null })).toContain('กำลังโหลดสถิติผู้เข้าชม');
        expect(render({ denied: true, data: null, error: 'กรุณาเข้าสู่ระบบ' })).toContain('/login?redirect=');
        expect(render({ data: { ...props.data!, rows: [], daily: [], total: 0 } })).toContain('ยังไม่มีผู้เข้าชมที่บันทึก');
    });
    it('escapes page paths from the database', () => {
        const html = render({ data: { ...props.data!, rows: [{ day: '2026-11-24', path: '/<script>bad</script>', views: 1, visitors: 1 }] } });
        expect(html).not.toContain('<script>bad'); expect(html).toContain('&lt;script&gt;');
    });
});
