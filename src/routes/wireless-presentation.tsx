import { createFileRoute } from "@tanstack/react-router";
import { SolutionDetailTemplate } from "@/components/site/SolutionDetailTemplate";
import {
  loadSolutionDetailContent,
  type SolutionDetailContent,
} from "@/lib/content/site";
import { buildSeoHead } from "@/lib/seo";
import heroWireless from "@/assets/hero-wireless.jpg";

const wirelessPresentationContent: SolutionDetailContent = {
  slug: "wireless-presentation",
  title: "Wireless Presentation",
  iconName: "Wifi",
  intro: "tranScreen ระบบนำเสนอไร้สายระดับองค์กร รองรับ BYOD ทุกอุปกรณ์ Windows / Mac / iOS / Android",
  introEn: "tranScreen Enterprise-grade wireless presentation system, supporting BYOD for all devices (Windows / Mac / iOS / Android)",
  bullets: [
    "ส่งภาพไร้สายแบบ Real-time ไม่มี Lag",
    "รองรับการแชร์พร้อมกันสูงสุด 4 หน้าจอ",
    "Plug-and-Play ใช้งานง่าย ไม่ต้องลง Driver",
    "ระบบความปลอดภัยระดับองค์กร",
    "รองรับ AirPlay / Miracast / Google Cast",
  ],
  bulletsEn: [
    "Real-time wireless screen casting with no lag",
    "Supports up to 4 simultaneous screen shares",
    "Plug-and-Play, easy to use without driver installation",
    "Enterprise-grade security systems",
    "Supports AirPlay / Miracast / Google Cast",
  ],
  applications: ["ห้องประชุม Huddle Room", "Boardroom", "Training Room", "Hybrid Meeting", "Innovation Lab"],
  applicationsEn: ["Huddle Rooms", "Boardrooms", "Training Rooms", "Hybrid Meetings", "Innovation Labs"],
};

export const Route = createFileRoute("/wireless-presentation")({
  loader: async () => loadSolutionDetailContent("wireless-presentation", wirelessPresentationContent),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: loaderData?.seoTitle || "Wireless Presentation สำหรับห้องประชุม | Matrix Intertrade",
      description: loaderData?.seoDescription || loaderData?.intro || wirelessPresentationContent.intro,
      path: "/wireless-presentation",
      canonical: loaderData?.seoCanonicalUrl,
      image: loaderData?.ogImageUrl || loaderData?.imageUrl || heroWireless,
      ogTitle: loaderData?.ogTitle,
      ogDescription: loaderData?.ogDescription,
      noIndex: loaderData?.seoNoIndex,
    }),
  component: WirelessPresentationPage,
});

function WirelessPresentationPage() {
  const content = Route.useLoaderData();
  return <SolutionDetailTemplate {...content} />;
}
