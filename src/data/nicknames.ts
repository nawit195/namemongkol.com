export interface Nickname {
    name: string;
    style: 'thai' | 'inter' | 'cute' | 'cool';
    gender: 'male' | 'female' | 'unisex';
    meaning?: string;
    examples?: string[];
}

export const nicknames: Nickname[] = [
    // Female
    { name: 'ขวัญ', style: 'thai', gender: 'female', meaning: 'สิ่งที่เป็นมงคล', examples: ['ขวัญฤทัย', 'ของขวัญ', 'ขวัญข้าว'] },
    { name: 'ดาว', style: 'thai', gender: 'female', meaning: 'ดวงดาว', examples: ['ดาริกา', 'ดารินทร์', 'ประดับดาว'] },
    { name: 'น้ำ', style: 'thai', gender: 'female', meaning: 'สายน้ำ', examples: ['ธารธารา', 'ชลธิดา', 'วารินทร์'] },
    { name: 'ฟ้า', style: 'thai', gender: 'female', meaning: 'ท้องฟ้า', examples: ['นภัสสร', 'ทิฆัมพร', 'นภาทิพย์'] },
    { name: 'พลอย', style: 'thai', gender: 'female', meaning: 'อัญมณี', examples: ['พชรพร', 'พลอยไพลิน', 'นภัสพลอย'] },
    { name: 'มิ้นท์', style: 'cute', gender: 'female', meaning: 'ใบสะระแหน่', examples: ['มินตรา', 'มนัสนันท์', 'มาริษา'] },
    { name: 'พรีม', style: 'cute', gender: 'female', meaning: 'ยอดเยี่ยม', examples: ['ปภาวรินทร์', 'พรพรรณ', 'พรีมา'] },
    { name: 'เบลล์', style: 'inter', gender: 'female', meaning: 'สวยงาม', examples: ['เบญญาภา', 'บุณณดา', 'เบลล่า'] },
    { name: 'เจดส์', style: 'cool', gender: 'female', meaning: 'หยก', examples: ['จิดาภา', 'จิรภิญญา'] },
    
    // Male
    { name: 'กร', style: 'thai', gender: 'male', meaning: 'มือ, ผู้สร้าง', examples: ['ธนกร', 'ภากร', 'ชยากร'] },
    { name: 'ปุณณ์', style: 'thai', gender: 'male', meaning: 'สมบูรณ์', examples: ['ปุณณวิช', 'ปุณยวีร์'] },
    { name: 'ภีม', style: 'thai', gender: 'male', meaning: 'น่าเกรงขาม', examples: ['ภีมพล', 'ภีมวัจน์'] },
    { name: 'เจ', style: 'cool', gender: 'male', meaning: '-', examples: ['จิรภัทร', 'จิรายุ'] },
    { name: 'แบงค์', style: 'cool', gender: 'male', meaning: 'ธนาคาร', examples: ['บวรวิชญ์', 'บูรพา'] },
    { name: 'แม็กซ์', style: 'inter', gender: 'male', meaning: 'ที่สุด', examples: ['มติชน', 'มงคล'] },
    { name: 'ลีโอ', style: 'inter', gender: 'male', meaning: 'สิงโต', examples: ['รณกร', 'รชต'] },
    { name: 'วิน', style: 'cool', gender: 'male', meaning: 'ชัยชนะ', examples: ['กวินทร์', 'วิชญ์', 'อชิตะ'] },
    { name: 'แทน', style: 'thai', gender: 'male', meaning: 'ทดแทน', examples: ['แทนไท', 'แทนคุณ'] },

    // Unisex
    { name: 'คิน', style: 'cool', gender: 'unisex', meaning: '-', examples: ['ภาคิน', 'อคิน'] },
    { name: 'ซัน', style: 'inter', gender: 'unisex', meaning: 'พระอาทิตย์', examples: ['รวิสรา', 'รวิภาส'] },
    { name: 'ดรีม', style: 'inter', gender: 'unisex', meaning: 'ความฝัน', examples: ['ดารินทร์', 'ดนุพล'] },
    { name: 'พาย', style: 'cute', gender: 'unisex', meaning: 'ขนมพาย', examples: ['พชร', 'พิมผกา'] },
    { name: 'สกาย', style: 'inter', gender: 'unisex', meaning: 'ท้องฟ้า', examples: ['สิรภพ', 'สุวิมล'] }
];
