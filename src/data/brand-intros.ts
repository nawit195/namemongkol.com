// Concise brand intros shown at the top of each category page.
// Maps category id -> brand intro content.
// Data enriched from legacy site: matrixintertrade.com/ผลิตภัณฑ์ของเรา
export type BrandIntro = {
  brandSlug: string;
  tagline: string;
  description: string;
  highlights: string[];
  bestFor: string[];
  origin?: string;
  productCategories?: { name: string; desc: string }[];
};

export const brandIntrosByCategoryId: Record<string, BrandIntro> = {
  "288194": {
    brandSlug: "unilumin",
    tagline: "จอ LED Display อันดับ 1 ของโลก | ความเชี่ยวชาญระดับ Broadcast",
    description:
      "Unilumin — ผู้ผลิตและผู้นำจอ LED Display ระดับโลกจากเมืองเซินเจิ้น ประเทศจีน ก่อตั้งมาตั้งแต่ปี 2004 ด้วยประสบการณ์กว่า 20 ปี ศรัทธาเลือกโดยองค์กรชั้นนำกว่า 100 ประเทศทั่วโลก\n\nUnilumin ขึ้นชื่อในการสร้างสรรค์โซลูชันจอ LED ที่นำเสนอมาตรฐาน Broadcast กับความหลากหลายของการใช้งาน ตั้งแต่:\n• จอ LED Indoor ความละเอียดสูง (Fine Pitch P0.9–P2.5) สำหรับห้องประชุมและ Auditorium\n• จอ LED Outdoor ความสว่างสูง (High Brightness) สำหรับสนามกีฬาและสถานที่สาธารณะ\n• จอ All-in-One ครบชุด สำหรับห้องประชุมยุคใหม่\n• จอ LED Rental & Staging สำหรับงานอีเวนต์และ Virtual Production\n• จอ LED Creative & Transparent สำหรับงานตกแต่งและ Retail\n\nMatrix Intertrade เป็นผู้จำหน่าย Unilumin ที่ได้รับอนุญาตอย่างเป็นทางการ (Authorized Distributor) ในประเทศไทย พร้อมให้บริการครบวงจร: ให้คำปรึกษา → ออกแบบโซลูชัน → ติดตั้งอย่างมืออาชีพ → บำรุงรักษาและสนับสนุนระยะยาว",
    highlights: [
      "ผู้นำตลาด LED Display ระดับโลก: ปฏิบัติการใน 100+ ประเทศ",
      "คุณภาพ Broadcast-Grade: ความสว่างและสีทรูถึง Cinema Standards",
      "Pixel Pitch เลือกได้ P0.9 ถึง P10 สำหรับทุกระยะการมองและการใช้งาน",
      "โซลูชันครบขัด: ให้คำปรึกษา + ออกแบบ + ติดตั้ง + บำรุงรักษา",
      "รับประกันยาวนาน + สนับสนุนหลังการขายในประเทศไทย",
    ],
    bestFor: [
      "ห้องประชุมและ Auditorium ขององค์กร",
      "ห้องโถงด้านล่างและ Showroom",
      "ป้าย Digital Signage / โฆษณากลางแจ้ง (DOOH)",
      "สนามกีฬา, Event Venue, คอนเสิร์ต",
      "Studio Virtual Production & Broadcast",
      "ห้องเรียนอัจฉริยะและสถาบันการศึกษา",
    ],
    origin: "Shenzhen, China (Est. 2004)",
    productCategories: [
      { name: "LED Indoor Fine Pitch (P0.9–P2.5)", desc: "จอ LED ความละเอียดสูงสุด สำหรับห้องประชุม, Lobby, Showroom, Theater ให้ภาพคมชัดระดับ 4K/8K นั่งชิดจอได้ ความสว่าง 400–600 nits ทั่วไป สีคมชัดระดับ Broadcast" },
      { name: "LED Outdoor High Brightness", desc: "จอ LED กลางแจ้งความสว่างสูง (1200–3000 nits) ทนแดด ทนฝน ทนอากาศเค็ม เหมาะสำหรับป้ายโฆษณา DOOH, งานอีเวนต์, สนามกีฬา" },
      { name: "LED All-in-One Meeting Display (UMini)", desc: "จอ LED ประชุมแบบครบชุด ไม่ต้องต่ออุปกรณ์เพิ่ม Controller ในตัว ขนาด 108\"–163\" รองรับ 9 อุปกรณ์เชื่อมต่อพร้อมกัน ทดแทนโปรเจกเตอร์ได้เลย" },
      { name: "LED Rental & Staging (Modular)", desc: "จอ LED แบบถอดประกอบง่าย สำหรับงานอีเวนต์, คอนเสิร์ต, Virtual Production มีให้เลือกหลายเบอร์และ Configuration, ติดตั้งรวดเร็ว น้ำหนักเบา" },
      { name: "LED Creative & Transparent (Decorative)", desc: "จอ LED โปร่งใสและรูปทรงพิเศษ สำหรับงานตกแต่ง Retail, Showroom, Exhibition, Shopping Mall กลมกลืนสถาปัตยกรรม" },
    ],
  },
  "235610": {
    brandSlug: "kramerav",
    tagline: "ผู้นำด้านอุปกรณ์ AV ระดับมืออาชีพ | 40+ ปีของนวัตกรรม",
    description:
      "Kramer AV — ผู้บุกเบิกในอุตสาหกรรมภาพและเสียงระดับมืออาชีพจากประเทศอิสราเอล ด้วยประสบการณ์กว่า 40 ปี ตั้ง​แต่ ค.ศ. 1981 Kramer สร้างสรรค์ผลิตภัณฑ์และโซลูชันที่เชื่อถือได้ ตอบโจทย์ความต้องการของทุกธุรกิจและอุตสาหกรรม\n\nKramer นำเสนออุปกรณ์ AV ที่ครบวงจร ตั้งแต่:\n• Switcher & Scaler — อุปกรณ์สลับและปรับสัญญาณ 4K/8K\n• AV over IP (KDS) — ระบบส่งสัญญาณคุณภาพสูงผ่านเครือข่าย IP\n• Wireless Presentation (VIA) — โซลูชันแชร์เนื้อหาไร้สาย BYOD\n• Control System — ระบบควบคุมอัจฉริยะแบบคลาวด์\n• Audio DSP & Amplifier — ระบบเสียงระดับมืออาชีพ\n• KVM Solutions — การควบคุมคอมพิวเตอร์จากระยะไกล\n\nMatrix Intertrade เป็น Master Distributor of Kramer Thailand พร้อมให้ความเชี่ยวชาญด้านระบบ AV คำปรึกษา ออกแบบโซลูชัน และบริการติดตั้ง + บำรุงรักษาอย่างเป็นมืออาชีพ",
    highlights: [
      "ผู้บุกเบิกระบบ AV มืออาชีพ กว่า 40 ปี",
      "รองรับ 4K60 4:4:4 HDR และ 8K ทุก Pipeline",
      "ระบบ AV over IP (KDS) มาตรฐานสำหรับขยายระยะและปรับขนาด",
      "Kramer Control: ระบบควบคุม Cloud-based ที่ยืดหยุ่นและง่ายต่อการใช้งาน",
      "Kramer VIA: Wireless Presentation ที่รองรับทุกอุปกรณ์ (BYOD)",
      "รับประกันสินค้าสูงสุด 7 ปี + บริการบำรุงรักษาในประเทศไทย",
    ],
    bestFor: [
      "ห้องประชุมองค์กรขนาดเล็ก-ใหญ่",
      "Smart Classroom / Lecture Hall / สถาบันการศึกษา",
      "Control Room / Command Center / Data Center",
      "Hybrid Meeting Room / Video Conference",
      "โรงแรมและห้องประชุมขนาดใหญ่",
      "สำนักงานและระบบ Enterprise AV",
    ],
    origin: "Israel (Est. 1981)",
    productCategories: [
      { name: "Switcher & Scaler", desc: "อุปกรณ์สลับและปรับสัญญาณภาพ/เสียง รองรับ 4K/8K HDR ให้ประสิทธิภาพสูงสำหรับห้องประชุม Auditorium และงาน Presentation ระดับโลก" },
      { name: "AV over IP (KDS)", desc: "ระบบส่งสัญญาณ AV คุณภาพระดับ Broadcast ผ่านเครือข่าย IP มาตรฐาน รองรับ 4K60 HDR ส่งได้ระยะไกลไม่จำกัด ผ่านสาย LAN ธรรมดา สามารถปรับขนาดระบบได้อย่างยืดหยุ่น" },
      { name: "Wireless Presentation (VIA)", desc: "ระบบนำเสนอไร้สาย BYOD ที่รองรับ Windows, macOS, iOS, Android เชื่อมต่อด้วยปุ่มเดียวหรือผ่านแอป แชร์หน้าจอ 4K ได้พร้อมกันหลายเครื่อง สำหรับห้องประชุม Smart Classroom และ Collaboration" },
      { name: "Extender & Distribution", desc: "อุปกรณ์ขยายและกระจายสัญญาณ HDMI / HDBaseT / USB ระยะไกลสูงสุด 100+ เมตร รองรับ 4K/8K มีตัวเลือก Fiber Optic สำหรับระยะทางไกล" },
      { name: "Control System (Kramer Control)", desc: "ระบบควบคุม AV ที่ใช้งานง่ายและยืดหยุ่น บนแพลตฟอร์มคลาวด์ สั่งงานอุปกรณ์ AV ทั้งหมดจาก Touch Panel หรือ Mobile App ลด​ความยุ่งยากในการจัดการห้องประชุม" },
      { name: "Audio DSP & Amplifier", desc: "ระบบเสียงระดับมืออาชีพ ทั้ง DSP Processor, Mixer, Digital Amplifier สำหรับห้องประชุม Auditorium และ Large Venue โดยรายละเอียดและความชัดของเสียง" },
      { name: "KVM Solutions", desc: "ระบบควบคุมคอมพิวเตอร์หลายเครื่องจากระยะไกล ด้วยชุดคีย์บอร์ด เมาส์ จอภาพเพียงชุดเดียว เหมาะสำหรับ Control Room, Data Center, Security Center, Broadcast Studio" },
    ],
  },
  "288209": {
    brandSlug: "persona",
    tagline: "ผู้นำจอสัมผัสอัจฉริยะ #1 จากไต้หวัน | เทคโนโลยีล้ำสมัยสำหรับการศึกษาและธุรกิจยุคใหม่",
    description:
      "Persona — แบรนด์จอ Interactive อันดับ 1 จากประเทศไต้หวัน ผู้บุกเบิกจอสัมผัสอัจฉริยะด้วยเทคโนโลยีที่ล้ำสมัยและคุณภาพที่เชื่อถือได้ Persona มอบประสบการณ์การใช้งานที่ราบรื่น มีประสิทธิภาพ และตอบโจทย์การใช้งานที่หลากหลาย ทั้งด้านการศึกษา ธุรกิจ และความบันเทิง\n\nจอ Persona Interactive ออกแบบมาเพื่อห้องเรียนยุคใหม่ (Smart Classroom) และห้องประชุม Hybrid Meeting โดยเฉพาะ มาพร้อม:\n• ความละเอียด 4K UHD (3840 x 2160) — ภาพคมชัด สดใส รายละเอียดครบถ้วน\n• ระบบปฏิบัติการ Android ในตัว (Android 11/14 EDLA) — ติดตั้ง Apps หลากหลายได้\n• MiraAir Screen Mirroring — แชร์หน้าจอจาก 9 อุปกรณ์พร้อมกัน บวก Touch-Back\n• DMS+ (Classroom Management) — บริหารจัดการจอจากระยะไกลผ่านเครือข่าย\n• AI Quiz Generator — เครื่องมือสำหรับสร้างแบบทดสอบและระบบจัดการห้องเรียนอินเตอร์แอคทีฟ\n• ดีไซน์ขอบจอบาง — มอบพื้นที่การแสดงผลสูงสุดพร้อมรูปลักษณ์ทันสมัยและสวยงาม\n\nMatrix Intertrade เป็นตัวแทนจำหน่าย Persona อย่างเป็นทางการในประเทศไทย พร้อมให้บริการจอสัมผัสอัจฉริยะที่ครบวงจร ตั้งแต่คำปรึกษา ติดตั้ง จนถึงบำรุงรักษาแบบมืออาชีพ",
    highlights: [
      "ผู้นำด้านจอสัมผัสอัจฉริยะจากไต้หวัน ด้วยนวัตกรรมเทคโนโลยีสมัยใหม่",
      "รับรอง Google EDLA — ใช้ Google Workspace, Classroom, Meet ได้แบบ Native",
      "ความละเอียด 4K UHD — ภาพคมชัด สดใส ถนอมสายตา Anti-glare",
      "Multi-touch 40 จุด พร้อม MiraAir (9 อุปกรณ์ พร้อมกัน) — ไร้สายหรือ USB",
      "DMS+ & AI Quiz Generator — บริหารจัดการห้องเรียนจากระยะไกล",
      "ขนาดหลากหลาย: 70\", 75\", 86\", 110\" — เลือกเหมาะกับพื้นที่",
    ],
    bestFor: [
      "ห้องเรียน K-12 / มหาวิทยาลัย / Smart Classroom",
      "ห้องประชุม Hybrid Meeting ขององค์กร",
      "ห้อง Training / Lecture Hall / Auditorium",
      "ห้องประชุมองค์กรขนาดกลาง-ใหญ่",
      "ห้อง Brainstorming & Creative Workshop",
      "สถาบันการศึกษาและศูนย์ฝึกอบรม",
    ],
    origin: "Taiwan",
    productCategories: [
      { name: "Interactive Flat Panel 4K (KTA-PRO-FULL)", desc: "จอสัมผัส 4K UHD ขนาด 70\", 75\", 86\", 110\" รองรับ Multi-touch 40 จุด เขียนลื่นเหมือนกระดาษ มาพร้อม Android 14 EDLA ใช้ Google Workspace / Classroom / Meet ได้แบบ Native พร้อมซอฟต์แวร์ Whiteboard และ Screen Share ในตัว" },
      { name: "DMS+ (Classroom Management System)", desc: "ระบบจัดการห้องเรียนอินเตอร์แอคทีฟ บริหารจัดการจอจากระยะไกลผ่านเครือข่าย ดูแลสถานะจอทั้งหมด ปรับปรุงฟิร์มแวร์ และจัดการแอปพลิเคชัน ทั่วทั้งองค์กรได้ง่าย" },
      { name: "MiraAir Screen Mirroring", desc: "ระบบแชร์หน้าจอไร้สาย BYOD รองรับทุกระบบปฏิบัติการ (Windows/macOS/iOS/Android) แชร์ได้พร้อมกัน 9 อุปกรณ์ เมาส์/คีย์บอร์ดควบคุมได้จากจอ Touch-Back, USB Plug & Play ที่ไม่ต้องซอฟต์แวร์" },
      { name: "AI Quiz Generator & Interactive Tools", desc: "เครื่องมือสร้างแบบทดสอบ Quiz ด้วย AI, Whiteboard, Annotation Tools, Polling & Voting, Recording Video Lecture สำหรับการสอนแบบ Active Learning ที่มีประสิทธิภาพ" },
      { name: "OPS PC & Advanced Connectivity", desc: "รองรับการต่ออุปกรณ์ภายนอก ท่า USB ที่ครบครัน (USB-C, HDMI, Audio, LAN) Slot-in PC ขนาดเล็ก ต่ออย่างยืดหยุ่นกับสิ่งแวดล้อม" },
    ],
  },
  "288210": {
    brandSlug: "transcreen",
    tagline: "ระบบ Wireless Presentation สำหรับห้องประชุมยุคใหม่",
    description:
      "tranScreen — ยกระดับการทำงานร่วมกันและการนำเสนอของคุณด้วยโซลูชันการแชร์หน้าจอไร้สายที่พัฒนาโซลูชันฮาร์ดแวร์และซอฟต์แวร์เอง เพื่อการเชื่อมต่อที่ราบรื่น รองรับทุกระบบปฏิบัติการ (BYOD) ทั้ง Windows, macOS, iOS และ Android เชื่อมต่อได้ง่ายทั้งแบบปุ่มเดียวหรือผ่านแอป แชร์หน้าจอได้พร้อมกันหลายเครื่อง และรองรับ Video Conference ด้วยกล้อง USB ที่ต่อกับจอประชุม",
    highlights: [
      "แชร์หน้าจอไร้สายได้ราบรื่นจากทุกอุปกรณ์",
      "รองรับ Windows / macOS / iOS / Android และอุปกรณ์อัจฉริยะ",
      "แชร์หน้าจอพร้อมกันได้หลายเครื่อง โดยไม่ต้องติดตั้งซอฟต์แวร์",
      "รองรับ Video Conference และ USB Camera สำหรับ Hybrid Meeting",
      "ติดตั้งง่าย ใช้งานได้ทันที ลดเวลาเตรียมการก่อนการประชุม",
    ],
    bestFor: [
      "ห้องประชุมขนาดเล็ก-กลาง",
      "Huddle Room",
      "ห้อง Training",
      "Co-working Space",
      "Hybrid Meeting Room",
      "ห้องเรียนยุคใหม่",
    ],
    productCategories: [
      { name: "Wireless Presentation System", desc: "ตัวรับ-ส่งสัญญาณไร้สาย BYOD แชร์จอจาก Laptop / มือถือ ไปยังจอห้องประชุม รองรับ 4K และ Video Conference" },
      { name: "Wireless Video Collaboration", desc: "ระบบ Video Conference ไร้สาย รองรับ USB Camera และไมค์ ช่วยให้การประชุม Hybrid เป็นเรื่องง่ายและสะดวก" },
      { name: "Transmitter & Dongle", desc: "ตัวส่งสัญญาณ USB-C / HDMI Plug & Play กดปุ่มเดียวเพื่อแชร์หน้าจอ ไม่ต้องติดตั้งซอฟต์แวร์" },
    ],
  },
  "237068": {
    brandSlug: "grandview",
    tagline: "ผู้นำด้านจอโปรเจคเตอร์และจอฉายภาพคุณภาพสูง | นวัตกรรมจากไต้หวัน",
    description:
      "Grandview — ผู้บุกเบิกจอโปรเจคเตอร์ระดับโลกจากไต้หวัน ด้วยการเชี่ยวชาญในการผลิตจอฉายภาพและนวัตกรรมเทคโนโลยีสมัยใหม่ Grandview มอบประสบการณ์การรับชมภาพที่เหนือระดับ ตั้งแต่โฮมเธียเตอร์ระดับพรีเมียมไปจนถึงระบบการนำเสนอระดับมืออาชีพสำหรับองค์กร\n\nจอ Grandview ออกแบบมาเพื่อความยืดหยุ่นและประสิทธิภาพสูงสุด ด้วยหลากหลายประเภทที่ครอบคลุมทุกความต้องการ:\n• จอ Fixed Frame — ติดตั้งถาวร ภาพตึงสมบูรณ์แบบสำหรับ Home Theater\n• จอ Electric/Motorized — ม้วนเก็บอัตโนมัติ ประหยัดพื้นที่สำหรับห้องประชุม\n• จอ Manual — ดึงมือง่ายและทนทาน ประหยัดราคา\n• จอ Portable — น้ำหนักเบา พกพาสะดวก เหมาะสำหรับการนำเสนอเคลื่อนที่\n• จอ ALR (Ambient Light Rejecting) — เฉพาะตัวสะท้อนแสงแวดล้อม คมชัดแม้มีแสงสว่าง\n\nMatrix Intertrade เป็นตัวแทนจำหน่าย Grandview อย่างเป็นทางการในประเทศไทย พร้อมให้คำปรึกษา ออกแบบโซลูชัน และบริการติดตั้ง รวมทั้งสนับสนุนหลังการขายอย่างเป็นมืออาชีพ",
    highlights: [
      "ผู้นำตลาดจอโปรเจคเตอร์ระดับโลก ด้วยนวัตกรรมเทคโนโลยีสมัยใหม่",
      "เทคโนโลยี ALR (Ambient Light Rejecting) — ภาพคมชัดแม้ห้องมีแสงสว่าง",
      "วิศวกรรมความแม่นยำและการผลิต — ผ้าจอตึงเรียบสมบูรณ์แบบ มอเตอร์เงียบและทนทาน",
      "ความยืดหยุ่นในเลือกประเภท — Fixed Frame, Motorized, Manual, Portable, ALR",
      "บริการครบวงจร: ปรึกษา → ออกแบบ → ติดตั้ง → บำรุงรักษาในประเทศไทย",
    ],
    bestFor: [
      "โฮมเธียเตอร์ระดับพรีเมียม",
      "ห้องประชุมขององค์กรขนาดเล็ก-ใหญ่",
      "ห้องเรียน / ห้อง Training / Lecture Hall",
      "Auditorium และสถาบันการศึกษา",
      "โรงแรมและห้องสัมมนา",
      "การนำเสนอเคลื่อนที่และงานอีเวนต์",
    ],
    origin: "Taiwan",
    productCategories: [
      { name: "จอ Fixed Frame", desc: "จอติดตั้งถาวรบนผนัง ผ้าจอตึงเรียบสมบูรณ์แบบ ให้ภาพสมมาตรคงที่จากทุกมุมมอง มีอัตราส่วน 16:9 / 16:10 / 2.35:1 เหมาะสำหรับ Home Theater Premium และห้องประชุมถาวร" },
      { name: "จอ Electric/Motorized", desc: "จอม้วนเก็บอัตโนมัติด้วยมอเตอร์ไฟฟ้าที่เงียบและทนทาน ควบคุมด้วยรีโมท หรือ Trigger 12V ประหยัดพื้นที่สำหรับห้องประชุม ห้องสัมมนา และสนามฝึกอบรม" },
      { name: "จอ Manual (ดึงมือ)", desc: "จอดึงมือแบบง่าย ใช้งานง่ายและทนทาน ประหยัดราคา เหมาะสำหรับห้องประชุม Small Meeting Room และห้องฝึกอบรมที่มีงบประมาณจำกัด" },
      { name: "จอ Portable (พกพา)", desc: "จอน้ำหนักเบา พับเก็บและพกพาได้สะดวก เหมาะสำหรับการนำเสนอเคลื่อนที่ Road Show งานอีเวนต์ และการศึกษา โดยไม่ต้องติดตั้งถาวร" },
      { name: "จอ ALR (Ambient Light Rejecting)", desc: "จอเฉพาะตัวด้วยเทคโนโลยีสะท้อนแสงแวดล้อม ผ้าจอออกแบบพิเศษดูดซับแสงรบกวน ให้ภาพคมชัดและสีสันสดใสแม้ในห้องที่มีแสงสว่าง เหมาะสำหรับห้องประชุมที่ไม่สามารถปิดไฟได้" },
    ],
  },
  "237477": {
    brandSlug: "hdmi-cable",
    tagline: "สาย HDMI คุณภาพสูง รองรับ 4K / 8K",
    description:
      "สาย HDMI คัดสรรเกรดมืออาชีพ รองรับการใช้งานตั้งแต่ห้องประชุม Smart Classroom ไปจนถึงระบบ AV ครบวงจร ทนทาน สัญญาณเสถียร ผ่านการทดสอบกับอุปกรณ์จริงทุกเส้น พร้อมความยาวให้เลือกหลากหลาย",
    highlights: [
      "รองรับ 4K60 HDR และ 8K (ตามรุ่น)",
      "หัวต่อชุบทอง สัญญาณสูญเสียต่ำ",
      "มีทั้งสายทองแดงและ Fiber Optic",
      "ทดสอบทุกเส้นก่อนส่งมอบ",
    ],
    bestFor: [
      "ห้องประชุมและ Smart Classroom",
      "ระบบ AV ระยะไกล (Fiber)",
      "Home Theater",
      "Digital Signage",
    ],
    productCategories: [
      { name: "HDMI Copper Cable", desc: "สาย HDMI ทองแดง ความยาว 1–15 เมตร รองรับ 4K60 HDR เหมาะกับการเชื่อมต่อระยะสั้นถึงปานกลาง" },
      { name: "HDMI Fiber Optic Cable", desc: "สาย HDMI ไฟเบอร์ออปติก ความยาว 10–100 เมตร รองรับ 4K60 / 8K สัญญาณไม่สูญเสียแม้ระยะไกล" },
      { name: "HDMI Adapter & Converter", desc: "หัวแปลงและตัวแปลง HDMI เป็น USB-C, DisplayPort, VGA สำหรับเชื่อมต่ออุปกรณ์ที่หลากหลาย" },
    ],
  },
};
