import { useEffect, useRef, useState, type ReactNode, type ElementType, type Ref } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "scale" | "slide";
  as?: ElementType;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  as = "div",
  once = true,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const Comp = as as ElementType;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  return (
    <Comp
      ref={ref as Ref<HTMLElement>}
      className={cn(
        variant === "scale" ? "reveal-scale" : variant === "slide" ? "reveal-slide" : "reveal",
        visible && "is-visible",
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Comp>
  );
}

export function RevealStagger({
  children,
  className,
  step = 90,
}: {
  children: ReactNode[];
  className?: string;
  step?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
