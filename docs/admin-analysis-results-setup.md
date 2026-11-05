# รายชื่อที่เคยวิเคราะห์

หน้า `/admin/analysis-results` แสดงชื่อจริงไม่ซ้ำจาก `analysis_results` พร้อมค้นหา แบ่งหน้าละ 50 ชื่อ และดาวน์โหลด CSV ตามคำค้น โดยไม่ส่งออกนามสกุลหรือคะแนน

## ติดตั้งฐานข้อมูล

1. เปิด Supabase SQL Editor ของโปรเจกต์เดียวกับเว็บไซต์
2. รันไฟล์ `scripts/migration-admin-analysis-result-names.sql` ทั้งไฟล์ สามารถรันซ้ำได้
3. ตรวจว่าเซิร์ฟเวอร์มี `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` และ `SUPABASE_SERVICE_ROLE_KEY` โดย service key ต้องอยู่ฝั่งเซิร์ฟเวอร์เท่านั้น
4. เข้าสู่ระบบด้วยบัญชีที่ `user_profiles.role` เป็น `admin` แล้วเปิดเมนู “รายชื่อที่เคยวิเคราะห์”

Migration เพิ่มเพียง RPC `public.admin_analysis_result_names(text, integer, integer, boolean)` แบบ `SECURITY INVOKER` และให้สิทธิ์เรียกเฉพาะ `service_role` ไม่แก้ข้อมูล ไม่แก้ RLS และไม่เพิ่มชื่อเข้า `auspicious_names`

ระบบตรวจผู้ใช้ด้วย session cookie และตรวจ role ก่อนสร้าง service client ทุกครั้ง ทั้ง JSON และ CSV ใช้ `Cache-Control: private, no-store` หากยังไม่ติดตั้ง RPC จะตอบ `503` / `MIGRATION_REQUIRED` พร้อมข้อความตั้งค่า แยกจากตารางที่ไม่มีข้อมูล

## รูปแบบ API

`GET /api/admin/analysis-results?search=ณัฐ&page=1` คืน `{ success, names, total, page, pageSize, totalPages }` โดย `total` เป็นจำนวนชื่อไม่ซ้ำที่ตรงคำค้น ส่วน `format=csv` ส่งออกชื่อทั้งหมดที่ตรงคำค้นจาก snapshot เดียวในฐานข้อมูล ไม่ติดข้อจำกัด 1,000 แถวของ REST row results

ตัดช่องว่างธรรมดาหัวท้ายชื่อ ข้ามชื่อว่าง รวมเฉพาะชื่อที่สะกดตรงกัน และคงตัวพิมพ์เดิม การค้นหาเป็นข้อความบางส่วนแบบไม่สนตัวพิมพ์สำหรับอักษรที่ฐานข้อมูลรองรับ `%` และ `_` เป็นข้อความปกติ ไม่ใช่ wildcard รายชื่อเรียงด้วย collation `C` เพื่อให้ลำดับระหว่างหน้าคงที่

CSV มีคอลัมน์เดียว `ชื่อ` ใช้ UTF-8 BOM, CRLF, escape เครื่องหมายคำพูด และป้องกันค่าเริ่มต้น `=`, `+`, `-`, `@` ถูกเปิดเป็นสูตรใน spreadsheet

## ตรวจสอบ

```powershell
npm run test -- src/lib/adminAnalysisResults.test.ts src/app/api/admin/analysis-results/route.test.ts src/app/admin/analysis-results/AnalysisResultsView.test.ts
```

ทดสอบ SQL จริงใน PostgreSQL แบบฝังตัวด้วยข้อมูลจำลอง โดยติดตั้ง dependency ในโฟลเดอร์ชั่วคราว ไม่เพิ่ม dependency เข้าโปรเจกต์:

```powershell
$analysisSqlTestRoot = Join-Path $env:TEMP 'namemongkol-analysis-sql-test'
npm install --prefix $analysisSqlTestRoot --no-save --package-lock=false @electric-sql/pglite
node scripts/test-admin-analysis-result-names.mjs (Join-Path $analysisSqlTestRoot 'node_modules/@electric-sql/pglite')
```

สคริปต์สร้างฐานข้อมูลในหน่วยความจำเองเท่านั้น ทดสอบชื่อซ้ำต่างนามสกุล ชื่อว่าง การตัดช่องว่าง ชื่อไม่ซ้ำ 1,506 รายการ การค้นหาภาษาไทย การแบ่งหน้า CSV ทั้งชุด การจำกัดสิทธิ์และการรัน migration ซ้ำ โดยไม่เชื่อมต่อฐานข้อมูลจริง

## ผลตรวจ 5 พฤศจิกายน 2569

- ติดตั้ง migration ใน Supabase โปรเจกต์ NameMongkol แล้ว พบชื่อไม่ซ้ำ 775 ชื่อ ณ เวลาตรวจ จำนวนตรงกับการนับจากตาราง และโหมดส่งออกคืนชื่อครบ 775 ชื่อโดยไม่มีรายการซ้ำ
- ตรวจสิทธิ์จริง: `service_role` อ่าน RPC ได้ ส่วน `anon` และ `authenticated` ไม่มีสิทธิ์เรียก RPC; anonymous REST request ถูกปฏิเสธ และ RLS ของตารางเดิมยังเปิดอยู่
- Production build ผ่าน รวมหน้า `/admin/analysis-results` และ API ใหม่
- Vitest ผ่าน 51 ไฟล์ / 263 tests; ESLint มี 0 errors และ 46 warnings ในไฟล์เดิม
- PostgreSQL แบบฝังตัวผ่านกรณีชื่อซ้ำ ช่องว่าง 1,506 ชื่อ การแบ่งหน้า ค้นหาภาษาไทย/อักขระ `%_` การส่งออกทั้งหมด สิทธิ์เรียก RPC และ migration ที่รันซ้ำได้
- ทดสอบ UI ด้วยหน้าแยกและข้อมูลจำลอง โดยใช้ component/controller เดียวกับหน้าแอดมินจริง ไม่ข้ามการตรวจสิทธิ์ของแอป: หน้าละ 50 ชื่อ ค้นหาแล้วกลับหน้าแรก รีเฟรช สถานะไม่พบชื่อ และข้อผิดพลาดการตั้งค่า
- ตรวจไฟล์ CSV ที่ดาวน์โหลดจากหน้าสองว่ามีข้อมูลจำลองครบ 126 ชื่อ และ CSV จากคำค้นมีเพียง 1 ชื่อ พร้อม BOM; ตรวจขนาดหน้าจอ 1280 และ 390 พิกเซล ไม่พบเนื้อหาล้นแนวนอน
