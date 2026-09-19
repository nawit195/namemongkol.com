import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { brandImages } from "@/data/brand-images";
import { brandLogos } from "@/data/brand-logos";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { CATEGORY_IDS_BY_SLUG, CATEGORY_SLUGS } from "@/lib/seo-slugs";

export function BrandCard({
  slug,
  name,
  category,
  desc,
  descEn,
  imageUrl,
  logoUrl,
}: {
  slug: string;
  name: string;
  category: string;
  desc: string;
  descEn?: string;
  color: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
}) {
  const { lang } = useLanguage();
  const img = imageUrl || brandImages[slug];
  const logo = logoUrl || brandLogos[slug];

  const categoryId = CATEGORY_IDS_BY_SLUG[slug];
  const targetUrl = `/category/${categoryId && CATEGORY_SLUGS[categoryId] ? CATEGORY_SLUGS[categoryId] : slug}`;

  return (
    <Link
      to={targetUrl}
      className="group relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:shadow-elev focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-muted/30">
        {img ? (
          <img
            src={img}
            alt={`${name} product visual`}
            loading="lazy"
            width={1280}
            height={768}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy ring-1 ring-black/5 backdrop-blur-md shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span className="truncate">{category}</span>
        </div>

        <div className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white text-navy ring-1 ring-black/5 shadow-md">
          {logo ? (
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="h-6 w-6 object-contain"
            />
          ) : (
            <span className="text-sm font-black">{name.charAt(0)}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-black leading-tight tracking-tight text-navy transition-colors duration-300 group-hover:text-accent">
              {name}
            </h3>
          </div>
        </div>
        <p className="text-[15px] leading-relaxed text-muted-foreground line-clamp-2">
          {t(lang, desc, descEn || desc)}
        </p>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent/5 px-3 py-2 text-[13px] font-semibold text-navy border border-accent/10">
            <BadgeCheck className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
            <span className="line-clamp-1">
              {t(lang, "ตัวแทนจำหน่ายทางการ", "Authorized distributor")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
            <span className="text-[13px] font-semibold text-muted-foreground/80">
              {t(lang, "พร้อมให้คำปรึกษา", "Sales support")}
            </span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-accent transition-colors">
              {t(lang, "ดูสินค้า", "View products")}
              <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
