import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, FileText, Package } from "lucide-react";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";

export function CTASection() {
  const { lang } = useLanguage();
  return (
    <section className="relative overflow-hidden border-y border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(0,44,84,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,44,84,0.055)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cyan/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-200/45 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-navy tracking-tight max-w-3xl mx-auto leading-tight">
          {t(lang, "ต้องการออกแบบระบบ AV หรือจอ LED ", "Need an AV system or LED display ")}
          <span className="text-accent">
            {t(lang, "สำหรับองค์กรของคุณ?", "for your organization?")}
          </span>
        </h2>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          {t(
            lang,
            "ทีมผู้เชี่ยวชาญพร้อมให้คำปรึกษาฟรี ออกแบบโซลูชั่นตามหน้างานจริงของคุณ",
            "Our expert team offers free consultation and tailor-made solutions for your site.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-white text-navy ring-1 ring-sky-200 hover:bg-sky-50">
            <Link to="/contactus">
              <Phone className="mr-2 h-4 w-4" /> {t(lang, "ติดต่อฝ่ายขาย", "Contact Sales")}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-gradient-accent text-white hover:opacity-90 shadow-glow"
          >
            <Link to="/contactus">
              <FileText className="mr-2 h-4 w-4" /> {t(lang, "ขอใบเสนอราคา", "Request Quote")}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-sky-200 bg-white/70 text-navy hover:bg-sky-50 hover:text-navy"
          >
            <Link to="/category/$slug" params={{ slug: "all-products" }}>
              <Package className="mr-2 h-4 w-4" /> {t(lang, "ดูสินค้า", "View Products")}{" "}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
