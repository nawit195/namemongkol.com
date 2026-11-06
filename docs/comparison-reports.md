# รายงานสรุปเปรียบเทียบชื่อ

ตาราง `/compare-names` เดิมยังใช้ฟรี 2–5 ชื่อ ไม่ต้องสมัคร รายงานเสริมคิด 5 เครดิตต่อชุดสำหรับทุกบัญชี เปิดซ้ำและดาวน์โหลด PDF/CSV ได้ตลอด ไม่จำกัดระดับสมาชิก ไม่ใช้ AI

## การคิดเครดิตและข้อมูลที่บันทึก

- ชุดเดียวกันคือรายชื่อชุดเดียวกัน + นามสกุล + วันเกิด ผูกกับเจ้าของบัญชี ปรับ NFC/trim และเทียบตัวพิมพ์อังกฤษโดยไม่สน case ก่อนสร้าง SHA-256 บนเซิร์ฟเวอร์ สลับชื่อหรือเรียงตารางไม่ทำให้เสียเครดิตเพิ่ม
- เพิ่ม/ลบ/เปลี่ยนชื่อ นามสกุล หรือวันเกิดถือเป็นชุดใหม่ ต้องยืนยันราคาอีกครั้ง
- Snapshot เก็บผลที่คำนวณจริง ข้อความสรุป `formulaVersion` และ `summaryVersion` เปิดรายงานเก่าไม่คำนวณใหม่และไม่หักเครดิต
- แยกกลุ่มเกรดสูงสุด ชื่อจริงที่ไม่มีกาลกิณี และจุดตัดสองกลุ่ม ไม่ถือว่าจุดตัดเป็นการรับรองชื่อที่ดีเสมอไป โดยเฉพาะเมื่อทุกชื่อได้ C; เตือนกาลกิณีในนามสกุลแยก
- ผู้ไม่ล็อกอินใช้ sessionStorage เก็บชุดที่กำลังเลือกเฉพาะแท็บ ก่อนกลับมาที่ `/compare-names` หลังล็อกอิน ระบบคืนแบบฟอร์ม ไม่สั่งซื้อหรือเปรียบเทียบอัตโนมัติ

## API และฐานข้อมูล

- `GET /api/compare-names/reports?page=1`: รายงานเจ้าของบัญชี ล่าสุดก่อน หน้าละ 20 รายงาน พร้อมเครดิตใช้ได้จริง ราคาและสถานะพร้อมใช้งาน
- `POST /api/compare-names/reports?preview=1`: รับ `{ names, surname, day }` คืนรายงานเดิมถ้ามี หรือราคา 5 เครดิตและเครดิตคงเหลือ ไม่มีการหักเครดิต
- `POST /api/compare-names/reports`: รับ input เดียวกัน คำนวณ snapshot และ fingerprint ฝั่งเซิร์ฟเวอร์ แล้วเรียก RPC `unlock_comparison_report`; ไม่เชื่อ owner, ราคา, คะแนน หรือ snapshot ที่แนบมาจากเบราว์เซอร์
- `GET /api/compare-names/reports/[id]`: เปิด snapshot ของเจ้าของเท่านั้น คืน 404 สำหรับรายงานที่ไม่พบหรือไม่มีสิทธิ์
- API ทุกเส้นทางใช้ `Cache-Control: private, no-store` และตรวจ session ด้วย `getUser()`; ไม่ล็อกอิน 401, input ผิด 400, เครดิตไม่พอ 402, ตั้งค่า/ฐานข้อมูลไม่พร้อม 503
- ตาราง `comparison_reports` เปิด RLS อ่านเฉพาะเจ้าของ ผู้ใช้ไม่มีสิทธิ์เขียน และ RPC แบบ SECURITY INVOKER เรียกได้เฉพาะ service_role ใช้ service key เฉพาะเซิร์ฟเวอร์
- RPC ล็อกแถว `user_profiles FOR UPDATE` ก่อนตรวจรายการเดิมซ้ำ หัก welcome credits ที่ยังไม่หมดอายุก่อนเครดิตซื้อ และบันทึกรายงานกับ `credit_transactions` ในธุรกรรมเดียว หากส่วนใดล้มเหลว rollback ทั้งหมด
- ถ้าการตอบกลับขาดหลัง commit ให้ลองชุดเดิมอีกครั้ง จะได้ `already_unlocked` โดยไม่หักซ้ำ

## ติดตั้งและตรวจรับ

ติดตั้ง migration ตามลำดับ `supabase/migrations/20261106100738_comparison_reports.sql` แล้ว `supabase/migrations/20261106103315_comparison_report_snapshot_limit.sql` ก่อน deploy แอป ไฟล์ที่สองขยายเพดาน snapshot เป็น 2 MB ให้รองรับชื่อ/นามสกุลยาว 100 ตัวอักษรพร้อมคำอธิบายคู่เลข ปุ่มรายงานปิดเมื่อโหลดสถานะไม่สำเร็จ ส่วนตารางฟรีไม่ขึ้นกับ migration หมายเลขทั้งสองตรงกับประวัติที่ติดตั้งบน Supabase

ติดตั้งใน Supabase โปรเจกต์ NameMongkol แล้วเมื่อ 6 พฤศจิกายน 2569 ตรวจว่า RLS เปิด, anon/authenticated เรียก RPC ไม่ได้, authenticated INSERT ตารางไม่ได้ และยังไม่มีรายงานหรือการใช้เครดิตจริงจากการทดสอบรอบนี้

```powershell
npm run test
npm run lint
npm run build
$comparisonSqlRoot = Join-Path $env:TEMP 'namemongkol-comparison-sql-test'
npm install --prefix $comparisonSqlRoot --no-save --package-lock=false @electric-sql/pglite@0.3.14
node scripts/test-comparison-reports.mjs (Join-Path $comparisonSqlRoot 'node_modules/@electric-sql/pglite')
```

ฐานข้อมูลจำลองทดสอบเครดิต 0/4/5, welcome priority/expiry, ชุดเดิมไม่หักซ้ำ, snapshot เดิม, owner RLS, service-only RPC และความล้มเหลวช่วงบันทึก ledger ที่ต้อง rollback เครดิตและรายงาน รวมถึงส่งสองคำขอพร้อมกันทั้งชุดเดียวและต่างชุด ทดสอบแบบฝังตัวผ่านคิว connection เดียว ไม่ใช่ stress test หลาย PostgreSQL connections; ตัว RPC ใช้ row lock และ unique constraint ป้องกันคำขอพร้อมกัน

ทดสอบ UI ในเซิร์ฟเวอร์ชั่วคราวที่ใช้ component/controller และสูตรจริงกับ backend จำลอง โดยไม่ข้าม auth ของแอป: ตารางฟรี 5 ชื่อ, ยืนยัน 5→0 เครดิต, เปิดซ้ำ, เปลี่ยนวันเกิดเป็นชุดใหม่แล้วเครดิตไม่พอ, ประวัติหน้าสอง, กลับจากล็อกอินคืนแบบฟอร์มโดยไม่ซื้อเอง, ทุกชื่อเกรด C และกาลกิณีนามสกุล ตรวจขนาด 320/390/1280px และแก้ข้อความ sr-only ในตารางที่เคยทำให้หน้าล้นแนวนอน

ดาวน์โหลด CSV จริง 5 แถว 25 คอลัมน์ เกรดตรงกับตาราง และ PDF ภาษาไทย 5 ชื่อ 3 หน้า ขนาด 544,347 bytes ตรวจภาพ render ทุกหน้าแล้ว; PDF เป็นภาพเพื่อรักษารูปอักษรไทย ไม่รองรับค้นหาข้อความใน PDF

Vitest ฉบับสุดท้ายผ่าน 54 ไฟล์ / 286 tests และ production build ผ่าน รวมทั้ง API รายงานสองเส้นทาง ไฟล์ที่แก้ไม่มี lint warnings/errors ส่วน lint ทั้งโปรเจกต์มี warnings เดิม 46 รายการ ชุดทดสอบที่เกี่ยวข้อง 4 ไฟล์ / 21 tests ผ่าน รวมกรณีชื่อยาวสุดและ snapshot เกิน 250 KB

## วัดผลหลังเผยแพร่ 28 วัน

ใช้ tracker เดิมและ metadata เฉพาะ `count`, `cost` ไม่ส่งชื่อ นามสกุล fingerprint หรือ snapshot:

| Event | ความหมาย |
|---|---|
| `compare_names.analyze_success` | เปรียบเทียบฟรีสำเร็จ |
| `compare_names.report.unlock_click` | คลิกเปิดรายงาน |
| `compare_names.report.unlock_confirmation` | แสดงราคา/เครดิตก่อนซื้อ |
| `compare_names.report.unlock_confirm` | ผู้ใช้ยืนยันซื้อ |
| `compare_names.report.unlock_success` | สร้างรายงานใหม่สำเร็จ |
| `compare_names.report.unlock_insufficient` | เครดิตไม่พอขณะยืนยัน |
| `compare_names.report.unlock_reopen` | เปิดรายงานเดิม |
| `compare_names.report.download_pdf` / `download_csv` | ดาวน์โหลดสำเร็จ |

ยอดรายงานใหม่และเครดิตอ้างอิงจาก `comparison_reports` กับ ledger `type='spend'` ที่ description ขึ้นต้น `รายงานสรุปเปรียบเทียบชื่อ · ` ไม่ใช้ event ฝั่งเบราว์เซอร์เป็นยอดบัญชี เครดิตที่ใช้รวม welcome credits จึงไม่ใช่รายรับเงินจริง

เทียบรายสัปดาห์และรวม 28 วัน: ผู้เปรียบเทียบฟรีที่ซื้อรายงาน, อัตราสำเร็จหลังยืนยัน, เครดิตไม่พอ, เครดิตต่อผู้ซื้อ, การกลับมาเปิดรายงาน และการใช้งานบริการอื่นของผู้ซื้อ ใช้ช่วง 28 วันก่อนเผยแพร่เป็นฐานของทราฟฟิกฟรี/บริการเดิม บันทึกวัน deploy เป็นวันเริ่มวัด และยังไม่เปลี่ยนราคา 5 เครดิตในช่วงเก็บฐานแรก
