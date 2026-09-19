export type ManagedSolutionDetailPayload = {
  intro?: string;
  introEn?: string;
  bullets?: string[];
  bulletsEn?: string[];
  applications?: string[];
  applicationsEn?: string[];
  seoSections?: Array<{
    heading: string;
    headingEn?: string;
    body: string;
    bodyEn?: string;
  }>;
  relatedLinks?: Array<{
    label: string;
    labelEn?: string;
    href: string;
    description?: string;
    descriptionEn?: string;
  }>;
  faqs?: Array<{
    question: string;
    questionEn?: string;
    answer: string;
    answerEn?: string;
  }>;
};

export type ManagedIndustryDetailPayload = {
  banners?: string[];
  highlight_1?: {
    badge?: string;
    imagePosition?: string;
    title?: string;
    desc?: string;
    image?: string;
    features?: string[];
  };
  productsTitle?: string;
  productsDesc?: string;
  products?: Array<{
    title?: string;
    desc?: string;
    descTH?: string;
    descEN?: string;
    img?: string;
    href?: string;
  }>;
};

const solutionDefaults: Record<string, ManagedSolutionDetailPayload> = {
  "led-display": {
    intro:
      "โซลูชันสำหรับองค์กรที่ต้องการจอ LED หรือ LED Display คุณภาพสูงจาก Unilumin ใช้งานได้ทั้ง Indoor, Outdoor และ All-in-One พร้อมทีมขาย ออกแบบ ติดตั้ง และดูแลหลังการขายแบบครบวงจร",
    introEn:
      "Enterprise LED Display solutions from Unilumin for indoor, outdoor, and All-in-One applications, supported by consultation, design, installation, and after-sales teams.",
    bullets: [
      "บริการขาย ออกแบบ และติดตั้งจอ LED แบบครบวงจรสำหรับองค์กรไทย",
      "เลือก Pixel Pitch ได้ตั้งแต่ P0.9 ถึง P10 ตามระยะมองจริงของผู้ชม",
      "รองรับการใช้งาน Indoor / Outdoor / Rental / All-in-One",
      "ความสว่างสูงสุดถึง 6,000 nits สำหรับใช้งานกลางแจ้งและพื้นที่แสงมาก",
      "วางระบบควบคุมภาพและจัดการเนื้อหาจากระยะไกลได้ตามรูปแบบงาน",
      "ทีมออกแบบโครงสร้าง ระบบไฟ การติดตั้ง และบริการหลังการขายในประเทศ",
    ],
    applications: ["ห้องประชุมผู้บริหาร", "Lobby & Showroom", "Control Room", "Outdoor DOOH", "Auditorium", "Convention Hall"],
    seoSections: [
      {
        heading: "จอ LED คืออะไร และ LED Display เหมาะกับองค์กรแบบไหน",
        body:
          "ระบบจอ LED คือจอแสดงผลที่ประกอบจากโมดูล LED หลายชุด ทำให้สร้างจอขนาดใหญ่ได้แบบไร้รอยต่อ เหมาะกับองค์กรที่ต้องการภาพคมชัด สว่าง และใช้งานต่อเนื่อง เช่น ห้องประชุมใหญ่ ห้องควบคุม โชว์รูม โรงแรม หน่วยงานรัฐ และพื้นที่สื่อสารแบรนด์ที่ต้องการความน่าเชื่อถือสูง",
      },
      {
        heading: "บริการติดตั้งจอ LED และออกแบบ LED Display แบบครบวงจร",
        body:
          "Matrix Intertrade ดูแลตั้งแต่ให้คำปรึกษา สำรวจพื้นที่ ออกแบบขนาดจอ เลือก Pixel Pitch วางโครงสร้างและระบบไฟ ไปจนถึงติดตั้ง ทดสอบระบบ อบรมการใช้งาน และดูแลหลังการขาย เพื่อให้จอ LED ทำงานได้เหมาะกับพื้นที่จริง ไม่ใช่แค่สเปกบนกระดาษ",
      },
      {
        heading: "เลือกจอ LED Indoor, Outdoor และ All-in-One",
        body:
          "การเลือกจอ LED ต้องดูระยะมอง ความละเอียด ความสว่าง สภาพแสง และรูปแบบการติดตั้งร่วมกัน งาน Indoor มักเน้น Pixel Pitch ละเอียดและความสบายตา งาน Outdoor ต้องเน้น brightness และความทนทาน ส่วน All-in-One เหมาะกับห้องประชุมที่ต้องการจอใหญ่ ใช้งานง่าย และลดอุปกรณ์ต่อพ่วง",
      },
    ],
    relatedLinks: [
      {
        label: "คู่มือวางงบจอ LED สำหรับองค์กร",
        href: "/blog/led-led-display",
      },
      {
        label: "จอ LED 1 จอ ต้องมีอุปกรณ์อะไรบ้าง",
        href: "/blog/led-1-led-display",
      },
      {
        label: "เปรียบเทียบจอ LED กับ LCD สำหรับองค์กร",
        href: "/blog/led-display-vs-lcd-display",
      },
    ],
    faqs: [
      { question: "ควรเลือก Pixel Pitch ของจอ LED อย่างไร?", answer: "ให้เริ่มจากระยะมองจริงของผู้ชม หากนั่งใกล้ เช่น ห้องประชุมหรือ Control Room ควรใช้ P0.9-P2.5 แต่ถ้าเป็นพื้นที่กว้างหรือ Outdoor DOOH สามารถใช้ P3.9-P10 เพื่อคุมงบและยังมองเห็นชัดเจน" },
      { question: "จอ LED Indoor กับ Outdoor ต่างกันอย่างไร?", answer: "จอ Indoor เน้นความละเอียดและความสบายตาในระยะใกล้ ส่วนจอ Outdoor ต้องมีความสว่างสูง ทนแดด ทนฝน และมีโครงสร้างที่เหมาะกับสภาพแวดล้อมภายนอก" },
      { question: "จอ All-in-One LED เหมาะกับใคร?", answer: "เหมาะกับองค์กรที่ต้องการจอประชุมขนาดใหญ่พร้อมระบบควบคุมในตัว ติดตั้งง่าย ใช้งานสะดวก และต้องการภาพลักษณ์ห้องประชุมที่ทันสมัยกว่าโปรเจกเตอร์หรือทีวีทั่วไป" },
      { question: "Matrix Intertrade ให้บริการติดตั้งครบวงจรหรือไม่?", answer: "ให้บริการครบตั้งแต่ให้คำปรึกษา สำรวจพื้นที่ ออกแบบระบบ เลือกสเปกจอ LED วางโครงสร้างไฟฟ้า ติดตั้ง ทดสอบระบบ และดูแลหลังการขายในประเทศไทย" },
    ],
  },
  "interactive-display": {
    intro:
      "จอสัมผัสอัจฉริยะระดับมืออาชีพจาก Persona รองรับการเรียนการสอน Active Learning และห้องประชุม Hybrid Meeting",
    introEn: "Professional smart touch displays from Persona, supporting Active Learning and Hybrid Meetings.",
    bullets: [
      "Google EDLA Certified รองรับ Google Play อย่างเป็นทางการ",
      "Multi-touch สูงสุด 40 จุด ตอบสนองทันที",
      "Whiteboard ในตัว พร้อม Cloud Storage",
      "รองรับ Wireless Casting จากทุกอุปกรณ์",
      "DMS+ ระบบบริหารจัดการจอจากระยะไกล",
      "ขนาด 65 / 75 / 86 / 98 นิ้ว",
    ],
    applications: ["Smart Classroom", "ห้องประชุมองค์กร", "ห้องอบรม", "Training Room", "ห้องผู้บริหาร", "Innovation Lab"],
  },
  projector: {
    intro:
      "ระบบโปรเจกเตอร์ความสว่างสูงพร้อมจอรับภาพ Grandview สำหรับห้องประชุม Auditorium และโฮมเธียเตอร์",
    introEn:
      "High-brightness projector systems paired with Grandview screens for meeting rooms, auditoriums, and home theaters.",
    bullets: [
      "ความสว่างตั้งแต่ 3,000 ถึง 20,000 lumens",
      "เทคโนโลยี Laser Light Source อายุการใช้งานยาวนาน",
      "รองรับ 4K UHD และ HDR",
      "จอรับภาพ Grandview ทั้งแบบ Fixed / Motorized / ALR",
      "ติดตั้งโดยทีมเทคนิคพร้อม Color Calibration",
    ],
    applications: ["ห้องประชุมใหญ่", "Auditorium", "ห้องอบรม", "Boardroom", "โรงเรียน", "Home Theater"],
  },
  "wireless-presentation": {
    intro:
      "tranScreen ระบบนำเสนอไร้สายระดับองค์กร รองรับ BYOD ทุกอุปกรณ์ Windows / Mac / iOS / Android",
    introEn:
      "tranScreen Enterprise-grade wireless presentation system, supporting BYOD for all devices (Windows / Mac / iOS / Android)",
    bullets: [
      "ส่งภาพไร้สายแบบ Real-time ไม่มี Lag",
      "รองรับการแชร์พร้อมกันสูงสุด 4 หน้าจอ",
      "Plug-and-Play ใช้งานง่าย ไม่ต้องลง Driver",
      "ระบบความปลอดภัยระดับองค์กร",
      "รองรับ AirPlay / Miracast / Google Cast",
    ],
    applications: ["ห้องประชุม Huddle Room", "Boardroom", "Training Room", "Hybrid Meeting", "Innovation Lab"],
  },
  "av-solutions": {
    intro:
      "ออกแบบ ติดตั้ง และดูแลระบบภาพและเสียงครบวงจร พร้อมอุปกรณ์ Kramer AV ระดับ Enterprise",
    introEn:
      "Comprehensive Audio-Visual system design, installation, and maintenance with Enterprise-grade Kramer AV equipment.",
    bullets: [
      "AV over IP ส่งสัญญาณภาพและเสียงผ่านระบบเครือข่าย",
      "Matrix Switcher และ Video Wall Processor",
      "ระบบ Conference / Microphone / Audio DSP",
      "Control System สั่งงานทั้งห้องผ่าน Touch Panel",
      "ออกแบบโดยทีม Sales Engineer ที่ผ่าน CTS",
      "Commissioning & Training ครบวงจร",
    ],
    applications: ["Boardroom", "Control Room", "Auditorium", "Smart Hospital", "Command Center", "Broadcast Studio"],
  },
};

const industryDefaults: Record<string, ManagedIndustryDetailPayload> = {
  education: {
    banners: [
      "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
      "/legacy-imports/652ee847c907-th_kta_pro_full_-231_.png",
      "/legacy-imports/f7c323982191-interactive_display12.png",
    ],
    highlight_1: {
      badge: "มหาวิทยาลัย · วิทยาลัย · โรงเรียนทุกระดับชั้น",
      title: "Remarkable Screen — จอ 2-in-1 สำหรับห้องเรียนยุคใหม่",
      desc: "ห้องเรียน ห้องเล็กเชอร์ และห้องบรรยายในยุคปัจจุบัน ขาดการนำเสนอภาพผ่านสื่อมีเดียไม่ได้ Grandview มีจอฉายภาพคุณภาพสูงที่ตอบทุกความต้องการ ทุกขนาด",
      imagePosition: "left",
      image: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
      features: [
        "เป็นได้ทั้งกระดานเขียนและจอฉายภาพในเวลาเดียวกัน",
        "ไม่ต้องดึงจอขึ้นลงเพื่อสลับการใช้งาน",
        "โครงสร้างแข็งแรง 4 ชั้น ดีไซน์ทันสมัย",
        "ทำงานร่วมกับโปรเจกเตอร์อินเตอร์แอคทีฟได้ราบรื่น",
        'มีขนาดให้เลือกตั้งแต่ 50" จนถึง 106"',
      ],
    },
    productsTitle: "ผลิตภัณฑ์สำหรับสถาบันการศึกษา",
    productsDesc: "โซลูชั่นภาพและเสียงครบวงจรสำหรับห้องเรียน ห้องบรรยาย และหอประชุมทุกขนาด",
    products: [
      { title: "Grandview Large-stage Series", descTH: "จอสำหรับห้องบรรยายขนาดกลาง - ใหญ่ หากห้องเรียนหรือห้องบรรยายของคุณมีขนาดใหญ่เกินกว่าที่ Remarkable Screen จะรองรับได้ Grandview มีจอตั้งแต่ขนาด 100\" - 500\" ทุกฟอร์แมต ทั้งแบบมือดึงและแบบมอเตอร์", img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg", href: "/category/grandview" },
      { title: "SkyShow Series", descTH: "จอสำหรับห้องเพดานสูง หอประชุม หรือห้องบรรยายเพดานสูง โดย Grandview ออกแบบให้เหมาะกับการใช้งานบนเวทีและฮอลล์ขนาดใหญ่", img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg", href: "/category/grandview" },
      { title: "KRAMER", descTH: "อุปกรณ์เพื่อทุกคำตอบสำหรับโซลูชั่นในการนำเสนองานภาพ เสียง และการแลกเปลี่ยนความเห็นในยุคดิจิตอล 4.0", img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg", href: "/category/kramer" },
    ],
  },
  hotel: {
    banners: [
      "/legacy-imports/7b9fc0dd456f-av_solutions1.png",
      "/legacy-imports/a6492e1dbcf9-led_display1.png",
      "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
      "/legacy-imports/55c7fda91436-wireless_presentation1.png",
      "/legacy-imports/f7c323982191-interactive_display12.png",
    ],
    highlight_1: {
      badge: "Live Event · พิพิธภัณฑ์ · โรงละคร · โรงแรม",
      title: "สถานบันเทิง โรงละคร โรงแรม งานกิจกรรม",
      desc: "เราทราบดีว่างานของคุณพลาดไม่ได้ หากพลาด ความเสียหายต่อคุณและลูกค้าของคุณอาจมากมายเกินรับไหว อุปกรณ์ที่เราคัดสรรจึงเป็น Top Class reliable products ที่ผ่านการพิสูจน์อย่างโชกโชนจากกิจกรรมสำคัญและการใช้งานหนัก ในสถานที่ที่ต้องการเสถียรภาพสูงสุดจากทุกมุมโลก",
      imagePosition: "left",
      image: "/legacy-imports/7b9fc0dd456f-av_solutions1.png",
      features: [
        "โซลูชั่นสำหรับงานที่ต้องการความเสถียรสูงสุด",
        "เหมาะกับงาน Live Event, Museum, Theatre และ Hotel",
        "เลือกอุปกรณ์ระดับ Top Class ที่พิสูจน์แล้ว",
      ],
    },
    productsTitle: "ผลิตภัณฑ์เพื่อกิจการโรงแรม งานกิจกรรม Live Event และงานพิพิธภัณฑ์",
    productsDesc: "",
    products: [
      { title: "Grandview CNV — Cyber / Elegant / Large-stage Series", descTH: "จอสำหรับห้องบรรยายและฮอลล์ขนาดกลาง - ใหญ่ รองรับห้องที่ใหญ่เกินกว่า Remarkable Screen ตั้งแต่ขนาด 100\" ถึง 500\" ทุกฟอร์แมต ทั้งแบบมือดึงและแบบมอเตอร์", img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg", href: "/category/grandview" },
      { title: "KRAMER", descTH: "อุปกรณ์เพื่อทุกคำตอบสำหรับโซลูชั่นในการนำเสนองานภาพ เสียง และการแลกเปลี่ยนความเห็นในยุคดิจิตอล 4.0", img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg", href: "/category/kramer" },
    ],
  },
  corporate: {
    highlight_1: {
      badge: "องค์กรธุรกิจ · หน่วยงานราชการ · รัฐวิสาหกิจ",
      title: "Remarkable Screen — จอ 2-in-1 สำหรับห้องประชุมยุคดิจิตอล 4.0",
      desc: "Remarkable Screen จอภาพยุคใหม่ล่าสุดแบบทูอินวัน เป็นได้ทั้งกระดานเขียนบรรยายด้วย Marking pen ลบได้เหมือนไวท์บอร์ด และเป็นจอฉายภาพคุณภาพสูงจากโปรเจคเตอร์ในเวลาเดียวกัน — ทางเลือกใหม่อันชาญฉลาดสำหรับห้องประชุมในสำนักงาน",
      imagePosition: "right",
      image: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
      features: [
        "เขียนและฉายภาพได้พร้อมกันบนจอเดียว",
        "ดีไซน์ทันสมัย โครงสร้างแข็งแรง 4 ชั้น",
        "ใช้ร่วมกับโปรเจกเตอร์อินเตอร์แอคทีฟได้ราบรื่น",
        'มีให้เลือกหลายขนาด ตั้งแต่ 50" จนถึง 106"',
      ],
    },
    productsTitle: "ผลิตภัณฑ์สำหรับสำนักงาน องค์กรธุรกิจ และหน่วยงานราชการ",
    products: [
      { title: "Grandview CNV — Cyber / Elegant / Large-stage Series", descTH: "จอสำหรับห้องประชุมและฮอลล์ขนาดกลาง-ใหญ่ ตั้งแต่ 100\" ถึง 500\" ทุกฟอร์แมต ทั้งแบบมือดึงและมอเตอร์ ตอบโจทย์ทุกขนาดของห้องประชุมในองค์กร", img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg", href: "/category/grandview" },
      { title: "KRAMER", descTH: "อุปกรณ์ระบบ AV ครบวงจร สำหรับการนำเสนอภาพ เสียง และการแลกเปลี่ยนความเห็นในห้องประชุมยุคดิจิตอล 4.0", img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg", href: "/category/kramer" },
      { title: "AV Over IP", descTH: "การส่งสัญญาณภาพและเสียงผ่านระบบ Network รองรับการกระจายสัญญาณคุณภาพสูงในระยะไกลและหลายจุดพร้อมกัน", img: "/legacy-imports/7b9fc0dd456f-av_solutions1.png", href: "/category/kramer" },
      { title: "Video Switchers 4K", descTH: "เครื่องสลับสัญญาณภาพ รองรับความละเอียดสูงสุดถึง 4K สำหรับห้องประชุมและงานอีเวนต์ที่ต้องการคุณภาพสูง", img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg", href: "/category/kramer" },
    ],
  },
  "video-conference": {
    highlight_1: {
      badge: "Video Conference · Interactive Display · AV Over IP",
      title: "Interactive Display จออินเตอร์แอคทีฟ — มากกว่าจอ TV ทั่วไป",
      desc: "จอแสดงผลเพียงหนึ่งเดียวที่คุณสามารถใช้ขีดเขียน แสดงความเห็น เชื่อมต่อการประชุมออนไลน์ และแลกเปลี่ยนข้อมูลกันในการประชุมแบบไร้สาย ทำงานร่วมกับอุปกรณ์ชุดประชุมอื่นๆ ได้อย่างลงตัว",
      imagePosition: "left",
      image: "/legacy-imports/f7c323982191-interactive_display12.png",
      features: [
        "รองรับการประชุมออนไลน์และแชร์หน้าจอไร้สาย",
        "ใช้งานร่วมกับอุปกรณ์ชุดประชุมได้อย่างลงตัว",
        "เขียนและแลกเปลี่ยนข้อมูลได้ทันที",
      ],
    },
    productsTitle: "ผลิตภัณฑ์สำหรับระบบวิดีโอคอนเฟอเร้นซ์ เพื่อทุกหน่วยงาน",
    productsDesc: "โซลูชั่นภาพ เสียง และการประชุมทางไกลครบวงจร สำหรับห้องประชุม ห้องเรียน และห้องควบคุมทุกขนาด",
    products: [
      { title: "Collaboration Devices", descTH: "ชุดอุปกรณ์วิดีโอคอนเฟอเร้นซ์ครบชุด สำหรับการประชุมทางไกล รองรับการเชื่อมต่อกับแพลตฟอร์มประชุมยอดนิยม", img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg", href: "/category/kramer" },
      { title: "AV Over IP", descTH: "ระบบส่งสัญญาณภาพและเสียงผ่านเครือข่ายเพื่อการกระจายสัญญาณหลายจุด", img: "/legacy-imports/7b9fc0dd456f-av_solutions1.png", href: "/category/kramer" },
      { title: "Room Control Systems", descTH: "ควบคุมภาพ เสียง แสง และระบบนำเสนอจากจุดควบคุมเดียว", img: "/legacy-imports/7b9fc0dd456f-av_solutions1.png", href: "/category/kramer" },
      { title: "Wireless Presentation", descTH: "แชร์หน้าจอแบบไร้สายสำหรับการประชุมยุคใหม่", img: "/legacy-imports/55c7fda91436-wireless_presentation1.png", href: "/category/kramer" },
    ],
  },
};

export function getSolutionDetailDefaults(
  slug: string,
  title?: string,
  description?: string,
): ManagedSolutionDetailPayload {
  return solutionDefaults[slug] ?? {
    intro: description || title || "",
    bullets: [],
    applications: [],
    seoSections: [],
    relatedLinks: [],
    faqs: [],
  };
}

export function getIndustryDetailDefaults(
  slug: string,
  title?: string,
  description?: string,
): ManagedIndustryDetailPayload {
  return industryDefaults[slug] ?? {
    banners: [],
    highlight_1: {
      badge: title || "",
      title: title || "",
      desc: description || "",
      imagePosition: "left",
      features: [],
    },
    productsTitle: "",
    products: [],
  };
}