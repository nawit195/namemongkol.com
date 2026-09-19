import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  Lock,
  Mail,
  Phone,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/lib/content/use-site-content";
import { companyPhoneHref, formatThaiPhone } from "@/lib/company-profile";

type PreviewKind = "products" | "articles";
type PreviewItem = Record<string, unknown>;
type LoadState =
  | { status: "loading" }
  | { status: "ready"; item: PreviewItem; userEmail: string }
  | { status: "unauthorized"; message: string }
  | { status: "error"; message: string };

type ArticleBlock =
  | { t: "img"; src: string }
  | { t: "h2" | "h3" | "li" | "p"; text: string }
  | Record<string, unknown>;

export function DraftPreviewPage({ kind, slug }: { kind: PreviewKind; slug: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;

    async function loadPreview() {
      setState({ status: "loading" });
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        if (isCurrent) {
          setState({
            status: "unauthorized",
            message: "กรุณาเข้าสู่ระบบ Admin Panel ก่อนเปิดหน้า draft preview",
          });
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/content?previewKind=${kind}&previewId=${encodeURIComponent(slug)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            response.status === 401 || response.status === 403
              ? "Session หมดอายุ หรือบัญชีนี้ไม่มีสิทธิ์ดู draft preview"
              : payload.error || "ไม่สามารถโหลดข้อมูล preview ได้";
          if (isCurrent)
            setState({ status: response.status < 500 ? "unauthorized" : "error", message });
          return;
        }

        if (isCurrent) {
          setState({
            status: "ready",
            item: payload.item,
            userEmail: payload.userEmail || "",
          });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูล preview ได้",
          });
        }
      }
    }

    void loadPreview();

    return () => {
      isCurrent = false;
    };
  }, [kind, slug]);

  if (state.status === "loading") return <PreviewShell state={state} />;
  if (state.status === "unauthorized" || state.status === "error")
    return <PreviewShell state={state} />;

  return (
    <PreviewFrame
      kind={kind}
      item={state.item}
      userEmail={state.userEmail}
      publicHref={publicHrefFor(kind, state.item)}
    />
  );
}

function PreviewShell({ state }: { state: LoadState }) {
  const isLoading = state.status === "loading";
  const Icon = isLoading ? Loader2 : state.status === "error" ? AlertTriangle : Lock;

  return (
    <main className="min-h-screen bg-secondary/35 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Icon className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-primary">
          {isLoading ? "กำลังโหลด Draft preview" : "เปิด Preview ไม่ได้"}
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {isLoading ? "ระบบกำลังตรวจสอบสิทธิ์ผู้ดูแลและโหลดข้อมูลฉบับร่าง" : state.message}
        </p>
        {!isLoading && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <a href="/admin">กลับไป Admin Panel</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin-manual">เปิดคู่มือ</a>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function PreviewFrame({
  kind,
  item,
  userEmail,
  publicHref,
}: {
  kind: PreviewKind;
  item: PreviewItem;
  userEmail: string;
  publicHref: string;
}) {
  return (
    <main className="bg-background">
      <div className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-amber-600 text-white hover:bg-amber-600">Draft preview</Badge>
            <span className="text-sm font-medium text-amber-950">
              หน้านี้เห็นได้เฉพาะผู้ดูแลที่ล็อกอินอยู่ และแสดงข้อมูลที่บันทึกล่าสุด
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-900">
            {userEmail && <span>{userEmail}</span>}
            <Button asChild size="sm" variant="outline" className="h-8 bg-white">
              <a href="/admin">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                กลับ Admin
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-8 bg-white">
              <a href={publicHref} target="_blank" rel="noopener noreferrer">
                Public URL
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {kind === "products" ? (
        <ProductDraftPreview item={item} />
      ) : (
        <ArticleDraftPreview item={item} />
      )}
    </main>
  );
}

function ProductDraftPreview({ item }: { item: PreviewItem }) {
  const { companyProfile } = useSiteContent();
  const name = text(item.name) || "Untitled product";
  const brand = text(item.brand);
  const price = text(item.price_text);
  const image = browserImageUrl(item.image_url);
  const descriptionText = text(item.description_text);
  const descriptionHtml = text(item.description_html);
  const status = text(item.status) || "draft";

  return (
    <>
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{brand || "Product"}</Badge>
              <Badge
                variant="outline"
                className={
                  status === "draft"
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700"
                }
              >
                {status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold leading-tight text-primary md:text-5xl">{name}</h1>
            {descriptionText && (
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                {descriptionText}
              </p>
            )}
            <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-xs font-medium text-muted-foreground">ราคา</p>
              <p className="mt-1 text-2xl font-bold text-primary">{price || "ติดต่อสอบถามราคา"}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="/contactus">ขอใบเสนอราคา</a>
              </Button>
              <Button asChild variant="outline">
                <a href={companyPhoneHref(companyProfile.mobilePhone)}>
                  <Phone className="mr-2 h-4 w-4" />
                  {formatThaiPhone(companyProfile.mobilePhone)}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`mailto:${companyProfile.publicEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[1.12/1] overflow-hidden rounded-xl border border-border bg-secondary/50">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-contain p-6 md:p-10"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  No preview image
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {descriptionHtml && (
        <section className="bg-white py-10 md:py-14">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <h2 className="mb-6 text-2xl font-bold text-primary">รายละเอียดสินค้า</h2>
            <article
              className="product-detail-content min-w-0 leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </section>
      )}
    </>
  );
}

function ArticleDraftPreview({ item }: { item: PreviewItem }) {
  const title = text(item.title) || "Untitled article";
  const category = text(item.category);
  const excerpt = text(item.excerpt);
  const contentHtml = text(item.content_html);
  const blocks = useMemo(() => parseBlocks(item.blocks), [item.blocks]);
  const firstImage = blocks.find((block): block is { t: "img"; src: string } => {
    return block.t === "img" && typeof block.src === "string";
  });
  const coverImage = browserImageUrl(item.cover_image_url) || firstImage?.src || "";
  const status = text(item.status) || "draft";
  const date = text(item.published_date) || "ยังไม่ระบุวันที่";
  const readMin = text(item.read_min) || "0";

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          {coverImage ? (
            <img src={coverImage} alt={title} className="h-full w-full object-cover opacity-35" />
          ) : (
            <div className="h-full w-full bg-gradient-hero" />
          )}
          <div className="absolute inset-0 bg-primary/65" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-24">
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {category && (
              <Badge className="bg-white/12 text-white hover:bg-white/12">{category}</Badge>
            )}
            <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">{status}</Badge>
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
          {excerpt && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/82">{excerpt}</p>
          )}
        </div>
      </section>

      <article className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="mb-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readMin} นาทีในการอ่าน
            </span>
            {category && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                <Tag className="h-4 w-4" />
                {category}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5"
              title="Draft preview does not count views"
            >
              <Eye className="h-4 w-4" />
              preview
            </span>
          </div>

          {coverImage && (
            <div className="relative mb-10 aspect-square overflow-hidden rounded-2xl bg-secondary shadow-elev">
              <img
                src={coverImage}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none space-y-5 text-foreground/85 prose-headings:text-primary prose-a:text-accent prose-img:rounded-xl">
            {excerpt && <p className="text-xl font-medium text-foreground">{excerpt}</p>}
            {contentHtml ? (
              <div
                className="article-rich-text prose prose-lg max-w-none prose-img:aspect-square prose-img:object-cover prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:shadow-card prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              blocks
                .filter((block) => block !== firstImage)
                .map((block, index) => renderArticleBlock(block, `${index}`))
            )}
          </div>
        </div>
      </article>
    </>
  );
}

function renderArticleBlock(block: ArticleBlock, key: string) {
  if (block.t === "img" && typeof block.src === "string") {
    return <img key={key} src={block.src} alt="" loading="lazy" />;
  }
  if (block.t === "h2" && typeof block.text === "string") return <h2 key={key}>{block.text}</h2>;
  if (block.t === "h3" && typeof block.text === "string") return <h3 key={key}>{block.text}</h3>;
  if (block.t === "li" && typeof block.text === "string") return <li key={key}>{block.text}</li>;
  if ("text" in block && typeof block.text === "string") return <p key={key}>{block.text}</p>;
  return null;
}

function parseBlocks(value: unknown): ArticleBlock[] {
  if (Array.isArray(value)) return value as ArticleBlock[];
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as ArticleBlock[]) : [];
  } catch {
    return [];
  }
}

function publicHrefFor(kind: PreviewKind, item: PreviewItem) {
  const slug = text(item.slug) || text(kind === "products" ? item.product_id : item.article_id);
  return kind === "products" ? `/product/${slug}` : `/blog/${slug}`;
}

function browserImageUrl(value: unknown) {
  const url = text(value).trim();
  if (!url) return "";
  if (/^(https?:\/\/|\/|data:image\/|blob:)/i.test(url)) return url;
  return "";
}

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}
