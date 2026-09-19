import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { CTASection } from "@/components/site/CTASection";
import heroAbout from "@/assets/hero-aboutus.jpg";
import ledLineup2026 from "@/assets/about/led-lineup-2026.jpg";
import premiumSolutions2026 from "@/assets/about/premium-solutions-2026.jpg";
import partnerKramer from "@/assets/about/partner-1.png";
import partnerGrandview from "@/assets/about/partner-2.png";
import partner3 from "@/assets/about/partner-3.png";
import partner4 from "@/assets/about/partner-4.png";
import partner5 from "@/assets/about/partner-5.png";
import partner6 from "@/assets/about/partner-6.png";
import partner7 from "@/assets/about/partner-7.png";
import partner8 from "@/assets/about/partner-8.png";
import industryEducation from "@/assets/about/industries/education.jpg";
import industryHotel from "@/assets/about/industries/hotel-events.jpg";
import industryOffice from "@/assets/about/industries/office-business.jpg";
import industryVC from "@/assets/about/industries/video-conference.jpg";
import imgEducation from "@/assets/article-smart-classroom.jpg";
import imgHotel from "@/assets/hero-av.jpg";
import imgCorporate from "@/assets/article-meeting-room.jpg";
import imgGovernment from "@/assets/hero-led.jpg";
import imgHospital from "@/assets/hero-interactive.jpg";
import imgVideo from "@/assets/hero-wireless.jpg";
import { Button } from "@/components/ui/button";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/lib/content/use-site-content";
import { resolveIcon } from "@/lib/icon-map";
import { buildSeoHead } from "@/lib/seo";
import {
  companyAddress,
  companyMapEmbedUrl,
  companyPhoneDisplay,
} from "@/lib/company-profile";

const industryImages: Record<string, string> = {
  education: imgEducation,
  hotel: imgHotel,
  corporate: imgCorporate,
  government: imgGovernment,
  hospital: imgHospital,
  "video-conference": imgVideo,
};
import {
  Target,
  Eye,
  Heart,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  GraduationCap,
  Hotel,
  Building2,
  Video,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/aboutus")({
  head: () =>
    buildSeoHead({
      title: "เกี่ยวกับ Matrix Intertrade | ผู้เชี่ยวชาญระบบภาพและเสียง",
      description: "รู้จัก Matrix Intertrade ผู้เชี่ยวชาญด้าน LED Display และระบบ AV สำหรับองค์กร พร้อมทีมออกแบบ ติดตั้ง และบริการหลังการขายในประเทศไทย",
      path: "/aboutus",
      image: heroAbout,
    }),
  component: AboutPage,
});

const stats = [
  { v: "20+", l: "ปีประสบการณ์", lEn: "Years Experience" },
  { v: "500+", l: "โปรเจ็คที่สำเร็จ", lEn: "Completed Projects" },
  { v: "8+", l: "แบรนด์ระดับโลก", lEn: "Global Brands" },
  { v: "100%", l: "บริการในประเทศ", lEn: "Local Service" },
];

const partners = [
  {
    name: "Kramer",
    img: partnerKramer,
    tag: "อุปกรณ์ระบบ AV ที่ของมันต้องมี",
    tagEn: "Essential AV Equipment",
  },
  {
    name: "Grandview",
    img: partnerGrandview,
    tag: "จอรับภาพ คุณภาพเหนือราคา",
    tagEn: "High-quality Projection Screens",
  },
];

const industries = [
  {
    Icon: GraduationCap,
    title: "โรงเรียน และสถาบันการศึกษา",
    titleEn: "Schools & Educational Institutions",
    subtitle: "Education",
    desc: "ผลิตภัณฑ์สำหรับสถาบันการศึกษา มหาวิทยาลัย วิทยาลัย และโรงเรียนทุกระดับชั้น พร้อมโซลูชั่นห้องเรียนอัจฉริยะ จอภาพคุณภาพสูง Grandview Large-stage / SkyShow Series และอุปกรณ์ Kramer ครบวงจร",
    descEn:
      "Products for educational institutions, universities, colleges, and schools of all levels. Featuring smart classroom solutions, high-quality Grandview Large-stage/SkyShow Series screens, and comprehensive Kramer equipment.",
    img: industryEducation,
    href: "/industry/education",
  },
  {
    Icon: Hotel,
    title: "โรงแรมและห้องประชุมขนาดใหญ่",
    titleEn: "Hotels & Large Venues",
    subtitle: "Hotels, Live Events & Museums",
    desc: '"The show must go on" — สถานบันเทิง โรงละคร โรงแรม งานกิจกรรม Live Event และพิพิธภัณฑ์ เราคัดสรร Top Class Reliable Products ที่พิสูจน์จากการใช้งานหนักในสถานที่ที่ต้องการเสถียรภาพสูงสุดจากทุกมุมโลก',
    descEn:
      '"The show must go on" — Entertainment venues, theaters, hotels, live events, and museums. We select top-class reliable products proven by heavy use in locations demanding maximum stability worldwide.',
    img: industryHotel,
    href: "/industry/hotel",
  },
  {
    Icon: Building2,
    title: "สำนักงานและองค์กรธุรกิจ",
    titleEn: "Offices & Corporate",
    subtitle: "Corporate & Government",
    desc: "สำหรับองค์กรธุรกิจ หน่วยงานราชการ และรัฐวิสาหกิจ — Remarkable Screen จอภาพยุคใหม่แบบทูอินวัน เขียน-ฉายภาพได้บนจอเดียว จับคู่กับโปรเจคเตอร์อินเตอร์แอ๊คทีฟ พร้อมระบบภาพและเสียงที่ออกแบบให้เหมาะกับการใช้งานจริง",
    descEn:
      "For corporate organizations, government agencies, and state enterprises — Remarkable Screens, two-in-one modern displays for writing and projecting, paired with interactive projectors, with AV systems designed around real workflows.",
    img: industryOffice,
    href: "/industry/corporate",
  },
  {
    Icon: Video,
    title: "ระบบวิดีโอคอนเฟอเร้นซ์ เพื่อทุกหน่วยงาน",
    titleEn: "Video Conference Systems",
    subtitle: "Video Conference",
    desc: "ระบบประชุมทางไกลครบวงจร จอแสดงผล กล้อง ไมโครโฟน และระบบควบคุม สำหรับห้องประชุมทุกขนาด ตอบโจทย์การทำงานแบบ Hybrid Workplace ในยุคดิจิตอล",
    descEn:
      "Comprehensive teleconference systems with displays, cameras, microphones, and control equipment for meeting rooms of all sizes, answering the needs of Hybrid Workplaces in the digital era.",
    img: industryVC,
    href: "/industry/video-conference",
  },
];

function AboutPage() {
  const { lang } = useLanguage();
  const { aboutUs, industries: runtimeIndustries, companyProfile } = useSiteContent();

  if (!aboutUs) return null;

  const rawStats = aboutUs.statsPayload;
  const statsList = Array.isArray(rawStats) && rawStats.length > 0 ? rawStats : stats;
  const aboutIndustryItems = runtimeIndustries
    .filter((industry) => industry.showOnBrands !== false)
    .sort(
      (a, b) =>
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
    );

  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title={t(lang, aboutUs.introTitleTh, aboutUs.introTitleEn)}
        desc={aboutUs.introDescTh ? t(lang, aboutUs.introDescTh, aboutUs.introDescEn) : t(
          lang,
          "ผู้นำเข้าและจัดจำหน่ายระบบภาพแบรนด์ชั้นนำของโลก ด้วยประสบการณ์ทีมงานมากกว่า 20 ปี คัดสรรเฉพาะผลิตภัณฑ์คุณภาพสูงที่เชื่อถือได้ระดับแนวหน้าของโลก",
          "Importer and distributor of world-leading AV brands with over 20 years of experience. We select only the highest quality and most reliable products globally.",
        )}
        breadcrumbs={[{ label: t(lang, "เกี่ยวกับเรา", "About Us") }]}
        bgImage={heroAbout}
        variant="light"
      />

      {/* Full-width feature image */}
      <section className="bg-navy">
        <img
          src={premiumSolutions2026}
          alt="We Deliver Premium Solutions For Every Vision — Matrix Intertrade: LED Display, Interactive Display, Wireless Presentation, Projector, AV Solution"
          loading="eager"
          className="h-auto w-full object-contain"
        />
      </section>

      {/* Story */}
      <section className="relative overflow-hidden bg-gradient-subtle py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-45" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.8fr)] lg:items-center">
          <div className="max-w-[72ch]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/10 px-3.5 py-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              Our Story
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              {t(lang, aboutUs.introTitleTh, aboutUs.introTitleEn)}
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/75 md:text-base">
              {aboutUs.storyP1Th && <p>{t(lang, aboutUs.storyP1Th, aboutUs.storyP1En)}</p>}
              {aboutUs.storyP2Th && <p>{t(lang, aboutUs.storyP2Th, aboutUs.storyP2En)}</p>}
              {aboutUs.storyP3Th && <p>{t(lang, aboutUs.storyP3Th, aboutUs.storyP3En)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {statsList.map((s: any) => (
              <div
                key={s.l}
                className="rounded-2xl border border-border/80 bg-white/90 p-5 shadow-card transition-colors hover:border-cyan/45 sm:p-6"
              >
                <div className="text-3xl font-black leading-none text-accent md:text-4xl">
                  {s.v}
                </div>
                <div className="mt-3 text-xs font-semibold leading-relaxed text-foreground/65">
                  {t(lang, s.l, s.lEn)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-white pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                Icon: Target,
                t: "Mission",
                d: t(lang, aboutUs.missionTh, aboutUs.missionEn),
              },
              {
                Icon: Eye,
                t: "Vision",
                d: t(lang, aboutUs.visionTh, aboutUs.visionEn),
              },
              {
                Icon: Heart,
                t: "Values",
                d: t(lang, aboutUs.valuesTh, aboutUs.valuesEn),
              },
            ].map(({ Icon, t: title, d }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 text-left shadow-card transition-colors hover:border-cyan/45 md:p-7"
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-cyan/12 text-accent ring-1 ring-cyan/25">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-primary">{title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve — content from About sub-menu */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-block rounded-full bg-accent/10 text-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest mb-4">
              Industries We Serve
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              {t(lang, "ผลิตภัณฑ์ตามกลุ่มลูกค้าและการใช้งาน", "Products by Client Group & Usage")}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {t(
                lang,
                "เราคัดสรรอุปกรณ์ระบบภาพและเสียงให้เหมาะกับการใช้งานเฉพาะของแต่ละกลุ่มองค์กร พร้อมทีมผู้เชี่ยวชาญดูแลตลอดอายุการใช้งาน",
                "We select AV equipment tailored to the specific needs of each organization type, with a team of experts providing lifetime support.",
              )}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {aboutIndustryItems.map((industry) => {
              const Icon = resolveIcon(industry.icon);
              const title = t(lang, industry.title, industry.titleEn);
              const desc = t(lang, industry.desc, industry.descEn);
              const img = industry.showcaseImageUrl || industry.imageUrl || industryImages[industry.slug];
              const href = industry.linkUrl || `/industry/${industry.slug}`;
              const subtitle =
                lang === "EN"
                  ? industry.cardTagEn || industry.titleEn || industry.slug
                  : industry.cardTagTh || industry.title || industry.slug;
              return (
              <Link
                key={industry.slug}
                to={href}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-card hover:shadow-elev hover:border-accent/40 transition-all"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                  {img ? (
                    <img
                      src={img}
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-hero text-white/30">
                      <Icon className="h-20 w-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-accent shadow">
                    <Icon className="h-3.5 w-3.5" />
                    {subtitle}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-primary group-hover:text-accent transition-colors">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                    {t(lang, "ดูรายละเอียดเพิ่มเติม", "View More Details")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company info */}
      <section className="bg-gradient-subtle py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-[1.2fr_1fr] gap-10">
          <div>
            <div className="inline-block rounded-full bg-accent/10 text-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest mb-4">
              Company Info
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              {t(lang, aboutUs.introTitleTh, aboutUs.introTitleEn)}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                lang,
                "สำนักงานและคลังสินค้าตั้งอยู่ที่นนทบุรี พร้อมทีมงานเทคนิคและฝ่ายขายที่พร้อมให้บริการลูกค้าทั่วประเทศ",
                "Head office and warehouse located in Nonthaburi, with technical and sales teams ready to serve customers nationwide.",
              )}
            </p>
            <div className="mt-8 space-y-4">
              {[
                {
                  Icon: MapPin,
                  t: t(lang, "ที่อยู่", "Address"),
                  d: companyAddress(companyProfile, lang),
                },
                { Icon: Phone, t: t(lang, "โทรศัพท์", "Phone"), d: companyPhoneDisplay(companyProfile) },
                { Icon: Mail, t: t(lang, "อีเมล", "Email"), d: companyProfile.publicEmail },
                { Icon: Globe, t: t(lang, "เว็บไซต์", "Website"), d: companyProfile.websiteUrl },
                { Icon: Facebook, t: "Facebook", d: companyProfile.facebookUrl },
              ].map(({ Icon, t: title, d }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent text-white shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {title}
                    </div>
                    <div className="text-sm font-semibold text-primary mt-0.5">{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild className="bg-gradient-accent text-white shadow-glow">
                <Link to="/contactus">{t(lang, "ติดต่อเรา", "Contact Us")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/brands">{t(lang, "ดูแบรนด์ทั้งหมด", "View All Brands")}</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-elev ring-1 ring-border bg-card min-h-[420px]">
            <iframe
              title="Matrix Intertrade Location"
              src={companyMapEmbedUrl(companyProfile)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full w-full min-h-[420px] border-0"
            />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
