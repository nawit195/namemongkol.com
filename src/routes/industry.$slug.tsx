import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { CTASection } from "@/components/site/CTASection";
import { loadIndustryDetailContent } from "@/lib/content/site";
import { getIndustryDetailDefaults } from "@/data/managed-content-defaults";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/site/LazyImage";
import heroSolutions from "@/assets/hero-solutions.jpg";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { buildSeoHead } from "@/lib/seo";
import {
  findPublishedProjectBySlug,
  loadPublishedProjects,
  type SiteProject,
} from "@/lib/content/projects";
import { ProjectCard } from "@/components/site/ProjectCard";
const GRANDVIEW_IMAGE = "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg";
const KRAMER_IMAGE = "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg";
const INTERACTIVE_IMAGE = "/legacy-imports/f7c323982191-interactive_display12.png";
const LED_IMAGE = "/legacy-imports/a6492e1dbcf9-led_display1.png";
const AV_IMAGE = "/legacy-imports/7b9fc0dd456f-av_solutions1.png";
const WIRELESS_IMAGE = "/legacy-imports/55c7fda91436-wireless_presentation1.png";

const INDUSTRY_IMAGE_FALLBACKS: Record<string, string> = {
  education: INTERACTIVE_IMAGE,
  hotel: AV_IMAGE,
  corporate: AV_IMAGE,
  government: LED_IMAGE,
  hospital: INTERACTIVE_IMAGE,
  "video-conference": WIRELESS_IMAGE,
};

export const Route = createFileRoute("/industry/$slug")({
  loader: async ({ params }) => {
    if (params.slug === "phichit-hospital") {
      const legacyProject = await findPublishedProjectBySlug(params.slug);
      if (legacyProject) {
        throw redirect({
          to: "/industry/$industrySlug/$projectSlug",
          params: {
            industrySlug: legacyProject.industrySlug,
            projectSlug: legacyProject.slug,
          },
          statusCode: 301,
        });
      }
    }
    const ind = await loadIndustryDetailContent(params.slug);
    if (!ind) throw notFound();
    const { projects, error: projectsError } = await loadPublishedProjects(ind.slug);
    return { ind, projects, projectsError };
  },
  head: ({ loaderData }) => {
    const ind = loaderData?.ind;
    return buildSeoHead({
      title: ind?.seoTitle || `${ind?.title ?? "โซลูชันตามอุตสาหกรรม"} | Matrix Intertrade`,
      description: ind?.seoDescription || ind?.desc || "ออกแบบระบบภาพและเสียงสำหรับองค์กร",
      path: `/industry/${ind?.slug ?? ""}`,
      canonical: ind?.seoCanonicalUrl,
      image: ind?.ogImageUrl || ind?.imageUrl || heroSolutions,
      ogTitle: ind?.ogTitle,
      ogDescription: ind?.ogDescription,
      noIndex: ind?.seoNoIndex,
    });
  },
  component: IndustryPage,
  notFoundComponent: () => <div className="p-20 text-center">Not found</div>,
  errorComponent: () => <div className="p-20 text-center">เกิดข้อผิดพลาด</div>,
});

function IndustryPage() {
  const { ind, projects, projectsError } = Route.useLoaderData();
  const { lang } = useLanguage();
  const detailPayload = mergeIndustryPayload(
    getIndustryDetailDefaults(ind.slug, ind.title, ind.desc),
    ind.payload,
  );
  const displayTitle = t(lang, ind.title, ind.titleEn);
  const displayDesc = t(lang, ind.desc, ind.descEn);
  const Icon = (_props: { className?: string }) => null;
  const features: string[] = [];
  const industryImage = ind.imageUrl ?? INDUSTRY_IMAGE_FALLBACKS[ind.slug];
  const archivedLegacyLayoutsEnabled = false;
  /*
  const Icon = resolveIcon(ind.icon);
  const isHotel = ind.slug === "hotel";
  const featuresTH = [
    "ออกแบบระบบให้เหมาะกับขนาดและการใช้งานจริง",
    "อุปกรณ์จากแบรนด์ระดับโลกที่ผ่านการรับรอง",
    "บริการ Site Survey และให้คำปรึกษาฟรี",
    "ติดตั้งและทดสอบโดยทีมช่างผู้เชี่ยวชาญ",
    "บริการหลังการขายและ Training สำหรับทีมงาน",
  ];
  const featuresEN = [
    "System design tailored to your space and real-world usage",
    "Equipment from world-class, fully certified brands",
    "Free on-site survey and expert consultation",
    "Installation and commissioning by specialist engineers",
    "After-sales service and team training included",
  ];
  const features = t(lang, featuresTH, featuresEN);

  const hotelTitleEN = "Hotels & Large Conference Halls";
  const hotelDescEN =
    "End-to-end AV solutions for hotels, ballrooms, conference halls, live events, theatres and museums — built on Top-Class, mission-critical equipment.";
  const displayTitle = isHotel ? t(lang, ind.title, hotelTitleEN) : t(lang, ind.title, ind.titleEn);
  const displayDesc = isHotel ? t(lang, ind.desc, hotelDescEN) : t(lang, ind.desc, ind.descEn);
  const industryImage = ind.imageUrl ?? INDUSTRY_IMAGE_FALLBACKS[ind.slug];
  */

  return (
    <>
      <PageHeader
        eyebrow="Industry"
        title={displayTitle}
        desc={displayDesc}
        breadcrumbs={[
          { label: t(lang, "เกี่ยวกับเรา", "About Us"), href: "/aboutus" },
          { label: displayTitle },
        ]}
        bgImage={heroSolutions}
      />
      <ProjectListSection title={displayTitle} projects={projects} loadError={projectsError} />
      <DynamicIndustryContent payload={detailPayload} slug={ind.slug} />
      {archivedLegacyLayoutsEnabled &&
        !["education", "hotel", "corporate", "video-conference"].includes(ind.slug) && (
          <section className="py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <div className="mb-6 inline-grid h-14 w-14 place-items-center rounded-xl bg-gradient-accent text-white shadow-glow">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                  {t(lang, `โซลูชั่นสำหรับ${displayTitle}`, `Solutions for ${displayTitle}`)}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {displayDesc}{" "}
                  {t(
                    lang,
                    "เราเข้าใจความต้องการเฉพาะของแต่ละองค์กร และออกแบบระบบที่ตอบโจทย์การใช้งานจริง",
                    "We understand the unique needs of every organization and design systems that match real-world use.",
                  )}
                </p>
                <ul className="mt-6 space-y-3">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
                    >
                      <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="aspect-[4/3] rounded-3xl bg-gradient-hero relative overflow-hidden shadow-elev grid place-items-center group">
                {industryImage ? (
                  <img
                    src={industryImage}
                    alt={ind.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    width={1280}
                    height={960}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                ) : (
                  <Icon className="h-32 w-32 text-white/20" />
                )}
              </div>
            </div>
          </section>
        )}
      {archivedLegacyLayoutsEnabled && ind.slug === "education" && <EducationContent />}
      {archivedLegacyLayoutsEnabled && ind.slug === "hotel" && <HotelContent />}
      {archivedLegacyLayoutsEnabled && ind.slug === "corporate" && <CorporateContent />}
      {archivedLegacyLayoutsEnabled && ind.slug === "video-conference" && (
        <VideoConferenceContent />
      )}
      <CTASection />
    </>
  );
}

function ProjectListSection({
  title,
  projects,
  loadError,
}: {
  title: string;
  projects: SiteProject[];
  loadError: string | null;
}) {
  const { lang } = useLanguage();
  return (
    <section className="border-b border-border bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {t(lang, "ผลงานของเรา", "Our projects")}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-primary md:text-4xl">
            {t(lang, `ผลงานในหมวด${title}`, `${title} projects`)}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t(
              lang,
              "ตัวอย่างงานติดตั้งและโซลูชันที่ส่งมอบให้ลูกค้า เลือกผลงานเพื่อดูรายละเอียดและภาพเพิ่มเติม",
              "Explore completed installations and delivered solutions in this category.",
            )}
          </p>
        </div>

        {loadError ? (
          <div
            className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
            role="status"
          >
            {t(
              lang,
              "ไม่สามารถโหลดรายการผลงานได้ในขณะนี้ เนื้อหาหมวดด้านล่างยังใช้งานได้ตามปกติ",
              "Projects are temporarily unavailable. The category content below is still available.",
            )}
          </div>
        ) : projects.length > 0 ? (
          <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="font-semibold text-primary">
              {t(lang, "กำลังรวบรวมผลงานในหมวดนี้", "Projects are being added")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                lang,
                "ระหว่างนี้สามารถดูข้อมูลโซลูชันและสินค้าแนะนำด้านล่างได้",
                "You can still explore the solutions and recommended products below.",
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

type EduProduct = {
  title: string;
  desc: string;
  img: string;
  href: string;
};

const EDU_PRODUCTS: EduProduct[] = [
  {
    title: "Grandview Large-stage Series",
    desc: 'จอสำหรับห้องบรรยายขนาดกลาง - ใหญ่ หากห้องเรียนหรือห้องบรรยายของคุณมีขนาดใหญ่เกินกว่าที่ Remarkable Screen จะรองรับได้ Grandview มีจอตั้งแต่ขนาด 100" - 500" ทุกฟอร์แมต ทั้งแบบมือดึงและแบบมอเตอร์',
    img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
    href: "/category/grandview",
  },
  {
    title: "SkyShow Series",
    desc: "จอสำหรับห้องเพดานสูง หอประชุม หรือห้องบรรยายเพดานสูง โดย Grandview ออกแบบให้เหมาะกับการใช้งานบนเวทีและฮอลล์ขนาดใหญ่",
    img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
    href: "/category/grandview",
  },
  {
    title: "KRAMER",
    desc: "อุปกรณ์เพื่อทุกคำตอบสำหรับโซลูชั่นในการนำเสนองานภาพ เสียง และการแลกเปลี่ยนความเห็นในยุคดิจิตอล 4.0",
    img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg",
    href: "/category/kramer",
  },
];

function EducationContent() {
  return (
    <>
      <section className="py-16 md:py-20 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-primary tracking-tight">
            ผลิตภัณฑ์สำหรับสถาบันการศึกษา
          </h2>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            โซลูชั่นภาพและเสียงครบวงจรสำหรับห้องเรียน ห้องบรรยาย และหอประชุมทุกขนาด
          </p>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EDU_PRODUCTS.map((p) => (
              <article
                key={p.title}
                className="group rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-elev transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <LazyImage
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary">{p.title}</h3>
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-5">
                    {p.desc}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-5">
                    <Link to={p.href}>
                      ดูเพิ่มเติม <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <div className="grid grid-cols-2 gap-4">
            <LazyImage
              src="/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg"
              alt="Remarkable Screen ห้องเรียน"
              className="aspect-[4/3] w-full object-cover rounded-2xl shadow-card col-span-2"
            />
            <LazyImage
              src="/legacy-imports/652ee847c907-th_kta_pro_full_-231_.png"
              alt="Remarkable Screen ตัวอย่าง"
              className="aspect-square w-full object-cover rounded-2xl shadow-card"
            />
            <LazyImage
              src="/legacy-imports/f7c323982191-interactive_display12.png"
              alt="Interactive Display ในห้องเรียน"
              className="aspect-square w-full object-cover rounded-2xl shadow-card"
            />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
              มหาวิทยาลัย · วิทยาลัย · โรงเรียนทุกระดับชั้น
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-primary tracking-tight">
              Remarkable Screen — จอ 2-in-1 สำหรับห้องเรียนยุคใหม่
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              ห้องเรียน ห้องเล็กเชอร์ และห้องบรรยายในยุคปัจจุบัน ขาดการนำเสนอภาพผ่านสื่อมีเดียไม่ได้
              Grandview มีจอฉายภาพคุณภาพสูงที่ตอบทุกความต้องการ ทุกขนาด
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Remarkable Screen เป็นได้ทั้งกระดานเขียนด้วย Marking pen ลบได้เหมือนไวท์บอร์ด และเป็นจอฉายภาพคุณภาพสูงในเวลาเดียวกัน",
                "หมดยุคการดึงจอลง-ขึ้นเพื่อสลับระหว่างฉายภาพและเขียนบรรยาย",
                "โครงสร้างแข็งแรง 4 ชั้น ดีไซน์ทันสมัย เหมาะกับทุกห้องเรียน",
                "ใช้งานร่วมกับโปรเจคเตอร์อินเตอร์แอ๊คทีฟได้อย่างราบรื่น เขียน ขยาย คอมเม้นต์บนสไลด์ และบันทึกส่งให้ผู้เรียนได้ทันที",
                'มีขนาดให้เลือกตั้งแต่ 50" จนถึง 106"',
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-foreground/85 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Button asChild className="bg-gradient-accent text-white shadow-glow">
                <Link to="/contactus">
                  ปรึกษาผู้เชี่ยวชาญ <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/category/$slug" params={{ slug: "grandview" }}>
                  ดูสินค้า Grandview
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Interactive Display · AI · IoT
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">
              จออินเตอร์แอคทีฟ ขายดีอันดับ 1 ในอเมริกาและยุโรป
            </h2>
            <p className="mt-4 text-white/85 leading-relaxed">
              จอแสดงผลที่เป็นมากกว่าจอ TV — เขียน แสดงความเห็น เชื่อมต่อประชุมออนไลน์
              และแลกเปลี่ยนข้อมูลแบบไร้สาย พลิกโฉมวิธีการเรียนการสอนในห้องเรียนและสำนักงานยุค AI
              &amp; IoT
            </p>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Button asChild className="bg-white text-primary hover:bg-white/90">
                <Link to="/interactive-display">
                  ดูโซลูชั่น Interactive Display <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link to="/interactive-display">ดูสินค้าทั้งหมด</Link>
              </Button>
            </div>
          </div>
          <LazyImage
            src="/legacy-imports/f7c323982191-interactive_display12.png"
            alt="Interactive Display สำหรับการเรียนการสอน"
            className="aspect-[4/3] w-full object-cover rounded-3xl shadow-elev"
          />
        </div>
      </section>
    </>
  );
}

const HOTEL_BANNERS = [
  "/legacy-imports/7b9fc0dd456f-av_solutions1.png",
  "/legacy-imports/a6492e1dbcf9-led_display1.png",
  "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
  "/legacy-imports/55c7fda91436-wireless_presentation1.png",
  "/legacy-imports/f7c323982191-interactive_display12.png",
];

type BiProduct = {
  title: string;
  descTH: string;
  descEN: string;
  img: string;
  href: string;
};

const HOTEL_PRODUCTS: BiProduct[] = [
  {
    title: "Grandview CNV — Cyber / Elegant / Large-stage Series",
    descTH:
      'จอสำหรับห้องบรรยายและฮอลล์ขนาดกลาง - ใหญ่ รองรับห้องที่ใหญ่เกินกว่า Remarkable Screen ตั้งแต่ขนาด 100" ถึง 500" ทุกฟอร์แมต ทั้งแบบมือดึงและแบบมอเตอร์',
    descEN:
      'Projection screens for medium-to-large halls and auditoriums — for rooms beyond Remarkable Screen\'s range, from 100" up to 500" in every format, available in pull-down and motorized versions.',
    img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
    href: "/category/grandview",
  },
  {
    title: "KRAMER",
    descTH:
      "อุปกรณ์เพื่อทุกคำตอบสำหรับโซลูชั่นในการนำเสนองานภาพ เสียง และการแลกเปลี่ยนความเห็นในยุคดิจิตอล 4.0",
    descEN:
      "Equipment that answers every need in audio, video and collaborative presentation for the Digital 4.0 era.",
    img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg",
    href: "/category/kramer",
  },
];

function HotelContent() {
  const { lang } = useLanguage();
  return (
    <>
      <section className="py-12 md:py-16 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {HOTEL_BANNERS.map((src, i) => (
              <LazyImage
                key={src}
                src={src}
                alt={`Hotel banner ${i + 1}`}
                className={`aspect-[4/3] w-full object-cover rounded-2xl shadow-card ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
            {t(
              lang,
              "Live Event · พิพิธภัณฑ์ · โรงละคร · โรงแรม",
              "Live Events · Museums · Theatres · Hotels",
            )}
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl font-bold text-primary tracking-tight">
            {t(
              lang,
              "สถานบันเทิง โรงละคร โรงแรม งานกิจกรรม",
              "Entertainment Venues, Theatres, Hotels & Live Events",
            )}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">&quot;The show must go on&quot;</span>
            {" — "}
            {t(
              lang,
              "เราทราบดีว่างานของคุณพลาดไม่ได้ หากพลาด ความเสียหายต่อคุณและลูกค้าของคุณอาจมากมายเกินรับไหว อุปกรณ์ที่เราคัดสรรจึงเป็น Top Class reliable products ที่ผ่านการพิสูจน์อย่างโชกโชนจากกิจกรรมสำคัญและการใช้งานหนัก ในสถานที่ที่ต้องการเสถียรภาพสูงสุดจากทุกมุมโลก",
              "we know your show cannot afford to fail. The cost to you and your clients could be more than anyone can bear. That's why we select only Top-Class, proven equipment battle-tested in major events and demanding installations worldwide.",
            )}
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h3 className="text-center text-xl md:text-2xl font-bold text-primary tracking-tight">
            {t(
              lang,
              "ผลิตภัณฑ์เพื่อกิจการโรงแรม งานกิจกรรม Live Event และงานพิพิธภัณฑ์",
              "Products for Hotels, Live Events and Museums",
            )}
          </h3>
          <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {HOTEL_PRODUCTS.map((p) => (
              <article
                key={p.title}
                className="group rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-elev transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <LazyImage
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-primary">{p.title}</h4>
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                    {t(lang, p.descTH, p.descEN)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-5">
                    <Link to={p.href}>
                      Read more <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const CORP_PRODUCTS: BiProduct[] = [
  {
    title: "Grandview CNV — Cyber / Elegant / Large-stage Series",
    descTH:
      'จอสำหรับห้องประชุมและฮอลล์ขนาดกลาง-ใหญ่ ตั้งแต่ 100" ถึง 500" ทุกฟอร์แมต ทั้งแบบมือดึงและมอเตอร์ ตอบโจทย์ทุกขนาดของห้องประชุมในองค์กร',
    descEN:
      'Projection screens for medium-to-large corporate meeting rooms and halls, from 100" up to 500" in every format — manual and motorized options for any room size.',
    img: "/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg",
    href: "/category/grandview",
  },
  {
    title: "KRAMER",
    descTH:
      "อุปกรณ์ระบบ AV ครบวงจร สำหรับการนำเสนอภาพ เสียง และการแลกเปลี่ยนความเห็นในห้องประชุมยุคดิจิตอล 4.0",
    descEN:
      "End-to-end AV equipment for presentation, audio and collaboration in Digital 4.0 corporate meeting rooms.",
    img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg",
    href: "/category/kramer",
  },
];

function CorporateContent() {
  const { lang } = useLanguage();
  return (
    <>
      <section className="py-16 md:py-20 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
              {t(
                lang,
                "องค์กรธุรกิจ · หน่วยงานราชการ · รัฐวิสาหกิจ",
                "Corporate · Government · State Enterprise",
              )}
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-primary tracking-tight">
              {t(
                lang,
                "Remarkable Screen — จอ 2-in-1 สำหรับห้องประชุมยุคดิจิตอล 4.0",
                "Remarkable Screen — the 2-in-1 display for Digital 4.0 meeting rooms",
              )}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t(
                lang,
                "Remarkable Screen จอภาพยุคใหม่ล่าสุดแบบทูอินวัน เป็นได้ทั้งกระดานเขียนบรรยายด้วย Marking pen ลบได้เหมือนไวท์บอร์ด และเป็นจอฉายภาพคุณภาพสูงจากโปรเจคเตอร์ในเวลาเดียวกัน — ทางเลือกใหม่อันชาญฉลาดสำหรับห้องประชุมในสำนักงาน",
                "Remarkable Screen is the new 2-in-1 display — a whiteboard you can write on with a marker pen AND a high-quality projection screen at the same time. The smart new choice for any office meeting room.",
              )}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                t(
                  lang,
                  "หมดยุคของการดึงจอลง-ขึ้นเพื่อสลับระหว่างฉายภาพและเขียนบรรยาย — ทำได้สองอย่างพร้อมกันบนจอเดียว",
                  "No more pulling screens up and down to switch between projecting and writing — do both at once on a single surface.",
                ),
                t(
                  lang,
                  "ดีไซน์ทันสมัย โครงสร้างแข็งแรงถึง 4 ชั้น ผิวจอเรียบสนิท ภาพสวย คุณภาพสูงเหมือนจริง",
                  "Modern design with a 4-layer reinforced structure and perfectly flat surface for stunning, true-to-life image quality.",
                ),
                t(
                  lang,
                  "ใช้คู่กับโปรเจคเตอร์อินเตอร์แอ๊คทีฟ — เขียน ขยาย คอมเม้นต์บนสไลด์ บันทึกและส่งให้ผู้เข้าประชุมได้ทันที",
                  "Pair with an interactive projector — write, zoom, annotate on slides, save and share instantly with every meeting attendee.",
                ),
                t(
                  lang,
                  "การจับคู่ระหว่างจอกับโปรเจคเตอร์อินเตอร์แอ๊คทีฟราบรื่นทุกจุดสัมผัส",
                  "Seamless touch response on every point thanks to the perfectly flat surface and rigid construction.",
                ),
                t(
                  lang,
                  'มีให้เลือกหลายขนาด ตั้งแต่ 50" จนถึง 106" ตามความเหมาะสมของห้อง',
                  'Available in multiple sizes from 50" up to 106" to fit any room.',
                ),
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-foreground/85 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Button asChild className="bg-gradient-accent text-white shadow-glow">
                <Link to="/contactus">
                  {t(lang, "ปรึกษาผู้เชี่ยวชาญ", "Talk to a specialist")}{" "}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/interactive-display">
                  {t(lang, "ดูโซลูชั่น Interactive Display", "Interactive Display solutions")}
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LazyImage
              src="/legacy-imports/84c6dde0fa04-crop-1664192588573.jpg"
              alt="Remarkable Screen สำนักงาน"
              className="aspect-[4/3] w-full object-cover rounded-2xl shadow-card col-span-2"
            />
            <LazyImage
              src="/legacy-imports/f7c323982191-interactive_display12.png"
              alt="Interactive Display Flex"
              className="aspect-square w-full object-cover rounded-2xl shadow-card"
            />
            <LazyImage
              src="/legacy-imports/652ee847c907-th_kta_pro_full_-231_.png"
              alt="Interactive Display Q Series"
              className="aspect-square w-full object-cover rounded-2xl shadow-card"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h3 className="text-center text-xl md:text-2xl font-bold text-primary tracking-tight">
            {t(
              lang,
              "ผลิตภัณฑ์สำหรับสำนักงาน องค์กรธุรกิจ และหน่วยงานราชการ",
              "Products for Offices, Corporate and Government",
            )}
          </h3>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            {t(
              lang,
              "โซลูชั่นภาพและเสียงครบวงจร ตอบโจทย์ทุกห้องประชุมและทุกการใช้งานในองค์กรยุคใหม่",
              "End-to-end AV solutions for every meeting room and every use case in the modern enterprise.",
            )}
          </p>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORP_PRODUCTS.map((p) => (
              <article
                key={p.title}
                className="group rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-elev transition-all flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <LazyImage
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-base font-bold text-primary leading-snug">{p.title}</h4>
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed flex-1">
                    {t(lang, p.descTH, p.descEN)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-5 self-start">
                    <Link to={p.href}>
                      {t(lang, "ดูเพิ่มเติม", "Read more")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const VC_PRODUCTS: BiProduct[] = [
  {
    title: "Collaboration Devices",
    descTH:
      "ชุดอุปกรณ์วิดีโอคอนเฟอเร้นซ์ครบชุด สำหรับการประชุมทางไกล รองรับการเชื่อมต่อกับแพลตฟอร์มประชุมยอดนิยม",
    descEN:
      "Complete video conferencing kits for remote meetings — compatible with all major conferencing platforms.",
    img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg",
    href: "/category/kramer",
  },
  {
    title: "AV Over IP",
    descTH:
      "การส่งสัญญาณภาพและเสียงผ่านระบบ Network รองรับการกระจายสัญญาณคุณภาพสูงในระยะไกลและหลายจุดพร้อมกัน",
    descEN:
      "Transmit audio and video over standard IP networks — high-quality distribution across long distances and multiple endpoints.",
    img: "/legacy-imports/7b9fc0dd456f-av_solutions1.png",
    href: "/category/kramer",
  },
  {
    title: "Video Switchers 4K",
    descTH:
      "เครื่องสลับสัญญาณภาพ รองรับความละเอียดสูงสุดถึง 4K สำหรับห้องประชุมและงานอีเวนต์ที่ต้องการคุณภาพสูง",
    descEN:
      "Video switchers supporting up to 4K resolution — for meeting rooms and live events that demand top image quality.",
    img: "/legacy-imports/53aa84128a4c-crop-1664270486366.jpg",
    href: "/category/kramer",
  },
  {
    title: "Collaboration Devices — Video Conference",
    descTH:
      "อุปกรณ์สำหรับ Video Conference (การประชุมทางไกล) เพื่อการสื่อสารทั้งภายในและภายนอกองค์กรอย่างมีประสิทธิภาพ",
    descEN:
      "Devices for video conferencing — efficient communication inside and across organizations.",
    img: "/legacy-imports/55c7fda91436-wireless_presentation1.png",
    href: "/category/kramer",
  },
  {
    title: "Room Control Systems",
    descTH:
      "อุปกรณ์สำหรับควบคุมอุปกรณ์ต่างๆ ภายในห้องเรียน ห้องประชุม ทั้งภาพ เสียง แสง และระบบนำเสนอจากจุดควบคุมเดียว",
    descEN:
      "Control all classroom and meeting room devices — video, audio, lighting and presentation — from a single control panel.",
    img: "/legacy-imports/7b9fc0dd456f-av_solutions1.png",
    href: "/category/kramer",
  },
];

function VideoConferenceContent() {
  const { lang } = useLanguage();
  return (
    <>
      <section className="py-16 md:py-20 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <LazyImage
            src="/legacy-imports/f7c323982191-interactive_display12.png"
            alt="Interactive Display Interactive Display"
            className="aspect-[4/3] w-full object-cover rounded-3xl shadow-elev"
          />
          <div>
            <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
              {t(
                lang,
                "Video Conference · Interactive Display · AV Over IP",
                "Video Conference · Interactive Display · AV Over IP",
              )}
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-primary tracking-tight">
              {t(
                lang,
                "Interactive Display จออินเตอร์แอคทีฟ — มากกว่าจอ TV ทั่วไป",
                "Interactive Display Interactive Display — far more than a TV",
              )}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t(
                lang,
                "จอแสดงผลเพียงหนึ่งเดียวที่คุณสามารถใช้ขีดเขียน แสดงความเห็น เชื่อมต่อการประชุมออนไลน์ และแลกเปลี่ยนข้อมูลกันในการประชุมแบบไร้สาย ทำงานร่วมกับอุปกรณ์ชุดประชุมอื่นๆ ได้อย่างลงตัว",
                "The single display where you can write, annotate, join online meetings and share data wirelessly — working seamlessly with every other conferencing device in the room.",
              )}
            </p>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Button asChild className="bg-gradient-accent text-white shadow-glow">
                <Link to="/contactus">
                  {t(lang, "ปรึกษาผู้เชี่ยวชาญ", "Talk to a specialist")}{" "}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/interactive-display">
                  {t(lang, "ดูโซลูชั่น Interactive Display", "Interactive Display solutions")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h3 className="text-center text-xl md:text-2xl font-bold text-primary tracking-tight">
            {t(
              lang,
              "ผลิตภัณฑ์สำหรับระบบวิดีโอคอนเฟอเร้นซ์ เพื่อทุกหน่วยงาน",
              "Video Conferencing Products for Every Organization",
            )}
          </h3>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            {t(
              lang,
              "โซลูชั่นภาพ เสียง และการประชุมทางไกลครบวงจร สำหรับห้องประชุม ห้องเรียน และห้องควบคุมทุกขนาด",
              "End-to-end audio, video and conferencing solutions for meeting rooms, classrooms and control rooms of any size.",
            )}
          </p>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VC_PRODUCTS.map((p) => (
              <article
                key={p.title}
                className="group rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-elev transition-all flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <LazyImage
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-base font-bold text-primary leading-snug">{p.title}</h4>
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed flex-1">
                    {t(lang, p.descTH, p.descEN)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-5 self-start">
                    <Link to={p.href}>
                      {t(lang, "ดูเพิ่มเติม", "Read more")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

type RuntimeIndustryPayload = {
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
    img?: string;
    href?: string;
  }>;
};

function asPayloadRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mergeIndustryPayload(
  fallback: RuntimeIndustryPayload,
  runtime: unknown,
): RuntimeIndustryPayload {
  const source = asPayloadRecord(runtime);
  if (Object.keys(source).length === 0) return fallback;
  return {
    ...fallback,
    ...source,
    highlight_1: {
      ...(fallback.highlight_1 ?? {}),
      ...asPayloadRecord(source.highlight_1),
    },
  } as RuntimeIndustryPayload;
}

function DynamicIndustryContent({
  payload,
  slug,
}: {
  payload?: RuntimeIndustryPayload;
  slug: string;
}) {
  const { lang } = useLanguage();
  if (!payload || Object.keys(payload).length === 0) return null;

  return (
    <>
      {payload.banners && payload.banners.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {payload.banners.map((src: string, i: number) => (
                <LazyImage
                  key={src}
                  src={src}
                  alt={"Banner " + (i + 1)}
                  className={
                    "aspect-[4/3] w-full object-cover rounded-2xl shadow-card " +
                    (i === 0 && payload.banners.length > 3 ? "col-span-2 md:col-span-1" : "")
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {payload.highlight_1 && (
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-2 gap-10 items-center">
            {payload.highlight_1.imagePosition === "left" && payload.highlight_1.image && (
              <LazyImage
                src={payload.highlight_1.image}
                alt={payload.highlight_1.title}
                className="aspect-[4/3] w-full object-cover rounded-3xl shadow-elev"
              />
            )}
            <div>
              {payload.highlight_1.badge && (
                <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
                  {payload.highlight_1.badge}
                </span>
              )}
              <h2 className="mt-4 text-2xl md:text-3xl font-bold text-primary tracking-tight">
                {payload.highlight_1.title}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {payload.highlight_1.desc}
              </p>
              {payload.highlight_1.features && payload.highlight_1.features.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {payload.highlight_1.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm text-foreground/85 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-7 flex gap-3 flex-wrap">
                <Button asChild className="bg-gradient-accent text-white shadow-glow">
                  <Link to="/contactus">
                    {t(lang, "ปรึกษาผู้เชี่ยวชาญ", "Talk to a specialist")}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            {payload.highlight_1.imagePosition !== "left" && payload.highlight_1.image && (
              <LazyImage
                src={payload.highlight_1.image}
                alt={payload.highlight_1.title}
                className="aspect-[4/3] w-full object-cover rounded-3xl shadow-elev"
              />
            )}
          </div>
        </section>
      )}

      {payload.products && payload.products.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h3 className="text-center text-xl md:text-2xl font-bold text-primary tracking-tight">
              {payload.productsTitle || t(lang, "ผลิตภัณฑ์แนะนำ", "Featured Products")}
            </h3>
            {payload.productsDesc && (
              <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
                {payload.productsDesc}
              </p>
            )}
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payload.products.map((p, i: number) => (
                <article
                  key={i}
                  className="group rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-elev transition-all flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <LazyImage
                      src={p.img}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold text-primary">{p.title}</h4>
                    <p className="mt-3 text-sm text-foreground/80 leading-relaxed flex-1">
                      {p.desc}
                    </p>
                    {p.href && (
                      <Button asChild variant="outline" size="sm" className="mt-5 self-start">
                        <Link to={p.href}>
                          {t(lang, "ดูเพิ่มเติม", "Read more")}{" "}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
