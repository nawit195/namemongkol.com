"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleCategories = exports.articles = void 0;
exports.articlesByCategory = articlesByCategory;
exports.getArticle = getArticle;
const site_1 = require("./site");
Object.defineProperty(exports, "articleCategories", { enumerable: true, get: function () { return site_1.articleCategories; } });
const titles = [
    "ติดตั้งจอ LED คุณกำลังจ่ายเพื่อ “ราคา” หรือ “คุณภาพการใช้งานระยะยาว”",
    "กำลังจะติดตั้งจอ LED ถ้ายังดูแค่ราคา คุณอาจกำลังตัดสินใจผิด",
    "งบเท่านี้ซื้อจอ LED ได้แบบไหน? คู่มือวางงบ LED Display สำหรับองค์กร",
    "Hybrid Meeting ยังไม่เวิร์ก แก้ได้ด้วย Persona Interactive และระบบที่องค์กรต้องมี",
    "จอ LED 1 จอ ต้องมีอะไรบ้าง? คู่มือระบบ LED Display สำหรับองค์กรที่มือใหม่ก็เข้าใจ",
    "Active Learning ด้วย Persona ยกระดับห้องเรียนสู่ Smart Classroom",
    "Case Study อัปเกรดห้องเรียนด้วย Persona Interactive",
    "10 คำถามเชิงกลยุทธ์ที่องค์กรต้องรู้ ก่อนตัดสินใจติดตั้งจอ LED",
    "7 เหตุผลที่หน่วยงานรัฐควรติดตั้งจอ LED กลางแจ้ง แทนป้ายไวนิลแบบเดิม ๆ",
    "ทำไมจอ Persona ถึงเป็นจอสัมผัสอัจฉริยะอันดับ 1 จากไต้หวัน",
    "การดูแลและบำรุงรักษาจอ LED เพื่อให้ใช้งานได้ยาวนานในองค์กร",
    "5 เหตุผลที่จออินเตอร์แอคทีฟ กำลังเป็นมาตรฐานของห้องเรียนอัจฉริยะ",
    "Whiteboard บนจอ Persona ดีกว่าจออินเตอร์แอคทีฟทั่วไปอย่างไร",
    "LED Display vs LCD Display เลือกแบบไหนให้เหมาะกับองค์กรของคุณ",
    "จอ Persona vs Projector ต่างกันอย่างไร เลือกให้ถูกก่อนตัดสินใจซื้อ",
    "จอ Persona vs TV ทั่วไป ต่างกันแค่ไหน เทียบชัดทุกจุดแบบมืออาชีพ",
    "6 เหตุผลที่หน่วยงานรัฐควรใช้จอ LED แทนโปรเจคเตอร์",
    "ClassCraft โซลูชั่นห้องเรียนอัจฉริยะจาก Persona",
    "เลือกจอ Interactive ปี 2026 ทำไม Persona คือคำตอบ",
    "7 Checklists ที่องค์กรต้องรู้ ก่อนตัดสินใจติดตั้งจอ LED",
    "DMS+ ระบบจัดการจอจากระยะไกล ที่โรงเรียนยุคใหม่ต้องมี",
    "5 แนวทางวางระบบจอ LED สำหรับห้องประชุมองค์กรในปี 2026",
    "Google EDLA Certified คืออะไร? และทำไมจอ Persona ถึงเหนือกว่าคู่แข่ง",
    "โซลูชั่นห้องเรียนอัจฉริยะด้วย Persona Interactive",
    "อยากติดตั้งจอ LED ในองค์กร ต้องเริ่มต้นอย่างไรบ้าง?",
    "Persona Interactive ใช้สอนออนไลน์ได้ไหม? รองรับโปรแกรมอะไรบ้าง",
    "10 คำถามที่โรงเรียน-องค์กรถามบ่อยก่อนซื้อ จอ Persona",
    "9 ฟีเจอร์เด่นของ Persona Interactive Display",
    "จอ LED แบบ SMD | COB | GOB ต่างกันอย่างไร?",
    "ติดตั้งจอ LED แบบไหนดี? Indoor หรือ Outdoor - เลือกอย่างไรให้เหมาะกับธุรกิจคุณ",
    "5 ปัจจัยที่ต้องรู้ก่อนสั่งซื้อ “จอ LED” เพื่อใช้งานจริงในองค์กร",
    "ทำไมธุรกิจยุคใหม่ถึงเลือกใช้จอ LED แทนโปรเจกเตอร์แบบเดิม",
    "สิ่งที่ควรรู้ก่อนตัดสินใจ “ติดตั้งจอ LED” สำหรับองค์กรของคุณ",
    "Umate SF จาก Unilumin – จอ LED กลางแจ้งระดับพรีเมียม ที่ตอบโจทย์ DOOH ทุกโปรเจกต์",
    "Persona Interactive KTA-Pro-Full | จอสัมผัสอัจฉริยะที่ตอบโจทย์การศึกษาและธุรกิจยุคใหม่",
    "UsurfaceⅢ จาก Unilumin – จอ LED Outdoor ที่ยกระดับโฆษณากลางแจ้งสู่มาตรฐานใหม่",
    "U-Natural จาก Unilumin – จอ LED ที่ยกระดับความสมจริงสู่มิติใหม่",
    "UTV SC จาก Unilumin – จอ All In One ที่เปลี่ยนห้องประชุมให้เหนือกว่าที่เคย",
    "UMini P จาก Unilumin — จอ LED ที่สร้างประสบการณ์เหนือการแสดงผล",
    "Umate LM จาก Unilumin — จอ LED ที่ตอบโจทย์ทุกภาคธุรกิจ",
    "มาทำความรู้จักกับ Screen Resolution คืออะไร?",
    "ความแตกต่างระหว่าง Module LED และ Cabinet LED",
    "รู้หรือไม่? Pixel Pitch คืออะไร และสำคัญอย่างไรกับจอ LED!",
    "จอ LED All-in-one ครองตลาดห้องประชุม ยุค LCD กำลังจะล้าสมัย?",
    "What Is AVoverIP",
    "Smart Hospital",
    "5 เทคโนโลยีสุดล้ำ เปลี่ยนห้องประชุมธรรมดาให้กลายเป็นห้องประชุมยุคใหม่", "Matrix Intertrade ประสบความสำเร็จอย่างยิ่งใหญ่กับงาน Smart Solutions & Smart AV Technologies For Smart Southern People",
    "HDBaseT คืออะไร? เทคโนโลยีนี้ทำงานอย่างไร?",
];
function categorize(t) {
    const s = t.toLowerCase();
    if (s.includes("persona") && s.includes("classroom"))
        return "smart-classroom";
    if (s.includes("classroom") ||
        s.includes("ห้องเรียน") ||
        s.includes("โรงเรียน"))
        return "smart-classroom";
    if (s.includes("interactive") || s.includes("persona") || s.includes("whiteboard"))
        return "interactive-display";
    if (s.includes("hybrid") ||
        s.includes("meeting") ||
        s.includes("ห้องประชุม") ||
        s.includes("avoverip") ||
        s.includes("hdbaset") ||
        s.includes("kramer"))
        return "meeting-room";
    if (s.includes("case study") ||
        s.includes("smart solutions") ||
        s.includes("ประสบความสำเร็จ") ||
        s.includes("smart hospital"))
        return "case-study";
    if (s.includes("pixel") ||
        s.includes("resolution") ||
        s.includes("module") ||
        s.includes("cabinet") ||
        s.includes("คืออะไร") ||
        s.includes("ต่างกัน"))
        return "knowledge";
    return "led-display";
}
const removedBrandArticleIds = new Set([46, 47, 48, 49]);
const removedBrandArticleTitles = /Smart Solutions/i;
exports.articles = titles
    .map((title, i) => ({ title, id: i + 1 }))
    .filter(({ title, id }) => !removedBrandArticleIds.has(id) && !removedBrandArticleTitles.test(title))
    .map(({ title, id }) => {
    return {
        id,
        title,
        slug: `article-${id}`,
        category: categorize(title),
        excerpt: title.slice(0, 110) + (title.length > 110 ? "โ€ฆ" : ""),
        date: `2025-${String((((id - 1) * 3) % 12) + 1).padStart(2, "0")}-${String((((id - 1) * 7) % 27) + 1).padStart(2, "0")}`,
        readMin: 4 + ((id - 1) % 6),
    };
});
function articlesByCategory(slug) {
    return exports.articles.filter((a) => a.category === slug);
}
function getArticle(slug) {
    return exports.articles.find((a) => a.slug === slug);
}
