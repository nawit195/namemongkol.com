import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import {
    ReturningMembersView,
    type ReturningMembersViewProps,
} from './ReturningMembersView';
const base: ReturningMembersViewProps = {
    data: {
        members: [
            {
                id: '10000000-0000-4000-8000-000000000001',
                firstName: 'มาลีทดสอบ',
                lastName: null,
                email: 'member@example.test',
                tier: 'pro',
                activeDays: 3,
                observedDays: 1,
                legacyOnlyDays: 2,
                firstSeenAt: '2026-11-01T00:00:00Z',
                lastSeenAt: '2026-11-10T00:00:00Z',
                source: 'mixed',
            },
        ],
        total: 51,
        page: 1,
        pageSize: 50,
        summary: { activeMembers: 100, returningMembers: 51 },
        coverage: {
            trackingStartedAt: '2026-11-10T00:00:00Z',
            legacyImportedAt: '2026-11-10T00:00:00Z',
            legacySources: ['analysis_history'],
        },
    },
    loading: false,
    error: '',
    denied: null,
    period: '30',
    from: '2026-10-12',
    to: '2026-11-10',
    today: '2026-11-10',
    source: 'all',
    search: '',
    page: 1,
    onPeriod: vi.fn(),
    onFrom: vi.fn(),
    onTo: vi.fn(),
    onSource: vi.fn(),
    onSearch: vi.fn(),
    onPage: vi.fn(),
    onRefresh: vi.fn(),
};
const render = (props: Partial<ReturningMembersViewProps> = {}) =>
    renderToStaticMarkup(
        createElement(ReturningMembersView, { ...base, ...props }),
    );
test('renders the agreed daily definition, coverage warning and labelled member table', () => {
    const html = render();
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    for (const text of [
        'อย่างน้อย 2 วัน',
        'มาลีทดสอบ',
        'member@example.test',
        '3 วัน',
        'ใหม่และย้อนหลัง',
        'ประวัติบางส่วนถูกล้าง',
        '50 คน',
        'หน้า 1 / 2',
    ])
        expect(html).toContain(text);
    expect(html).toContain(
        'aria-label="ตารางสมาชิก เลื่อนซ้ายขวาเพื่อดูทุกคอลัมน์"',
    );
});
test('does not render member data while loading or when denied', () => {
    for (const props of [
        { loading: true },
        { denied: 'forbidden' as const },
        { denied: 'unauthorized' as const },
    ]) {
        const html = render(props);
        expect(html).not.toContain('member@example.test');
        expect(html).not.toContain('มาลีทดสอบ');
    }
    expect(render({ denied: 'unauthorized' })).toContain(
        '/login?redirect=%2Fadmin%2Freturning-members',
    );
});
test('renders recoverable errors, empty results and missing profile fields safely', () => {
    expect(
        render({ data: null, error: 'กรุณาติดตั้ง SQL migration' }),
    ).toContain('กรุณาติดตั้ง SQL migration');
    expect(
        render({ data: { ...base.data!, members: [], total: 0 } }),
    ).toContain('ไม่พบสมาชิก');
    const row = { ...base.data!.members[0], firstName: null, email: null };
    const html = render({ data: { ...base.data!, members: [row] } });
    expect(html).toContain('สมาชิกไม่ระบุชื่อ');
    expect(html).toContain('ไม่ระบุอีเมล');
});
