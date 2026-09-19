import { useState, useRef, useEffect, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function LazyImage({ className, onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <img
      ref={imgRef}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={cn("lazy-img", loaded && "is-loaded", className)}
    />
  );
}
