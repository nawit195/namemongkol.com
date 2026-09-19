import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  speed?: number; // seconds per loop
  className?: string;
  fade?: boolean;
  pauseOnHover?: boolean;
  stepped?: boolean;
};

export function Marquee({
  children,
  speed = 40,
  className,
  fade = true,
  pauseOnHover = true,
  stepped = false,
}: Props) {
  return (
    <div
      className={cn("marquee group relative overflow-hidden", fade && "marquee-fade", className)}
    >
      <div
        className={cn(
          "flex w-max gap-4 md:gap-12 will-change-transform",
          stepped ? "marquee-track-stepped" : "marquee-track",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex items-center gap-4 md:gap-12 shrink-0">{children}</div>
        <div className="flex items-center gap-4 md:gap-12 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
