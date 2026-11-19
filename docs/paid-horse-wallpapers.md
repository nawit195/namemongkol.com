# ภาพม้า 8 ตัวบน /wallpapers

## บริการ

- ทางเข้าหมวด: `/wallpapers?collection=horses` มี PNG ต้นฉบับ 4 ภาพ มือถือ 852×1846 และคอมพิวเตอร์ 1672×941 ประเภทละ 2 ภาพ
- 15 เครดิตต่อการดาวน์โหลดใหม่ทุกครั้ง ไม่ใช่สิทธิ์เปิดภาพตลอดชีพ ต้องเข้าสู่ระบบและยืนยันก่อนซื้อ ไม่ซื้ออัตโนมัติหลังล็อกอิน
- รายการเดิมลองซ้ำฟรี 30 นาทีจากเวลาซื้อที่เซิร์ฟเวอร์กำหนด ปุ่มลองซ้ำส่ง `action: retry` และสร้างรายการซื้อใหม่ไม่ได้
- เบราว์เซอร์ยืนยันไม่ได้ว่าผู้ใช้บันทึกไฟล์ลงอุปกรณ์สำเร็จ จึงแสดงว่า “ส่งไฟล์ให้เบราว์เซอร์แล้ว” พร้อมปุ่มลองซ้ำ แทนการรับรองว่าบันทึกสำเร็จ
- รหัสรายการค้างเก็บใน sessionStorage แยกบัญชีและภาพ เมื่อปิดพื้นที่เก็บข้อมูลยังลองซ้ำในหน้าที่ยังเปิดอยู่ได้

## API และสิทธิ์

- `GET /api/wallpapers/products` คืนเฉพาะข้อมูลแสดงผล ความพร้อมดาวน์โหลด ตัวตน session และเครดิตคงเหลือ ไม่คืน private path หรือ secret
- `POST /api/wallpapers/download` รับ `{ productId, requestId, action: 'start' | 'retry' }` ไม่รับราคา/เจ้าของจากเบราว์เซอร์
- ตรวจ Auth `getUser()` และปฏิเสธ anonymous sign-in อ่านไฟล์และตรวจ checksum ก่อนเรียก RPC แล้วส่ง PNG ผ่าน response `private, no-store`
- `401` ต้องล็อกอิน, `402` เครดิตไม่พอ, `400` ข้อมูลผิด, `403` origin ผิด, `404` ภาพไม่พร้อม, `409` รายการหมดอายุ/ไม่พบ/ไม่ตรงภาพ, `503` ตั้งค่าหรือส่งไฟล์ขัดข้อง
- ถ้า RPC ขาดการเชื่อมต่อหลัง commit อาจยังหักเครดิตแล้ว จึงคืน `DOWNLOAD_RESULT_UNKNOWN` และให้ลองรหัสเดิม ไม่อ้างว่ายังไม่ได้หัก
- หากซื้อใหม่ไม่ผ่านอย่างชัดเจน เช่น เครดิตไม่พอ ให้คืนรายการเดิมที่ยังลองซ้ำได้ ส่วนผลเครือข่ายที่ไม่แน่ชัดยังเก็บรหัสคำขอล่าสุด และไม่แสดงผลของภาพเดิมทับภาพที่เพิ่งเปิดใหม่
- RPC `purchase_wallpaper_download` ใช้ได้เฉพาะ service_role ล็อก wallet และเขียน receipt/ledger ใน transaction เดียว ใช้ welcome credits ที่ไม่หมดอายุก่อน
- `wallpaper_products` แยกจากตาราง `wallpapers` เดิม เพื่อไม่ให้การเพิ่ม 4 แถวแทนที่แกลเลอรี fallback เดิม
- bucket `premium-wallpaper-originals` เป็น private และมี restrictive policy ปิดสิทธิ์ browser แม้มี permissive policy เพิ่มภายหลัง ไม่เปลี่ยน bucket สาธารณะเดิม

## เนื้อหาและชื่อไฟล์ภาพ

- ใช้ข้อความที่ผู้ใช้ให้สำหรับ “น้ำตกแสงอาทิตย์ · อาชาแห่งความสำเร็จ” และ “สไตล์จีน · อาชาภูผาหยก” โดยปรับรายละเอียดของภาพแนวตั้ง/แนวนอนให้ตรงรูปจริง
- แยกคำอธิบายภาพออกจากหัวข้อ “ความหมายมงคลตามความเชื่อ” แสดงใกล้ภาพบนการ์ด รายละเอียด และส่วนอ่านแนวคิดที่ render จากเซิร์ฟเวอร์
- Alt text ต่างกันทั้ง 4 ไฟล์ตามฉากจริง ใช้ชื่อไฟล์ WebP สาธารณะที่บรรยายภาพ และชื่อ PNG ดาวน์โหลดจาก `downloadFilename` เดียวกันทั้ง API และเบราว์เซอร์
- PNG ของภาพหลักใช้ `eight-horses-waterfall-sunlight-wallpaper.png` และ `eight-horses-jade-mountains-chinese-wallpaper.png`; อีกสองภาพเพิ่ม `desktop`/`mobile` เพื่อไม่ให้ชื่อไฟล์ซ้ำ
- คงรหัสสินค้าและ private immutable paths เดิม ไม่เปลี่ยนสิทธิ์หรือการหักเครดิต
- แนวทางชื่อไฟล์ คำอธิบายใกล้ภาพ และ Alt text: [Google Image SEO](https://developers.google.com/search/docs/appearance/google-images)

## ติดตั้งจริง

1. ใช้ migration `supabase/migrations/20261119033338_paid_horse_wallpapers.sql` สินค้าทั้ง 4 เริ่ม `active=false` (ติดตั้งในโครงการจริงแล้ว เวอร์ชันตรงกับประวัติ migration)
2. ตั้งค่า `SUPABASE_SERVICE_ROLE_KEY` ฝั่งเซิร์ฟเวอร์และใน `.env.local` สำหรับสคริปต์ติดตั้ง ห้ามส่ง key ในแชตหรือ Commit
3. วาง PNG ต้นฉบับที่ผู้ใช้ให้ไว้ใน Downloads หรือกำหนด `WALLPAPER_SOURCE_DIR` แล้วรัน `node scripts/horse-wallpaper-assets.mjs --upload`
4. สคริปต์ตรวจ checksum/ขนาด อัปโหลดด้วยชื่อ immutable ไม่ทับไฟล์ ตรวจอ่านกลับทั้ง 4 ไฟล์ก่อนเปิดสินค้าพร้อมกัน รันซ้ำไม่สร้างสินค้า/ไฟล์ซ้ำ
5. ตรวจว่า private URL ปฏิเสธ guest/member และ products API พร้อม ไม่ทดสอบหักเครดิตสมาชิกจริง

สร้างภาพตัวอย่างใหม่ด้วย `node scripts/horse-wallpaper-assets.mjs --previews` โดยคงสัดส่วนเดิม ไฟล์ต้นฉบับไม่อยู่ใน public หรือ Git

## ตรวจรับ

- `npm test -- src/lib/paidWallpaper.test.ts src/lib/paidWallpaperApi.test.ts`
- `node scripts/test-paid-wallpapers.mjs <path-to-@electric-sql/pglite>` ทดสอบ transaction, credits 0/14/15, welcome priority/expiry, คำขอซ้ำ, ชุดใหม่, 30 นาที, เจ้าของ, rollback, grants และ Storage RLS
- `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build`
- หน้าจอ 320/390/1280 px: เห็นม้าครบ ฟิลเตอร์ครบ 4/2/2 ภาพ modal ใช้คีย์บอร์ดได้ Escape คืนโฟกัส รูปไม่แตก และไม่มีการซื้อเมื่อกลับจากล็อกอิน

รอบนี้ไม่รวม Git Commit/Push หรือเผยแพร่โค้ด production

## ผลตรวจวันที่ 19 พฤศจิกายน 2569

- ติดตั้ง migration จริงแล้ว: สินค้า 4 รายการยัง inactive, bucket เป็น private, RPC ใช้ได้เฉพาะ service_role
- ยังไม่อัปโหลด PNG เนื่องจาก `.env.local` ยังไม่มี service key สินค้าจึงยังไม่เปิดหักเครดิต
- ชุดทดสอบทั้งหมดผ่าน 80 ไฟล์ / 426 tests พร้อม SQL transaction tests, lint, TypeScript และ production build
- ตรวจหน้าจอ 320/390/1280 px, ฟิลเตอร์ 4/2/2 รายการ, Escape คืนโฟกัส, ภาพไม่ล้นและไม่ตัดม้า รวมถึงแกลเลอรีวันเกิดเดิม
- HTML production มีบทนำ รายการภาพ 4 ลิงก์ และ FAQ ใหม่; canonical เป็น www และ title ไม่ซ้ำแบรนด์
