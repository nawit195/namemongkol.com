export type ThaiNameRoot = {
    root: string;
    meaning: string;
};

// Curated building blocks used only to ground draft meanings. The generated
// sentence is never published until an administrator approves it.
export const THAI_NAME_ROOTS: ThaiNameRoot[] = [
    { root: 'กมล', meaning: 'ใจ หรือดอกบัว' },
    { root: 'กร', meaning: 'ผู้กระทำ มือ หรือผู้สร้าง' },
    { root: 'กฤต', meaning: 'การกระทำ ความสำเร็จ หรือสิ่งที่สร้างแล้ว' },
    { root: 'กิตติ', meaning: 'ชื่อเสียงและเกียรติคุณ' },
    { root: 'คุณ', meaning: 'ความดี คุณธรรม และคุณค่า' },
    { root: 'จิร', meaning: 'ยั่งยืน ยาวนาน' },
    { root: 'ญาณ', meaning: 'ปัญญาหยั่งรู้' },
    { root: 'ณัฐ', meaning: 'นักปราชญ์ ผู้มีความรู้' },
    { root: 'เดช', meaning: 'อำนาจ บารมี' },
    { root: 'ธรรม', meaning: 'ความดี ความถูกต้อง และคุณธรรม' },
    { root: 'ธีร', meaning: 'นักปราชญ์ ผู้สุขุม' },
    { root: 'ธีร์', meaning: 'นักปราชญ์ ผู้มีปัญญา' },
    { root: 'นันท์', meaning: 'ความยินดี ความสุข' },
    { root: 'นภ', meaning: 'ท้องฟ้า' },
    { root: 'นภัส', meaning: 'ท้องฟ้า แสงสว่าง' },
    { root: 'นรินทร์', meaning: 'ผู้เป็นใหญ่ในหมู่คน' },
    { root: 'ภัทร', meaning: 'ความดีงาม ความเจริญ' },
    { root: 'ภูมิ', meaning: 'แผ่นดิน ภูมิรู้ หรือความสง่างาม' },
    { root: 'เมธ', meaning: 'ปัญญา ความฉลาด' },
    { root: 'รัตน์', meaning: 'แก้ว ของมีค่า' },
    { root: 'รินทร์', meaning: 'ผู้เป็นใหญ่' },
    { root: 'วรรณ', meaning: 'ผิวพรรณ สีสัน หรือความงดงาม' },
    { root: 'วร', meaning: 'ประเสริฐ ดีเลิศ' },
    { root: 'วริศ', meaning: 'ผู้ประเสริฐ ผู้เป็นใหญ่' },
    { root: 'วิชญ์', meaning: 'ผู้รู้ ผู้มีปัญญา' },
    { root: 'วิท', meaning: 'ความรู้' },
    { root: 'ศรี', meaning: 'สิริมงคล ความรุ่งเรือง' },
    { root: 'สิริ', meaning: 'สิริมงคล ความเจริญ' },
    { root: 'สร', meaning: 'ผู้สร้าง หรือสิ่งอันประเสริฐตามบริบทของคำ' },
    { root: 'อร', meaning: 'งดงาม อ่อนโยน' },
    { root: 'อารี', meaning: 'ผู้มีน้ำใจ เอื้อเฟื้อ' },
    { root: 'ไกร', meaning: 'ยิ่งใหญ่ เด่นไกล' },
    { root: 'โกมล', meaning: 'อ่อนโยน งดงาม หรือดอกบัว' },
    { root: 'โกวิท', meaning: 'ผู้รอบรู้ ผู้เชี่ยวชาญ' },
    { root: 'โกมินทร์', meaning: 'ผู้เป็นใหญ่ ผู้คุ้มครอง' },
].sort((a, b) => b.root.length - a.root.length);
