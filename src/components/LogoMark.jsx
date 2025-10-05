// src/components/LogoMark.jsx
import React, { useEffect, useRef } from "react";

export default function LogoMark({
  src = "images/cheatham-logo.svg",
  alt = "Cheatham Arboriculture",
  size = 120,
  imgClassName,
  parallax = 0.12,
  corner = "tl",
  popDuration = 1200,          // ms — make 1500 for extra slow
  popEasing = "cubic-bezier(.2,.8,.2,1)", // slower start, smooth finish
  scrim = true,
  scrimColor = "rgba(243,245,242,0.75)",
  scrimRing = "rgba(199,224,207,0.9)",
  offsetY = 0,
}) {
  const parallaxRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Page-load animation (on the ANIMATION wrapper only)
    if (!reduced && animRef.current) {
      // keep the class; 'both' fill-mode pins the final scale(1) with no jump
      animRef.current.classList.add("logo-anim");
    }

    // Parallax (on the PARALLAX wrapper only)
    const el = parallaxRef.current;
    if (!el || reduced) return;

    let raf = 0, lastY = -1;
    const container = el.closest("section") || el.parentElement;
    const getContainerTop = () =>
      container?.getBoundingClientRect().top + window.scrollY || 0;
    let containerTop = getContainerTop();

    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y === lastY) return;
      lastY = y;
      raf ||= requestAnimationFrame(() => {
        const localY = y - containerTop;
        const offset = localY * parallax;
        // Only parallax translateY here — no scale, no X translate
        el.style.transform = `translateY(${offsetY + offset}px)`;
        raf = 0;
      });
    };

    const onResize = () => {
      containerTop = getContainerTop();
      lastY = -1;
      onScroll();
    };

    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [parallax, offsetY]);

  const cornerClass =
    corner === "tr" ? "top-6 right-6" :
    corner === "bl" ? "bottom-6 left-6" :
    corner === "br" ? "bottom-6 right-6" :
    corner === "center" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :
    "top-6 left-6"; // tl default
  
  const imgProps = imgClassName
    ? { className: `relative z-10 drop-shadow-md pointer-events-none ${imgClassName}`}
    : {
        className: "relative z-10 drop-shadow-md pointer-events-none",
        style: typeof size === "string"
            ? {width: size, height: "auto"}
            : {width: `${size}px`, height: "auto"},
    };
  return (
    <>
      {/* Inline keyframes so you don't need Tailwind config changes */}
      <style>{`
      @keyframes logoPopScale {
        0%   { opacity: 0; transform: scale(.94); filter: blur(2px); }
        65%  { opacity: 1; transform: scale(1.04); filter: blur(0); }
        100% { opacity: 1; transform: scale(1); filter: blur(0); }
      }
      .logo-anim {
        animation-name: logoPopScale;
        animation-duration: ${popDuration}ms;
        animation-timing-function: ${popEasing};
        animation-fill-mode: both;
      }
      @media (prefers-reduced-motion: reduce) {
        .logo-anim { animation: none !important; }
      }
    `}</style>

    {/* Outer anchor: handles corners/center positioning */}
    <div className={`absolute ${cornerClass} z-20 select-none`} aria-hidden="true">
      {/* Parallax wrapper: ONLY translateY here */}
      <div ref={parallaxRef} style={{ willChange: "transform" }}>
        <div className="relative inline-block">
          {scrim && (
            <div
              className="absolute -inset-3 md:-inset-4 rounded-xl backdrop-blur-md"
              style={{
                backgroundColor: scrimColor,
                border: `1px solid ${scrimRing}`,
                boxShadow: "0 12px 30px rgba(0,0,0,.08)",
              }}
            />
          )}
          {/* Animation wrapper: ONLY opacity + scale here */}
          <div ref={animRef} className="relative">
            <img src={src} alt={alt} draggable={false} {...imgProps} />
          </div>
        </div>
      </div>
    </div>
  </>
);
}
