export const HORSE_WALLPAPER_COST = 15;
export const WALLPAPER_RETRY_MINUTES = 30;

export interface PaidWallpaperProduct {
    id: string;
    name: string;
    preview: string;
    device: 'mobile' | 'desktop';
    width: number;
    height: number;
    bytes: number;
    cost: number;
    description: string;
    auspiciousMeaning: string;
    alt: string;
    downloadFilename: string;
    palette: string;
}

// Public display metadata only. Original files never belong in the public gallery.
export const HORSE_WALLPAPERS: readonly PaidWallpaperProduct[] = [
    {
        id: 'eight-horses-jade-mist',
        name: 'วอลเปเปอร์ม้า 8 ตัว สไตล์จีน · อาชาภูผาหยก (มือถือ)',
        preview: '/wallpapers/eight-horses/eight-horses-jade-mountains-chinese-mobile-wallpaper.webp',
        device: 'mobile', width: 852, height: 1846, bytes: 2823355, cost: HORSE_WALLPAPER_COST,
        description: 'ม้าแปดตัวท่ามกลางภูผาหยก สายหมอก และแสงเช้าอ่อนในภาพแนวตั้ง ให้ความรู้สึกสงบและเปี่ยมความหวัง เหมาะสำหรับผู้ที่ต้องการแรงบันดาลใจในการเติบโตอย่างมั่นคง พร้อมพื้นที่ท้องฟ้าสำหรับนาฬิกาบนหน้าจอมือถือ',
        auspiciousMeaning: 'สื่อถึงความมั่นคง ความอุดมสมบูรณ์ และความเจริญรุ่งเรือง',
        alt: 'ม้าแปดตัววิ่งในลำธารแนวตั้ง ท่ามกลางภูผาสีเขียวหยก น้ำตก สายหมอก และแสงอาทิตย์ยามเช้า',
        downloadFilename: 'eight-horses-jade-mountains-chinese-mobile-wallpaper.png',
        palette: 'หยกอ่อน · ครีม · ทองเช้า',
    },
    {
        id: 'eight-horses-waterfall',
        name: 'วอลเปเปอร์ม้า 8 ตัว น้ำตกแสงอาทิตย์ · อาชาแห่งความสำเร็จ',
        preview: '/wallpapers/eight-horses/eight-horses-waterfall-sunlight-wallpaper.webp',
        device: 'mobile', width: 852, height: 1846, bytes: 3192514, cost: HORSE_WALLPAPER_COST,
        description: 'ม้าแปดตัวควบผ่านสายน้ำใต้ท้องฟ้าสดใส ให้ความรู้สึกฮึกเหิม อิสระ และมั่นใจ เหมาะสำหรับผู้ที่กำลังเริ่มต้นธุรกิจหรือมุ่งสู่เป้าหมายใหม่',
        auspiciousMeaning: 'สื่อถึงการงานก้าวหน้า ความสำเร็จ และโอกาสทางธุรกิจ',
        alt: 'ม้าแปดตัววิ่งผ่านสายน้ำ ด้านหลังเป็นน้ำตก ขุนเขา และท้องฟ้าสีฟ้าพร้อมแสงอาทิตย์',
        downloadFilename: 'eight-horses-waterfall-sunlight-wallpaper.png',
        palette: 'ฟ้าสด · เขียวภูผา · ขาวน้ำตก',
    },
    {
        id: 'eight-horses-sunlit-river',
        name: 'วอลเปเปอร์ม้า 8 ตัว น้ำตกแสงอาทิตย์ · อาชาแห่งความสำเร็จ (คอมพิวเตอร์)',
        preview: '/wallpapers/eight-horses/eight-horses-waterfall-sunlight-desktop-wallpaper.webp',
        device: 'desktop', width: 1672, height: 941, bytes: 3421774, cost: HORSE_WALLPAPER_COST,
        description: 'ม้าแปดตัวควบผ่านลำธารในภาพแนวนอน เปิดมุมมองกว้างไปยังม่านน้ำตกและขุนเขาใต้ท้องฟ้าสดใส ให้ความรู้สึกฮึกเหิมและมั่นใจ เหมาะสำหรับพื้นที่ทำงานของผู้ที่กำลังเริ่มต้นธุรกิจหรือมุ่งสู่เป้าหมายใหม่',
        auspiciousMeaning: 'สื่อถึงการงานก้าวหน้า ความสำเร็จ และโอกาสทางธุรกิจ',
        alt: 'ม้าแปดตัววิ่งผ่านลำธารในภาพแนวนอน หน้าผาน้ำตกและขุนเขา ด้านบนเป็นท้องฟ้าสีฟ้ากับแสงอาทิตย์',
        downloadFilename: 'eight-horses-waterfall-sunlight-desktop-wallpaper.png',
        palette: 'น้ำเงิน · เขียวธรรมชาติ · แสงทอง',
    },
    {
        id: 'eight-horses-mountain-stream',
        name: 'วอลเปเปอร์ม้า 8 ตัว สไตล์จีน · อาชาภูผาหยก',
        preview: '/wallpapers/eight-horses/eight-horses-jade-mountains-chinese-wallpaper.webp',
        device: 'desktop', width: 1672, height: 941, bytes: 3035262, cost: HORSE_WALLPAPER_COST,
        description: 'ม้าแปดตัวท่ามกลางภูผาหยก สายหมอก และแสงทองอ่อน ให้ความรู้สึกสงบ สง่างาม และเปี่ยมความหวัง เหมาะสำหรับผู้ที่ต้องการแรงบันดาลใจในการเติบโตอย่างมั่นคง',
        auspiciousMeaning: 'สื่อถึงความมั่นคง ความอุดมสมบูรณ์ และความเจริญรุ่งเรือง',
        alt: 'ภาพวาดจีนม้าแปดตัววิ่งในลำธาร ท่ามกลางภูเขาสีเขียวหยก น้ำตก สายหมอก และแสงทอง',
        downloadFilename: 'eight-horses-jade-mountains-chinese-wallpaper.png',
        palette: 'เขียวหมอก · เบจ · ทองอ่อน',
    },
];
