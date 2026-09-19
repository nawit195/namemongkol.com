import { createFileRoute } from "@tanstack/react-router";
import { IndustriesShowcase } from "@/components/site/IndustriesShowcase";
import { CTASection } from "@/components/site/CTASection";
import { useSiteContent } from "@/lib/content/use-site-content";
import { buildSeoHead } from "@/lib/seo";
import heroBrands from "@/assets/hero-brands.jpg";

export const Route = createFileRoute("/brands")({
  head: () =>
    buildSeoHead({
      title: "ผลงานติดตั้งระบบภาพและเสียงสำหรับองค์กร | Matrix Intertrade",
      description: "ตัวอย่างผลงานและโซลูชันระบบภาพและเสียงสำหรับองค์กร โรงเรียน หน่วยงานรัฐ โรงพยาบาล ห้องประชุม และธุรกิจบริการ",
      path: "/brands",
      image: heroBrands,
    }),
  component: BrandsPage,
});

function BrandsPage() {
  const { industries, industryShowcase } = useSiteContent();

  return (
    <>
      <IndustriesShowcase industries={industries} section={industryShowcase} headingAs="h1" />
      <CTASection />
    </>
  );
}
