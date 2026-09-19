CREATE TABLE IF NOT EXISTS public.content_about_us (
    id text NOT NULL DEFAULT 'about_us' PRIMARY KEY,
    
    intro_title_th text,
    intro_title_en text,
    intro_desc_th text,
    intro_desc_en text,
    
    story_p1_th text,
    story_p1_en text,
    story_p2_th text,
    story_p2_en text,
    story_p3_th text,
    story_p3_en text,
    
    mission_th text,
    mission_en text,
    vision_th text,
    vision_en text,
    values_th text,
    values_en text,
    
    address_th text,
    address_en text,
    phone text,
    email text,
    website text,
    facebook text,
    map_url text,
    
    stats_payload jsonb DEFAULT '[]'::jsonb,
    
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.content_about_us ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read access on content_about_us" ON public.content_about_us
    FOR SELECT USING (true);

-- Allow authenticated users (admin) to modify
CREATE POLICY "Allow authenticated full access on content_about_us" ON public.content_about_us
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO public.content_about_us (
    id,
    intro_title_th, intro_title_en,
    intro_desc_th, intro_desc_en,
    story_p1_th, story_p1_en,
    story_p2_th, story_p2_en,
    story_p3_th, story_p3_en,
    mission_th, mission_en,
    vision_th, vision_en,
    values_th, values_en,
    address_th, address_en,
    phone, email, website, facebook, map_url,
    stats_payload
) VALUES (
    'about_us',
    'เกี่ยวกับบริษัท Matrix Intertrade', 'About Matrix Intertrade',
    'ผู้นำเข้าและจัดจำหน่ายระบบภาพแบรนด์ชั้นนำของโลก ด้วยประสบการณ์ทีมงานมากกว่า 20 ปี คัดสรรเฉพาะผลิตภัณฑ์คุณภาพสูงที่เชื่อถือได้ระดับแนวหน้าของโลก', 'Importer and distributor of world-leading AV brands with over 20 years of experience. We select only the highest quality and most reliable products globally.',
    'บริษัท แมทริกซ์ อินเตอร์เทรด จำกัด เป็นผู้จัดจำหน่ายผลิตภัณฑ์ที่ใช้ในสำนักงานเพื่อเสริมประสิทธิภาพของการทำงานในหลากหลายรูปแบบ อาทิ จอรับภาพโปรเจคเตอร์ขนาดต่าง ๆ, จอ LED, กระดานอัจฉริยะ, อุปกรณ์ต่อเชื่อมระบบภาพ และการแสดงผลระบบภาพที่ทันสมัย ตอบโจทย์ยุคดิจิตอลทุกความต้องการ', 'Matrix Intertrade Co., Ltd. is a distributor of office products designed to enhance operational efficiency in various forms, such as projection screens of all sizes, LED displays, interactive whiteboards, AV connectivity equipment, and modern visual displays, meeting every digital era requirement.',
    'ด้วยวิสัยทัศน์ที่เล็งเห็นว่า เครื่องมือและอุปกรณ์สำนักงานที่ดีและมีเสถียรภาพสูงเท่านั้น ที่จะตอบโจทย์การลงทุนที่คุ้มค่า และจะเพิ่มประสิทธิภาพการทำงานขององค์กรในโลกเทคโนโลยียุคปัจจุบันได้อย่างแท้จริง', 'With the vision that only good and highly stable office tools and equipment will provide a worthwhile investment and truly increase organizational efficiency in today''s technological world.',
    'ผลิตภัณฑ์คุณภาพต่ำที่ดูเหมือนจะประหยัดในตอนต้น แต่กลับสร้างปัญหาในการใช้งานและบั่นทอนประสิทธิภาพในการทำงาน จากประสบการณ์อันยาวนานมากกว่า 20 ปี ของทีมงานเมทริกซ์ฯ ผลิตภัณฑ์ที่เราคัดสรรมาบริการท่าน ล้วนเป็นผลิตภัณฑ์ที่มีคุณภาพสูง เป็นที่เชื่อถือระดับแนวหน้าของโลกทั้งสิ้น', 'Low-quality products that seem economical initially often create operational problems and undermine work efficiency. With over 20 years of experience, Matrix’s team ensures that the products we select for you are of high quality and recognized as world-leaders.',
    'ส่งมอบโซลูชั่นภาพและเสียงที่ตอบโจทย์การใช้งานจริงและคุ้มค่าระยะยาวให้กับทุกองค์กร', 'Deliver practical and cost-effective long-term audiovisual solutions for all organizations.',
    'เป็นพาร์ทเนอร์อันดับหนึ่งด้านระบบภาพของไทย ที่องค์กรชั้นนำไว้วางใจเลือกใช้', 'To be Thailand''s number one visual systems partner, trusted by leading organizations.',
    'ความซื่อสัตย์ ความเชี่ยวชาญ และการดูแลลูกค้าตลอดอายุการใช้งานของผลิตภัณฑ์', 'Integrity, expertise, and customer care throughout the product lifecycle.',
    '111/51 หมู่ที่ 8 ตำบลบางกร่าง อ.เมือง จ.นนทบุรี 11000 ประเทศไทย', '111/51 Moo 8, Bang Krang, Mueang, Nonthaburi 11000, Thailand',
    '02-129-6193 / 092-932-8649',
    'matrixintertrade2026@gmail.com',
    'www.matrixintertrade.com',
    'facebook.com/MatrixIntertrade',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.5!2d100.45374869999999!3d13.843674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b41eaa4a621%3A0xdc28c2b815205d5b!2sMatrix%20Intertrade%20Co.%2CLtd.!5e0!3m2!1sth!2sth!4v1780061893336!5m2!1sth!2sth',
    '[{"v": "20+", "l": "ปีประสบการณ์", "lEn": "Years Experience"}, {"v": "500+", "l": "โปรเจ็คที่สำเร็จ", "lEn": "Completed Projects"}, {"v": "8+", "l": "แบรนด์ระดับโลก", "lEn": "Global Brands"}, {"v": "100%", "l": "บริการในประเทศ", "lEn": "Local Service"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
