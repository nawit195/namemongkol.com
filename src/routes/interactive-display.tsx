import { createFileRoute } from "@tanstack/react-router";
import { SolutionDetailTemplate } from "@/components/site/SolutionDetailTemplate";
import {
  loadSolutionDetailContent,
  type SolutionDetailContent,
} from "@/lib/content/site";
import { buildSeoHead } from "@/lib/seo";
import heroInteractive from "@/assets/hero-interactive.jpg";

const interactiveDisplayContent: SolutionDetailContent = {
  slug: "interactive-display",
  title: "Interactive Display",
  iconName: "Hand",
  intro: "จอสัมผัสอัจฉริยะระดับมืออาชีพจาก Persona รองรับการเรียนการสอน Active Learning และห้องประชุม Hybrid Meeting",
  introEn: "Professional smart touch displays from Persona, supporting Active Learning and Hybrid Meetings.",
  bullets: [
    "Google EDLA Certified รองรับ Google Play อย่างเป็นทางการ",
    "Multi-touch สูงสุด 40 จุด ตอบสนองทันที",
    "Whiteboard ในตัว พร้อม Cloud Storage",
    "รองรับ Wireless Casting จากทุกอุปกรณ์",
    "DMS+ ระบบบริหารจัดการจอจากระยะไกล",
    "ขนาด 65 / 75 / 86 / 98 นิ้ว",
  ],
  bulletsEn: [
    "Google EDLA Certified with official Google Play support",
    "Up to 40-point Multi-touch with instant response",
    "Built-in Whiteboard with Cloud Storage",
    "Supports Wireless Casting from all devices",
    "DMS+ remote display management system",
    "Available in 65 / 75 / 86 / 98 inches",
  ],
  applications: ["Smart Classroom", "ห้องประชุมองค์กร", "ห้องอบรม", "Training Room", "ห้องผู้บริหาร", "Innovation Lab"],
  applicationsEn: [
    "Smart Classrooms",
    "Corporate Meeting Rooms",
    "Training Rooms",
    "Lecture Halls",
    "Executive Boardrooms",
    "Innovation Labs",
  ],
};

export const Route = createFileRoute("/interactive-display")({
  loader: async () => loadSolutionDetailContent("interactive-display", interactiveDisplayContent),
  head: ({ loaderData }) =>
    buildSeoHead({
      title:
        loaderData?.seoTitle && loaderData.seoTitle.trim() !== "Interactive Display"
          ? loaderData.seoTitle
          : "จอ Interactive Display สำหรับองค์กรและการศึกษา | Matrix Intertrade",
      description: loaderData?.seoDescription || loaderData?.intro || interactiveDisplayContent.intro,
      path: "/interactive-display",
      canonical: loaderData?.seoCanonicalUrl,
      image: loaderData?.ogImageUrl || loaderData?.imageUrl || heroInteractive,
      ogTitle: loaderData?.ogTitle,
      ogDescription: loaderData?.ogDescription,
      noIndex: loaderData?.seoNoIndex,
    }),
  component: InteractiveDisplayPage,
});

function InteractiveDisplayPage() {
  const content = Route.useLoaderData();
  return <SolutionDetailTemplate {...content} />;
}
