# Name SEO cluster operations

## Query ownership

| URL | Primary intent |
| --- | --- |
| `/search` | ค้นหาชื่อมงคล, ชื่อมงคล, ชื่อความหมายดี |
| `/name-check` | วิเคราะห์ชื่อ, วิเคราะห์ชื่อ นามสกุล ฟรี |
| `/names/boys` | ตั้งชื่อลูกชาย |
| `/names/girls` | ตั้งชื่อลูกสาว |
| `/names/{boys,girls}/by-birthday/{day}` | ชื่อลูกตามเพศและวันเกิด |
| `/premium-search` | เปลี่ยนชื่อมงคล, ชื่อเสริมดวงเฉพาะบุคคล |
| `/name-generator` | ตั้งชื่อด้วย AI |

## Weekly GSC report

Export GSC query + page data with `query`, `page`, `clicks`, `impressions`, `ctr`, and `position`, then run:

```bash
npm run gsc:weekly:name-seo -- --input path/to/current.csv --compare path/to/previous.csv --output docs/reports/gsc-name-seo.md --period "YYYY-MM-DD to YYYY-MM-DD"
```

The report groups the owner pages above and flags queries appearing across two or more tracked page groups. Record the initial 28-day report as the baseline before comparing weekly 7-day and rolling 28-day windows.

## Funnel events

1. `funnel.organic_landing`
2. `funnel.search.name_select`
3. `funnel.search.name_analyze`
4. `funnel.premium.open`
5. `funnel.premium.unlock_confirm`
6. `funnel.premium.unlock_success`
7. `funnel.premium.topup_open`
8. `funnel.payment.success`

Do not lock KPI targets until a complete 28-day baseline exists. Compare organic Premium purchases, name-cluster clicks, owner-page overlap, CTR for positions 4–15, and Core Web Vitals p75 every week.
