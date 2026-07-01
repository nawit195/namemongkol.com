export type NameTheme = 
    | 'auspicious'     // ชื่อมงคล ความหมายดี
    | 'charm'          // เสริมเมตตาและเสน่ห์
    | 'wisdom'         // เสริมความรู้และปัญญา  
    | 'wealth'         // เสริมโชคลาภและความมั่นคง
    | 'short'          // ชื่อสั้น 2 พยางค์
    | 'no-vowel';      // ชื่อไม่มีสระ (consonant-heavy)

export interface MondayGirlName {
    name: string;           // ชื่อภาษาไทย
    reading: string;        // คำอ่าน เช่น 'กัน-ยา-รัตน์'
    meaning: string;        // ความหมายภาษาไทย
    highlight: string;      // จุดเด่นของชื่อ สั้นกระชับ
    theme: NameTheme;       // หมวดหมู่
    syllables: number;      // จำนวนพยางค์
    letterGroup: string;    // อักษรนำ (ตัวแรกของชื่อ)
    thaksaCategory: string; // หมวดทักษาของอักษรนำ เป็นภาษาไทย
    numerology: number;     // ผลรวมเลขศาสตร์
    hasNoVowel: boolean;    // ชื่อไม่ขึ้นต้นด้วยสระ (ทุกชื่อที่นี่ควรเป็น true)
}

export const mondayGirlNames: MondayGirlName[] = [
    // Theme: auspicious (มงคล ความหมายดี)
    { name: 'กชพร', reading: 'กต-ชะ-พอน', meaning: 'ดอกบัวประเสริฐ', highlight: 'บริสุทธิ์ดั่งดอกบัว', theme: 'auspicious', syllables: 3, letterGroup: 'ก', thaksaCategory: 'บริวาร', numerology: 14, hasNoVowel: true },
    { name: 'กรกนก', reading: 'กอน-กะ-หนก', meaning: 'แสงทอง', highlight: 'สว่างไสว รุ่งเรือง', theme: 'auspicious', syllables: 3, letterGroup: 'ก', thaksaCategory: 'บริวาร', numerology: 14, hasNoVowel: true },
    { name: 'ชนม์พรรษ', reading: 'ชน-พัด', meaning: 'มีอายุยืนยาว', highlight: 'สุขภาพดี อายุยืน', theme: 'auspicious', syllables: 2, letterGroup: 'ช', thaksaCategory: 'อายุ', numerology: 42, hasNoVowel: true },
    { name: 'ชญานันท์', reading: 'ชะ-ยา-นัน', meaning: 'ยินดีในความรู้', highlight: 'มีความสุขกับความรู้', theme: 'auspicious', syllables: 3, letterGroup: 'ช', thaksaCategory: 'อายุ', numerology: 41, hasNoVowel: true },
    { name: 'ณัฐกฤตา', reading: 'นัด-กริ-ตา', meaning: 'ผู้สร้างความรู้', highlight: 'ฉลาดหลักแหลม', theme: 'auspicious', syllables: 3, letterGroup: 'ณ', thaksaCategory: 'เดช', numerology: 24, hasNoVowel: true },
    { name: 'ณัฏฐพัชร์', reading: 'นัด-ถะ-พัด', meaning: 'ผู้รู้ที่มีค่าดั่งเพชร', highlight: 'มีคุณค่าและฉลาด', theme: 'auspicious', syllables: 3, letterGroup: 'ณ', thaksaCategory: 'เดช', numerology: 45, hasNoVowel: true },
    { name: 'ดลพร', reading: 'ดน-ละ-พอน', meaning: 'บันดาลพร', highlight: 'นำมาซึ่งความสุข', theme: 'auspicious', syllables: 3, letterGroup: 'ด', thaksaCategory: 'ศรี', numerology: 15, hasNoVowel: true },
    { name: 'ทรรศนันทน์', reading: 'ทัด-สะ-นัน', meaning: 'มีความยินดีที่ได้เห็น', highlight: 'เป็นที่น่ายินดี', theme: 'auspicious', syllables: 3, letterGroup: 'ท', thaksaCategory: 'ศรี', numerology: 51, hasNoVowel: true },
    { name: 'บวรลักษณ์', reading: 'บะ-วอน-ลัก', meaning: 'มีลักษณะอันประเสริฐ', highlight: 'งดงาม ประเสริฐ', theme: 'auspicious', syllables: 3, letterGroup: 'บ', thaksaCategory: 'มูละ', numerology: 45, hasNoVowel: true },
    { name: 'พชรมน', reading: 'พะ-ชะ-ระ-มน', meaning: 'มีใจแกร่งดั่งเพชร', highlight: 'เข้มแข็ง มั่นคง', theme: 'auspicious', syllables: 4, letterGroup: 'พ', thaksaCategory: 'มูละ', numerology: 24, hasNoVowel: true },

    // Theme: charm (เสริมเมตตาและเสน่ห์)
    { name: 'ธัญชนก', reading: 'ทัน-ชะ-นก', meaning: 'ให้กำเนิดสิริมงคล', highlight: 'เป็นที่รักและสิริมงคล', theme: 'charm', syllables: 3, letterGroup: 'ธ', thaksaCategory: 'ศรี', numerology: 24, hasNoVowel: true },
    { name: 'นภัสสร', reading: 'นะ-พัด-สอน', meaning: 'แสงสว่างบนฟ้า', highlight: 'สดใส น่าทะนุถนอม', theme: 'charm', syllables: 3, letterGroup: 'น', thaksaCategory: 'ศรี', numerology: 24, hasNoVowel: true },
    { name: 'ปทิตตา', reading: 'ปะ-ทิด-ตา', meaning: 'รุ่งเรือง สว่างไสว', highlight: 'มีเสน่ห์ดึงดูด', theme: 'charm', syllables: 3, letterGroup: 'ป', thaksaCategory: 'มูละ', numerology: 24, hasNoVowel: true },
    { name: 'พรรณพัชร', reading: 'พัน-พัด', meaning: 'มีผิวพรรณงามดั่งเพชร', highlight: 'งดงาม เลอค่า', theme: 'charm', syllables: 3, letterGroup: 'พ', thaksaCategory: 'มูละ', numerology: 41, hasNoVowel: true },
    { name: 'ภคนันท์', reading: 'พะ-คะ-นัน', meaning: 'ยินดีในโชค', highlight: 'น่ารัก นำโชค', theme: 'charm', syllables: 3, letterGroup: 'ภ', thaksaCategory: 'มูละ', numerology: 24, hasNoVowel: true },
    { name: 'ภัทรนันท์', reading: 'พัด-ทระ-นัน', meaning: 'ยินดีในความเจริญ', highlight: 'มีเสน่ห์ เจริญรุ่งเรือง', theme: 'charm', syllables: 3, letterGroup: 'ภ', thaksaCategory: 'มูละ', numerology: 41, hasNoVowel: true },
    { name: 'มนัสพรรณ', reading: 'มะ-นัด-สะ-พัน', meaning: 'มีผิวพรรณเป็นที่ถูกใจ', highlight: 'งดงาม เป็นที่รัก', theme: 'charm', syllables: 4, letterGroup: 'ม', thaksaCategory: 'มูละ', numerology: 45, hasNoVowel: true },
    { name: 'รวิพรรณ', reading: 'ระ-วิ-พัน', meaning: 'ผิวพรรณดั่งพระอาทิตย์', highlight: 'โดดเด่น มีออร่า', theme: 'charm', syllables: 3, letterGroup: 'ร', thaksaCategory: 'อุตสาหะ', numerology: 36, hasNoVowel: true },
    { name: 'วรรณนภัส', reading: 'วัน-นะ-พัด', meaning: 'ผิวพรรณดั่งฟ้าสวรรค์', highlight: 'สวยงามบริสุทธิ์', theme: 'charm', syllables: 3, letterGroup: 'ว', thaksaCategory: 'อุตสาหะ', numerology: 41, hasNoVowel: true },
    { name: 'ศรัณยา', reading: 'สะ-รัน-ยา', meaning: 'เป็นที่พึ่ง', highlight: 'น่าพึ่งพา อบอุ่น', theme: 'charm', syllables: 3, letterGroup: 'ศ', thaksaCategory: 'มนตรี', numerology: 36, hasNoVowel: true },

    // Theme: wisdom (เสริมความรู้และปัญญา)
    { name: 'กวิสรา', reading: 'กะ-วิด-สะ-รา', meaning: 'ยอดกวี', highlight: 'ฉลาดหลักแหลม', theme: 'wisdom', syllables: 4, letterGroup: 'ก', thaksaCategory: 'บริวาร', numerology: 24, hasNoVowel: true },
    { name: 'ญาณัจฉรา', reading: 'ยา-นัด-ฉะ-รา', meaning: 'มีความรู้ดั่งนางฟ้า', highlight: 'ปราชญ์ผู้งดงาม', theme: 'wisdom', syllables: 4, letterGroup: 'ญ', thaksaCategory: 'อายุ', numerology: 41, hasNoVowel: true },
    { name: 'ญาณิน', reading: 'ยา-นิน', meaning: 'ผู้มีความรู้', highlight: 'มีปัญญาเฉียบแหลม', theme: 'wisdom', syllables: 2, letterGroup: 'ญ', thaksaCategory: 'อายุ', numerology: 24, hasNoVowel: true },
    { name: 'ณัฐณิชา', reading: 'นัด-นิ-ชา', meaning: 'ปราชญ์ผู้บริสุทธิ์', highlight: 'ฉลาดและบริสุทธิ์', theme: 'wisdom', syllables: 3, letterGroup: 'ณ', thaksaCategory: 'เดช', numerology: 24, hasNoVowel: true },
    { name: 'ณัฐธิดา', reading: 'นัด-ทิ-ดา', meaning: 'ลูกสาวของนักปราชญ์', highlight: 'ใฝ่รู้ เฉลียวฉลาด', theme: 'wisdom', syllables: 3, letterGroup: 'ณ', thaksaCategory: 'เดช', numerology: 24, hasNoVowel: true },
    { name: 'ทักษพร', reading: 'ทัก-สะ-พอน', meaning: 'ฉลาดและประเสริฐ', highlight: 'เก่งกาจและดีงาม', theme: 'wisdom', syllables: 3, letterGroup: 'ท', thaksaCategory: 'ศรี', numerology: 36, hasNoVowel: true },
    { name: 'ธัญญลักษณ์', reading: 'ทัน-ยะ-ลัก', meaning: 'ลักษณะของผู้มีโชคและปัญญา', highlight: 'ฉลาดและโชคดี', theme: 'wisdom', syllables: 3, letterGroup: 'ธ', thaksaCategory: 'ศรี', numerology: 45, hasNoVowel: true },
    { name: 'ปราชญา', reading: 'ปฺราด-ชะ-ยา', meaning: 'ผู้รอบรู้', highlight: 'ปัญญาเป็นเลิศ', theme: 'wisdom', syllables: 3, letterGroup: 'ป', thaksaCategory: 'มูละ', numerology: 15, hasNoVowel: true },
    { name: 'พรปวีณ์', reading: 'พอน-ปะ-วี', meaning: 'นักปราชญ์ผู้ประเสริฐ', highlight: 'เก่งกาจ เลิศเลอ', theme: 'wisdom', syllables: 3, letterGroup: 'พ', thaksaCategory: 'มูละ', numerology: 41, hasNoVowel: true },
    { name: 'วิชญาพร', reading: 'วิด-ชะ-ยา-พอน', meaning: 'ผู้รู้ที่ประเสริฐ', highlight: 'รอบรู้ ประเสริฐ', theme: 'wisdom', syllables: 4, letterGroup: 'ว', thaksaCategory: 'อุตสาหะ', numerology: 36, hasNoVowel: true },

    // Theme: wealth (เสริมโชคลาภและความมั่นคง)
    { name: 'กัญญ์ณพัชร์', reading: 'กัน-นะ-พัด', meaning: 'หญิงผู้มีค่าดั่งเพชร', highlight: 'เลอค่า มั่งคั่ง', theme: 'wealth', syllables: 3, letterGroup: 'ก', thaksaCategory: 'บริวาร', numerology: 51, hasNoVowel: true },
    { name: 'จันทกานต์', reading: 'จัน-ทะ-กาน', meaning: 'เป็นที่รักดั่งพระจันทร์', highlight: 'มีเสน่ห์และโชคลาภ', theme: 'wealth', syllables: 3, letterGroup: 'จ', thaksaCategory: 'อายุ', numerology: 41, hasNoVowel: true },
    { name: 'ณัฏฐพัชร์', reading: 'นัด-ถะ-พัด', meaning: 'ผู้รู้ที่มีค่าดั่งเพชร', highlight: 'รวยความรู้และทรัพย์', theme: 'wealth', syllables: 3, letterGroup: 'ณ', thaksaCategory: 'เดช', numerology: 45, hasNoVowel: true },
    { name: 'ทรัพย์คณา', reading: 'ซับ-คะ-นา', meaning: 'มีทรัพย์มาก', highlight: 'มั่งคั่ง ร่ำรวย', theme: 'wealth', syllables: 3, letterGroup: 'ท', thaksaCategory: 'ศรี', numerology: 36, hasNoVowel: true },
    { name: 'ธนพร', reading: 'ทะ-นะ-พอน', meaning: 'มีทรัพย์อันประเสริฐ', highlight: 'มีเงินทองไม่ขาด', theme: 'wealth', syllables: 3, letterGroup: 'ธ', thaksaCategory: 'ศรี', numerology: 24, hasNoVowel: true },
    { name: 'ธนัชชา', reading: 'ทะ-นัด-ชา', meaning: 'เกิดมาเพื่อรวย', highlight: 'โชคลาภวาสนาดี', theme: 'wealth', syllables: 3, letterGroup: 'ธ', thaksaCategory: 'ศรี', numerology: 24, hasNoVowel: true },
    { name: 'นภัสวรรณ', reading: 'นะ-พัด-สะ-วัน', meaning: 'ผิวพรรณดั่งฟ้า', highlight: 'สูงส่ง มั่งคั่ง', theme: 'wealth', syllables: 4, letterGroup: 'น', thaksaCategory: 'ศรี', numerology: 41, hasNoVowel: true },
    { name: 'พชร', reading: 'พะ-ชะ-ระ', meaning: 'เพชร', highlight: 'เลอค่า แข็งแกร่ง', theme: 'wealth', syllables: 3, letterGroup: 'พ', thaksaCategory: 'มูละ', numerology: 14, hasNoVowel: true },
    { name: 'มนสิชา', reading: 'มะ-นะ-สิ-ชา', meaning: 'เกิดในใจ', highlight: 'เป็นที่รัก มั่นคง', theme: 'wealth', syllables: 4, letterGroup: 'ม', thaksaCategory: 'มูละ', numerology: 24, hasNoVowel: true },
    { name: 'วรรณกร', reading: 'วัน-นะ-กอน', meaning: 'ผู้สร้างความงาม', highlight: 'ชีวิตงดงาม มั่งคั่ง', theme: 'wealth', syllables: 3, letterGroup: 'ว', thaksaCategory: 'อุตสาหะ', numerology: 24, hasNoVowel: true },

    // Theme: short (ชื่อสั้น 2 พยางค์)
    { name: 'กมล', reading: 'กะ-มน', meaning: 'ดอกบัว ใจ', highlight: 'จำง่าย ความหมายดี', theme: 'short', syllables: 2, letterGroup: 'ก', thaksaCategory: 'บริวาร', numerology: 14, hasNoVowel: true },
    { name: 'จรัส', reading: 'จะ-หรัด', meaning: 'รุ่งเรือง สว่าง', highlight: 'สว่างไสว', theme: 'short', syllables: 2, letterGroup: 'จ', thaksaCategory: 'อายุ', numerology: 19, hasNoVowel: true },
    { name: 'ชวัล', reading: 'ชะ-วัน', meaning: 'รุ่งเรือง สว่าง', highlight: 'รุ่งโรจน์', theme: 'short', syllables: 2, letterGroup: 'ช', thaksaCategory: 'อายุ', numerology: 15, hasNoVowel: true },
    { name: 'ญาดา', reading: 'ยา-ดา', meaning: 'นักปราชญ์', highlight: 'สั้นและฉลาด', theme: 'short', syllables: 2, letterGroup: 'ญ', thaksaCategory: 'อายุ', numerology: 14, hasNoVowel: true },
    { name: 'ดลลช', reading: 'ดน-ลด', meaning: 'เกิดจากใจ', highlight: 'เป็นที่รักของใจ', theme: 'short', syllables: 2, letterGroup: 'ด', thaksaCategory: 'ศรี', numerology: 15, hasNoVowel: true },
    { name: 'ตวัน', reading: 'ตะ-วัน', meaning: 'พระอาทิตย์', highlight: 'อบอุ่น สดใส', theme: 'short', syllables: 2, letterGroup: 'ต', thaksaCategory: 'ศรี', numerology: 19, hasNoVowel: true },
    { name: 'ธมน', reading: 'ทะ-มน', meaning: 'สวยงาม', highlight: 'งดงามน่ารัก', theme: 'short', syllables: 2, letterGroup: 'ธ', thaksaCategory: 'ศรี', numerology: 14, hasNoVowel: true },
    { name: 'นภัส', reading: 'นะ-พัด', meaning: 'ฟ้า', highlight: 'อิสระ สูงส่ง', theme: 'short', syllables: 2, letterGroup: 'น', thaksaCategory: 'ศรี', numerology: 19, hasNoVowel: true },
    { name: 'ปภัส', reading: 'ปะ-พัด', meaning: 'รัศมี แสงสว่าง', highlight: 'เปล่งประกาย', theme: 'short', syllables: 2, letterGroup: 'ป', thaksaCategory: 'มูละ', numerology: 19, hasNoVowel: true },
    { name: 'รวิ', reading: 'ระ-วิ', meaning: 'พระอาทิตย์', highlight: 'สว่าง สดใส', theme: 'short', syllables: 2, letterGroup: 'ร', thaksaCategory: 'อุตสาหะ', numerology: 14, hasNoVowel: true },

    // Theme: no-vowel (ชื่อไม่มีสระ)
    { name: 'กรรณ', reading: 'กัน', meaning: 'หู', highlight: 'ไร้สระกาลกิณี', theme: 'no-vowel', syllables: 1, letterGroup: 'ก', thaksaCategory: 'บริวาร', numerology: 14, hasNoVowel: true },
    { name: 'จรรยา', reading: 'จัน-ยา', meaning: 'ความประพฤติดี', highlight: 'มารยาทงาม', theme: 'no-vowel', syllables: 2, letterGroup: 'จ', thaksaCategory: 'อายุ', numerology: 24, hasNoVowel: true },
    { name: 'ชญทรรศ', reading: 'ชะ-ยะ-ทัด', meaning: 'ผู้มีสายตาแห่งปราชญ์', highlight: 'ไร้สระกาลกิณี 100%', theme: 'no-vowel', syllables: 3, letterGroup: 'ช', thaksaCategory: 'อายุ', numerology: 24, hasNoVowel: true },
    { name: 'ณัชชา', reading: 'นัด-ชา', meaning: 'เกิดมาเพื่อรู้', highlight: 'ฉลาดหลักแหลม', theme: 'no-vowel', syllables: 2, letterGroup: 'ณ', thaksaCategory: 'เดช', numerology: 15, hasNoVowel: true },
    { name: 'ทรรศมล', reading: 'ทัด-สะ-มน', meaning: 'ผู้มีใจอันงดงามที่ได้เห็น', highlight: 'ไร้สระกาลกิณี 100%', theme: 'no-vowel', syllables: 3, letterGroup: 'ท', thaksaCategory: 'ศรี', numerology: 36, hasNoVowel: true },
    { name: 'ธรชญาน์', reading: 'ทอน-ชะ-ยา', meaning: 'ทรงไว้ซึ่งความรู้', highlight: 'ทรงปัญญา', theme: 'no-vowel', syllables: 3, letterGroup: 'ธ', thaksaCategory: 'ศรี', numerology: 42, hasNoVowel: true },
    { name: 'นภสร', reading: 'นบ-พะ-สอน', meaning: 'สระบนฟ้า', highlight: 'ไร้สระกาลกิณี 100%', theme: 'no-vowel', syllables: 3, letterGroup: 'น', thaksaCategory: 'ศรี', numerology: 24, hasNoVowel: true },
    { name: 'พรรษชล', reading: 'พัด-สะ-ชน', meaning: 'น้ำฝน', highlight: 'เย็นใจ ไร้สระ', theme: 'no-vowel', syllables: 3, letterGroup: 'พ', thaksaCategory: 'มูละ', numerology: 24, hasNoVowel: true },
    { name: 'วรรณพร', reading: 'วัน-นะ-พอน', meaning: 'ผิวพรรณประเสริฐ', highlight: 'ไร้สระกาลกิณี 100%', theme: 'no-vowel', syllables: 3, letterGroup: 'ว', thaksaCategory: 'อุตสาหะ', numerology: 36, hasNoVowel: true },
    { name: 'สรรพพร', reading: 'สับ-พะ-พอน', meaning: 'มีพรทุกประการ', highlight: 'ไร้สระกาลกิณี 100%', theme: 'no-vowel', syllables: 3, letterGroup: 'ส', thaksaCategory: 'มนตรี', numerology: 45, hasNoVowel: true }
];
