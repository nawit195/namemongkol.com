# คอลเลกชันวอลเปเปอร์เสริมดวงการเงิน 4289

## หน้าและเนื้อหา

- `/wallpapers` แสดงชุดเด่นจากเซิร์ฟเวอร์ก่อนแกลเลอรีเดิม: 4 คอลัมน์บนเดสก์ท็อป และ 2×2 บนมือถือ/แท็บเล็ต
- `/wallpapers/intent/finance` เป็นเจ้าของคีย์เวิร์ด “วอลเปเปอร์เสริมดวงการเงิน” มี canonical ของตนเอง ภาพทั้ง 4 คำอธิบาย วิธีตั้งภาพ และ FAQ จากข้อมูลชุดเดียวกับ JSON-LD
- ใช้ภาพต้นไม้ทอง ปลาคาร์ปคู่ ฝูงม้า และเรือสำเภาทองตามลำดับ ไม่เรียกภาพฝูงม้าว่า “ม้า 8 ตัว” เพื่อไม่สับสนกับคอลเลกชันเดิม
- รายละเอียดแต่ละภาพใช้ `?image=<productId>` หลังเข้าสู่ระบบกลับภาพเดิมและรอการยืนยันซื้อ ไม่ซื้ออัตโนมัติ

## สินค้าและไฟล์

| Product ID | ขนาด PNG | Bytes |
| --- | --- | --- |
| finance-golden-tree | 841×1870 | 2659152 |
| finance-koi | 830×1895 | 2976024 |
| finance-emerald-horses | 841×1870 | 3137100 |
| finance-golden-junk | 931×1689 | 3040430 |

- WebP เต็มที่ผู้ใช้ให้และ PNG ที่สร้างจากไฟล์เหล่านั้นเก็บใน `.local/wallpaper-originals/finance/` ซึ่งไม่เผยแพร่และไม่เข้า Git
- PNG สร้างจาก WebP แบบ lossless ตรวจ raw pixels ให้ตรงกันทุกพิกเซล ไม่ได้อ้างว่าเป็นไฟล์ PNG เดิมก่อนการแปลง
- หน้าเว็บใช้ WebP ย่อกว้าง 640 px คุณภาพ 75 ใน `public/wallpapers/finance/` รวมประมาณ 283 KB พร้อม `next/image`, sizes และ alt ตามภาพจริง
- PNG เต็มอยู่ใน private bucket `premium-wallpaper-originals` ชื่อ `finance/<id>-<sha256>.png` ไม่เผย private path ผ่าน catalog API

## เครดิตและ API

- ดาวน์โหลดใหม่ใช้ 15 เครดิตต่อภาพทุกครั้ง ต้องเข้าสู่ระบบและยืนยันก่อนหัก ลองรายการเดิมฟรีภายใน 30 นาที
- ใช้ request ID, owner isolation, transaction, checksum และ receipt เดิมร่วมกับชุดม้า ไม่เปลี่ยน RPC การหักเครดิต
- `GET /api/wallpapers/products` คืน 8 สินค้า โดยเพิ่ม `collection: 'horses' | 'finance'` และตรวจ availability แยกแต่ละสินค้า
- `POST /api/wallpapers/download` คง `{ productId, requestId, action: 'start' | 'retry' }` และคืน PNG ผ่าน private/no-store response รูปแบบเดิม
- ทะเบียนรวมอยู่ใน `src/data/paidWallpapers.ts` ส่วน component ซื้อ/ลองซ้ำใช้ร่วมกันใน `PaidWallpaperCollection`

## การติดตั้งและตรวจซ้ำ

Migration `20261120052112_paid_finance_wallpapers.sql` ตรงกับเวอร์ชันบนโครงการ NameMongkol ขยายข้อจำกัดรหัสสินค้าและเพิ่ม 4 สินค้าแบบ inactive โดยไม่เปลี่ยนรายการม้าเดิม

```powershell
node scripts/finance-wallpaper-assets.mjs --prepare
node scripts/finance-wallpaper-assets.mjs --upload
```

`--prepare` เก็บสำเนา WebP เต็มที่ตรวจสอบแล้วก่อนนำออกจาก public สร้าง PNG และ previews ใหม่ได้โดยคงไฟล์เต็มไว้ ส่วน `--upload` ต้องมี server credentials ใน `.env.local` ตรวจ bucket เป็น private อัปโหลดโดยไม่ทับไฟล์ อ่านกลับตรวจ checksum ทั้ง 4 แล้วจึงเปิดสินค้าพร้อมกัน รันซ้ำได้โดยไม่หักเครดิตหรือสร้างสิทธิ์สมาชิก

หาก public มีไฟล์ใหม่ที่ใช้ชื่อเดียวกับต้นฉบับเดิม สคริปต์จะตรวจ checksum แล้วหยุดโดยเก็บไฟล์ใหม่นั้นไว้ ไม่ลบไฟล์ที่ไม่ตรงกับสำเนาที่เก็บรักษา

วันที่ 20 พฤศจิกายน 2569: migration ติดตั้งแล้ว สินค้าการเงินทั้ง 4 active และมี private originals ครบ ชุดม้าเดิมยัง active ทั้ง 4 ตรวจ anonymous/public URL แล้วเข้าถึง PNG เต็มไม่ได้ การเปิดสินค้าบนฐานข้อมูลแยกจากการเผยแพร่โค้ดเว็บไซต์

## การทดสอบ

```powershell
npm test
npm run lint -- --quiet
npx tsc --noEmit --incremental false
npm run build
node scripts/test-paid-wallpapers.mjs <path-to-@electric-sql/pglite>
```

- API tests ครอบคลุมสินค้าใหม่ การคง availability ของชุดม้าเมื่อชุดใหม่ไม่พร้อม ไฟล์ผิด checksum ราคาไม่ตรง และการปฏิเสธ guest ก่อนซื้อ
- SQL harness ครอบคลุมทั้ง 8 สินค้า migration แบบเพิ่มข้อมูล เครดิต 0/14/15 การกดซ้ำ เจ้าของ/ภาพไม่ตรง รายการหมดเวลา rollback และสิทธิ์ Storage
- ตรวจ 320/390/768/1280 px, ภาพไม่ครอป ไม่มี horizontal overflow และ Escape คืนโฟกัสให้ภาพเดิม
- ตรวจ production HTML มี H1 หนึ่งหัวข้อ ภาพครบ canonical/JSON-LD ถูกต้อง และ sitemap มีภาพ preview ทั้ง 4
- ไม่ทดสอบหักเครดิตบัญชีสมาชิกจริง ใช้ transaction harness และ API mocks สำหรับการซื้อ

แนวทางเนื้อหาภาพ: [Google Image SEO](https://developers.google.com/search/docs/appearance/google-images)
