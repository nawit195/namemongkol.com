import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { SiteProject } from "@/lib/content/projects";

export function ProjectCard({ project }: { project: SiteProject }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elev">
      <Link
        to="/industry/$industrySlug/$projectSlug"
        params={{ industrySlug: project.industrySlug, projectSlug: project.slug }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {project.coverImageUrl ? (
            <img
              src={project.coverImageUrl}
              alt={project.title}
              loading="lazy"
              width={960}
              height={600}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/10 to-accent/15" />
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Project
              </p>
              <h3 className="mt-2 text-xl font-bold leading-snug text-primary">{project.title}</h3>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-primary transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          {project.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {project.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
