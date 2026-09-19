import { createFileRoute } from "@tanstack/react-router";
import { SolutionDetailTemplate } from "@/components/site/SolutionDetailTemplate";
import {
  loadSolutionDetailContent,
  type SolutionDetailContent,
} from "@/lib/content/site";
import { buildSeoHead } from "@/lib/seo";
import heroAv from "@/assets/hero-av.jpg";

const avSolutionsContent: SolutionDetailContent = {
  slug: "av-solutions",
  title: "AV Solutions",
  iconName: "Cable",
  intro: "ออกแบบ ติดตั้ง และดูแลระบบภาพและเสียงครบวงจร พร้อมอุปกรณ์ Kramer AV ระดับ Enterprise",
  introEn: "Comprehensive Audio-Visual system design, installation, and maintenance with Enterprise-grade Kramer AV equipment.",
  bullets: [
    "AV over IP ส่งสัญญาณภาพและเสียงผ่านระบบเครือข่าย",
    "Matrix Switcher และ Video Wall Processor",
    "ระบบ Conference / Microphone / Audio DSP",
    "Control System สั่งงานทั้งห้องผ่าน Touch Panel",
    "ออกแบบโดยทีม Sales Engineer ที่ผ่าน CTS",
    "Commissioning & Training ครบวงจร",
  ],
  bulletsEn: [
    "AV over IP: Transmitting audio and video over network systems",
    "Matrix Switchers and Video Wall Processors",
    "Conference Systems / Microphones / Audio DSPs",
    "Control Systems: Manage the entire room via Touch Panel",
    "Designed by CTS-certified Sales Engineering teams",
    "Comprehensive Commissioning & Training",
  ],
  applications: ["Boardroom", "Control Room", "Auditorium", "Smart Hospital", "Command Center", "Broadcast Studio"],
  applicationsEn: ["Boardrooms", "Control Rooms", "Auditoriums", "Smart Hospitals", "Command Centers", "Broadcast Studios"],
};

export const Route = createFileRoute("/av-solutions")({
  loader: async () => loadSolutionDetailContent("av-solutions", avSolutionsContent),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: loaderData?.seoTitle || "ออกแบบและติดตั้งระบบ AV Solutions ครบวงจร | Matrix Intertrade",
      description: loaderData?.seoDescription || loaderData?.intro || avSolutionsContent.intro,
      path: "/av-solutions",
      canonical: loaderData?.seoCanonicalUrl,
      image: loaderData?.ogImageUrl || loaderData?.imageUrl || heroAv,
      ogTitle: loaderData?.ogTitle,
      ogDescription: loaderData?.ogDescription,
      noIndex: loaderData?.seoNoIndex,
    }),
  component: AvSolutionsPage,
});

function AvSolutionsPage() {
  const content = Route.useLoaderData();
  return <SolutionDetailTemplate {...content} />;
}
