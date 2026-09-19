import { Breadcrumb } from "./Breadcrumb";

export function PageHeader({
  eyebrow,
  title,
  desc,
  breadcrumbs,
  bgImage,
  variant = "default",
  compact = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  breadcrumbs?: { label: string; href?: string }[];
  bgImage?: string;
  variant?: "default" | "clean" | "light";
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const clean = variant === "clean";
  const light = variant === "light";
  return (
    <section
      className={`relative overflow-hidden border-b border-border ${
        light ? "bg-white" : clean ? "bg-white" : bgImage ? "bg-navy" : "bg-gradient-subtle"
      }`}
    >
      {light ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(1_0_0)_0%,oklch(0.992_0.004_250)_48%,oklch(0.96_0.018_238)_100%)]" />
          {bgImage && (
            <div className="absolute inset-y-0 right-0 w-full opacity-20 [-webkit-mask-image:linear-gradient(to_left,black_25%,transparent_82%)] [mask-image:linear-gradient(to_left,black_25%,transparent_82%)] sm:opacity-25 md:w-[72%] md:opacity-35 lg:w-[58%] lg:opacity-70 lg:[-webkit-mask-image:linear-gradient(to_left,black_44%,transparent_100%)] lg:[mask-image:linear-gradient(to_left,black_44%,transparent_100%)]">
              <img
                src={bgImage}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover object-center saturate-[0.82]"
                loading="eager"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70 md:via-white/88 md:to-white/35 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </>
      ) : clean ? (
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      ) : bgImage ? (
        <>
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
          <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 dot-pattern opacity-60 pointer-events-none" />
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
        </>
      )}
      <div
        className={`relative mx-auto min-w-0 max-w-7xl px-4 md:px-6 ${
          compact
            ? "py-4 sm:py-6"
            : light
              ? "py-10 sm:py-14 md:py-16 lg:py-20"
              : clean
                ? "py-8 sm:py-10 md:py-14"
                : "py-10 sm:py-14 md:py-20"
        }`}
      >
        {breadcrumbs && (
          <div
            className={`mb-6 ${
              bgImage && !clean && !light
                ? "[&_*]:!text-white [&_a]:!text-white/90 [&_a:hover]:!text-cyan [&_a:hover]:underline [&_span.font-semibold]:!text-white [&_svg]:!text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                : ""
            }`}
          >
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        {eyebrow && (
          <div
            className={`mb-4 inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase leading-snug tracking-[0.14em] ${
              light
                ? "bg-white/85 text-accent ring-1 ring-accent/20 shadow-[0_1px_8px_oklch(0.205_0.075_258_/_0.06)]"
                : bgImage && !clean
                ? "bg-accent/20 ring-1 ring-accent/40 text-accent"
                : "bg-secondary text-primary ring-1 ring-border"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="min-w-0 break-words">{eyebrow}</span>
          </div>
        )}
        <h1
          className={`max-w-4xl break-words text-[28px] font-bold leading-tight tracking-tight text-balance sm:text-3xl md:text-5xl lg:text-6xl ${
            bgImage && !clean && !light ? "text-white drop-shadow-lg" : "text-primary"
          }`}
        >
          {title}
        </h1>
        {desc && (
          <p
            className={`mt-4 max-w-3xl break-words text-sm leading-relaxed text-pretty sm:mt-5 sm:text-base md:text-lg ${
              bgImage && !clean && !light
                ? "text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
                : light
                  ? "text-foreground/75"
                  : "text-muted-foreground"
            }`}
          >
            {desc}
          </p>
        )}
        {children && <div className={compact ? "mt-4 md:mt-5" : "mt-6 md:mt-8"}>{children}</div>}
      </div>
    </section>
  );
}
