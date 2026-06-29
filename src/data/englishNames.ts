export interface EnglishName {
    name: string;
    thai: string;
    meaning: string;
    gender: 'male' | 'female' | 'unisex';
    style: 'classic' | 'modern' | 'unique' | 'cute';
    origin: string;
}

export const englishNames: EnglishName[] = [
    // Female
    { name: 'Alice', thai: 'อลิส', meaning: 'มีคุณค่า, สูงศักดิ์', gender: 'female', style: 'classic', origin: 'German' },
    { name: 'Aurora', thai: 'ออโรร่า', meaning: 'รุ่งอรุณ', gender: 'female', style: 'modern', origin: 'Latin' },
    { name: 'Bella', thai: 'เบลล่า', meaning: 'สวยงาม', gender: 'female', style: 'modern', origin: 'Italian' },
    { name: 'Charlotte', thai: 'ชาร์ลอตต์', meaning: 'หญิงที่แข็งแกร่งและมีอิสระ', gender: 'female', style: 'classic', origin: 'French' },
    { name: 'Chloe', thai: 'โคลอี้', meaning: 'สีเขียวสดใส, ความเบ่งบาน', gender: 'female', style: 'modern', origin: 'Greek' },
    { name: 'Daisy', thai: 'เดซี่', meaning: 'ดอกเดซี่', gender: 'female', style: 'cute', origin: 'English' },
    { name: 'Eleanor', thai: 'เอลินอร์', meaning: 'แสงสว่าง', gender: 'female', style: 'classic', origin: 'Greek' },
    { name: 'Emma', thai: 'เอ็มม่า', meaning: 'สมบูรณ์แบบ, เป็นสากล', gender: 'female', style: 'classic', origin: 'German' },
    { name: 'Grace', thai: 'เกรซ', meaning: 'ความสง่างาม, ความเมตตา', gender: 'female', style: 'classic', origin: 'Latin' },
    { name: 'Isabella', thai: 'อิซาเบลล่า', meaning: 'คำมั่นสัญญาของพระเจ้า', gender: 'female', style: 'classic', origin: 'Hebrew' },
    { name: 'Luna', thai: 'ลูน่า', meaning: 'พระจันทร์', gender: 'female', style: 'modern', origin: 'Latin' },
    { name: 'Mia', thai: 'เมีย', meaning: 'เป็นที่รัก', gender: 'female', style: 'modern', origin: 'Latin' },
    { name: 'Olivia', thai: 'โอลิเวีย', meaning: 'ต้นมะกอก (สัญลักษณ์แห่งความสงบ)', gender: 'female', style: 'classic', origin: 'Latin' },
    { name: 'Sophia', thai: 'โซเฟีย', meaning: 'ความฉลาดหลักแหลม', gender: 'female', style: 'classic', origin: 'Greek' },
    { name: 'Stella', thai: 'สเตลล่า', meaning: 'ดวงดาว', gender: 'female', style: 'modern', origin: 'Latin' },
    
    // Male
    { name: 'Arthur', thai: 'อาเธอร์', meaning: 'ผู้สูงส่ง, กล้าหาญดั่งหมี', gender: 'male', style: 'classic', origin: 'Celtic' },
    { name: 'Asher', thai: 'แอชเชอร์', meaning: 'ความสุข, ได้รับพร', gender: 'male', style: 'modern', origin: 'Hebrew' },
    { name: 'Caleb', thai: 'คาเลบ', meaning: 'ซื่อสัตย์, ความกล้าหาญ', gender: 'male', style: 'classic', origin: 'Hebrew' },
    { name: 'Ethan', thai: 'อีธาน', meaning: 'แข็งแกร่ง, มั่นคง', gender: 'male', style: 'classic', origin: 'Hebrew' },
    { name: 'Ezra', thai: 'เอซรา', meaning: 'ผู้ช่วยเหลือ', gender: 'male', style: 'modern', origin: 'Hebrew' },
    { name: 'Felix', thai: 'ฟีลิกซ์', meaning: 'โชคดี, มีความสุข', gender: 'male', style: 'unique', origin: 'Latin' },
    { name: 'Julian', thai: 'จูเลียน', meaning: 'อ่อนเยาว์', gender: 'male', style: 'classic', origin: 'Latin' },
    { name: 'Leo', thai: 'ลีโอ', meaning: 'สิงโต, ความกล้าหาญ', gender: 'male', style: 'modern', origin: 'Latin' },
    { name: 'Liam', thai: 'เลียม', meaning: 'นักรบผู้กล้าหาญ', gender: 'male', style: 'modern', origin: 'Irish' },
    { name: 'Lucas', thai: 'ลูคัส', meaning: 'ผู้ให้แสงสว่าง', gender: 'male', style: 'classic', origin: 'Latin' },
    { name: 'Mateo', thai: 'มาเตโอ', meaning: 'ของขวัญจากพระเจ้า', gender: 'male', style: 'modern', origin: 'Spanish' },
    { name: 'Oliver', thai: 'โอลิเวอร์', meaning: 'ต้นมะกอก (ความสงบสุข)', gender: 'male', style: 'classic', origin: 'Latin' },
    { name: 'Rowan', thai: 'โรวัน', meaning: 'ต้นไม้เล็กๆ สีแดง', gender: 'male', style: 'unique', origin: 'Celtic' },
    { name: 'Theodore', thai: 'ธีโอดอร์', meaning: 'ของขวัญจากพระเจ้า', gender: 'male', style: 'classic', origin: 'Greek' },

    // Unisex
    { name: 'Avery', thai: 'เอเวอรี่', meaning: 'ที่ปรึกษา', gender: 'unisex', style: 'modern', origin: 'English' },
    { name: 'Harper', thai: 'ฮาร์เปอร์', meaning: 'นักเล่นพิณ', gender: 'unisex', style: 'modern', origin: 'English' },
    { name: 'Jordan', thai: 'จอร์แดน', meaning: 'ผู้ไหลลงมา', gender: 'unisex', style: 'classic', origin: 'Hebrew' },
    { name: 'Morgan', thai: 'มอร์แกน', meaning: 'ผู้มาจากทะเล', gender: 'unisex', style: 'classic', origin: 'Welsh' },
    { name: 'Quinn', thai: 'ควินน์', meaning: 'ฉลาดหลักแหลม', gender: 'unisex', style: 'unique', origin: 'Irish' },
    { name: 'Riley', thai: 'ไรลีย์', meaning: 'กล้าหาญ', gender: 'unisex', style: 'modern', origin: 'Irish' }
];
