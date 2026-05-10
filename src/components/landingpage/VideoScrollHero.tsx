"use client";

import { useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────
const FRAME_COUNT  = 120;
const FRAME_PATH   = (n: number) => `/frames/frame${String(n).padStart(4, "0")}.jpg`;
const PX_PER_FRAME = 14;

// ── Slide data ─────────────────────────────────────────────────────────────────
const SLIDES_DATA = [
  { line1: "Todo bajo",  accent: "control", subtitle: "Reservas, finanzas y equipo en un solo lugar",       start: -0.10, end: 0.28, phoneZoom: false },
  { line1: "Más tiempo", accent: "para ti", subtitle: "Automatiza la gestión y céntrate en lo que importa", start: 0.18,  end: 0.50, phoneZoom: false },
  { line1: "Listo para", accent: "crecer",  subtitle: "Únete a los negocios que ya confían en Businext",    start: 0.54,  end: 0.92, phoneZoom: true  },
];

// ── Animation positions (vh from bottom) ──────────────────────────────────────
const POS_IN         = -14; // off-screen below viewport
const POS2           = 40;  // center — large
const POS3           = 98;  // exit — top
const PHONE_CENTER   = 46;  // iPhone screen center (vh from bottom)

// ── Easing functions ───────────────────────────────────────────────────────────
const clamp       = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp        = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutExpo = (t: number) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeInOut   = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const easeOutBack = (t: number) => { const c = 1.70158; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2); };

// ──────────────────────────────────────────────────────────────────────────────

export function VideoScrollHero() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const [loadPct,   setLoadPct]   = useState(0);
  const [mounted,   setMounted]   = useState(false);

  const sectionRef         = useRef<HTMLDivElement>(null);
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const framesRef          = useRef<HTMLImageElement[]>([]);
  const currentFrame       = useRef(0);
  const targetFrame        = useRef(0);
  const rafId              = useRef<number>(0);
  const mountedRef         = useRef(false);
  const innerWidthRef      = useRef(0);
  const progressBarRef     = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const vignetteCloseRef   = useRef<HTMLDivElement>(null);
  const blackRef           = useRef<HTMLDivElement>(null);
  const ctaRef             = useRef<HTMLDivElement>(null);
  const touchStartY        = useRef(0);
  const rafTouch           = useRef<number>(0);

  // Container ref per slide — animates h1+p as a unit
  const slideRefs = useRef<Array<{ container: HTMLDivElement | null }>>(
    SLIDES_DATA.map(() => ({ container: null }))
  );

  // ── Detect desktop ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth > 1024);
      innerWidthRef.current = window.innerWidth;
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(onResize, 150));
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Mobile canvas animation ────────────────────────────────────────────────
  useEffect(() => {
    if (isDesktop) return;

    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d")!;

    const setVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
      innerWidthRef.current = window.innerWidth;
    };
    setVH();

    section.style.height = `${window.innerHeight + FRAME_COUNT * PX_PER_FRAME}px`;

    // Load frames
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loadedCount++;
        setLoadPct(Math.round((loadedCount / FRAME_COUNT) * 100));
        if (loadedCount === FRAME_COUNT) {
          framesRef.current = images;
          canvas.width  = images[0].naturalWidth;
          canvas.height = images[0].naturalHeight;
          ctx.drawImage(images[0], 0, 0);
          setLoaded(true);
          setTimeout(() => { mountedRef.current = true; setMounted(true); }, 100);
        }
      };
      images.push(img);
    }

    let visible = true;
    const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    observer.observe(section);

    // ── Animate slides ─────────────────────────────────────────────────────────
    // MAX = 1.0 → text always renders at native CSS size, never stretched = no blur
    const animateSlides = (progress: number) => {
      const vw = innerWidthRef.current;

      SLIDES_DATA.forEach((slide, i) => {
        const el = slideRefs.current[i].container;
        if (!el) return;

        const raw = (progress - slide.start) / (slide.end - slide.start);
        if (raw < -0.02 || raw > 1.02) { el.style.opacity = "0"; return; }
        const p = clamp(raw, 0, 1);

        // ── Phone zoom — slide 3 ─────────────────────────────────────────────
        if (slide.phoneZoom) {
          let sc: number, bot: number, op: number, blur: number;

          if (p < 0.28) {
            // Slower entry: spreads over 28% of range
            const t = easeOutExpo(p / 0.28);
            sc   = lerp(0.04, 1.0, t);
            bot  = lerp(PHONE_CENTER, POS2, t);
            op   = clamp((p / 0.28) * 6, 0, 1);
            blur = lerp(10, 0, t);
          } else if (p < 0.72) {
            sc = 1.0; bot = POS2; op = 1; blur = 0;
          } else if (p < 0.90) {
            // Slower exit: spreads over 18% of range
            const t = easeInOut((p - 0.72) / 0.18);
            sc = 1.0; bot = POS2; op = 1 - t; blur = 0;
          } else {
            sc = 1.0; bot = POS2; op = 0; blur = 0;
          }

          el.style.bottom          = `${bot}vh`;
          el.style.left            = "50%";
          el.style.transform       = `translateX(-50%) scale(${sc}) translateZ(0)`;
          el.style.transformOrigin = "center bottom";
          el.style.opacity         = String(op);
          el.style.filter          = blur > 0 ? `blur(${blur}px)` : "none";
          el.style.textAlign       = "center";
          return;
        }

        // ── Standard slides 1 & 2 ────────────────────────────────────────────
        let sc: number, bot: number, op: number, cx: number;

        if (p < 0.26) {
          // Slower entry: spreads over 26% of range, starts at 0.84 (barely scaled)
          const t = easeOutExpo(p / 0.26);
          sc = lerp(0.84, 1.0, t); bot = lerp(POS_IN, POS2, t);
          op = clamp((p / 0.26) * 4, 0, 1); cx = t;
        } else if (p < 0.70) {
          sc = 1.0; bot = POS2; op = 1; cx = 1;
        } else if (p < 0.88) {
          // Slower exit: spreads over 18% of range, subtle scale-down
          const t = easeInOut((p - 0.70) / 0.18);
          sc = lerp(1.0, 0.90, t); bot = lerp(POS2, POS3, t); op = 1 - t; cx = 1 - t;
        } else {
          sc = 0.90; bot = POS3; op = 0; cx = 0;
        }

        const startLeft  = Math.max(24, vw * 0.05);
        const scaledW    = el.offsetWidth * sc;
        const centerLeft = Math.max(startLeft, (vw - scaledW) / 2);
        const leftPx     = lerp(startLeft, centerLeft, cx);

        el.style.bottom          = `${bot}vh`;
        el.style.left            = `${leftPx}px`;
        el.style.transform       = `scale(${sc}) translateZ(0)`;
        el.style.transformOrigin = "left bottom";
        el.style.opacity         = String(op);
        el.style.filter          = "none";
        el.style.textAlign       = "left";
      });
    };

    // ── Finale ────────────────────────────────────────────────────────────────
    const animateFinale = (progress: number) => {
      const vc = vignetteCloseRef.current;
      const bl = blackRef.current;
      if (!vc || !bl) return;

      if (progress >= 0.86) {
        const t  = clamp((progress - 0.86) / 0.11, 0, 1);
        const e  = easeInOut(t);
        const r  = Math.max(0, 80 - e * 86);
        vc.style.background = `radial-gradient(circle ${r}% at 50% 65%, transparent 40%, rgba(0,0,0,${0.35 + e * 0.65}) 100%)`;
        vc.style.opacity    = String(Math.min(t * 4, 1));
      } else {
        vc.style.opacity = "0";
      }

      if (progress >= 0.93) {
        const t = easeInOut(clamp((progress - 0.93) / 0.04, 0, 1));
        bl.style.opacity = String(t * t);
      } else {
        bl.style.opacity = "0";
      }
    };

    // ── RAF loop ───────────────────────────────────────────────────────────────
    const tick = () => {
      if (!visible) { rafId.current = requestAnimationFrame(tick); return; }

      const diff  = targetFrame.current - currentFrame.current;
      const lerpF = "ontouchstart" in window ? 0.16 : 0.14;

      if (Math.abs(diff) > 0.05) {
        currentFrame.current += diff * lerpF;
        const idx = clamp(Math.round(currentFrame.current), 0, FRAME_COUNT - 1);
        if (framesRef.current[idx]) ctx.drawImage(framesRef.current[idx], 0, 0);
      }

      const progress = currentFrame.current / FRAME_COUNT;

      if (progressBarRef.current)
        progressBarRef.current.style.width = `${progress * 100}%`;

      if (scrollIndicatorRef.current)
        scrollIndicatorRef.current.style.opacity = progress > 0.06 ? "0" : "1";

      if (ctaRef.current) {
        const show = mountedRef.current && progress < 0.08;
        ctaRef.current.style.opacity       = show ? "1" : "0";
        ctaRef.current.style.pointerEvents = show ? "auto" : "none";
      }

      animateSlides(progress);
      animateFinale(progress);

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    // ── Scroll ────────────────────────────────────────────────────────────────
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      targetFrame.current = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1) * (FRAME_COUNT - 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Touch with inertia ────────────────────────────────────────────────────
    let touchVelocity = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      cancelAnimationFrame(rafTouch.current);
      touchVelocity = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const p     = currentFrame.current / FRAME_COUNT;
      const delta = touchStartY.current - e.touches[0].clientY;
      if (delta > 0 && p >= 0.97) return;
      if (delta < 0 && p <= 0.01) return;
      e.preventDefault();
      touchVelocity = clamp(delta * 0.4, -60, 60);
      window.scrollBy({ top: touchVelocity, behavior: "instant" as ScrollBehavior });
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      const apply = () => {
        if (Math.abs(touchVelocity) < 0.5) { touchVelocity = 0; return; }
        window.scrollBy({ top: touchVelocity, behavior: "instant" as ScrollBehavior });
        touchVelocity *= 0.74;
        rafTouch.current = requestAnimationFrame(apply);
      };
      rafTouch.current = requestAnimationFrame(apply);
    };

    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchmove",  onTouchMove,  { passive: false });
    section.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      cancelAnimationFrame(rafTouch.current);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchmove",  onTouchMove);
      section.removeEventListener("touchend",   onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  // ── Desktop ────────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#0f172a" }}>
        <img src="/hero app.jpeg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 100%" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(7,8,15,0.75) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: "linear-gradient(to top, #0f172a, transparent)" }} />
        <div style={{ position: "absolute", bottom: "clamp(140px, 18vh, 200px)", left: "clamp(24px, 5vw, 90px)", zIndex: 5, animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
          <h1 style={{ margin: 0, color: "#f8fafc", fontFamily: "var(--font-heading), system-ui, sans-serif", fontSize: "clamp(2.6rem, 4vw, 4.5rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.03em", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            <span style={{ display: "block", marginBottom: "0.08em" }}>Todo bajo</span>
            <span style={{ display: "block", background: "linear-gradient(to right, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>control</span>
          </h1>
          <p style={{ margin: "clamp(0.75rem, 1.5vh, 1.1rem) 0 0", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans), system-ui, sans-serif", fontSize: "clamp(1rem, 1.4vw, 1.2rem)", lineHeight: 1.4, letterSpacing: "-0.01em", maxWidth: 440 }}>
            Reservas, finanzas y equipo en un solo lugar
          </p>
        </div>
        <div style={{ position: "absolute", bottom: "clamp(40px, 8vh, 100px)", left: "clamp(24px, 5vw, 90px)", animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s both", zIndex: 5 }}>
          <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(to right, #3b82f6, #a78bfa)", color: "#f8fafc", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 24px rgba(99,102,241,0.35)" }}>
            Comienza ahora
          </a>
        </div>
      </section>
    );
  }

  // ── Mobile / Tablet ────────────────────────────────────────────────────────
  return (
    <div ref={sectionRef} style={{ position: "relative", width: "100%", minHeight: "100vh", background: "#07080f" }}>
      <div style={{ position: "sticky", top: 0, width: "100%", height: "100vh", height: "calc(var(--vh, 1vh) * 100)", overflow: "clip" } as React.CSSProperties}>

        {/* Loading */}
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#07080f", zIndex: 30, gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#b0bec5", fontSize: 13 }}>Cargando... {loadPct}%</span>
          </div>
        )}

        {/* Canvas */}
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease" }} />

        {/* Vignettes */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none", zIndex: 2 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: "linear-gradient(to top, #07080f, transparent)", pointerEvents: "none", zIndex: 2 }} />

        {/* ── Scroll indicator — TOP ── */}
        <div
          ref={scrollIndicatorRef}
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "bounceY 1.6s ease-in-out infinite" }}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          <span style={{ color: "#3b82f6", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>scroll</span>
        </div>

        {/* ── 3 Text slides — each is one animated container ── */}
        {SLIDES_DATA.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { slideRefs.current[i].container = el; }}
            style={{
              position: "absolute",
              left: "clamp(24px, 5vw, 90px)",
              bottom: "7vh",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden" as const,
              opacity: 0,
              pointerEvents: "none",
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <h1 style={{
              margin: 0,
              color: "#f8fafc",
              fontFamily: "var(--font-heading), system-ui, sans-serif",
              fontSize: "clamp(2.8rem, 10vw, 5.8rem)",
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              WebkitFontSmoothing: "antialiased" as const,
              MozOsxFontSmoothing: "grayscale" as const,
              whiteSpace: "nowrap",
            }}>
              <span style={{ display: "block", marginBottom: "0.1em" }}>{slide.line1}</span>
              <span style={{
                display: "block",
                background: "linear-gradient(to right, #3b82f6, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{slide.accent}</span>
            </h1>
            <p style={{
              margin: "clamp(0.65rem, 1.8vh, 1.1rem) 0 0",
              color: "rgba(255,255,255,0.72)",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontSize: "clamp(0.95rem, 3.8vw, 1.15rem)",
              fontWeight: 400,
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
              maxWidth: "min(340px, 76vw)",
              WebkitFontSmoothing: "antialiased" as const,
              MozOsxFontSmoothing: "grayscale" as const,
              whiteSpace: "normal",
            }}>
              {slide.subtitle}
            </p>
          </div>
        ))}

        {/* CTA */}
        <div ref={ctaRef} style={{ position: "absolute", bottom: "clamp(80px, 10vh, 120px)", left: "50%", transform: "translateX(-50%)", opacity: 0, transition: "opacity 0.4s ease", pointerEvents: "none", zIndex: 10 }}>
          <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(to right, #3b82f6, #a78bfa)", color: "#f8fafc", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 24px rgba(99,102,241,0.35)" }}>
            Comienza ahora
          </a>
        </div>

        {/* Iris close */}
        <div ref={vignetteCloseRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", zIndex: 15 }} />

        {/* Black fade */}
        <div ref={blackRef} style={{ position: "absolute", inset: 0, background: "#000", opacity: 0, pointerEvents: "none", zIndex: 16 }} />

        {/* Progress bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.07)", zIndex: 20 }}>
          <div ref={progressBarRef} style={{ height: "100%", width: "0%", background: "linear-gradient(to right, #3b82f6, #a78bfa)", transition: "none" }} />
        </div>
      </div>
    </div>
  );
}
