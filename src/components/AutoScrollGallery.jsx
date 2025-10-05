// src/components/AutoScrollGallery.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Auto-scrolling, seamless (infinite) gallery tuned for PORTRAIT images.
 *
 * Props:
 *  - images: (string[] | { src, alt?, href? }[])
 *  - speed: number (px/sec) default 60
 *  - gap: number (px) default 12
 *  - borderColor: string (CSS color) default "#ddd"
 *  - pauseOnHover: boolean default true
 *  - showControls: boolean default true  // prev/next buttons
 *  - itemWidthClasses: string Tailwind width classes for cards
 *      default "w-[180px] sm:w-[200px] md:w-[240px]"
 */
export default function AutoScrollGallery({
  images = [],
  speed = 60,
  gap = 12,
  borderColor = "#ddd",
  pauseOnHover = true,
  showControls = true,
  itemWidthClasses = "w-[180px] sm:w-[200px] md:w-[240px]",
}) {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Normalize to objects so both strings and {src,alt} work
  const safeImages = useMemo(() => {
    const list = Array.isArray(images) ? images : [];
    return list
      .filter(Boolean)
      .map((img) => (typeof img === "string" ? { src: img } : img));
  }, [images]);

  const hasLoop = safeImages.length >= 2;
  // Duplicate list (A + A) for seamless wrap
  const track = useMemo(
    () => (hasLoop ? [...safeImages, ...safeImages] : safeImages),
    [hasLoop, safeImages]
  );

  // Auto-scroll ticker with wrap
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasLoop) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let rafId;
    let prev = performance.now();

    const step = (ts) => {
      const dt = Math.min(ts - prev, 50); // clamp big tab-switch jumps
      prev = ts;

      if (!isPaused) {
        const pxPerMs = speed / 1000;
        el.scrollLeft += pxPerMs * dt;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half; // seamless reset
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    // Keep scrollLeft modulo half-width on layout changes
    const onResize = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) el.scrollLeft = el.scrollLeft % half;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [hasLoop, speed, isPaused]);

  // Pause autoplay when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Pause when not visible
          if (!entry.isIntersecting) setIsPaused(true);
        });
      },
      { threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Click arrows: scroll by exactly one card width (+ margins)
  const scrollByOneCard = (dir = 1) => {
    const el = containerRef.current;
    if (!el) return;
    const firstCard = el.querySelector("[data-card]");
    if (!firstCard) return;
    const rect = firstCard.getBoundingClientRect();
    const style = window.getComputedStyle(firstCard);
    const marginX =
      parseFloat(style.marginLeft || "0") + parseFloat(style.marginRight || "0");
    const delta = dir * (rect.width + marginX);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const gapStyle = { gap: `${gap}px` };

  return (
    <div
      className="relative mt-6 select-none"
      role="region"
      aria-label="Project gallery"
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="overflow-x-scroll rounded-xl [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Track */}
        <div className="flex items-center p-2" style={gapStyle}>
          {track.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              data-card
              className={`shrink-0 ${itemWidthClasses}`}
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white shadow">
                {img.href ? (
                  <a
                    href={img.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block h-full w-full"
                  >
                    <img
                      src={img.src}
                      alt={img.alt ?? ""}
                      loading={i < safeImages.length ? "eager" : "lazy"}
                      decoding="async"
                      draggable="false"
                      className="h-full w-full object-cover"
                    />
                  </a>
                ) : (
                  <img
                    src={img.src}
                    alt={img.alt ?? ""}
                    loading={i < safeImages.length ? "eager" : "lazy"}
                    decoding="async"
                    draggable="false"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls (optional) */}
      {showControls && hasLoop && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByOneCard(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full backdrop-blur bg-white/70 hover:bg-white shadow"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByOneCard(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full backdrop-blur bg-white/70 hover:bg-white shadow"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
