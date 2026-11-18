# ตรวจโค้ดก่อนเผยแพร่ วันที่ 17 พฤศจิกายน 2569

ชุดเปลี่ยนแปลงรวมเครื่องมือนำเข้ารายชื่อ A-B/A+ รอบล่าสุด วันที่อัปเดตรายชื่อพรีเมียม การนำข้อความรอตรวจสอบออกจากการ์ด และเนื้อหา SEO/AEO เรื่อง 4 ศาสตร์ การนำเข้าฐานจริงเสร็จในงานก่อนหน้า การเผยแพร่โค้ดครั้งนี้ไม่รันนำเข้าหรือเปลี่ยนฐานอีกครั้ง

## จุดที่พบและแก้ระหว่างตรวจ

1. ตัวอ่านชีต A-B ใช้คอลัมน์แรกเพื่อตรวจแถวว่าง แม้จับข้อมูลจากชื่อหัวคอลัมน์แล้ว แก้ให้ตรวจคอลัมน์รายชื่อจริงตาม header และทดสอบทั้ง A-B/A+ ด้วย fixture ที่สลับคอลัมน์
2. ตัวเตรียม dry run ของ A-B เขียนทับ backup/แผนเดิมได้ เพิ่มการปฏิเสธไฟล์ before.json, plan.json หรือ import.sql ที่มีอยู่แล้ว และให้ระบุ output directory ใหม่ได้ ทั้งสอง planner ตรวจเงื่อนไขนี้ก่อนเชื่อมต่อ Supabase

## ผลตรวจ

- ชุดทดสอบเต็ม: 77 files / 409 tests ผ่าน; regression ใหม่เรื่อง backup 3 tests ผ่านแยกต่างหาก
- PostgreSQL จำลองผ่านทั้ง 7,606 ชื่อสาธารณะและ 3,251 ชื่อพรีเมียม: นำเข้าซ้ำ, snapshot เปลี่ยนแล้ว rollback, การรักษาสถานะตรวจ และข้อความ quote/dollar delimiter
- Fixture extractors ผ่านกรณีสลับคอลัมน์ ชื่อซ้ำ/ว่าง อักขระแฝง และชื่ออังกฤษที่ไม่ถูกต้อง
- lint โครงการไม่มี error; lint ของไฟล์ที่แก้ไม่มี warning และตรวจสคริปต์นำเข้าด้วย --no-ignore
- TypeScript และ production build ด้วย Webpack ผ่านในชุดเว็บปัจจุบัน; แก้หลัง build เฉพาะเครื่องมือนำเข้าและ regression tests จากการตรวจครั้งนี้
- HTML จาก production build ผ่าน 5 หน้า: H1 เดียว, canonical www, title ไม่ซ้ำแบรนด์, 4 ศาสตร์ครบ และ FAQ ตรง schema
- ตรวจขนาด 320/390/1280px และคีย์บอร์ดในงานพัฒนารอบนี้แล้ว
- ตรวจไฟล์ที่จะ commit ไม่พบ token/secret จริงหรือ database before-values; .env.local และโฟลเดอร์ backup ถูก gitignore

## การเผยแพร่

ใช้ branch `codex/surname-premium-cta` และ remote `nawit195` ตาม upstream เดิม โดยไม่ force push โครงการ Vercel `namemongkol-com` deploy อัตโนมัติเฉพาะ main จึง deploy production ด้วย CLI หลัง push commit แล้ว ตรวจสถานะ Ready, aliases ของโดเมนจริง, เนื้อหา 4 ศาสตร์ และ API รายชื่อ/วันที่ล่าสุดหลังเผยแพร่

ขณะตรวจ production เดิมเป็น deployment `namemongkol-9meiv4bhz-nawit195s-projects.vercel.app` ไม่มีงาน production ใหม่กว่าที่ต้องรวมเพิ่ม และ main ที่ fetch มาเพิ่มเพียง merge commit ของ PR เก่า ไม่ได้มีการแก้ไฟล์อิสระที่หายไปจากชุดนี้
