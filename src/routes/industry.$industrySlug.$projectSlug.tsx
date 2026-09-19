import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Images } from "lucide-react";
import { CTASection } from "@/components/site/CTASection";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { loadIndustryDetailContent } from "@/lib/content/site";
import { loadPublishedProject } from "@/lib/content/projects";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/industry/$industrySlug/$projectSlug")({
  loader: async ({ params }) => {
    const [industry, projectResult] = await Promise.all([
      loadIndustryDetailContent(params.industrySlug),
      loadPublishedProject(params.industrySlug, params.projectSlug),
    ]);
    if (!industry || !projectResult.project) throw notFound();
    return { industry, project: projectResult.project };
  },
  head: ({ loaderData, params }) => {
    const project = loaderData?.project;
    return buildSeoHead({
      title: project ? `${project.title} | Matrix Intertrade` : "Project | Matrix Intertrade",
      description: project?.excerpt || "ผลงานติดตั้งระบบภาพและเสียงโดย Matrix Intertrade",
      path: `/industry/${params.industrySlug}/${params.projectSlug}`,
      image: project?.coverImageUrl,
    });
  },
  component: ProjectDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-primary">ไม่พบผลงานนี้</h1>
      <p className="mt-3 text-muted-foreground">ผลงานอาจถูกซ่อน ย้ายตำแหน่ง หรือ URL ไม่ถูกต้อง</p>
      <Link to="/brands" className="mt-6 inline-flex font-semibold text-accent hover:underline">
        กลับไปหน้าผลงาน
      </Link>
    </div>
  ),
});

function ProjectDetailPage() {
  const { industry, project } = Route.useLoaderData();
  const { lang } = useLanguage();
  const gallery = project.galleryImages.filter((image) => image.url !== project.coverImageUrl);

  return (
    <>
      <main>
        <header className="border-b border-border bg-gradient-to-b from-primary/[0.06] to-background pt-28 pb-10 md:pt-36 md:pb-14">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            >
              <Link to="/brands" className="transition-colors hover:text-accent">
                {t(lang, "ผลงาน", "Projects")}
              </Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link
                to="/industry/$slug"
                params={{ slug: industry.slug }}
                className="transition-colors hover:text-accent"
              >
                {t(lang, industry.title, industry.titleEn)}
              </Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-foreground">{project.title}</span>
            </nav>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Project
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-primary md:text-5xl">
              {project.title}
            </h1>
            {project.excerpt && (
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {project.excerpt}
              </p>
            )}
          </div>
        </header>

        <section className="py-10 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            {project.coverImageUrl && (
              <figure className="overflow-hidden rounded-2xl border border-border bg-muted shadow-elev md:rounded-3xl">
                <img
                  src={project.coverImageUrl}
                  alt={project.title}
                  width={1600}
                  height={1000}
                  className="aspect-[16/9] w-full object-cover"
                />
              </figure>
            )}

            {project.contentHtml && (
              <article
                className="prose prose-slate mx-auto mt-12 max-w-3xl prose-headings:text-primary prose-a:text-accent md:mt-16"
                dangerouslySetInnerHTML={{ __html: project.contentHtml }}
              />
            )}

            {gallery.length > 0 && (
              <section className="mt-14 md:mt-20" aria-labelledby="project-gallery-heading">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Images className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      Gallery
                    </p>
                    <h2 id="project-gallery-heading" className="text-2xl font-bold text-primary">
                      {t(lang, "ภาพผลงานเพิ่มเติม", "More project images")}
                    </h2>
                  </div>
                </div>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {gallery.map((image, index) => (
                    <figure
                      key={image.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${project.title} ภาพที่ ${index + 1}`}
                        loading="lazy"
                        width={1200}
                        height={800}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      {image.caption && (
                        <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                          {image.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 border-t border-border pt-7">
              <Link
                to="/industry/$slug"
                params={{ slug: industry.slug }}
                className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t(lang, "กลับไปดูผลงานในหมวดนี้", "Back to this project category")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <CTASection />
    </>
  );
}
