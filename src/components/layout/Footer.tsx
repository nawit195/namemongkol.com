import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Facebook, Youtube, Music2, ArrowUpRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import matrixLogo from "@/assets/matrix-logo.jpg";
import { useSiteContent } from "@/lib/content/use-site-content";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import {
  companyAddress,
  companyPhoneDisplay,
  companyPhoneHref,
  formatThaiPhone,
} from "@/lib/company-profile";

const FOOTER_BRANDS = [
  { slug: "grandview", label: "Grandview" },
  { slug: "hdmi-cable", label: "HDMI Cable" },
  { slug: "kramer", label: "Kramer" },
  { slug: "persona", label: "Persona" },
  { slug: "transcreen", label: "tranScreen" },
  { slug: "unilumin", label: "Unilumin" },
] as const;

export function Footer() {
  const { solutions, articleCategories, footerSettings, companyProfile } = useSiteContent();
  const { lang } = useLanguage();
  const local = (th: string, en: string) => t(lang, th, en);
  const phoneHref = companyPhoneHref(companyProfile.officePhone);
  const footerBrandItems = FOOTER_BRANDS.map((footerBrand) => ({
    label: footerBrand.label,
    href: `/category/${footerBrand.slug}`,
  }));

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-50 text-navy">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-cyan/16 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-sky-200/50 blur-3xl pointer-events-none" />

      {/* Top CTA strip */}
      <div className="relative border-b border-sky-200/70 bg-white/35">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-8 md:flex-row md:items-center md:px-6">
          <div className="min-w-0">
            <h3 className="break-words text-xl font-bold tracking-tight md:text-2xl">
              {local(footerSettings.ctaTitleTh, footerSettings.ctaTitleEn)}
            </h3>
            <p className="mt-1.5 break-words text-sm text-slate-600">
              {local(footerSettings.ctaDescriptionTh, footerSettings.ctaDescriptionEn)}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button
              asChild
              className="min-h-11 w-full bg-gradient-accent font-semibold text-white shadow-glow hover:opacity-90 sm:w-auto"
            >
              <Link to="/contactus">
                {t(lang, "ขอใบเสนอราคา", "Request Quote")} <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-11 w-full border-sky-200 bg-white/75 text-navy hover:bg-sky-50 hover:text-navy sm:w-auto"
            >
              <a href={phoneHref}>
                <Phone className="mr-1.5 h-4 w-4" />
                {formatThaiPhone(companyProfile.officePhone)}
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-9 px-4 py-10 sm:py-12 md:grid-cols-2 md:px-6 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-4 space-y-5">
          <span className="relative inline-block h-20 w-20 overflow-hidden rounded-2xl ring-1 ring-[#ffd24a]/30 shadow-[0_4px_20px_-6px_rgba(255,204,25,0.3)]">
            <img src={matrixLogo} alt="Matrix Intertrade Co., Ltd." className="absolute inset-0 h-full w-full object-contain" />
          </span>
          <p className="max-w-md break-words text-sm leading-relaxed text-slate-600">
            {local(footerSettings.companyDescriptionTh, footerSettings.companyDescriptionEn)}
          </p>
          <div className="space-y-2.5 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sky-200 bg-white/75">
                <MapPin className="h-4 w-4 text-cyan" />
              </div>
              <span className="min-w-0 break-words pt-1">
                {companyAddress(companyProfile, lang)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sky-200 bg-white/75">
                <Phone className="h-4 w-4 text-cyan" />
              </div>
              <span className="min-w-0 break-words">{companyPhoneDisplay(companyProfile)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sky-200 bg-white/75">
                <Mail className="h-4 w-4 text-cyan" />
              </div>
              <span className="min-w-0 break-all">{companyProfile.publicEmail}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sky-200 bg-white/75">
                <span className="text-[10px] font-extrabold text-[#06C755]">LINE</span>
              </div>
              <span className="min-w-0 break-words">{companyProfile.lineId}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            {[
              {
                Icon: Facebook,
                href: companyProfile.facebookUrl,
                label: "Facebook",
              },
              {
                Icon: Youtube,
                href: companyProfile.youtubeUrl,
                label: "Youtube",
              },
              { Icon: Music2, href: companyProfile.tiktokUrl, label: "TikTok" },
            ].filter((item) => item.href).map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-xl border border-sky-200 bg-white/75 text-navy transition-all hover:border-transparent hover:bg-gradient-accent hover:text-white hover:shadow-glow"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          className="lg:col-span-2"
          title={t(lang, "โซลูชั่น", "Solutions")}
          items={solutions.map((s) => ({
            label: t(lang, s.title, (s as any).titleEn || s.title),
            href: `/${s.slug}`,
          }))}
        />
        <FooterCol
          className="lg:col-span-2"
          title={t(lang, "แบรนด์สินค้า", "Brands")}
          items={footerBrandItems}
        />
        <FooterCol
          className="lg:col-span-2"
          title={t(lang, "บทความ", "Articles")}
          items={articleCategories
            .slice(0, 6)
            .map((c) => ({
              label: t(lang, c.label, (c as any).labelEn || c.label),
              href: "/blog",
            }))}
        />

        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-navy">Newsletter</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {local(footerSettings.newsletterDescriptionTh, footerSettings.newsletterDescriptionEn)}
          </p>
          <form
            className="flex min-w-0 overflow-hidden rounded-xl border border-sky-200 bg-white/80 transition-colors focus-within:border-cyan"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder={local(
                footerSettings.newsletterPlaceholderTh,
                footerSettings.newsletterPlaceholderEn,
              )}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs text-navy outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              aria-label={lang === "EN" ? "Subscribe" : "สมัคร"}
              className="grid h-11 w-11 shrink-0 place-items-center bg-gradient-accent transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="relative border-t border-sky-200/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-slate-600 md:flex-row md:px-6 md:text-left">
          <div>© {new Date().getFullYear()} Matrix Intertrade Co., Ltd. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/aboutus" className="transition-colors hover:text-accent">
              {t(lang, "เกี่ยวกับเรา", "About Us")}
            </Link>
            <Link to="/contactus" className="transition-colors hover:text-accent">
              {t(lang, "ติดต่อเรา", "Contact Us")}
            </Link>
            <Link to="/blog" className="transition-colors hover:text-accent">
              {t(lang, "บทความ", "Articles")}
            </Link>
            <span>{t(lang, "นโยบายความเป็นส่วนตัว", "Privacy Policy")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
  className,
}: {
  title: string;
  items: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 text-navy">{title}</h4>
      <ul className="space-y-2.5 text-sm text-slate-600">
        {items.map((i, idx) => (
          <li key={i.label + idx}>
            <Link
              to={i.href}
              className="group inline-flex min-w-0 items-center gap-1 break-words transition-colors hover:text-accent"
            >
              <span>{i.label}</span>
              <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
