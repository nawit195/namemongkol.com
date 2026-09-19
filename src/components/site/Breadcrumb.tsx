import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav
      aria-label="breadcrumb"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] sm:text-sm font-medium text-muted-foreground"
    >
      <Link to="/" className="inline-flex items-center transition-colors hover:text-accent">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          {it.href && i < items.length - 1 ? (
            <Link
              to={it.href}
              className="underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              {it.label}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
