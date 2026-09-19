import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  articleCategories as fallbackArticleCategories,
  brands as fallbackBrands,
  industries as fallbackIndustries,
  nav as fallbackNav,
  solutions as fallbackSolutions,
  type NavItem,
} from "@/data/site";
import {
  brandIntrosByCategoryId as fallbackBrandIntrosByCategoryId,
  type BrandIntro,
} from "@/data/brand-intros";
import { CATEGORY_SLUGS } from "@/lib/seo-slugs";
import type { ManagedSeoFields } from "@/lib/seo";
import {
  fallbackCompanyProfile,
  parseCompanyProfile,
  type SiteCompanyProfile,
} from "@/lib/company-profile";

export type { SiteCompanyProfile } from "@/lib/company-profile";

export type SiteBrand = (typeof fallbackBrands)[number] & ManagedSeoFields & {
  imageUrl?: string | null;
  logoUrl?: string | null;
  accent?: unknown;
};

export type SiteSolution = (typeof fallbackSolutions)[number] & ManagedSeoFields & {
  imageUrl?: string | null;
  payload?: Record<string, unknown> | null;
};

export type SolutionDetailSeoSection = {
  heading: string;
  headingEn?: string;
  body: string;
  bodyEn?: string;
};

export type SolutionDetailFaq = {
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
};

export type SolutionDetailRelatedLink = {
  label: string;
  labelEn?: string;
  href: string;
  description?: string;
  descriptionEn?: string;
};

export type SolutionDetailContent = ManagedSeoFields & {
  slug: string;
  title: string;
  iconName: string;
  intro: string;
  introEn?: string;
  bullets: string[];
  bulletsEn?: string[];
  applications: string[];
  applicationsEn?: string[];
  seoSections?: SolutionDetailSeoSection[];
  relatedLinks?: SolutionDetailRelatedLink[];
  faqs?: SolutionDetailFaq[];
  imageUrl?: string | null;
};

export type SiteIndustry = (typeof fallbackIndustries)[number] & {
  imageUrl?: string | null;
  showcaseImageUrl?: string | null;
  showOnBrands?: boolean;
  sortOrder?: number | null;
  cardTagTh?: string | null;
  cardTagEn?: string | null;
  metricValue?: string | null;
  metricLabelTh?: string | null;
  metricLabelEn?: string | null;
  linkUrl?: string | null;
  payload?: Record<string, unknown> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  seoCanonicalUrl?: string | null;
  seoNoIndex?: boolean | null;
};

export type SiteShowcaseSection = {
  eyebrowTh: string;
  eyebrowEn: string;
  titlePrefixTh: string;
  titlePrefixEn: string;
  titleHighlightTh: string;
  titleHighlightEn: string;
  descriptionPrefixTh: string;
  descriptionPrefixEn: string;
  descriptionHighlightTh: string;
  descriptionHighlightEn: string;
  descriptionSuffixTh: string;
  descriptionSuffixEn: string;
  isEnabled: boolean;
};

export type SiteArticleCategory = (typeof fallbackArticleCategories)[number] & {
  imageUrl?: string | null;
};

export type SiteBrandIntro = BrandIntro & {
  imageUrl?: string | null;
  logoUrl?: string | null;
  payload?: Record<string, unknown> | null;
};

export type SiteAboutUs = {
  introTitleTh: string;
  introTitleEn: string;
  introDescTh: string;
  introDescEn: string;
  storyP1Th: string;
  storyP1En: string;
  storyP2Th: string;
  storyP2En: string;
  storyP3Th: string;
  storyP3En: string;
  missionTh: string;
  missionEn: string;
  visionTh: string;
  visionEn: string;
  valuesTh: string;
  valuesEn: string;
  addressTh: string;
  addressEn: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  mapUrl: string;
  statsPayload: any;
};

export type SiteContactPage = {
  heroTitleTh: string;
  heroTitleEn: string;
  heroDescriptionTh: string;
  heroDescriptionEn: string;
  metaTitleTh: string;
  metaTitleEn: string;
  metaDescriptionTh: string;
  metaDescriptionEn: string;
  sectionTitleTh: string;
  sectionTitleEn: string;
  sectionDescriptionTh: string;
  sectionDescriptionEn: string;
  addressTh: string;
  addressEn: string;
  phone: string;
  email: string;
  line: string;
  mapTitleTh: string;
  mapTitleEn: string;
  mapDescriptionTh: string;
  mapDescriptionEn: string;
  mapEmbedUrl: string;
  directionsUrl: string;
  phoneHref: string;
  businessHoursTh: string;
  businessHoursEn: string;
  parkingTh: string;
  parkingEn: string;
};

export type SiteFooterSettings = {
  ctaTitleTh: string;
  ctaTitleEn: string;
  ctaDescriptionTh: string;
  ctaDescriptionEn: string;
  companyDescriptionTh: string;
  companyDescriptionEn: string;
  addressTh: string;
  addressEn: string;
  phone: string;
  email: string;
  line: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  newsletterDescriptionTh: string;
  newsletterDescriptionEn: string;
  newsletterPlaceholderTh: string;
  newsletterPlaceholderEn: string;
};

export type SiteContent = {
  nav: NavItem[];
  brands: SiteBrand[];
  solutions: SiteSolution[];
  industries: SiteIndustry[];
  industryShowcase: SiteShowcaseSection;
  articleCategories: SiteArticleCategory[];
  brandIntrosByCategoryId: Record<string, SiteBrandIntro>;
  aboutUs: SiteAboutUs | null;
  companyProfile: SiteCompanyProfile;
  contactPage: SiteContactPage;
  footerSettings: SiteFooterSettings;
  source: "files" | "supabase";
};

type NavRow = {
  id: string;
  parent_id: string | null;
  depth: number | null;
  sort_order: number | null;
  label: string;
  href: string;
  description: string | null;
  image_url: string | null;
};

type BrandRow = {
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  color: string | null;
  image_url: string | null;
  logo_url: string | null;
  accent: unknown;
  seo_title?: string | null;
  seo_description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  seo_canonical_url?: string | null;
  seo_no_index?: boolean | null;
  updated_at?: string | null;
};

type BrandIntroRow = {
  category_id: string;
  brand_slug: string;
  tagline: string | null;
  description: string | null;
  highlights: unknown;
  best_for: unknown;
  origin: string | null;
  payload: unknown;
};

type SolutionRow = {
  slug: string;
  title: string;
  icon: string | null;
  description: string | null;
  image_url: string | null;
  payload: unknown;
  seo_title?: string | null;
  seo_description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  seo_canonical_url?: string | null;
  seo_no_index?: boolean | null;
  updated_at?: string | null;
};

type IndustryRow = {
  slug: string;
  title: string;
  icon: string | null;
  description: string | null;
  image_url?: string | null;
  payload?: unknown;
  showcase_image_url?: string | null;
  show_on_brands?: boolean | null;
  sort_order?: number | null;
  card_tag_th?: string | null;
  card_tag_en?: string | null;
  metric_value?: string | null;
  metric_label_th?: string | null;
  metric_label_en?: string | null;
  link_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  seo_canonical_url?: string | null;
  seo_no_index?: boolean | null;
};

type SiteSectionRow = {
  section_key: string;
  eyebrow_th: string | null;
  eyebrow_en: string | null;
  title_prefix_th: string | null;
  title_prefix_en: string | null;
  title_highlight_th: string | null;
  title_highlight_en: string | null;
  description_prefix_th: string | null;
  description_prefix_en: string | null;
  description_highlight_th: string | null;
  description_highlight_en: string | null;
  description_suffix_th: string | null;
  description_suffix_en: string | null;
  is_enabled: boolean | null;
  payload?: unknown;
};

type AboutUsRow = {
  id: string;
  intro_title_th: string | null;
  intro_title_en: string | null;
  intro_desc_th: string | null;
  intro_desc_en: string | null;
  story_p1_th: string | null;
  story_p1_en: string | null;
  story_p2_th: string | null;
  story_p2_en: string | null;
  story_p3_th: string | null;
  story_p3_en: string | null;
  mission_th: string | null;
  mission_en: string | null;
  vision_th: string | null;
  vision_en: string | null;
  values_th: string | null;
  values_en: string | null;
  address_th: string | null;
  address_en: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  map_url: string | null;
  stats_payload: any;
};

type ArticleCategoryRow = {
  slug: string;
  label: string;
  image_url: string | null;
};

type ContentDatabase = {
  public: {
    Tables: {
      content_nav_items: { Row: NavRow };
      content_brands: { Row: BrandRow };
      content_solutions: { Row: SolutionRow };
      content_industries: { Row: IndustryRow };
      content_site_sections: { Row: SiteSectionRow };
      content_article_categories: { Row: ArticleCategoryRow };
      content_brand_category_intros: { Row: BrandIntroRow };
      content_about_us: { Row: AboutUsRow };
    };
  };
};

type LocalizedFallback = {
  descEn?: string;
  labelEn?: string;
  titleEn?: string;
};

const contentClient = supabase as unknown as SupabaseClient<ContentDatabase>;


const fallbackAboutUs: SiteAboutUs = {
  introTitleTh: "บริษัท แมทริกซ์ อินเตอร์เทรด จำกัด",
  introTitleEn: "Matrix Intertrade Co., Ltd.",
  introDescTh: "ผู้นำเข้าและจัดจำหน่ายระบบภาพแบรนด์ชั้นนำของโลก ด้วยประสบการณ์ทีมงานมากกว่า 20 ปี คัดสรรเฉพาะผลิตภัณฑ์คุณภาพสูงที่เชื่อถือได้ระดับแนวหน้าของโลก",
  introDescEn: "Importer and distributor of world-leading AV brands with over 20 years of experience. We select only the highest quality and most reliable products globally.",
  storyP1Th: "เป็นผู้จัดจำหน่ายผลิตภัณฑ์ที่ใช้ในสำนักงานเพื่อเสริมประสิทธิภาพของการทำงานในหลากหลายรูปแบบ อาทิ จอรับภาพโปรเจคเตอร์ขนาดต่าง ๆ, จอ LED, กระดานอัจฉริยะ, อุปกรณ์ต่อเชื่อมระบบภาพ และการแสดงผลระบบภาพที่ทันสมัย ตอบโจทย์ยุคดิจิตอลทุกความต้องการ",
  storyP1En: "is a distributor of office products designed to enhance operational efficiency in various forms, such as projection screens of all sizes, LED displays, interactive whiteboards, AV connectivity equipment, and modern visual displays, meeting every digital era requirement.",
  storyP2Th: "ด้วยวิสัยทัศน์ที่เล็งเห็นว่า เครื่องมือและอุปกรณ์สำนักงานที่ดีและมีเสถียรภาพสูงเท่านั้น ที่จะตอบโจทย์การลงทุนที่คุ้มค่า และจะเพิ่มประสิทธิภาพการทำงานขององค์กรในโลกเทคโนโลยียุคปัจจุบันได้อย่างแท้จริง",
  storyP2En: "With the vision that only good and highly stable office tools and equipment will provide a worthwhile investment and truly increase organizational efficiency in today's technological world.",
  storyP3Th: "ผลิตภัณฑ์คุณภาพต่ำที่ดูเหมือนจะประหยัดในตอนต้น แต่กลับสร้างปัญหาในการใช้งานและบั่นทอนประสิทธิภาพในการทำงาน จากประสบการณ์อันยาวนานมากกว่า 20 ปี ของทีมงานเมทริกซ์ฯ ผลิตภัณฑ์ที่เราคัดสรรมาบริการท่าน ล้วนเป็นผลิตภัณฑ์ที่มีคุณภาพสูง เป็นที่เชื่อถือระดับแนวหน้าของโลกทั้งสิ้น",
  storyP3En: "Low-quality products that seem economical initially often create operational problems and undermine work efficiency. With over 20 years of experience, Matrix’s team ensures that the products we select for you are of high quality and recognized as world-leaders.",
  missionTh: "ส่งมอบโซลูชั่นภาพและเสียงที่ตอบโจทย์การใช้งานจริงและคุ้มค่าระยะยาวให้กับทุกองค์กร",
  missionEn: "Deliver practical and cost-effective long-term audiovisual solutions for all organizations.",
  visionTh: "เป็นพาร์ทเนอร์อันดับหนึ่งด้านระบบภาพของไทย ที่องค์กรชั้นนำไว้วางใจเลือกใช้",
  visionEn: "To be Thailand's number one visual systems partner, trusted by leading organizations.",
  valuesTh: "ความซื่อสัตย์ ความเชี่ยวชาญ และการดูแลลูกค้าตลอดอายุการใช้งานของผลิตภัณฑ์",
  valuesEn: "Integrity, expertise, and customer care throughout the product lifecycle.",
  addressTh: "111/51 หมู่ที่ 8 ตำบลบางกร่าง อ.เมือง จ.นนทบุรี 11000 ประเทศไทย",
  addressEn: "111/51 Moo 8, Bang Krang, Mueang, Nonthaburi 11000, Thailand",
  phone: "02-129-6193 / 094-888-7041",
  email: "info@matrixintertrade.co.th",
  website: "www.matrixintertrade.com",
  facebook: "facebook.com/MatrixIntertrade",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.5!2d100.45374869999999!3d13.843674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b41eaa4a621%3A0xdc28c2b815205d5b!2sMatrix%20Intertrade%20Co.%2CLtd.!5e0!3m2!1sth!2sth!4v1780061893336!5m2!1sth!2sth",
  statsPayload: [
    { v: "20+", l: "Years Experience" },
    { v: "500+", l: "Projects Delivered" },
    { v: "10+", l: "Global Brands" },
    { v: "100%", l: "Support" }
  ]
};

const CONTACT_MAP_EMBED_URL =
  "https://www.google.com/maps?q=13.843674%2C100.4537487&z=17&output=embed";

export const fallbackContactPage: SiteContactPage = {
  heroTitleTh: "ติดต่อทีมผู้เชี่ยวชาญของเรา",
  heroTitleEn: "Contact Our Experts",
  heroDescriptionTh:
    "ขอใบเสนอราคา หรือนัดหมาย Site Survey ฟรี ทีมงานพร้อมตอบกลับภายใน 1 วันทำการ",
  heroDescriptionEn:
    "Request a quote or schedule a free site survey. We reply within 1 business day.",
  metaTitleTh: "ติดต่อเรา — Matrix Intertrade",
  metaTitleEn: "Contact Us — Matrix Intertrade",
  metaDescriptionTh: "ขอใบเสนอราคา หรือปรึกษาผู้เชี่ยวชาญด้าน AV Solutions ฟรี",
  metaDescriptionEn: "Request a quote or consult our AV Solutions experts.",
  sectionTitleTh: "ติดต่อเรา พร้อมให้บริการ",
  sectionTitleEn: "We're Here to Help",
  sectionDescriptionTh: "ช่องทางการติดต่อ Matrix Intertrade",
  sectionDescriptionEn: "Contact Channels",
  addressTh:
    "บจก.แมทริกซ์ อินเตอร์เทรด 111/51 หมู่ที่ 8 ต.บางกร่าง อ.เมือง จ.นนทบุรี 11000",
  addressEn: "Matrix Intertrade 111/51 Moo 8, Bang Krang, Mueang, Nonthaburi 11000",
  phone: "02-129-6193 / 094-888-7041",
  email: "info@matrixintertrade.co.th",
  line: "@MatrixIntertrade",
  mapTitleTh: "แผนที่บริษัท & เส้นทางเดินทาง",
  mapTitleEn: "Office Map & Directions",
  mapDescriptionTh:
    "นัดหมายเข้าชม Showroom และคลังสินค้าของเราที่นนทบุรี ทีมงานพร้อมต้อนรับและสาธิตสินค้าจริง",
  mapDescriptionEn:
    "Schedule a visit to our Showroom and Warehouse in Nonthaburi. Our team is ready to welcome you and provide live demonstrations.",
  mapEmbedUrl: CONTACT_MAP_EMBED_URL,
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=13.843674,100.4537487",
  phoneHref: "tel:021296193",
  businessHoursTh: "เวลาทำการ จันทร์-ศุกร์ 08:30-17:30 น.",
  businessHoursEn: "Business hours Monday-Friday 08:30-17:30",
  parkingTh: "มีที่จอดรถภายในบริษัท",
  parkingEn: "Parking available on-site",
};

export const fallbackFooterSettings: SiteFooterSettings = {
  ctaTitleTh: "พร้อมเริ่มโปรเจ็คของคุณแล้วหรือยัง?",
  ctaTitleEn: "Ready to start your project?",
  ctaDescriptionTh: "ขอใบเสนอราคา หรือนัด Site Survey ฟรีจากทีมผู้เชี่ยวชาญ",
  ctaDescriptionEn: "Request a quote or schedule a free site survey with our experts",
  companyDescriptionTh:
    "บจก.แมทริกซ์ อินเตอร์เทรด — ผู้เชี่ยวชาญด้าน AV Solutions, LED Display, Interactive Display, Projector, Wireless Presentation และ Smart Classroom สำหรับองค์กรในประเทศไทย",
  companyDescriptionEn:
    "Matrix Intertrade Co., Ltd. — Experts in AV Solutions, LED Display, Interactive Display, Projector, Wireless Presentation, and Smart Classroom for enterprises in Thailand.",
  addressTh: "111/51 หมู่ที่ 8 ต.บางกร่าง อ.เมือง จ.นนทบุรี 11000",
  addressEn: "111/51 Moo 8, Bang Krang, Mueang, Nonthaburi 11000",
  phone: "02-129-6193 / 094-888-7041",
  email: "info@matrixintertrade.co.th",
  line: "@MatrixIntertrade",
  facebookUrl: "https://www.facebook.com/MatrixIntertrade",
  youtubeUrl: "https://www.youtube.com/@matrixintertrade",
  tiktokUrl: "https://www.tiktok.com/@matrixintertrade",
  newsletterDescriptionTh: "รับบทความและคู่มือเลือก AV ใหม่ก่อนใคร",
  newsletterDescriptionEn: "Get the latest AV articles and guides before anyone else",
  newsletterPlaceholderTh: "อีเมลของคุณ",
  newsletterPlaceholderEn: "Your email",
};

const fallbackIndustryShowcase: SiteShowcaseSection = {
  eyebrowTh: "กลุ่มลูกค้าและการใช้งาน",
  eyebrowEn: "Industry Use Cases",
  titlePrefixTh: "ออกแบบ",
  titlePrefixEn: "Designed ",
  titleHighlightTh: "เพื่อทุกประเภทองค์กร",
  titleHighlightEn: "for every kind of organization",
  descriptionPrefixTh: "ประสบการณ์จริงจากการติดตั้งกว่า ",
  descriptionPrefixEn: "Real-world experience from over ",
  descriptionHighlightTh: "500+ โปรเจ็ค",
  descriptionHighlightEn: "500+ projects",
  descriptionSuffixTh: " ครอบคลุมทุกอุตสาหกรรม",
  descriptionSuffixEn: " across every industry",
  isEnabled: true,
};

const industryCardFallbacks: Record<
  string,
  {
    sortOrder: number;
    cardTagTh: string;
    cardTagEn: string;
    metricValue: string;
    metricLabelTh: string;
    metricLabelEn: string;
  }
> = {
  education: {
    sortOrder: 10,
    cardTagTh: "Smart Classroom",
    cardTagEn: "Smart Classroom",
    metricValue: "120+",
    metricLabelTh: "ห้องเรียน",
    metricLabelEn: "Classrooms",
  },
  hotel: {
    sortOrder: 20,
    cardTagTh: "Ballroom & MICE",
    cardTagEn: "Ballroom & MICE",
    metricValue: "60+",
    metricLabelTh: "โรงแรม",
    metricLabelEn: "Hotels",
  },
  corporate: {
    sortOrder: 30,
    cardTagTh: "Hybrid Meeting",
    cardTagEn: "Hybrid Meeting",
    metricValue: "200+",
    metricLabelTh: "องค์กร",
    metricLabelEn: "Enterprises",
  },
  government: {
    sortOrder: 40,
    cardTagTh: "Public Sector",
    cardTagEn: "Public Sector",
    metricValue: "40+",
    metricLabelTh: "หน่วยงาน",
    metricLabelEn: "Agencies",
  },
  hospital: {
    sortOrder: 50,
    cardTagTh: "Healthcare",
    cardTagEn: "Healthcare",
    metricValue: "25+",
    metricLabelTh: "โรงพยาบาล",
    metricLabelEn: "Hospitals",
  },
  "video-conference": {
    sortOrder: 60,
    cardTagTh: "Video Conference",
    cardTagEn: "Video Conference",
    metricValue: "300+",
    metricLabelTh: "ห้องประชุม",
    metricLabelEn: "Meeting Rooms",
  },
};

function withIndustryCardFallbacks(
  industry: (typeof fallbackIndustries)[number] & { imageUrl?: string | null },
  row?: IndustryRow,
  index: number = 0,
): SiteIndustry {
  const fallback = industryCardFallbacks[industry.slug];
  return {
    ...industry,
    showOnBrands: row?.show_on_brands ?? true,
    sortOrder: row?.sort_order ?? fallback?.sortOrder ?? (index + 1) * 10,
    cardTagTh: row?.card_tag_th ?? fallback?.cardTagTh ?? "Solution",
    cardTagEn: row?.card_tag_en ?? fallback?.cardTagEn ?? "Solution",
    metricValue: row?.metric_value ?? fallback?.metricValue ?? "-",
    metricLabelTh: row?.metric_label_th ?? fallback?.metricLabelTh ?? "",
    metricLabelEn: row?.metric_label_en ?? fallback?.metricLabelEn ?? "",
    showcaseImageUrl: imageUrlOrUndefined(row?.showcase_image_url) ?? null,
    linkUrl: row?.link_url?.trim() || null,
    payload: asRecord(row?.payload),
    seoTitle: row?.seo_title ?? null,
    seoDescription: row?.seo_description ?? null,
    seoKeywords: row?.seo_keywords ?? null,
    ogTitle: row?.og_title ?? null,
    ogDescription: row?.og_description ?? null,
    ogImageUrl: row?.og_image_url ?? null,
    seoCanonicalUrl: row?.seo_canonical_url ?? null,
    seoNoIndex: row?.seo_no_index ?? null,
  };
}

export const fallbackSiteContent: SiteContent = {
  nav: fallbackNav,
  brands: fallbackBrands,
  solutions: fallbackSolutions,
  industries: fallbackIndustries.map((industry, index) =>
    withIndustryCardFallbacks(industry, undefined, index),
  ),
  industryShowcase: fallbackIndustryShowcase,
  articleCategories: fallbackArticleCategories,
  brandIntrosByCategoryId: fallbackBrandIntrosByCategoryId,
  aboutUs: fallbackAboutUs,
  companyProfile: fallbackCompanyProfile,
  contactPage: fallbackContactPage,
  footerSettings: fallbackFooterSettings,
  source: "files",
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function mergeStringPayload<T extends Record<string, string>>(fallback: T, payload: unknown): T {
  const source = asRecord(payload);
  if (!source) return fallback;
  const next = { ...fallback };
  (Object.keys(fallback) as Array<keyof T>).forEach((key) => {
    const value = source[key as string];
    if (typeof value === "string" && value.trim()) {
      next[key] = value.trim() as T[keyof T];
    }
  });
  return next;
}

function mapContactPage(rows: SiteSectionRow[] | null | undefined): SiteContactPage {
  const row = rows?.find((item) => item.section_key === "contact_page");
  return mergeStringPayload(fallbackContactPage, row?.payload);
}

function mapFooterSettings(rows: SiteSectionRow[] | null | undefined): SiteFooterSettings {
  const row = rows?.find((item) => item.section_key === "footer_settings");
  return mergeStringPayload(fallbackFooterSettings, row?.payload);
}

function mapCompanyProfile(rows: SiteSectionRow[] | null | undefined): SiteCompanyProfile {
  const row = rows?.find((item) => item.section_key === "company_profile");
  return parseCompanyProfile(row?.payload);
}

function asSolutionSeoSections(value: unknown): SolutionDetailSeoSection[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const sections = value
    .map((item) => {
      const section = asRecord(item);
      if (!section) return null;
      const heading = typeof section.heading === "string" ? section.heading.trim() : "";
      const body = typeof section.body === "string" ? section.body.trim() : "";
      if (!heading || !body) return null;

      const headingEn = typeof section.headingEn === "string" ? section.headingEn.trim() : undefined;
      const bodyEn = typeof section.bodyEn === "string" ? section.bodyEn.trim() : undefined;

      return { heading, headingEn, body, bodyEn };
    })
    .filter((item): item is SolutionDetailSeoSection => item !== null);

  return sections.length ? sections : undefined;
}

function asSolutionFaqs(value: unknown): SolutionDetailFaq[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const faqs = value
    .map((item) => {
      const faq = asRecord(item);
      if (!faq) return null;
      const question = typeof faq.question === "string" ? faq.question.trim() : "";
      const answer = typeof faq.answer === "string" ? faq.answer.trim() : "";
      if (!question || !answer) return null;

      const questionEn = typeof faq.questionEn === "string" ? faq.questionEn.trim() : undefined;
      const answerEn = typeof faq.answerEn === "string" ? faq.answerEn.trim() : undefined;

      return { question, questionEn, answer, answerEn };
    })
    .filter((item): item is SolutionDetailFaq => item !== null);

  return faqs.length ? faqs : undefined;
}

function asSolutionRelatedLinks(value: unknown): SolutionDetailRelatedLink[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const links = value
    .map((item) => {
      const link = asRecord(item);
      if (!link) return null;
      const label = typeof link.label === "string" ? link.label.trim() : "";
      const href = typeof link.href === "string" ? link.href.trim() : "";
      if (!label || !href) return null;

      const labelEn = typeof link.labelEn === "string" ? link.labelEn.trim() : undefined;
      const description = typeof link.description === "string" ? link.description.trim() : undefined;
      const descriptionEn =
        typeof link.descriptionEn === "string" ? link.descriptionEn.trim() : undefined;

      return { label, labelEn, href, description, descriptionEn };
    })
    .filter((item): item is SolutionDetailRelatedLink => item !== null);

  return links.length ? links : undefined;
}

function normalizeSolutionDetailContent(
  payload: unknown,
  fallback: SolutionDetailContent,
): SolutionDetailContent {
  const record = asRecord(payload);
  if (!record) return fallback;

  return {
    ...fallback,
    intro:
      typeof record.intro === "string" && record.intro.trim() ? record.intro.trim() : fallback.intro,
    introEn:
      typeof record.introEn === "string" && record.introEn.trim()
        ? record.introEn.trim()
        : fallback.introEn,
    bullets: asStringArray(record.bullets).length ? asStringArray(record.bullets) : fallback.bullets,
    bulletsEn:
      asStringArray(record.bulletsEn).length ? asStringArray(record.bulletsEn) : fallback.bulletsEn,
    applications: asStringArray(record.applications).length
      ? asStringArray(record.applications)
      : fallback.applications,
    applicationsEn:
      asStringArray(record.applicationsEn).length
        ? asStringArray(record.applicationsEn)
        : fallback.applicationsEn,
    seoSections: asSolutionSeoSections(record.seoSections) ?? fallback.seoSections,
    relatedLinks: asSolutionRelatedLinks(record.relatedLinks) ?? fallback.relatedLinks,
    faqs: asSolutionFaqs(record.faqs) ?? fallback.faqs,
  };
}

function asProductCategories(value: unknown): BrandIntro["productCategories"] {
  if (!value || typeof value !== "object" || !("productCategories" in value)) return undefined;
  const productCategories = (value as { productCategories?: unknown }).productCategories;
  if (!Array.isArray(productCategories)) return undefined;

  return productCategories
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const maybe = item as { name?: unknown; desc?: unknown };
      if (typeof maybe.name !== "string" || typeof maybe.desc !== "string") return null;
      return { name: maybe.name, desc: maybe.desc };
    })
    .filter((item): item is { name: string; desc: string } => item !== null);
}

function orderBySort<T extends { sort_order?: number | null; slug?: string; id?: string }>(
  rows: T[],
) {
  return [...rows].sort((a, b) => {
    const left = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const right = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (left !== right) return left - right;
    return String(a.slug ?? a.id ?? "").localeCompare(String(b.slug ?? b.id ?? ""));
  });
}

function normalizeNavHref(href: string): string {
  const [path, suffix = ""] = href.split(/([?#].*)/, 2);
  const legacyCategoryMatch = path.match(/^\/category\/([^/]+)$/);
  if (!legacyCategoryMatch) return href;

  const slug = CATEGORY_SLUGS[legacyCategoryMatch[1]];
  return slug ? `/category/${slug}${suffix}` : href;
}

function imageUrlOrUndefined(value: string | null | undefined): string | undefined {
  const url = value?.trim();
  if (!url) return undefined;
  if (url.startsWith("@/") || url.startsWith("src/")) return undefined;
  if (/^(https?:\/\/|\/|data:image\/|blob:)/i.test(url)) return url;
  return undefined;
}

function normalizeNavItem<T extends { href: string; submenu?: Array<{ href: string }> }>(
  item: T,
): T {
  return {
    ...item,
    href: normalizeNavHref(item.href),
    submenu: item.submenu?.map((subItem) => ({
      ...subItem,
      href: normalizeNavHref(subItem.href),
    })),
  };
}

function dedupeNavItems(items: NavItem[]): NavItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeNavHref(item.href);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapNav(rows: NavRow[] | null | undefined): NavItem[] {
  if (!rows?.length) return fallbackNav;

  const sorted = orderBySort(rows);
  const childrenByParent = new Map<string, NavRow[]>();
  for (const row of sorted) {
    if (!row.parent_id) continue;
    const bucket = childrenByParent.get(row.parent_id) ?? [];
    bucket.push(row);
    childrenByParent.set(row.parent_id, bucket);
  }

  const topLevel = sorted.filter((row) => !row.parent_id);
  if (topLevel.length === 0) return fallbackNav;

  const dbNav = dedupeNavItems(
    topLevel.map((row) => {
      const submenu = (childrenByParent.get(row.id) ?? []).map((child) => ({
        label: child.label === "Projector" ? "Projection Screen" : child.label,
        href: normalizeNavHref(child.href),
        desc: child.description ?? undefined,
        image: imageUrlOrUndefined(child.image_url),
      }));
      return normalizeNavItem({
        label: row.label,
        href: normalizeNavHref(row.href),
        submenu: submenu.length > 0 && row.href !== "/brands" ? submenu : undefined,
      });
    }),
  );

  const dbByHref = new Map(dbNav.map((item) => [item.href, item]));
  const merged = fallbackNav.map((fallbackItem) => {
    const normalizedFallback = normalizeNavItem(fallbackItem);
    const dbItem = dbByHref.get(normalizedFallback.href);
    if (!dbItem) return fallbackItem;
    return {
      ...normalizedFallback,
      ...dbItem,
      submenu:
        dbItem.submenu && dbItem.submenu.length > 0
          ? mergeSubmenu(normalizedFallback.submenu, dbItem.submenu)
          : normalizedFallback.submenu,
    };
  });

  const fallbackHrefs = new Set(fallbackNav.map((item) => normalizeNavHref(item.href)));
  return dedupeNavItems([...merged, ...dbNav.filter((item) => !fallbackHrefs.has(item.href))]);
}

function mergeSubmenu(fallbackItems: NavItem["submenu"], dbItems: NonNullable<NavItem["submenu"]>) {
  const normalizedDbItems = dbItems.map(normalizeNavItem);
  const dbByHref = new Map(normalizedDbItems.map((item) => [item.href, item]));
  const merged = (fallbackItems ?? []).map((fallbackItem) => ({
    ...fallbackItem,
    href: normalizeNavHref(fallbackItem.href),
    ...((dbByHref.get(normalizeNavHref(fallbackItem.href)) as any) || {}),
    image: (dbByHref.get(normalizeNavHref(fallbackItem.href)) as any)?.image || fallbackItem.image,
    desc: (dbByHref.get(normalizeNavHref(fallbackItem.href)) as any)?.desc || fallbackItem.desc,
  }));
  const fallbackHrefs = new Set((fallbackItems ?? []).map((item) => normalizeNavHref(item.href)));
  return [...merged, ...normalizedDbItems.filter((item) => !fallbackHrefs.has(item.href))];
}

function mapBrands(rows: BrandRow[] | null | undefined): SiteBrand[] {
  if (!rows?.length) return fallbackBrands;
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const mapped = fallbackBrands.map((fallback) => {
    const row = rowsBySlug.get(fallback.slug);
    if (!row) return fallback;
    return {
      slug: row.slug,
      name: row.name || fallback.name,
      category: row.category || fallback.category,
      desc: row.description || fallback.desc,
      descEn: (fallback as LocalizedFallback).descEn,
      color: row.color || fallback.color,
      imageUrl: imageUrlOrUndefined(row.image_url),
      logoUrl: imageUrlOrUndefined(row.logo_url),
      accent: row.accent,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      ogTitle: row.og_title,
      ogDescription: row.og_description,
      ogImageUrl: row.og_image_url,
      seoCanonicalUrl: row.seo_canonical_url,
      seoNoIndex: row.seo_no_index,
      updatedAt: row.updated_at,
    };
  });

  const fallbackSlugs = new Set(fallbackBrands.map((brand) => brand.slug));
  const additions = rows
    .filter((row) => !fallbackSlugs.has(row.slug))
    .map((row) => {
      const fallback = fallbackBrands.find((brand) => brand.slug === row.slug);
      return {
        slug: row.slug,
        name: row.name,
        category: row.category ?? fallback?.category ?? "",
        desc: row.description ?? fallback?.desc ?? "",
        descEn: (fallback as LocalizedFallback | undefined)?.descEn,
        color: row.color ?? fallback?.color ?? "from-blue-500 to-cyan-500",
        imageUrl: imageUrlOrUndefined(row.image_url),
        logoUrl: imageUrlOrUndefined(row.logo_url),
        accent: row.accent,
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        ogTitle: row.og_title,
        ogDescription: row.og_description,
        ogImageUrl: row.og_image_url,
        seoCanonicalUrl: row.seo_canonical_url,
        seoNoIndex: row.seo_no_index,
        updatedAt: row.updated_at,
      };
    });
  return [...mapped, ...additions];
}

function mapSolutions(rows: SolutionRow[] | null | undefined): SiteSolution[] {
  if (!rows?.length) return fallbackSolutions;
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const mapped = fallbackSolutions.map((fallback) => {
    const row = rowsBySlug.get(fallback.slug);
    if (!row) return fallback;
    return {
      slug: row.slug,
      title: row.title || fallback.title,
      titleEn: (fallback as LocalizedFallback).titleEn,
      icon: row.icon || fallback.icon,
      desc: row.description || fallback.desc,
      descEn: (fallback as LocalizedFallback).descEn,
      imageUrl: imageUrlOrUndefined(row.image_url),
      payload: asRecord(row.payload),
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      ogTitle: row.og_title,
      ogDescription: row.og_description,
      ogImageUrl: row.og_image_url,
      seoCanonicalUrl: row.seo_canonical_url,
      seoNoIndex: row.seo_no_index,
      updatedAt: row.updated_at,
    };
  });

  const fallbackSlugs = new Set(fallbackSolutions.map((solution) => solution.slug));
  const additions = rows
    .filter((row) => !fallbackSlugs.has(row.slug))
    .map((row) => {
      const fallback = fallbackSolutions.find((solution) => solution.slug === row.slug);
      return {
        slug: row.slug,
        title: row.title,
        titleEn: (fallback as LocalizedFallback | undefined)?.titleEn,
        icon: row.icon ?? fallback?.icon ?? "Monitor",
        desc: row.description ?? fallback?.desc ?? "",
        descEn: (fallback as LocalizedFallback | undefined)?.descEn,
        imageUrl: imageUrlOrUndefined(row.image_url),
        payload: asRecord(row.payload),
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        ogTitle: row.og_title,
        ogDescription: row.og_description,
        ogImageUrl: row.og_image_url,
        seoCanonicalUrl: row.seo_canonical_url,
        seoNoIndex: row.seo_no_index,
        updatedAt: row.updated_at,
      };
    });
  return [...mapped, ...additions];
}

function mapIndustries(rows: IndustryRow[] | null | undefined): SiteIndustry[] {
  if (!rows?.length) {
    return fallbackIndustries.map((industry, index) =>
      withIndustryCardFallbacks(industry, undefined, index),
    );
  }
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const mapped = fallbackIndustries.map((fallback, index) => {
    const row = rowsBySlug.get(fallback.slug);
    if (!row) return withIndustryCardFallbacks(fallback, undefined, index);
    return withIndustryCardFallbacks(
      {
        slug: row.slug,
        title: row.title || fallback.title,
        titleEn: (fallback as LocalizedFallback).titleEn,
        icon: row.icon || fallback.icon,
        desc: row.description || fallback.desc,
        descEn: (fallback as LocalizedFallback).descEn,
        imageUrl: imageUrlOrUndefined(row.image_url),
        showcaseImageUrl: imageUrlOrUndefined(row.showcase_image_url),
      },
      row,
      index,
    );
  });

  const fallbackSlugs = new Set(fallbackIndustries.map((industry) => industry.slug));
  const additions = rows
    .filter((row) => !fallbackSlugs.has(row.slug))
    .map((row, index) => {
      const fallback = fallbackIndustries.find((industry) => industry.slug === row.slug);
      return withIndustryCardFallbacks(
        {
          slug: row.slug,
          title: row.title,
          titleEn: (fallback as LocalizedFallback | undefined)?.titleEn,
          icon: row.icon ?? fallback?.icon ?? "Building2",
          desc: row.description ?? fallback?.desc ?? "",
          descEn: (fallback as LocalizedFallback | undefined)?.descEn,
          imageUrl: imageUrlOrUndefined(row.image_url),
          showcaseImageUrl: imageUrlOrUndefined(row.showcase_image_url),
        },
        row,
        fallbackIndustries.length + index,
      );
    });
  return [...mapped, ...additions];
}

function mapIndustryShowcase(rows: SiteSectionRow[] | null | undefined): SiteShowcaseSection {
  const row = rows?.find((item) => item.section_key === "industries_showcase");
  if (!row) return fallbackIndustryShowcase;

  return {
    eyebrowTh: row.eyebrow_th || fallbackIndustryShowcase.eyebrowTh,
    eyebrowEn: row.eyebrow_en || fallbackIndustryShowcase.eyebrowEn,
    titlePrefixTh: row.title_prefix_th || fallbackIndustryShowcase.titlePrefixTh,
    titlePrefixEn: row.title_prefix_en || fallbackIndustryShowcase.titlePrefixEn,
    titleHighlightTh: row.title_highlight_th || fallbackIndustryShowcase.titleHighlightTh,
    titleHighlightEn: row.title_highlight_en || fallbackIndustryShowcase.titleHighlightEn,
    descriptionPrefixTh:
      row.description_prefix_th || fallbackIndustryShowcase.descriptionPrefixTh,
    descriptionPrefixEn:
      row.description_prefix_en || fallbackIndustryShowcase.descriptionPrefixEn,
    descriptionHighlightTh:
      row.description_highlight_th || fallbackIndustryShowcase.descriptionHighlightTh,
    descriptionHighlightEn:
      row.description_highlight_en || fallbackIndustryShowcase.descriptionHighlightEn,
    descriptionSuffixTh:
      row.description_suffix_th || fallbackIndustryShowcase.descriptionSuffixTh,
    descriptionSuffixEn:
      row.description_suffix_en || fallbackIndustryShowcase.descriptionSuffixEn,
    isEnabled: row.is_enabled ?? fallbackIndustryShowcase.isEnabled,
  };
}

function mapArticleCategories(
  rows: ArticleCategoryRow[] | null | undefined,
): SiteArticleCategory[] {
  if (!rows?.length) return fallbackArticleCategories;
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const mapped = fallbackArticleCategories.map((fallback) => {
    const row = rowsBySlug.get(fallback.slug);
    return {
      slug: fallback.slug,
      label: row?.label || fallback.label,
      labelEn: (fallback as LocalizedFallback).labelEn,
      imageUrl: imageUrlOrUndefined(row?.image_url),
    };
  });
  const fallbackSlugs = new Set(fallbackArticleCategories.map((category) => category.slug));
  return [
    ...mapped,
    ...rows
      .filter((row) => !fallbackSlugs.has(row.slug))
      .map((row) => ({
        slug: row.slug,
        label: row.label,
        labelEn: row.label,
        imageUrl: imageUrlOrUndefined(row.image_url),
      })),
  ];
}

function mapBrandIntros(
  rows: BrandIntroRow[] | null | undefined,
  brands: SiteBrand[],
): Record<string, SiteBrandIntro> {
  if (!rows?.length) return fallbackBrandIntrosByCategoryId;

  const dbIntros = Object.fromEntries(
    rows.map((row) => {
      const fallback = fallbackBrandIntrosByCategoryId[row.category_id];
      const brand = brands.find((item) => item.slug === row.brand_slug);
      const payload =
        row.payload && typeof row.payload === "object"
          ? (row.payload as Record<string, unknown>)
          : null;

      return [
        row.category_id,
        {
          brandSlug: row.brand_slug,
          tagline: row.tagline ?? fallback?.tagline ?? "",
          description: row.description ?? fallback?.description ?? "",
          highlights: asStringArray(row.highlights).length
            ? asStringArray(row.highlights)
            : (fallback?.highlights ?? []),
          bestFor: asStringArray(row.best_for).length
            ? asStringArray(row.best_for)
            : (fallback?.bestFor ?? []),
          origin: row.origin ?? fallback?.origin,
          productCategories: asProductCategories(payload) ?? fallback?.productCategories,
          imageUrl: brand?.imageUrl,
          logoUrl: brand?.logoUrl,
          payload,
        },
      ];
    }),
  );

  return {
    ...fallbackBrandIntrosByCategoryId,
    ...dbIntros,
  };
}

async function loadIndustryRows() {
  const result = await contentClient
    .from("content_industries")
    .select(
      "slug,title,icon,description,image_url,showcase_image_url,show_on_brands,sort_order,card_tag_th,card_tag_en,metric_value,metric_label_th,metric_label_en,link_url,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index",
    )
    .order("sort_order", { ascending: true });

  if (!result.error) return result;

  const fallbackResult = await contentClient
    .from("content_industries")
    .select(
      "slug,title,icon,description,image_url,show_on_brands,sort_order,card_tag_th,card_tag_en,metric_value,metric_label_th,metric_label_en,link_url,payload,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index",
    )
    .order("sort_order", { ascending: true });

  if (!fallbackResult.error) {
    console.warn("[content] Loaded industries without showcase_image_url fallback", result.error);
    return fallbackResult;
  }

  const legacyResult = await contentClient
    .from("content_industries")
    .select("slug,title,icon,description,image_url,payload")
    .order("slug", { ascending: true });

  if (!legacyResult.error) {
    console.warn("[content] Loaded industries with legacy schema fallback", result.error);
    return legacyResult;
  }

  return result;
}

async function loadSiteSectionRows() {
  const result = await contentClient
    .from("content_site_sections")
    .select(
      "section_key,eyebrow_th,eyebrow_en,title_prefix_th,title_prefix_en,title_highlight_th,title_highlight_en,description_prefix_th,description_prefix_en,description_highlight_th,description_highlight_en,description_suffix_th,description_suffix_en,is_enabled,payload",
    )
    .order("section_key", { ascending: true });

  if (!result.error) return result;

  console.warn("[content] Loaded site sections from file fallback", result.error);
  return { data: null, error: null };
}

export async function loadSiteContent(): Promise<SiteContent> {
  try {
    const [
      navResult,
      brandsResult,
      solutionsResult,
      industriesResult,
      siteSectionsResult,
      articleCategoriesResult,
      brandIntrosResult,
      aboutUsResult,
    ] = await Promise.all([
      contentClient
        .from("content_nav_items")
        .select("id,parent_id,depth,sort_order,label,href,description,image_url")
        .order("sort_order", { ascending: true }),
      contentClient
        .from("content_brands")
        .select("slug,name,category,description,color,image_url,logo_url,accent,seo_title,seo_description,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at")
        .order("slug", { ascending: true }),
      contentClient
        .from("content_solutions")
        .select("slug,title,icon,description,image_url,payload,seo_title,seo_description,og_title,og_description,og_image_url,seo_canonical_url,seo_no_index,updated_at")
        .order("slug", { ascending: true }),
      loadIndustryRows(),
      loadSiteSectionRows(),
      contentClient
        .from("content_article_categories")
        .select("slug,label,image_url")
        .order("slug", { ascending: true }),
      contentClient
        .from("content_brand_category_intros")
        .select("category_id,brand_slug,tagline,description,highlights,best_for,origin,payload")
        .order("category_id", { ascending: true }),
      contentClient
        .from("content_about_us")
        .select("*")
        .eq("id", "about_us")
        .single(),
    ]);

    const firstError =
      navResult.error ??
      brandsResult.error ??
      solutionsResult.error ??
      industriesResult.error ??
      siteSectionsResult.error ??
      articleCategoriesResult.error ??
      brandIntrosResult.error ??
      (aboutUsResult.error && !["PGRST116", "42P01", "42P07"].includes(aboutUsResult.error.code) ? aboutUsResult.error : null);
    if (firstError) throw firstError;

    const brands = mapBrands(brandsResult.data as BrandRow[] | null);
    return {
      nav: mapNav(navResult.data as NavRow[] | null),
      brands,
      solutions: mapSolutions(solutionsResult.data as SolutionRow[] | null),
      industries: mapIndustries(industriesResult.data as IndustryRow[] | null),
      industryShowcase: mapIndustryShowcase(siteSectionsResult.data as SiteSectionRow[] | null),
      articleCategories: mapArticleCategories(
        articleCategoriesResult.data as ArticleCategoryRow[] | null,
      ),
      brandIntrosByCategoryId: mapBrandIntros(
        brandIntrosResult.data as BrandIntroRow[] | null,
        brands,
      ),
      aboutUs: aboutUsResult.data ? mapAboutUs(aboutUsResult.data as AboutUsRow) : fallbackAboutUs,
      companyProfile: mapCompanyProfile(siteSectionsResult.data as SiteSectionRow[] | null),
      contactPage: mapContactPage(siteSectionsResult.data as SiteSectionRow[] | null),
      footerSettings: mapFooterSettings(siteSectionsResult.data as SiteSectionRow[] | null),
      source: "supabase",
    };
  } catch (error) {
    console.warn("[content] Falling back to file-based site content", error);
    return fallbackSiteContent;
  }
}

export async function loadBrandDetailContent(slug: string): Promise<SiteBrand | undefined> {
  const content = await loadSiteContent();
  return content.brands.find((brand) => brand.slug === slug);
}

export async function loadIndustryDetailContent(slug: string): Promise<SiteIndustry | undefined> {
  const content = await loadSiteContent();
  return content.industries.find((industry) => industry.slug === slug);
}

export async function loadBrandIntroContent(
  categoryId: string,
): Promise<SiteBrandIntro | undefined> {
  const content = await loadSiteContent();
  return content.brandIntrosByCategoryId[categoryId];
}

export async function loadSolutionDetailContent(
  slug: string,
  fallback: SolutionDetailContent,
): Promise<SolutionDetailContent> {
  const content = await loadSiteContent();
  const solution = content.solutions.find((item) => item.slug === slug);

  return normalizeSolutionDetailContent(solution?.payload, {
    ...fallback,
    slug,
    title: solution?.title || fallback.title,
    iconName: solution?.icon || fallback.iconName,
    imageUrl: solution?.imageUrl,
    seoTitle: solution?.seoTitle,
    seoDescription: solution?.seoDescription,
    ogTitle: solution?.ogTitle,
    ogDescription: solution?.ogDescription,
    ogImageUrl: solution?.ogImageUrl,
    seoCanonicalUrl: solution?.seoCanonicalUrl,
    seoNoIndex: solution?.seoNoIndex,
    updatedAt: solution?.updatedAt,
  });
}

export async function loadCompanyProfile(): Promise<SiteCompanyProfile> {
  try {
    const result = await loadSiteSectionRows();
    return mapCompanyProfile(result.data as SiteSectionRow[] | null);
  } catch (error) {
    console.warn("[content] Falling back to file-based company profile", error);
    return fallbackCompanyProfile;
  }
}

function mapAboutUs(row: AboutUsRow): SiteAboutUs {
  return {
    introTitleTh: row.intro_title_th ?? "",
    introTitleEn: row.intro_title_en ?? "",
    introDescTh: row.intro_desc_th ?? "",
    introDescEn: row.intro_desc_en ?? "",
    storyP1Th: row.story_p1_th ?? "",
    storyP1En: row.story_p1_en ?? "",
    storyP2Th: row.story_p2_th ?? "",
    storyP2En: row.story_p2_en ?? "",
    storyP3Th: row.story_p3_th ?? "",
    storyP3En: row.story_p3_en ?? "",
    missionTh: row.mission_th ?? "",
    missionEn: row.mission_en ?? "",
    visionTh: row.vision_th ?? "",
    visionEn: row.vision_en ?? "",
    valuesTh: row.values_th ?? "",
    valuesEn: row.values_en ?? "",
    addressTh: row.address_th ?? "",
    addressEn: row.address_en ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    facebook: row.facebook ?? "",
    mapUrl: row.map_url ?? "",
    statsPayload: row.stats_payload,
  };
}
