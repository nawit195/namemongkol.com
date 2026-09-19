export type SubItem = {
  label: string;
  labelEn?: string;
  href: string;
  desc?: string;
  descEn?: string;
  image?: string;
};
export type NavItem = { label: string; labelEn?: string; href: string; submenu?: SubItem[] };

export const nav: NavItem[] = [
  { label: "หน้าแรก", labelEn: "Home", href: "/" },
  {
    label: "เกี่ยวกับเรา",
    labelEn: "About Us",
    href: "/aboutus",
    submenu: [
      {
        label: "โรงเรียน และสถาบันการศึกษา",
        labelEn: "Schools & Education",
        href: "/industry/education",
      },
      {
        label: "โรงแรมและห้องประชุมขนาดใหญ่",
        labelEn: "Hotels & Convention Centers",
        href: "/industry/hotel",
      },
      {
        label: "สำนักงานและองค์กรธุรกิจ",
        labelEn: "Corporate Offices",
        href: "/industry/corporate",
      },
      {
        label: "ระบบวิดีโอคอนเฟอเร้นซ์ เพื่อทุกหน่วยงาน",
        labelEn: "Video Conferencing Systems",
        href: "/industry/video-conference",
      },
    ],
  },
  {
    label: "โซลูชั่นของเรา",
    labelEn: "Our Solutions",
    href: "/solutions",
    submenu: [
      {
        label: "LED Display",
        labelEn: "LED Display",
        href: "/led-display",
        desc: "จอ LED ระดับมืออาชีพสำหรับองค์กร",
        descEn: "Professional LED Displays for Enterprises",
        image: "/legacy-imports/a6492e1dbcf9-led_display1.png",
      },
      {
        label: "Interactive Display",
        labelEn: "Interactive Display",
        href: "/interactive-display",
        desc: "จอสัมผัสอัจฉริยะสำหรับการเรียนและประชุม",
        descEn: "Smart Touch Displays for Active Learning & Meetings",
        image: "/legacy-imports/f7c323982191-interactive_display12.png",
      },
      {
        label: "Projection Screen",
        labelEn: "Projection Screen",
        href: "/projector",
        desc: "โปรเจกเตอร์ความสว่างสูง",
        descEn: "High Brightness Projectors",
        image: "/legacy-imports/3ddadb3d3dff-projector11.png",
      },
      {
        label: "Wireless Presentation",
        labelEn: "Wireless Presentation",
        href: "/wireless-presentation",
        desc: "ระบบนำเสนอไร้สาย",
        descEn: "Wireless Presentation Systems",
        image: "/legacy-imports/55c7fda91436-wireless_presentation1.png",
      },
      {
        label: "AV Solutions",
        labelEn: "AV Solutions",
        href: "/av-solutions",
        desc: "ออกแบบระบบภาพและเสียงครบวงจร",
        descEn: "Complete Audio & Visual System Integration",
        image: "/legacy-imports/7b9fc0dd456f-av_solutions1.png",
      },
    ],
  },
  {
    label: "ผลงาน",
    labelEn: "Our Brands",
    href: "/brands",
  },
  {
    label: "สินค้า",
    labelEn: "Products",
    href: "/category/all-products",
    submenu: [
      { label: "Unilumin", labelEn: "Unilumin", href: "/category/unilumin" },
      { label: "Kramer", labelEn: "Kramer", href: "/category/kramer" },
      { label: "Persona", labelEn: "Persona", href: "/category/persona" },
      { label: "tranScreen", labelEn: "tranScreen", href: "/category/transcreen" },
      { label: "Grandview", labelEn: "Grandview", href: "/category/grandview" },
      { label: "HDMI Cable", labelEn: "HDMI Cable", href: "/category/hdmi-cable" },
      { label: "Product Line", labelEn: "Product Line", href: "/product-line" },
    ],
  },
  { label: "ติดต่อเรา", labelEn: "Contact Us", href: "/contactus" },
  { label: "บทความ", labelEn: "Articles", href: "/blog" },
];

export const brands = [
  {
    slug: "unilumin",
    name: "Unilumin",
    category: "LED Display",
    desc: "ผู้นำระดับโลกด้านจอ LED Display คุณภาพสูง สำหรับ Indoor และ Outdoor",
    descEn: "Global leader in high-quality Indoor and Outdoor LED Displays",
    color: "from-blue-500 to-cyan-500",
  },
  {
    slug: "kramerav",
    name: "KramerAV",
    category: "AV / Switching",
    desc: "อุปกรณ์ AV และระบบ switching ระดับมืออาชีพจากอิสราเอล",
    descEn: "Professional AV equipment and switching systems from Israel",
    color: "from-indigo-500 to-blue-500",
  },
  {
    slug: "grandview",
    name: "Grandview",
    category: "Projector Screen",
    desc: "จอรับภาพระดับพรีเมียมสำหรับห้องประชุมและโฮมเธียเตอร์",
    descEn: "Premium projector screens for meeting rooms and home theaters",
    color: "from-slate-500 to-slate-700",
  },
  {
    slug: "persona",
    name: "Persona",
    category: "Interactive Display",
    desc: "จอสัมผัสอัจฉริยะอันดับ 1 จากไต้หวัน รับรอง Google EDLA",
    descEn: "No.1 Interactive Display from Taiwan with Google EDLA certification",
    color: "from-cyan-500 to-teal-500",
  },
  {
    slug: "transcreen",
    name: "tranScreen",
    category: "Wireless Presentation",
    desc: "ระบบนำเสนอไร้สายสำหรับห้องประชุมยุคใหม่",
    descEn: "Wireless presentation systems for modern meeting rooms",
    color: "from-sky-500 to-blue-600",
  },
];

export const solutions = [
  {
    slug: "led-display",
    title: "จอ LED",
    titleEn: "LED Display",
    icon: "Monitor",
    desc: "จอ LED / LED Display Indoor, Outdoor และ All-in-One สำหรับองค์กร ห้องประชุม และงานอีเวนต์",
    descEn: "Indoor / Outdoor / All-in-One LED Displays for enterprises, meeting rooms, and events",
  },
  {
    slug: "interactive-display",
    title: "Interactive Display",
    titleEn: "Interactive Display",
    icon: "Hand",
    desc: "จอสัมผัสอัจฉริยะ รองรับการเรียนการสอนและการประชุมแบบ Active",
    descEn: "Smart touch displays supporting active learning and meetings",
  },
  {
    slug: "projector",
    title: "Projection Screen",
    titleEn: "Projection Screen",
    icon: "Projector",
    desc: "โปรเจกเตอร์ความสว่างสูง คมชัด พร้อมจอรับภาพคุณภาพ",
    descEn: "High brightness, clear projectors with quality screens",
  },
  {
    slug: "wireless-presentation",
    title: "Wireless Presentation",
    titleEn: "Wireless Presentation",
    icon: "Wifi",
    desc: "ระบบนำเสนอไร้สาย รองรับ BYOD ทุกอุปกรณ์",
    descEn: "Wireless presentation systems supporting BYOD on all devices",
  },
  {
    slug: "av-solutions",
    title: "AV Solutions",
    titleEn: "AV Solutions",
    icon: "Cable",
    desc: "ออกแบบและติดตั้งระบบภาพและเสียงครบวงจรสำหรับองค์กร",
    descEn: "Complete audio and visual system design and installation for enterprises",
  },
];

export const industries = [
  {
    slug: "education",
    title: "โรงเรียน และสถาบันการศึกษา",
    titleEn: "Schools & Education",
    icon: "GraduationCap",
    desc: "Smart Classroom พร้อมจอ Interactive และระบบนำเสนอ",
    descEn: "Smart Classrooms with Interactive Displays and presentation systems",
  },
  {
    slug: "hotel",
    title: "โรงแรมและห้องประชุมขนาดใหญ่",
    titleEn: "Hotels & Convention Centers",
    icon: "Building2",
    desc: "ระบบ AV ครบวงจรสำหรับ Ballroom และห้องสัมมนา",
    descEn: "Comprehensive AV systems for Ballrooms and seminar rooms",
  },
  {
    slug: "corporate",
    title: "สำนักงานและองค์กรธุรกิจ",
    titleEn: "Corporate Offices",
    icon: "Briefcase",
    desc: "Smart Meeting Room รองรับ Hybrid Meeting",
    descEn: "Smart Meeting Rooms supporting Hybrid Meetings",
  },
  {
    slug: "government",
    title: "หน่วยงานรัฐ",
    titleEn: "Government Agencies",
    icon: "Landmark",
    desc: "จอ LED Outdoor และห้องประชุมระดับองค์กรรัฐ",
    descEn: "Outdoor LED Displays and enterprise-grade meeting rooms for government",
  },
  {
    slug: "hospital",
    title: "โรงพยาบาล / Smart Hospital",
    titleEn: "Smart Hospitals",
    icon: "HeartPulse",
    desc: "ระบบจัดการข้อมูลและประชุมทางการแพทย์",
    descEn: "Data management and medical conferencing systems",
  },
  {
    slug: "video-conference",
    title: "ห้องประชุม Hybrid Meeting",
    titleEn: "Hybrid Meeting Rooms",
    icon: "Video",
    desc: "ระบบ Video Conference เพื่อทุกหน่วยงาน",
    descEn: "Video Conference systems for all departments",
  },
];

export const articleCategories = [
  { slug: "led-display", label: "LED Display", labelEn: "LED Display" },
  { slug: "interactive-display", label: "Interactive Display", labelEn: "Interactive Display" },
  { slug: "smart-classroom", label: "Smart Classroom", labelEn: "Smart Classroom" },
  { slug: "meeting-room", label: "Meeting Room & AV", labelEn: "Meeting Room & AV" },
  { slug: "knowledge", label: "Technology Knowledge", labelEn: "Technology Knowledge" },
  { slug: "case-study", label: "Case Study / News", labelEn: "Case Study / News" },
];
