// src/App.jsx
import { useEffect, useMemo, useState, useRef } from "react";

// Pick one: "modern" | "rustic" | "bold"
const THEME = "bold";

const PALETTES = {
  modern: {
    name: "Modern Organic",
    // Cool greige / moss baseline (no pink-ish browns)
    pageBgFrom: "#F3F5F2",
    pageBgTo: "#E9EFE9",
    sectionLight: "#F6F8F5",
    sectionMid: "#EEF2EC",
    sectionBrown: "#E3EAE1", // cool moss-gray instead of warm brown
    cardBg: "#FAFBF9",
    border: "#D2DACF",
    heading: "#1E5630", // deep forest green
    body: "#2F2419",   // warm charcoal (legible)
    muted: "#42503F",  // olive-gray body secondary
    accent: "#1E5630",
    accentHover: "#184926",
    accentBright: "#7FA37F" // sage pop
  },
  rustic: {
    name: "Rustic & Grounded",
    // Earthy but cooler neutrals; no throw-up pink
    pageBgFrom: "#F2F2EF",
    pageBgTo: "#E6E7E2",
    sectionLight: "#F2F2EF",
    sectionMid: "#E8EAE5",
    sectionBrown: "#D9DFD6", // cool sage-stone
    cardBg: "#F5F6F3",
    border: "#CCD3C7",
    heading: "#2F3B2F", // dark olive
    body: "#2F2419",
    muted: "#465247",
    accent: "#2F3B2F",
    accentHover: "#243026",
    accentBright: "#7FA37F"
  },
  bold: {
    name: "Bold & Fresh",
    // Forest-to-soft-green gradient base
    pageBgFrom: "#1E5630",
    pageBgTo: "#E9EFE9",
    sectionLight: "#F3F7F3",
    sectionMid: "#E2EEE4",
    sectionBrown: "#2C2520", // your preferred sage as an alt section
    cardBg: "#FFFFFFE6", // translucent white over soft green
    border: "#C7E0CF",
    heading: "#0F3A22",
    body: "#2F2419",
    muted: "#3E4A3E",
    accent: "#1E5630",
    accentHover: "#184926",
    accentBright: "#9AD3A2" // a touch brighter than 81C784
  }
};

function useParallaxRelative(speed = 0.25, containerRef) {
  const bgRef = useRef(null);

  useEffect(() => {
    const bg = bgRef.current;
    const container = containerRef?.current || bg?.parentElement;
    if (!bg || !container) return;

    let raf = 0;
    let lastY = -1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Precompute the container's page offset
    const getContainerTop = () =>
      container.getBoundingClientRect().top + window.scrollY;

    let containerTop = getContainerTop();

    const onScroll = () => {
      if (reduced) return;
      const y = window.scrollY || 0;
      if (y === lastY) return;
      lastY = y;

      raf ||= requestAnimationFrame(() => {
        // distance scrolled past the top of this container
        const localY = y - containerTop;
        // Move a bit up (negative) as you scroll down
        const offset = localY * speed;
        bg.style.transform = `translateY(${offset}px) scale(1.05)`;
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, containerRef]);

  return bgRef;
}

export default function App() {
  const palette = PALETTES[THEME];

  const sections = useMemo(() => [
    { id: "services", label: "Services" },
    { id: "process", label: "Process" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ], []);

  const [active, setActive] = useState("services");

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  const navLink = (id) => {
    const base = "px-3 py-2 rounded-md transition-colors";
    const activeCls = {
      backgroundColor: hexWithAlpha(palette.accent, 0.12),
      color: palette.accent
    };
    const hoverCls = { backgroundColor: hexWithAlpha(palette.accent, 0.08) };
    return { className: base, style: active === id ? activeCls : hoverCls };
  };

    const heroRef = useParallaxRelative(0.25);
    const galleryRef = useParallaxRelative(0.18);

  return (
    <div
      className="min-h-dvh"
      style={{
        color: palette.body,
        background: `linear-gradient(180deg, ${palette.pageBgFrom}, ${palette.pageBgTo})`
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur border-b"
        style={{
          backgroundColor: hexWithAlpha(palette.sectionLight, 0.7),
          borderColor: palette.border
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#top" className="font-semibold tracking-wide flex items-center gap-2" style={{ color: palette.heading }}>
            <span className="inline-block w-2 h-6 rounded-sm" style={{ backgroundColor: palette.accent }} aria-hidden />
            Cheatham Arboriculture
          </a>
          <nav className="hidden md:flex gap-1 text-sm">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} {...navLink(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative">
        <div className="relative h-[58svh] md:h-[70svh] overflow-hidden">
          <div
            ref={heroRef}
            className="absolute inset-0 will-change-form bg-[url('https://newdayarborist.com/wp-content/uploads/2024/06/Arborist-climbing-tree.jpg')] bg-cover bg-top bg-fixed scale-105" 
            role="img"
            aria-label="Mature neighborhood trees"
          />
          {/* Soft overlay to harmonize with theme */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${hexWithAlpha(palette.pageBgFrom, 0.7)}, ${hexWithAlpha(palette.pageBgTo, 0.85)})`
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 -mt-28 md:-mt-36 relative pb-10">
          <div
            className="rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,.08)] p-6 md:p-10"
            style={{ backgroundColor: hexWithAlpha(palette.cardBg, 0.95), border: `1px solid ${palette.border}` }}
          >
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight" style={{ color: palette.heading }}>
              Welcome to Cheatham Arboriculture
            </h1>
            <p className="mt-3 max-w-3xl leading-relaxed" style={{ color: palette.muted }}>
              Here, trees are more than just our work - they're our passion. As proud members of the International Society of Arboriculture (ISA), we bring knowledge, skill, and care to every profect. Our licensed and insured team is dedicated to keepying your trees healthy, dafe, and beautiful while supporting long-term sustainability for our enviornment.
              <br></br>
              <br></br>We are a small, close-knit crew that treats every propety as if it were our own. 
              Whether it's precision pruning, safe tree removal, or planting the next generation of saplings, we approach each job with professionalism and respect for nature.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="tel:+13145360225"
                className="px-5 py-3 rounded-xl shadow hover:shadow-md transition-shadow"
                style={{ backgroundColor: palette.accent, color: "#FFFFFF" }}
              >
                Call / Text for Free Estimate
              </a>
              <a
                href="#contact"
                className="px-5 py-3 rounded-xl border hover:opacity-90"
                style={{ borderColor: palette.body, color: palette.body, backgroundColor: hexWithAlpha(palette.sectionLight, 0.8) }}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      <main id="main">
        {/* Services */}
        <section id="services" className="scroll-mt-28 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#FFFFFF" }}>Services</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[ 
                { t:"Tree Trimming & Pruning", d:"Encouraging healthy growth and enchancing safety." },
                { t:"Tree Removals & Brush Hauling", d:"Safe, efficient clearing with complete cleanup." },
                { t:"Storm Damage Cleanup", d:"Fast reliable response when you need it most." },
                { t:"Stump Grinding", d:"Removing hazard and making way for new growth." },
                { t:"Sapling Planting & Care", d:"Helping young trees thrive for years to come." },
              ].map((s) => (
                <div
                  key={s.t}
                  className="rounded-2xl p-6 shadow hover:shadow-md transition-shadow"
                  style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }}
                >
                  <h3 className="font-semibold" style={{ color: palette.body }}>{s.t}</h3>
                  <p className="mt-1" style={{ color: palette.muted }}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="scroll-mt-28 py-16" style={{ backgroundColor: palette.sectionBrown }}>
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#FFFFFF" }}>Our Approach</h2>
            
            <ol className="mt-6 space-y-8">
              {[
                { n: 1, t: "Assess", d: "On-site walk-through with an ISA-certified arborist." },
                { n: 2, t: "Plan", d: "Clear scope, price, and timeline before work begins." },
                { n: 3, t: "Perform & Clean", d: "Rigged removals, careful pruning, thorough cleanup." },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex items-start gap-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full font-bold grid place-items-center"
                    style={{ backgroundColor: palette.accent, color: "#FFFFFF" }}
                  >
                    {n}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>{t}</h3>
                    <p style={{ color: "#FFFFFF" }}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p style={{ color:"#FFFFFF" }}>
              <br></br>
              <i>“Our mission is simple: to care for trees and the people who live alongside them.”</i>
            </p>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery"
        className="scroll-mt-28 py-16 relative overflow-hidden"
        style={{ backgroundColor: palette.sectionLight }}>
          <div 
          ref={galleryRef}
          className="absolute inset-0 will-change-transform bg-[url('https://oregonforests.org/sites/default/files/2023-08/1.4.4_TreeBiology_0.jpg')] bg-cover bg-center"
          role='img'
          aria-label='tree trunk background'
          style={{ zIndex: 0, transform: "scale(1.05)"}}
          />
            <div
              className="absolute inset-0"
              style={{background: "linear-gradient(180deg, rgba(243,245,242,.75), rgba(233,239,233,.85)", zIndex:0}}
            />
            {/*Foreground content*/}
          <div className='relative max-w-7xl mx-auto px-4' style={{zIndex:1}}>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: palette.heading }}>Recent Work</h2>
            <GalleryCarousel
              images={[
                "https://imgs.search.brave.com/IukX1T1E-uguArvY1NMrAiNJDe307vdTm-bWRk8RYnM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9wZW9w/bGUtY3V0dGluZy1k/b3duLXRyZWVzLWNo/YWluc2F3LWVuZ2lu/ZS1wZW9wbGUtY3V0/dGluZy1kb3duLXRy/ZWVzLWNoYWluc2F3/LWVuZ2luZS0xMzc0/MDk0NzIuanBn",
                "https://imgs.search.brave.com/htY0aTkQq12h2cvPyqd33M0jU_18RrS736KCFCU-SVo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9jdXR0/aW5nLWRvd24tdHJl/ZXMtMjgwNzkzMjMu/anBn",
                "https://imgs.search.brave.com/4JUSlHBEM6fngR3f-I3fk1UR7_TO3fm72TF3eY0oxFo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvODI4/MDUwNzY0L3Bob3Rv/L21hbi11c2luZy1j/aGFpbnNhdy10by1j/dXQtbGltYi1mcm9t/LWRlYWQtb2FrLXRy/ZWUtbGFyZ2Utc2Vj/dGlvbi1mYWxscy10/by1ncm91bmQuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPWly/MFVOUFlqb2ZJWklX/WDY4azdHNzhmMEJv/bEVsdHdJZlFJdENM/Njd2ZjA9",
                "https://imgs.search.brave.com/dxu4rOLgFsZ7pHdy-46eBk5ZFU8i09b7mWEZoCsiCCU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE4/NzQyMDAxOC9waG90/by9yZWFyLXZpZXctb2YtYXJib3Jpc3QtbWVuLXdpdGgtY2hhaW5zYXctY3V0dGluZy1hLXRyZWUtcGxhbm5pbmcuanBnP3M9NjEyeDYxMiZ3PTAmaz0yMCZjPWVxYWtQY2ZnZVN3SG1rSmpYdm1fMDB6WW56UzlhS3JxLTVBSHZvUy1XSlU9",
                "https://imgs.search.brave.com/Hx3SmnQiNnfXSLytkBV_CD3ehK0kbpOZ-Fpk1eLDfX4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuYWR2YW50YWdldHJlZWNhcmUuY2Evd3AtY29udGVudC91cGxvYWRzLzIwMjIvMDUvV2hhdC1kby1hbi1hcmJvcmlzdC1kby5qcGc",
                "https://imgs.search.brave.com/7bik7gk8N3tJVQp259hqrjB1qADBc2fLP-75T--r43c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdDMuZGVwb3NpdHBob3Rvcy5jb20vMTEyNzc2MTYvMTY2OTcvaS80NTAvZGVwb3NpdHBob3Rvc18xNjY5NzY1Nzgtc3RvY2stcGhvdG8tYXJib3Jpc3QtYXQtd29yay5qcGc",
              ]}
              borderColor={palette.border}
            />
          </div>
        </section>

        {/* Free Estimate CTA */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between shadow"
              style={{
                background: `linear-gradient(135deg, ${palette.accent}, ${palette.accentBright})`,
                color: "#FFFFFF"
              }}
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold">Free on-site estimate in Greater Nashville</h3>
                <p className="mt-2 opacity-90">Small, local crew • ISA-Certified • Respect for your property</p>
              </div>
              <a
                href="tel:+13145360225"
                className="mt-4 md:mt-0 px-5 py-3 rounded-xl shadow hover:shadow-md transition-shadow"
                style={{ backgroundColor: "#FFFFFF", color: palette.body }}
              >
                Call / Text Now
              </a>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-28 py-16" style={{ backgroundColor: palette.sectionMid }}>
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: palette.heading }}>Contact</h2>
            <div className="mt-6 grid md:grid-cols-2 gap-8">
              <div className="rounded-xl p-6" style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }}>
                <p style={{ color: palette.muted }}>
                  Aaron Cheatham<br />
                  439 Capri Dr Unit B, Nashville, TN 37209<br />
                  <a className="underline" href="tel:+13145360225" style={{ color: palette.body }}>(314) 536-0225</a><br />
                  <a className="underline" href="mailto:aaron@cheathamtrees.com" style={{ color: palette.body }}>aaron@cheathamtrees.com</a><br />
                  <a className="underline" href="https://instagram.com/cheathamtrees" target="_blank" style={{ color: palette.body }}>instagram.com/cheathamtrees</a>
                </p>
              </div>
              <form name="contact" method="POST" data-netlify="true" className="rounded-xl p-6" style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }}>
                <input type="hidden" name="form-name" value="contact" />
                <h3 className="text-xl font-semibold" style={{ color: palette.body }}>Message</h3>
                <div className="mt-4 grid gap-3">
                  <input required name="name" placeholder="Your name" className="rounded-md px-3 py-2" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.sectionLight, color: palette.body }} />
                  <input required type="email" name="email" placeholder="Email" className="rounded-md px-3 py-2" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.sectionLight, color: palette.body }} />
                  <textarea required name="message" rows="5" placeholder="How can we help?" className="rounded-md px-3 py-2" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.sectionLight, color: palette.body }} />
                  <button className="mt-2 px-4 py-2 rounded-md text-white" style={{ backgroundColor: palette.accent }}>Send</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t" style={{ backgroundColor: palette.sectionLight, borderColor: palette.border }}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-sm" style={{ color: palette.muted }}>
          © {new Date().getFullYear()} Cheatham Arboriculture • Licensed & Insured • ISA Member
        </div>
      </footer>

      {/* Sticky ISA badge */}
      <a
        href="https://www.isa-arbor.com/"
        target="_blank" rel="noreferrer"
        aria-label="International Society of Arboriculture Member"
        className="fixed right-4 bottom-4 z-40"
      >
        <img src="/isa-badge.png" alt="ISA Member" className="w-16 h-16 md:w-20 md:h-20 drop-shadow" />
      </a>

      {/* Dev theme helper (optional): quickly toggle themes by editing THEME constant) */}
      <div className="fixed left-2 bottom-2 text-xs opacity-60 select-none" title={`Theme: ${palette.name}`}>Theme: {palette.name}</div>
    </div>
  );
}

// --- helpers
function hexWithAlpha(hex, alpha = 1) {
  // hex like #RRGGBB
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!res) return hex;
  const r = parseInt(res[1], 16);
  const g = parseInt(res[2], 16);
  const b = parseInt(res[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function GalleryCarousel({ images = [], borderColor = "#ddd" }) {
  const [index, setIndex] = useState(1);       // start at first real slide (after leading clone)
  const [isAnimating, setAnimating] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  // Build cloned edges for seamless loop
  const slides = useMemo(() => {
    if (!images.length) return [];
    return [images[images.length - 1], ...images, images[0]];
  }, [images]);

  // Autoplay
  useEffect(() => {
    if (paused || !slides.length) return;
    const id = setInterval(() => {
      setIndex((i) => i + 1);
      setAnimating(true);
    }, 3500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  // Handle transition end for infinite wrap
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onEnd = () => {
      if (index === slides.length - 1) {
        setAnimating(false);
        setIndex(1);
      } else if (index === 0) {
        setAnimating(false);
        setIndex(slides.length - 2);
      }
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [index, slides.length]);

  // Re-enable animation after a jump
  useEffect(() => {
    if (isAnimating) return;
    const id = requestAnimationFrame(() => setAnimating(true));
    return () => cancelAnimationFrame(id);
  }, [isAnimating]);

  const go = (dir) => {
    setAnimating(true);
    setIndex((i) => i + dir);
  };

  const realIndex =
    images.length ? (index - 1 + images.length) % images.length : 0;

  return (
    <div
      className="relative mt-6 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Project gallery"
    >
      {/* Track */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${index * (100 / slides.length)}%)`,
            transition: isAnimating
              ? "transform 600ms cubic-bezier(.22,.61,.36,1)"
              : "none",
          }}
        >
          {slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="w-full shrink-0"
              style={{ width: `${100 / slides.length}%` }}
            >
              <div className="h-64 md:h-80">
                <img
                  src={src}
                  alt="Project image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full backdrop-blur bg-white/70 hover:bg-white shadow"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full backdrop-blur bg-white/70 hover:bg-white shadow"
      >
        ›
      </button>

      {/* Dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i + 1);
              setAnimating(true);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor:
                i === realIndex ? "rgba(30,86,48,.9)" : "rgba(30,86,48,.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}