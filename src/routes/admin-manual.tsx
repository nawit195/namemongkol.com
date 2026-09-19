import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  Globe,
  Info,
  ListChecks,
  Mail,
  MessageSquare,
  Newspaper,
  Package,
  Search,
  Settings,
  ShieldAlert,
  Tags,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin-manual")({
  component: AdminManualPage,
  head: () => ({
    meta: [
      { title: "คู่มือการใช้งาน Admin Panel | Matrix Intertrade" },
      { name: "robots", content: "noindex,nofollow" },
      {
        name: "description",
        content:
          "คู่มือการใช้งานระบบหลังบ้าน Matrix Intertrade สำหรับจัดการสินค้า บทความ แบรนด์ โซลูชัน ติดต่อ Footer LINE และ Tracking Settings",
      },
    ],
  }),
});

type ManualSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  affected: string;
  steps: string[];
  cautions: string[];
  terms?: string[];
};

const workflowItems = [
  {
    title: "เข้าสู่ระบบและโหลดข้อมูล",
    body: "เปิด /admin แล้วเข้าสู่ระบบด้วยบัญชีผู้ดูแล เมื่อระบบโหลดสำเร็จจะเห็นอีเมลผู้ใช้งาน เวลา sync ล่าสุด และรายการแต่ละเมนู",
  },
  {
    title: "ค้นหาและเลือกรายการ",
    body: "ใช้ช่อง Search this section เพื่อกรองรายการในเมนูที่เปิดอยู่ จากนั้นเลือกรายการด้านซ้ายเพื่อแก้ไขรายละเอียด",
  },
  {
    title: "แก้ไขและดู Preview",
    body: "แก้ข้อมูลในฟอร์มด้านกลาง แล้วตรวจ preview ด้านขวา โดยเฉพาะรูปภาพ ข้อความสรุป slug และ SEO preview",
  },
  {
    title: "บันทึกหรือเผยแพร่",
    body: "Products และ Articles มี Save draft กับ Publish ส่วนเมนูอื่นใช้ Save changes หลังบันทึกควรกด Refresh และเปิดหน้าจริงตรวจอีกครั้ง",
  },
  {
    title: "เปิด Draft preview",
    body: "หลัง Save draft สำหรับ Products หรือ Articles ให้กด Preview draft เพื่อเปิด /admin-preview/... ในแท็บใหม่ โดย preview จะใช้ข้อมูลที่บันทึกล่าสุดและต้องใช้ session admin เดียวกัน",
  },
];

const manualSections: ManualSection[] = [
  {
    id: "products",
    title: "All Products",
    subtitle: "จัดการสินค้า รูปภาพ ราคา แบรนด์ รายละเอียด Rich Text และ SEO",
    icon: Package,
    affected: "หน้า Product Line, หน้า product detail, filter แบรนด์ และผลลัพธ์ SEO ของสินค้า",
    steps: [
      "เลือกสินค้าที่ต้องแก้ หรือกด Add new หากต้องสร้างสินค้าใหม่",
      "กรอกชื่อสินค้า slug รูปหลัก คำอธิบายสั้น ราคา แบรนด์ และแหล่งอ้างอิงตามข้อมูลที่ได้รับ",
      "ใช้ Rich Text สำหรับรายละเอียดสินค้า เช่น จุดเด่น ตารางสเปก รูปประกอบ และลิงก์ที่เกี่ยวข้อง",
      "ตรวจ SEO Title, Meta Description, Social title และ Social image ก่อนเผยแพร่",
      "ใช้ Save draft หากยังไม่พร้อมแสดงหน้าเว็บ และใช้ Publish เมื่อตรวจเนื้อหาเสร็จแล้ว",
      "หลัง Save draft ให้กด Preview draft เพื่อดูหน้าสินค้าแบบ draft ก่อน Publish",
    ],
    cautions: [
      "slug ควรเป็นภาษาอังกฤษตัวเล็ก ใช้ hyphen และไม่ซ้ำกับสินค้าอื่น",
      "รูปภาพต้องเป็น URL ที่เปิดใน browser ได้ และไม่ควรเป็นไฟล์ส่วนตัว",
      "อย่าใส่ข้อมูลต้นทุนหรือราคาภายในลงใน Description หรือ Rich Text",
      "หากแก้ข้อมูลหลัง Save draft ต้องกด Save draft อีกครั้งก่อนเปิด preview เพื่อให้เห็นข้อมูลล่าสุด",
    ],
    terms: [
      "Product ID",
      "Slug",
      "Description Text",
      "Rich Text",
      "Brand Slug",
      "SEO",
      "Preview draft",
    ],
  },
  {
    id: "articles",
    title: "Articles",
    subtitle: "สร้างและแก้ไขบทความ ข่าวสาร คู่มือ และ content SEO",
    icon: Newspaper,
    affected: "หน้า Blog, หน้า blog detail, บทความแนะนำ และผลลัพธ์การแชร์บน Social",
    steps: [
      "กรอก Title และปล่อยให้ระบบช่วยสร้าง slug หรือระบุ slug เองเมื่อจำเป็น",
      "เลือก Category ให้ตรงกับเนื้อหา เช่น LED Display, Interactive Display หรือ Case Study",
      "ใส่ Cover Image, Excerpt และเนื้อหาใน Rich Text editor",
      "จัด heading, bullet, link และรูปภาพให้เหมาะกับการอ่านบนมือถือ",
      "ตรวจ Featured, Published Date และ SEO ก่อนใช้ Publish",
      "หลัง Save draft ให้กด Preview draft เพื่อดูหน้าบทความแบบ draft ก่อน Publish",
    ],
    cautions: [
      "อย่าคัดลอกบทความยาวจากแหล่งอื่นโดยไม่ตรวจลิขสิทธิ์",
      "รูปปกควรเกี่ยวข้องกับเนื้อหาและไม่มีข้อมูลลูกค้าหรือโลโก้ที่ไม่ได้รับอนุญาต",
      "หากบทความยังไม่สมบูรณ์ให้ใช้ Save draft ก่อน",
      "หากหน้า preview ไม่ตรงกับข้อมูลที่เพิ่งแก้ ให้กลับมากด Save draft อีกครั้ง",
    ],
    terms: [
      "Title",
      "Category",
      "Cover Image",
      "Excerpt",
      "Published Date",
      "Featured",
      "Preview draft",
    ],
  },
  {
    id: "article-categories",
    title: "Article Categories",
    subtitle: "จัดหมวดหมู่บทความและภาพหมวดสำหรับหน้า Blog",
    icon: Tags,
    affected: "ตัวกรองบทความ หน้า Blog และการจัดกลุ่มเนื้อหาความรู้",
    steps: [
      "ตั้งชื่อหมวดให้เข้าใจง่ายและสอดคล้องกับบทความจริง",
      "กำหนด slug ของหมวดเป็นภาษาอังกฤษ",
      "ใส่คำอธิบายสั้นเพื่อให้ทีมเข้าใจขอบเขตของหมวด",
      "ตรวจว่าบทความเดิมยังอยู่ในหมวดที่ถูกต้องหลังแก้ไข",
    ],
    cautions: [
      "อย่าสร้างหมวดซ้ำกันด้วยชื่อใกล้เคียง",
      "หากเปลี่ยน slug ของหมวด ควรตรวจบทความที่เชื่อมกับหมวดนั้น",
    ],
    terms: ["Label", "Slug", "Description", "Category image"],
  },
  {
    id: "brands",
    title: "Brands",
    subtitle: "จัดการแบรนด์ โลโก้ รูปภาพ หน้าแบรนด์ และข้อมูล SEO",
    icon: Building2,
    affected: "หน้า Brands, หน้า /brands/{slug}, filter สินค้า และหน้า category ของแบรนด์",
    steps: [
      "ตรวจชื่อแบรนด์ slug และ category ให้ตรงกับโครงสร้างสินค้า",
      "อัปโหลดหรือระบุ Logo URL และ Image URL ที่เหมาะกับหน้าเว็บ",
      "กรอก Description, Tagline และข้อมูลหน้า category เมื่อแบรนด์มีหน้ารวมเฉพาะ",
      "ตรวจ Highlights และ Best For JSON เฉพาะกรณีที่ต้องปรับรายละเอียดขั้นสูง",
      "เปิดหน้าแบรนด์จริงหลังบันทึกเพื่อดูโลโก้และรูปภาพ",
    ],
    cautions: [
      "โลโก้ควรเป็นไฟล์ชัดเจน พื้นหลังเหมาะกับเว็บ และไม่ถูกบีบผิดสัดส่วน",
      "การแก้ slug ของแบรนด์อาจกระทบลิงก์สินค้าและ navigation",
      "JSON ขั้นสูงต้องเป็นรูปแบบถูกต้องก่อนบันทึก",
    ],
    terms: ["Logo URL", "Image URL", "Category ID", "Highlights JSON", "Best For JSON"],
  },
  {
    id: "solutions",
    title: "Solutions",
    subtitle: "จัดการบริการหลัก เช่น LED Display, Interactive Display และ AV Solutions",
    icon: Wrench,
    affected: "หน้าแรก เมนูหลัก หน้า solution detail และ internal links ที่เกี่ยวข้อง",
    steps: [
      "ตรวจ slug, title, icon และ description ให้ตรงกับบริการจริง",
      "ระบุ Image URL หากต้องการแทนรูป fallback ของระบบ",
      "แก้ Payload JSON เฉพาะเมื่อต้องปรับ intro, bullet, FAQ หรือ related links",
      "ตรวจ SEO และ Social fields สำหรับแต่ละ solution",
      "เปิดหน้าจริงของ solution หลัง Save changes",
    ],
    cautions: [
      "slug ของ solution มักเป็น URL สำคัญ ไม่ควรเปลี่ยนโดยไม่ตรวจลิงก์เดิม",
      "Payload JSON ผิดรูปแบบจะทำให้บันทึกไม่ได้",
      "คำอธิบายควรเป็นภาษาลูกค้า อ่านแล้วเข้าใจบริการ ไม่ใช่ภาษาภายในทีม",
    ],
    terms: ["Icon", "Payload JSON", "FAQ", "Related Links", "SEO"],
  },
  {
    id: "industries",
    title: "Industries",
    subtitle: "จัดการกลุ่มลูกค้า showcase card, metric, visibility และหน้าอุตสาหกรรม",
    icon: Users,
    affected: "หน้าแรก, หน้า Brands, หน้า About Us และหน้า /industry/{slug}",
    steps: [
      "ตั้ง title, icon และ description สำหรับหน้าอุตสาหกรรม",
      "กำหนด Showcase Card Image, card tag, metric value และ metric label",
      "ใช้ Show on homepage and /brands เพื่อควบคุมการแสดงการ์ด",
      "กำหนด Card Order เพื่อเรียงลำดับการ์ด",
      "ตรวจหน้า /industry/{slug} และ section ที่ใช้ร่วมกันหลังบันทึก",
    ],
    cautions: [
      "metric ควรเป็นตัวเลขที่ทีมยืนยันได้",
      "ปิด Show on homepage and /brands หากรายการยังไม่พร้อมเผยแพร่",
      "รูป showcase ควรไม่มีข้อมูลลูกค้าหรือพื้นที่ติดตั้งที่เป็นความลับ",
    ],
    terms: ["Showcase Image", "Show on homepage", "Card Order", "Metric", "Payload JSON"],
  },
  {
    id: "company-profile",
    title: "ข้อมูลบริษัท",
    subtitle: "จุดเดียวสำหรับแก้ข้อมูลบริษัทที่แสดงทั้งหน้าบ้านและ Structured Data",
    icon: Building2,
    affected: "Header, Footer, Contact, About, หน้าสินค้า, Chatbot และ Company Schema",
    steps: [
      "กรอกชื่อบริษัทและคำอธิบายทั้งภาษาไทยและภาษาอังกฤษ",
      "กรอกที่อยู่แยกตามบ้านเลขที่ ตำบล อำเภอ จังหวัด รหัสไปรษณีย์ และประเทศ",
      "กรอกเบอร์สำนักงานและฝ่ายขายเป็นตัวเลขติดกัน โดยระบบจะจัดรูปแบบให้อัตโนมัติ",
      "ตรวจอีเมลสาธารณะ เว็บไซต์ LINE และ Social Media ที่ได้รับการยืนยันแล้ว",
      "ตรวจพิกัด ลิงก์นำทาง เวลาทำการ และสถานะพร้อมสร้าง Structured Data ก่อนบันทึก",
      "เปิดหน้า Contact และหน้าแรกเพื่อตรวจข้อมูลจริงหลังบันทึก",
    ],
    cautions: [
      "อีเมลในเมนูนี้จะแสดงต่อสาธารณะ ไม่ใช่อีเมลภายในที่รับข้อความจากฟอร์ม",
      "อย่าเพิ่ม Social URL ที่ยังไม่ได้ยืนยันว่าเป็นบัญชีทางการ",
      "พิกัดแผนที่ต้องตรวจสอบก่อนแก้ เพราะมีผลกับปุ่มนำทางและ Schema",
    ],
    terms: ["Company Profile", "Public Email", "Postal Address", "Coordinates", "Schema"],
  },
  {
    id: "about",
    title: "เกี่ยวกับเรา (About)",
    subtitle: "จัดการประวัติบริษัท เรื่องราว วิสัยทัศน์ และสถิติ",
    icon: Info,
    affected: "หน้า /aboutus และข้อมูลความน่าเชื่อถือของบริษัท",
    steps: [
      "แก้ Intro Title และ Intro Description ให้เล่า positioning ของบริษัทชัดเจน",
      "อัปเดต Story, Mission, Vision และ Values ตามข้อความที่อนุมัติแล้ว",
      "แก้ Stats JSON เมื่อต้องปรับตัวเลขสถิติบนหน้า About",
      "เปิด /aboutus เพื่อตรวจการขึ้นบรรทัดของภาษาไทยและความถูกต้องของข้อมูล",
    ],
    cautions: [
      "ที่อยู่ โทรศัพท์ อีเมล เว็บไซต์ และแผนที่ต้องแก้จากเมนูข้อมูลบริษัท",
      "Stats JSON ต้องถูกต้อง และตัวเลขต้องได้รับการยืนยันก่อนเผยแพร่",
    ],
    terms: ["Intro", "Story", "Mission", "Vision", "Values", "Stats JSON"],
  },
  {
    id: "contact-submissions",
    title: "Contact Submissions",
    subtitle: "อ่าน lead จากฟอร์มติดต่อและจัดสถานะอ่านแล้ว",
    icon: MessageSquare,
    affected: "ข้อมูลหลังบ้านเท่านั้น ไม่เปลี่ยนหน้าเว็บสาธารณะ",
    steps: [
      "เลือก submission เพื่อดูชื่อ บริษัท อีเมล เบอร์โทร หัวข้อ และข้อความ",
      "ติดต่อกลับผ่านช่องทางที่ลูกค้าให้ไว้ตาม workflow ของทีมขาย",
      "เปิด Mark as Read หลังทีมรับเรื่องแล้ว",
      "กด Save changes เพื่อบันทึกสถานะการอ่าน",
    ],
    cautions: [
      "ข้อมูลในเมนูนี้เป็นข้อมูลส่วนบุคคล ห้ามนำไปใส่ในคู่มือหรือส่งต่อโดยไม่จำเป็น",
      "อย่าลบ submission หากยังไม่ได้สำรองหรือส่งต่อให้ผู้รับผิดชอบ",
    ],
    terms: ["Submitted At", "Topic", "Message", "Mark as Read"],
  },
  {
    id: "contact-us",
    title: "Contact Us",
    subtitle: "แก้ข้อความหน้า Contact รายละเอียดประกอบแผนที่ และ SEO",
    icon: Mail,
    affected: "หน้า /contactus, ฟอร์มติดต่อ และข้อมูลติดต่อที่ลูกค้าเห็น",
    steps: [
      "แก้ Hero Title, Hero Description และ Contact Section ให้ตรงกับข้อความที่ต้องการสื่อสาร",
      "ตรวจ SEO Title และ Meta Description สำหรับหน้า Contact",
      "กด Save changes แล้วเปิด /contactus ตรวจฟอร์มและแผนที่",
    ],
    cautions: [
      "ข้อมูลติดต่อ แผนที่ และเวลาทำการต้องแก้จากเมนูข้อมูลบริษัท",
    ],
    terms: ["Hero", "Contact Section", "Map Copy", "SEO"],
  },
  {
    id: "footer",
    title: "Footer",
    subtitle: "แก้ CTA ท้ายเว็บ คำอธิบายบริษัท และ Newsletter",
    icon: Globe,
    affected: "Footer ทุกหน้าของเว็บไซต์ และ CTA ท้ายหน้า",
    steps: [
      "แก้ CTA Title และ CTA Description ให้ตรงกับข้อเสนอหลักของบริษัท",
      "ตรวจ Company Description ทั้งภาษาไทยและภาษาอังกฤษ",
      "ปรับ Newsletter text และ placeholder หากมีการเปลี่ยนข้อความรับข่าวสาร",
      "กด Save changes แล้วสุ่มเปิดหลายหน้าเพื่อตรวจ Footer",
    ],
    cautions: [
      "Footer แสดงทุกหน้า ข้อความผิดจะกระทบทั้งเว็บไซต์",
      "ข้อมูลติดต่อและ Social URL ต้องแก้จากเมนูข้อมูลบริษัท",
    ],
    terms: ["CTA", "Company Description", "Social Links", "Newsletter"],
  },
  {
    id: "line-settings",
    title: "LINE Settings",
    subtitle: "ตั้งค่าการแจ้งเตือน LINE สำหรับฟอร์มติดต่อ",
    icon: Settings,
    affected: "ระบบแจ้งเตือนหลังลูกค้าส่งฟอร์ม Contact",
    steps: [
      "ตรวจสถานะ token และ group id จาก panel โดยไม่เปิดเผยค่าจริง",
      "กรอกค่าใหม่เฉพาะเมื่อทีมเทคนิคหรือผู้ดูแลระบบยืนยันแล้ว",
      "กด Save LINE settings เพื่อบันทึก",
      "ทดสอบด้วยการส่งฟอร์ม contact หลังตั้งค่าเสร็จ",
    ],
    cautions: [
      "ห้ามส่งต่อ token หรือ group id แบบเต็มในแชต อีเมล หรือเอกสาร public",
      "หากแจ้งเตือนไม่เข้า ให้ตรวจสิทธิ์ LINE channel และ quota ก่อนเปลี่ยนค่าใหม่",
      "เมนูนี้ควรให้ผู้ดูแลระบบหลักหรือทีมเทคนิคแก้เท่านั้น",
    ],
    terms: ["Channel Access Token", "Group ID", "Runtime settings", "Env fallback"],
  },
  {
    id: "tracking-settings",
    title: "Tracking Settings",
    subtitle: "ตั้งค่า Google Analytics และ Meta Pixel สำหรับเว็บไซต์สาธารณะ",
    icon: BarChart3,
    affected: "PageView tracking, Contact form event และ conversion tracking",
    steps: [
      "ตรวจสถานะ Google Analytics และ Meta Pixel ว่าระบบอ่านค่าจากแหล่งใด",
      "กรอก tracking ID เฉพาะค่าที่ได้รับจากบัญชีทางการของบริษัท",
      "กด Save All Tracking Settings",
      "ทดสอบด้วยเครื่องมือของแพลตฟอร์ม analytics หลัง deploy",
    ],
    cautions: [
      "อย่าใส่ tracking ID ของบัญชีส่วนตัวหรือบัญชีลูกค้ารายอื่น",
      "การแก้ tracking อาจกระทบรายงาน marketing จึงควรแจ้งทีมที่ใช้ข้อมูลก่อนเปลี่ยน",
      "ไม่ควรเผยแพร่ภาพหน้าจอที่เห็น tracking ID เต็มในคู่มือสาธารณะ",
    ],
    terms: ["Google Analytics", "Meta Pixel", "PageView", "ContactFormSubmit"],
  },
];

const checklist = [
  "ชื่อรายการ สะกดถูก และสื่อความหมายชัดเจน",
  "slug เป็นภาษาอังกฤษตัวเล็ก ใช้ hyphen และไม่ซ้ำ",
  "รูปภาพเปิดได้จริง คมชัด และไม่มีข้อมูลลับ",
  "ข้อความสรุปอ่านรู้เรื่องภายใน 1 ถึง 3 ประโยค",
  "Rich Text มี heading, paragraph, bullet และ link ที่อ่านง่าย",
  "SEO Title และ Meta Description ไม่ยาวเกินไป",
  "Preview ใน Admin ดูถูกต้องก่อนบันทึก",
  "หลัง Save draft ของ Products หรือ Articles ให้กด Preview draft ตรวจหน้าฉบับร่างก่อน Publish",
  "หากมี unsaved changes ให้ Save draft อีกครั้งก่อนเปิด preview",
  "เปิดหน้าจริงหลัง Save หรือ Publish เพื่อตรวจผลอีกครั้ง",
];

const troubleshooting = [
  {
    problem: "Save ไม่ผ่าน",
    reason: "session หมดอายุ, field จำเป็นยังว่าง หรือ JSON ผิดรูปแบบ",
    fix: "Refresh หน้า, login ใหม่ และตรวจ error ของ field ที่ระบบแจ้ง",
  },
  {
    problem: "รูปไม่แสดง",
    reason: "URL เปิดไม่ได้, ไฟล์ไม่ public หรือไฟล์เสีย",
    fix: "อัปโหลดใหม่หรือใช้ URL ที่เปิดจาก browser ได้โดยตรง",
  },
  {
    problem: "หน้าเว็บยังไม่อัปเดต",
    reason: "ยังไม่ได้ Publish, cache ยังไม่ refresh หรือดู URL ผิดหน้า",
    fix: "กด Publish หรือ Save changes แล้ว reload หน้าจริงอีกครั้ง",
  },
  {
    problem: "กด Preview draft ไม่ได้",
    reason: "ยังไม่ได้ Save draft หรือรายการใหม่ยังไม่เคยบันทึกสำเร็จ",
    fix: "กด Save draft ก่อน แล้วเปิด Preview draft อีกครั้ง",
  },
  {
    problem: "Draft preview ให้ login",
    reason: "session admin หมดอายุ หรือเปิด preview ใน browser ที่ไม่ได้ login",
    fix: "กลับไป /admin แล้ว login ใหม่ใน browser เดียวกัน",
  },
  {
    problem: "Preview ไม่ตรงกับข้อมูลที่เพิ่งแก้",
    reason: "ยังไม่ได้ Save draft หลังแก้ข้อมูลล่าสุด",
    fix: "กด Save draft อีกครั้ง แล้ว refresh หน้า preview",
  },
  {
    problem: "slug ซ้ำ",
    reason: "URL ชนกับรายการเดิม",
    fix: "เปลี่ยน slug ให้เฉพาะเจาะจง เช่น เพิ่มรุ่นสินค้า ปี หรือหมวด",
  },
  {
    problem: "LINE ไม่แจ้งเตือน",
    reason: "token ไม่ถูกต้อง, group id ผิด หรือสิทธิ์ channel ไม่ครบ",
    fix: "ให้ผู้ดูแลระบบตรวจ LINE Settings และทดสอบส่งฟอร์มอีกครั้ง",
  },
];

function AdminManualPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return manualSections;
    return manualSections.filter((section) => {
      const haystack = [
        section.title,
        section.subtitle,
        section.affected,
        ...section.steps,
        ...section.cautions,
        ...(section.terms ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,oklch(0.985_0.006_250),white_22rem)] text-foreground">
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container-x mx-auto grid max-w-7xl gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-end lg:py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-white/15 bg-white/10 text-white hover:bg-white/10">
              Admin Panel
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-normal md:text-5xl">
              คู่มือการใช้งานระบบหลังบ้าน Content management
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-primary-foreground/82 md:text-lg">
              คู่มือสำหรับดูแลเนื้อหาเว็บไซต์ Matrix Intertrade ตั้งแต่สินค้า บทความ แบรนด์ โซลูชัน
              หน้าเกี่ยวกับเรา ข้อมูลติดต่อ Footer การแจ้งเตือน LINE และ Tracking Settings
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-primary hover:bg-white/90">
                <a href="#workflow">
                  <ListChecks className="mr-2 h-4 w-4" />
                  เริ่มจาก workflow
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="/admin" target="_blank" rel="noopener noreferrer">
                  เปิด Admin Panel
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/8 p-5 shadow-[0_24px_60px_-36px_oklch(0_0_0/0.75)]">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan text-cyan-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Public manual</p>
                <p className="text-sm text-primary-foreground/72">URL: /admin-manual</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <Metric value="12" label="หัวข้อ" />
              <Metric value="5" label="ขั้นตอนหลัก" />
              <Metric value="0" label="secret" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="container-x mx-auto max-w-7xl py-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาหัวข้อ เช่น Product, SEO, LINE, Footer, Preview"
              className="h-12 rounded-xl border-border bg-secondary/45 pl-11 text-base"
            />
          </div>
        </div>
      </section>

      <div className="container-x mx-auto grid max-w-7xl gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-white p-4 shadow-card">
            <p className="mb-3 text-sm font-semibold text-primary">สารบัญ</p>
            <nav className="space-y-1">
              <TocLink href="#workflow" label="Workflow ทั่วไป" />
              <TocLink href="#draft-preview" label="Draft Preview" />
              {manualSections.map((section) => (
                <TocLink key={section.id} href={`#${section.id}`} label={section.title} />
              ))}
              <TocLink href="#checklist" label="Checklist" />
              <TocLink href="#troubleshooting" label="Troubleshooting" />
            </nav>
          </div>
        </aside>

        <main className="space-y-10">
          <section id="workflow" className="scroll-mt-24">
            <SectionHeading
              eyebrow="Workflow"
              title="ขั้นตอนทำงานใน Admin Panel"
              description="ใช้ลำดับนี้เป็นมาตรฐานทุกครั้งก่อนแก้เนื้อหา เพื่อให้ทีมตรวจผลได้ครบและลดความเสี่ยงจากข้อมูลผิด"
            />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {workflowItems.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-white p-5 shadow-card"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <div className="flex flex-col gap-4 md:flex-row">
              <ShieldAlert className="h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h2 className="text-lg font-semibold">ข้อควรระวังเรื่องข้อมูลลับ</h2>
                <p className="mt-2 text-sm leading-7">
                  คู่มือนี้เป็นลิงก์สาธารณะ จึงห้ามใส่ token, API key, Supabase session, tracking ID
                  แบบเต็ม, อีเมลลูกค้า หรือข้อความจาก contact form ที่ระบุตัวบุคคลได้
                  หากต้องใช้ภาพหน้าจอให้ crop และปิดข้อมูลสำคัญก่อนเสมอ
                </p>
              </div>
            </div>
          </section>

          <section id="draft-preview" className="scroll-mt-24">
            <SectionHeading
              eyebrow="Draft Preview"
              title="การดูหน้า Preview ของฉบับร่าง"
              description="ใช้สำหรับ Products และ Articles ที่บันทึกเป็น draft แล้ว เพื่อให้ทีมตรวจหน้าจริงก่อน Publish โดยไม่ทำให้ draft เปิดผ่าน URL สาธารณะปกติ"
            />
            <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">วิธีเปิด Draft preview</h3>
                </div>
                <ol className="space-y-3">
                  {[
                    "กรอกข้อมูล Product หรือ Article แล้วกด Save draft ให้สำเร็จก่อน",
                    "ที่แผง Preview ด้านขวา ปุ่ม Open จะเปลี่ยนเป็น Preview draft สำหรับรายการ draft",
                    "กด Preview draft เพื่อเปิด /admin-preview/product/{slug} หรือ /admin-preview/blog/{slug} ในแท็บใหม่",
                    "ตรวจ hero, รูป, title, category/brand, excerpt/description, rich text และ status badge",
                    "เมื่อ Publish แล้ว ปุ่ม Open จะกลับไปเปิดหน้า public จริง เช่น /product/{slug} หรือ /blog/{slug}",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-5">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <ShieldAlert className="h-5 w-5 text-accent" />
                  ข้อควรจำด้านความปลอดภัย
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  <li>Draft preview ต้องใช้ session admin จาก browser เดียวกับที่ login /admin</li>
                  <li>ไม่มี token, secret หรือ preview key อยู่ใน URL</li>
                  <li>หากยังเป็นรายการใหม่และไม่เคย Save draft ปุ่ม preview จะถูกปิดไว้</li>
                  <li>
                    หากแก้ข้อมูลหลัง save ระบบ preview จะแสดงข้อมูลที่บันทึกล่าสุด ให้ Save draft
                    อีกครั้งก่อนตรวจ
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading
              eyebrow="Menu Guide"
              title="คู่มือรายหัวข้อ"
              description={
                normalizedQuery
                  ? `พบ ${filteredSections.length} หัวข้อที่ตรงกับคำค้นหา`
                  : "ครอบคลุมทุก tab ที่ใช้ดูแล Content management ในระบบหลังบ้าน"
              }
            />
            {filteredSections.length > 0 ? (
              <div className="space-y-5">
                {filteredSections.map((section) => (
                  <ManualSectionCard key={section.id} section={section} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-semibold text-primary">ไม่พบหัวข้อที่ค้นหา</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  ลองค้นด้วยคำว่า Product, Blog, SEO, LINE, Footer หรือ Preview
                </p>
              </div>
            )}
          </section>

          <section id="checklist" className="scroll-mt-24">
            <SectionHeading
              eyebrow="Checklist"
              title="ตรวจให้ครบก่อน Save หรือ Publish"
              description="รายการสั้นๆ สำหรับใช้ก่อนบันทึกสินค้าหรือบทความที่มีผลต่อหน้าเว็บสาธารณะ"
            />
            <div className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-card">
              <div className="grid gap-3 md:grid-cols-2">
                {checklist.map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl bg-secondary/45 p-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm leading-7 text-primary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="troubleshooting" className="scroll-mt-24">
            <SectionHeading
              eyebrow="Troubleshooting"
              title="แนวทางแก้ปัญหาเบื้องต้น"
              description="ใช้ตรวจอาการที่พบได้บ่อยก่อนส่งต่อให้ทีมเทคนิค"
            />
            <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-card">
              <div className="grid border-b border-border bg-secondary/60 px-4 py-3 text-sm font-semibold text-primary md:grid-cols-[1fr_1.3fr_1.4fr]">
                <span>ปัญหา</span>
                <span className="hidden md:block">สาเหตุที่พบบ่อย</span>
                <span className="hidden md:block">วิธีแก้</span>
              </div>
              {troubleshooting.map((row) => (
                <div
                  key={row.problem}
                  className="grid gap-2 border-b border-border px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_1.3fr_1.4fr]"
                >
                  <div className="font-semibold text-primary">{row.problem}</div>
                  <div className="text-muted-foreground">{row.reason}</div>
                  <div className="text-muted-foreground">{row.fix}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">พร้อมแก้เนื้อหาแล้ว</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-primary-foreground/78">
                  เปิด Admin Panel ในแท็บใหม่ แล้วใช้คู่มือนี้ประกอบการแก้ไขทีละหัวข้อ
                </p>
              </div>
              <Button asChild className="bg-white text-primary hover:bg-white/90">
                <a href="/admin" target="_blank" rel="noopener noreferrer">
                  เปิด Admin Panel
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-primary-foreground/70">{label}</div>
    </div>
  );
}

function TocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-primary"
    >
      {label}
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <Badge variant="secondary" className="mb-3">
        {eyebrow}
      </Badge>
      <h2 className="text-2xl font-bold tracking-normal text-primary md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function ManualSectionCard({ section }: { section: ManualSection }) {
  const Icon = section.icon;

  return (
    <article
      id={section.id}
      className="scroll-mt-24 rounded-2xl border border-border bg-white p-5 shadow-card md:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">{section.title}</h3>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">{section.subtitle}</p>
          </div>
        </div>
        <a
          href={`#${section.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-primary"
        >
          คัดลอกตำแหน่งหัวข้อ
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-secondary/45 p-4">
        <div className="flex gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-semibold text-primary">แสดงผลหรือกระทบส่วนใด</p>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">{section.affected}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-primary">
            <ClipboardCheck className="h-5 w-5 text-accent" />
            วิธีใช้งาน
          </h4>
          <ol className="space-y-3">
            {section.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-primary">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              ข้อควรระวัง
            </h4>
            <ul className="space-y-2">
              {section.cautions.map((caution) => (
                <li
                  key={caution}
                  className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-7 text-amber-950"
                >
                  {caution}
                </li>
              ))}
            </ul>
          </div>

          {section.terms && (
            <div>
              <h4 className="mb-3 font-semibold text-primary">คำที่มักเจอในหัวข้อนี้</h4>
              <div className="flex flex-wrap gap-2">
                {section.terms.map((term) => (
                  <Badge key={term} variant="outline" className="rounded-lg">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
