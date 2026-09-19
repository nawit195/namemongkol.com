import { Link } from "@tanstack/react-router";
import { Calendar, Clock, ArrowUpRight, Eye } from "lucide-react";
import { articleCategories, type Article } from "@/data/articles";
import { articleImages } from "@/data/article-images";
import { articleContents } from "@/data/article-contents";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { useArticleViews, formatViews } from "@/lib/article-views";

type ArticleWithMeta = Article & {
  legacySlug?: string;
  titleEn?: string;
};

export function ArticleCard({ article }: { article: ArticleWithMeta }) {
  const { lang } = useLanguage();
  const { data: views } = useArticleViews();
  const viewCount = views?.[article.slug] ?? 0;
  const catObj = articleCategories.find((c) => c.slug === article.category);
  const cat = catObj
    ? t(lang, catObj.label, catObj.labelEn || catObj.label)
    : t(lang, "บทความ", "Article");
  const content =
    articleContents[article.legacySlug ?? article.slug] ?? articleContents[article.slug];
  const firstImg = content?.blocks.find((b) => b.t === "img") as
    | { t: "img"; src: string }
    | undefined;
  const img = article.coverImageUrl ?? firstImg?.src ?? articleImages[article.category];
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card hover-lift hover:border-accent/30 hover:shadow-elev transition-all"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-hero">
        {img && (
          <img
            src={img}
            alt={cat}
            loading="lazy"
            width={1280}
            height={720}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-navy/85 ring-1 ring-white/20 backdrop-blur px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white">
          {cat}
        </div>
      </div>
      <div className="flex-1 p-3 sm:p-5 flex flex-col">
        <h3 className="text-[13px] sm:text-[15px] font-bold text-primary leading-snug line-clamp-3 group-hover:text-accent transition-colors">
          {t(lang, article.title, article.titleEn || article.title)}
        </h3>
        <div className="mt-auto pt-3 sm:pt-5 flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {article.date}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readMin} {t(lang, "นาที", "min")}
            </span>
            <span className="inline-flex items-center gap-1" title={t(lang, "ยอดเข้าชม", "Views")}>
              <Eye className="h-3 w-3" />
              {formatViews(viewCount)}
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
