# Name SEO cluster operations

## Query ownership

| URL | Primary intent |
| --- | --- |
| `/search` | ตั้งชื่อมงคล, ค้นหาชื่อมงคล, ชื่อมงคล, ชื่อความหมายดี |
| `/name-check` | วิเคราะห์ชื่อ, วิเคราะห์ชื่อ นามสกุล ฟรี |
| `/meaning` | สำรวจความหมายชื่อจริงและที่มาข้อมูล |
| `/meaning/{name}` | ความหมายของชื่อที่ระบุ แยกจากผลวิเคราะห์เลขศาสตร์ |
| `/articles/real-name-nickname-numerology` | ชื่อจริงกับชื่อเล่นต้องมีผลรวมเหมือนกันไหม |
| `/articles/name-meaning-vs-numerology` | เลือกอย่างไรเมื่อความหมายชื่อกับผลรวมไม่ตรงใจ |
| `/names` | ตั้งชื่อลูก, ตั้งชื่อลูกพร้อมความหมาย |
| `/names/boys` | ตั้งชื่อลูกชาย |
| `/names/girls` | ตั้งชื่อลูกสาว |
| `/names/{boys,girls}/by-birthday/{day}` | ชื่อลูกตามเพศและวันเกิด |
| `/nicknames` | ชื่อเล่นมงคลตามวันเกิด ความหมาย และเกรดจากชุดข้อมูลชื่อเล่น |
| `/nicknames/meaning/light` | ตัวอย่างชื่อเล่นสื่อถึงแสงสว่าง |
| `/nicknames/meaning/happiness` | ตัวอย่างชื่อเล่นสื่อถึงความสุขและความยินดี |
| `/nicknames/unisex` | ชื่อเล่นใช้ได้ทุกเพศตามชุดข้อมูลต้นฉบับ |
| `/premium-search` | เปลี่ยนชื่อมงคล, ชื่อเสริมดวงเฉพาะบุคคล |
| `/name-generator` | ตั้งชื่อด้วย AI |

## Meaning and decision journeys (items 4–6)

Naming articles use an explicit journey registry, linking to the relevant birthday category, real-name meaning lookup and surname analysis. Card name links for the discovery whitelist provide the category-to-meaning step without adding another action row; other names retain their analysis and favorite actions. Nicknames and English names keep their own datasets; they are not treated as entries in the Thai real-name meaning catalog.

The meaning page shows published catalog meaning separately from numerology. CMS approval is an editorial publication state, not independent dictionary verification. Unconfirmed readings stay hidden; missing external references are stated openly. Only the bounded discovery whitelist with actual publishable meaning is eligible for discovery indexing and sitemap inclusion. Pending, rejected, unavailable and non-discovery names must not become indexed dictionary claims merely because the numeric calculation works.

The two decision guides answer different questions: whether real and nickname totals must match, and how to choose when a preferred meaning and a preferred numeric result differ. They explain the site's calculation convention with reproducible examples rather than recommending a mandatory rename or promising outcomes. Neither guide owns the broad tool query “วิเคราะห์ชื่อ”.

## Weekly GSC report

The admin Search Console report accepts standard exported Queries, Pages and daily Chart files separately, with persisted import versions. These dimensions must not be joined to invent query-to-page attribution. Only a genuine combined query+page export can support a query/page-overlap review. The existing CLI below keeps its original combined-format contract.

Search Console calendar dates use Pacific Time (PT). The first-party page traffic report uses Asia/Bangkok and counts browsers/page views from all channels. These are separate measurements; do not equate daily GSC clicks with Thai-day visitors. Table exports may omit rows, so display sums as imported-row metrics rather than the property's complete totals.

Each page keeps its own intent. The public nickname collections expose only explicit free A/B IDs and describe how they were selected; they do not change the real-name calculation, the original grades, or the private A+ entitlement model. Existing boys/girls nickname pages remain the gender-focused idea guides from their own curated source.

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
