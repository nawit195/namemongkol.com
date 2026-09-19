import { createFileRoute } from "@tanstack/react-router";
import { SolutionDetailTemplate } from "@/components/site/SolutionDetailTemplate";
import {
  loadSolutionDetailContent,
  type SolutionDetailContent,
} from "@/lib/content/site";
import { buildSeoHead } from "@/lib/seo";
import heroLed from "@/assets/hero-led.jpg";
import { COMPANY_SCHEMA_ID } from "@/lib/company-profile";

const siteUrl = "https://www.matrixintertrade.com";

const ledDisplayFaqs = [
  {
    question: "ควรเลือก Pixel Pitch ของจอ LED อย่างไร?",
    answer:
      "ให้เริ่มจากระยะมองจริงของผู้ชม หากนั่งใกล้ เช่น ห้องประชุมหรือ Control Room ควรใช้ P0.9-P2.5 แต่ถ้าเป็นพื้นที่กว้างหรือ Outdoor DOOH สามารถใช้ P3.9-P10 เพื่อคุมงบและยังมองเห็นชัดเจน",
    questionEn: "How should I choose an LED display pixel pitch?",
    answerEn:
      "Start with the real viewing distance. Close-viewing spaces such as meeting rooms or control rooms typically use P0.9-P2.5, while wider or outdoor DOOH areas can use P3.9-P10 to balance clarity and budget.",
  },
  {
    question: "จอ LED Indoor กับ Outdoor ต่างกันอย่างไร?",
    answer:
      "จอ Indoor เน้นความละเอียดและความสบายตาในระยะใกล้ ส่วนจอ Outdoor ต้องมีความสว่างสูง ทนแดด ทนฝน และมีโครงสร้างที่เหมาะกับสภาพแวดล้อมภายนอก",
    questionEn: "What is the difference between indoor and outdoor LED displays?",
    answerEn:
      "Indoor displays prioritize fine resolution and comfortable close viewing. Outdoor displays need higher brightness, weather resistance, and structural design suitable for exterior environments.",
  },
  {
    question: "จอ All-in-One LED เหมาะกับใคร?",
    answer:
      "เหมาะกับองค์กรที่ต้องการจอประชุมขนาดใหญ่พร้อมระบบควบคุมในตัว ติดตั้งง่าย ใช้งานสะดวก และต้องการภาพลักษณ์ห้องประชุมที่ทันสมัยกว่าโปรเจกเตอร์หรือทีวีทั่วไป",
    questionEn: "Who should use an All-in-One LED display?",
    answerEn:
      "It is ideal for organizations that need a large meeting display with built-in control, easier installation, simple operation, and a more premium room experience than projectors or standard TVs.",
  },
  {
    question: "Matrix Intertrade ให้บริการติดตั้งครบวงจรหรือไม่?",
    answer:
      "ให้บริการครบตั้งแต่ให้คำปรึกษา สำรวจพื้นที่ ออกแบบระบบ เลือกสเปกจอ LED วางโครงสร้างไฟฟ้า ติดตั้ง ทดสอบระบบ และดูแลหลังการขายในประเทศไทย",
    questionEn: "Does Matrix Intertrade provide turnkey installation?",
    answerEn:
      "Yes. We support consultation, site survey, system design, LED Display specification, structure and power planning, installation, commissioning, and after-sales service in Thailand.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "จอ LED สำหรับองค์กร | LED Display Indoor Outdoor",
  serviceType: "จอ LED consultation, design and installation",
  url: `${siteUrl}/led-display`,
  provider: {
    "@type": "Organization",
    "@id": COMPANY_SCHEMA_ID,
  },
  areaServed: {
    "@type": "Country",
    name: "Thailand",
  },
  description:
    "บริการขาย ออกแบบ และติดตั้งจอ LED หรือ LED Display สำหรับห้องประชุม องค์กร โรงแรม หน่วยงานรัฐ และงาน Outdoor DOOH พร้อมทีมผู้เชี่ยวชาญในประเทศไทย",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Solutions",
      item: `${siteUrl}/solutions`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "จอ LED สำหรับองค์กร",
      item: `${siteUrl}/led-display`,
    },
  ],
};

function buildFaqJsonLd(faqs: typeof ledDisplayFaqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

const ledDisplayContent: SolutionDetailContent = {
  slug: "led-display",
  title: "จอ LED สำหรับองค์กร | LED Display Indoor Outdoor",
  iconName: "Monitor",
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
  bulletsEn: [
    "Turnkey LED Display consultation, sales, design, and installation for Thai organizations",
    "Pixel Pitch options from P0.9 to P10 based on real viewing distance",
    "Supports Indoor / Outdoor / Rental / All-in-One setups",
    "Up to 6,000 nits brightness for outdoor and high-ambient-light spaces",
    "Remote content management and control systems tailored to each project",
    "Structural, power design, installation, and domestic after-sales service teams",
  ],
  applications: ["ห้องประชุมผู้บริหาร", "Lobby & Showroom", "Control Room", "Outdoor DOOH", "Auditorium", "Convention Hall"],
  applicationsEn: [
    "Executive Boardrooms",
    "Lobbies & Showrooms",
    "Control Rooms",
    "Outdoor DOOH (Digital Out-of-Home)",
    "Auditoriums",
    "Convention Halls",
  ],
  seoSections: [
    {
      heading: "จอ LED คืออะไร และ LED Display เหมาะกับองค์กรแบบไหน",
      body:
        "ระบบจอ LED คือจอแสดงผลที่ประกอบจากโมดูล LED หลายชุด ทำให้สร้างจอขนาดใหญ่ได้แบบไร้รอยต่อ เหมาะกับองค์กรที่ต้องการภาพคมชัด สว่าง และใช้งานต่อเนื่อง เช่น ห้องประชุมใหญ่ ห้องควบคุม โชว์รูม โรงแรม หน่วยงานรัฐ และพื้นที่สื่อสารแบรนด์ที่ต้องการความน่าเชื่อถือสูง",
      headingEn: "What is an LED Display and which organizations should use it?",
      bodyEn:
        "An LED Display is a modular display system that can create large seamless screens with strong brightness and clarity. It suits meeting rooms, control rooms, showrooms, hotels, government agencies, and branded communication spaces that need reliable long-term operation.",
    },
    {
      heading: "บริการติดตั้งจอ LED และออกแบบ LED Display แบบครบวงจร",
      body:
        "Matrix Intertrade ดูแลตั้งแต่ให้คำปรึกษา สำรวจพื้นที่ ออกแบบขนาดจอ เลือก Pixel Pitch วางโครงสร้างและระบบไฟ ไปจนถึงติดตั้ง ทดสอบระบบ อบรมการใช้งาน และดูแลหลังการขาย เพื่อให้จอ LED ทำงานได้เหมาะกับพื้นที่จริง ไม่ใช่แค่สเปกบนกระดาษ",
      headingEn: "Turnkey LED Display design and installation service",
      bodyEn:
        "Matrix Intertrade supports consultation, site survey, screen sizing, pixel pitch selection, structure and power planning, installation, commissioning, training, and after-sales service so the display works well in the real environment.",
    },
    {
      heading: "เลือกจอ LED Indoor, Outdoor และ All-in-One",
      body:
        "การเลือกจอ LED ต้องดูระยะมอง ความละเอียด ความสว่าง สภาพแสง และรูปแบบการติดตั้งร่วมกัน งาน Indoor มักเน้น Pixel Pitch ละเอียดและความสบายตา งาน Outdoor ต้องเน้น brightness และความทนทาน ส่วน All-in-One เหมาะกับห้องประชุมที่ต้องการจอใหญ่ ใช้งานง่าย และลดอุปกรณ์ต่อพ่วง",
      headingEn: "Choose indoor, outdoor, and All-in-One LED Display systems",
      bodyEn:
        "Choosing the right system depends on viewing distance, resolution, brightness, ambient light, and installation format. Indoor projects need finer pixel pitch and comfortable viewing, outdoor projects need brightness and durability, while All-in-One displays are ideal for clean meeting-room setups.",
    },
  ],
  relatedLinks: [
    {
      label: "คู่มือวางงบจอ LED สำหรับองค์กร",
      labelEn: "Budget planning guide for enterprise LED screens",
      href: "/blog/led-led-display",
      description: "ดูวิธีประเมินงบประมาณจากขนาดจอ ความละเอียด ระบบควบคุม และการติดตั้ง",
      descriptionEn:
        "Learn how size, resolution, control systems, and installation affect project budget.",
    },
    {
      label: "จอ LED 1 จอ ต้องมีอุปกรณ์อะไรบ้าง",
      labelEn: "What equipment does one LED screen need?",
      href: "/blog/led-1-led-display",
      description: "เข้าใจภาพรวมของโมดูล ตู้จอ ระบบประมวลผล โครงสร้าง และงานระบบ",
      descriptionEn:
        "Understand modules, cabinets, processing, structure, and system components.",
    },
    {
      label: "เปรียบเทียบจอ LED กับ LCD สำหรับองค์กร",
      labelEn: "Compare LED and LCD displays for organizations",
      href: "/blog/led-display-vs-lcd-display",
      description: "เลือกเทคโนโลยีที่เหมาะกับห้องประชุม พื้นที่ขนาดใหญ่ และการใช้งานต่อเนื่อง",
      descriptionEn:
        "Choose the right display technology for meeting rooms, large spaces, and continuous use.",
    },
  ],
  faqs: ledDisplayFaqs,
};

export const Route = createFileRoute("/led-display")({
  loader: async () => loadSolutionDetailContent("led-display", ledDisplayContent),
  head: ({ loaderData }) => {
    const faqs = (loaderData?.faqs ?? ledDisplayContent.faqs ?? ledDisplayFaqs) as typeof ledDisplayFaqs;
    const managedTitle = loaderData?.seoTitle?.trim();
    const title =
      !managedTitle || managedTitle === "จอ LED สำหรับองค์กร | LED Display Indoor Outdoor - Matrix Intertrade"
        ? "จอ LED Display สำหรับองค์กร | ออกแบบ ติดตั้งครบวงจร"
        : managedTitle;
    const seo = buildSeoHead({
      title,
      description:
        loaderData?.seoDescription ||
        "จำหน่าย ออกแบบ และรับติดตั้งจอ LED Display สำหรับองค์กร ทั้ง Indoor, Outdoor และ All-in-One พร้อมสำรวจหน้างานและดูแลโดยทีม Matrix Intertrade",
      path: "/led-display",
      canonical: loaderData?.seoCanonicalUrl,
      image: loaderData?.ogImageUrl || loaderData?.imageUrl || heroLed,
      ogTitle: loaderData?.ogTitle,
      ogDescription: loaderData?.ogDescription,
      noIndex: loaderData?.seoNoIndex,
    });

    return {
      ...seo,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(buildFaqJsonLd(faqs)),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(serviceJsonLd),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbJsonLd),
        },
      ],
    };
  },
  component: LedDisplayPage,
});

function LedDisplayPage() {
  const content = Route.useLoaderData();
  return <SolutionDetailTemplate {...content} title="จอ LED Display สำหรับองค์กร" />;
}
