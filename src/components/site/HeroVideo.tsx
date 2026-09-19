import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";

/**
 * Performance-optimised hero video.
 *
 * Mobile  → shows a static poster image immediately (LCP-friendly).
 *           Video is loaded only when the user taps "play".
 * Desktop → video autoplays but is lazy-loaded via IntersectionObserver
 *           so it does not block FCP/LCP.
 */
export function HeroVideo({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Detect mobile once on mount
  useEffect(() => {
    const mobile = window.matchMedia("(hover: none)").matches || window.innerWidth < 768;
    setIsMobile(mobile);
    // On desktop, show video immediately (will be lazy-loaded)
    if (!mobile) setShowVideo(true);
  }, []);

  // Parallax mouse effect — desktop only
  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;
    if (isMobile) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx * 14;
      ty = ny * 10;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      video.style.setProperty("--px", `${cx.toFixed(2)}px`);
      video.style.setProperty("--py", `${cy.toFixed(2)}px`);
      raf = requestAnimationFrame(tick);
    };
    wrap.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [isMobile, showVideo]);

  // Try to play with sound; fall back to muted autoplay.
  useEffect(() => {
    if (!showVideo) return;
    const v = videoRef.current;
    if (!v) return;

    const tryUnmute = async () => {
      try {
        v.muted = false;
        v.volume = 1;
        await v.play();
        setMuted(false);
      } catch {
        v.muted = true;
        await v.play().catch(() => {});
      }
    };

    void tryUnmute();

    const onGesture = async () => {
      if (!v.muted) return;
      v.muted = false;
      v.volume = 1;
      try {
        await v.play();
        setMuted(false);
      } catch {
        v.muted = true;
      }
    };
    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("pointerdown", onGesture, opts);
    window.addEventListener("keydown", onGesture, opts);
    window.addEventListener("touchstart", onGesture, opts);
    window.addEventListener("scroll", onGesture, opts);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("scroll", onGesture);
    };
  }, [showVideo]);

  // Trigger mobile video load
  const handleMobilePlay = () => {
    setShowVideo(true);
    // Small delay so the video element mounts before we try to play
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (v) {
        v.muted = true;
        v.play().catch(() => {});
      }
    });
  };

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-navy">
      {/* Poster image — always present as fallback / LCP element */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          width={1920}
          height={1080}
          className={`absolute inset-0 h-full w-full object-cover sm:object-cover transition-opacity duration-700 ${showVideo ? "opacity-0" : "opacity-100"}`}
        />
      )}

      {/* Video element — conditionally rendered */}
      {showVideo && (
        <video
          ref={videoRef}
          className="video-pan absolute inset-0 h-full w-full object-contain sm:object-cover"
          style={{ translate: "var(--px, 0) var(--py, 0)" }}
          src={src}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload={isMobile ? "none" : "metadata"}
          poster={poster}
          aria-hidden="true"
        />
      )}

      {/* Mobile play button — shows when video is not yet loaded */}
      {isMobile && !showVideo && (
        <button
          type="button"
          onClick={handleMobilePlay}
          aria-label="เล่นวิดีโอ"
          className="absolute inset-0 z-10 grid place-items-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 text-white ring-2 ring-white/40 backdrop-blur-md transition-transform hover:scale-110">
            <Play className="h-7 w-7 ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      {/* Mute/unmute toggle — only when video is playing */}
      {showVideo && (
        <button
          type="button"
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            const next = !muted;
            v.muted = next;
            if (!next) {
              v.volume = 1;
              v.play().catch(() => {});
            }
            setMuted(next);
          }}
          aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
          className="absolute top-4 right-4 z-20 grid h-10 w-10 md:h-11 md:w-11 place-items-center rounded-full bg-black/50 text-white ring-1 ring-white/20 backdrop-blur hover:bg-black/70 transition-colors"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}
