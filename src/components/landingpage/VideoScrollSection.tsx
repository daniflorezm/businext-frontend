"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// ── Easing ─────────────────────────────────────────────────────────────────────
const clamp       = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp        = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutExpo = (t: number) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeInOut   = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ScrollSlide {
  line1: string;
  accent: string;
  subtitle: string;
  start: number; // 0–1 progress range
  end: number;
  align?: "left" | "center";
  noBackground?: boolean; // removes glass panel and centers vertically
}

interface Props {
  framePath: (n: number) => string;
  frameCount: number;
  slides: ScrollSlide[];
  pxPerFrame?: number;
}

const POS_IN = -14;
const POS2   =  20;
const POS3   =  98;

// Fewer pixels per frame on narrow screens → shorter total scroll distance on mobile
const getPxPerFrame = (base: number) =>
  typeof window !== "undefined" && window.innerWidth < 768 ? Math.round(base * 0.65) : base;

// ── Desktop static feature icons ──────────────────────────────────────────────
const FEATURE_ICONS = [
  // Calendar — Reservas
  <svg key="cal" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></svg>,
  // Chart — Finanzas
  <svg key="fin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  // Star — Reseñas
  <svg key="star" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  // Sparkle — IA
  <svg key="ai" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
];

export function VideoScrollSection({ framePath, frameCount, slides, pxPerFrame = 14 }: Props) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const desktopSectionRef = useRef<HTMLElement>(null);

  // useLayoutEffect runs synchronously after DOM mutations but BEFORE passive
  // useEffects — this guarantees the canvas mounts/unmounts before the animation
  // effect tries to capture canvasRef.current, preventing a null-ref on mobile.
  useLayoutEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const sectionRef      = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  // Sparse array indexed 0..frameCount-1 — filled as frames load
  const framesRef       = useRef<Array<HTMLImageElement | undefined>>(new Array(frameCount));
  const lastDrawnRef    = useRef<HTMLImageElement | null>(null); // avoids O(n) fallback scan
  const currentFrame    = useRef(0);
  const targetFrame     = useRef(0);
  const rafId           = useRef<number>(0);
  const innerWidthRef   = useRef(0);
  const pxPerFrameRef   = useRef(pxPerFrame);
  const progressBarRef  = useRef<HTMLDivElement>(null);
  const blackRef        = useRef<HTMLDivElement>(null);
  const vignetteRef     = useRef<HTMLDivElement>(null);
  const bottomGradRef   = useRef<HTMLDivElement>(null);
  // Entry fade — covers the seam with the previous section, fades out as scroll begins
  const entryFadeRef    = useRef<HTMLDivElement>(null);
  // Scroll indicator — visible at end of section to hint at next content
  const snapDoneRef     = useRef(false);
  const snapRafRef      = useRef<number>(0);
  const touchStartY     = useRef(0);
  const rafTouch        = useRef<number>(0);
  const slideRefs = useRef<Array<{ container: HTMLDivElement | null }>>(
    slides.map(() => ({ container: null }))
  );

  // ── Desktop entrance animations ───────────────────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;
    const el = desktopSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setCardsVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isDesktop]);

  // ── Resize: sync canvas size, --vh, and section height ─────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const canvas  = canvasRef.current;

    const onResize = () => {
      innerWidthRef.current = window.innerWidth;
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      // Recalculate section height so scroll math stays correct after orientation change
      pxPerFrameRef.current = getPxPerFrame(pxPerFrame);
      if (section) {
        section.style.height = `${window.innerHeight + frameCount * pxPerFrameRef.current}px`;
      }
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d")!;

    const drawFrame = (frame: HTMLImageElement) => {
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / 1076, ch / 1662);
      const dw = frame.naturalWidth * scale;
      const dh = frame.naturalHeight * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    // Load frames progressively — guard against stale callbacks after unmount
    let cancelled = false;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const idx = i - 1;
      img.src = framePath(i);
      img.onload = () => {
        if (!cancelled) {
          framesRef.current[idx] = img;
          // Draw first frame immediately on load so section never shows a black canvas
          if (idx === 0 && lastDrawnRef.current === null) {
            lastDrawnRef.current = img;
            drawFrame(img);
          }
        }
      };
    }

    let visible = true;
    const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    observer.observe(section);

    // ── Animate slides ─────────────────────────────────────────────────────────
    const animateSlides = (progress: number) => {
      const vw = innerWidthRef.current;

      slides.forEach((slide, i) => {
        const el = slideRefs.current[i].container;
        if (!el) return;

        const raw = (progress - slide.start) / (slide.end - slide.start);
        if (raw < -0.02 || raw > 1.02) { el.style.opacity = "0"; return; }
        const p = clamp(raw, 0, 1);

        // noBackground slides use top:50% centering with translateY offset for entry
        if (slide.noBackground) {
          let op: number, offsetVh: number;

          if (p < 0.26) {
            const t = easeOutExpo(p / 0.26);
            offsetVh = lerp(80, 0, t);
            op = clamp((p / 0.26) * 4, 0, 1);
          } else if (p < 0.78) {
            offsetVh = 0; op = 1;
          } else if (p < 0.94) {
            const t = easeInOut((p - 0.78) / 0.16);
            offsetVh = 0; op = 1 - t;
          } else {
            offsetVh = 0; op = 0;
          }

          el.style.top             = "50%";
          el.style.bottom          = "auto";
          el.style.left            = "50%";
          el.style.right           = "auto";
          el.style.transform       = `translateX(-50%) translateY(calc(-50% + ${offsetVh}vh)) translateZ(0)`;
          el.style.transformOrigin = "center center";
          el.style.textAlign       = "center";
          el.style.opacity         = String(op);
          el.style.filter          = "none";
          return;
        }

        let sc: number, bot: number, op: number;

        if (p < 0.26) {
          const t = easeOutExpo(p / 0.26);
          sc = lerp(0.84, 1.0, t); bot = lerp(POS_IN, POS2, t);
          op = clamp((p / 0.26) * 4, 0, 1);
        } else if (p < 0.78) {
          sc = 1.0; bot = POS2; op = 1;
        } else if (p < 0.94) {
          const t = easeInOut((p - 0.78) / 0.16);
          sc = 1.0; bot = POS2; op = 1 - t;
        } else {
          sc = 1.0; bot = POS2; op = 0;
        }

        el.style.bottom          = `${bot}vh`;
        el.style.top             = "auto";
        el.style.left            = "50%";
        el.style.right           = "auto";
        el.style.transform       = `translateX(-50%) scale(${sc}) translateZ(0)`;
        el.style.transformOrigin = "center bottom";
        el.style.textAlign       = "center";

        el.style.opacity = String(op);
        el.style.filter  = "none";
      });
    };

    // ── Finale ────────────────────────────────────────────────────────────────
    const animateFinale = (progress: number) => {
      const vc = vignetteRef.current;
      const bl = blackRef.current;
      const bg = bottomGradRef.current;
      if (!vc || !bl) return;

      // Bottom gradient: invisible during the video, fades in only at the end
      if (bg) {
        if (progress >= 0.80) {
          bg.style.opacity = String(clamp((progress - 0.80) / 0.10, 0, 1));
        } else {
          bg.style.opacity = "0";
        }
      }

      if (progress >= 0.86) {
        const t = clamp((progress - 0.86) / 0.11, 0, 1);
        const e = easeInOut(t);
        const r = Math.max(0, 80 - e * 86);
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
    const isMobile = "ontouchstart" in window;
    const lerpF    = isMobile ? 0.13 : 0.16;

    const tick = () => {
      if (!visible) { rafId.current = requestAnimationFrame(tick); return; }

      const diff = targetFrame.current - currentFrame.current;

      if (Math.abs(diff) > 0.05) {
        currentFrame.current += diff * lerpF;
        const ideal = clamp(Math.round(currentFrame.current), 0, frameCount - 1);

        // O(1) frame lookup: use cached last-drawn as fallback
        const frame = framesRef.current[ideal] ?? lastDrawnRef.current ?? undefined;
        if (frame) {
          lastDrawnRef.current = frame;
          drawFrame(frame);
        }
      }

      const progress = currentFrame.current / frameCount;

      if (progressBarRef.current)
        progressBarRef.current.style.width = `${progress * 100}%`;

      // Entry fade: hide seam with previous section, dissolves in first 3% of scroll
      if (entryFadeRef.current) {
        const op = progress < 0.008 ? 1 - (progress / 0.008) : 0;
        entryFadeRef.current.style.opacity = String(op);
      }


      // Snap to next section when user reaches the end
      if (progress >= 0.985 && !snapDoneRef.current) {
        snapDoneRef.current = true;
        snapToNext();
      } else if (progress < 0.92) {
        snapDoneRef.current = false;
        cancelAnimationFrame(snapRafRef.current);
      }


      animateSlides(progress);
      animateFinale(progress);

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    // ── Scroll ────────────────────────────────────────────────────────────────
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      targetFrame.current = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1) * (frameCount - 1);
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
      const p     = currentFrame.current / frameCount;
      const delta = touchStartY.current - e.touches[0].clientY;
      if (delta > 0 && p >= 0.97) return;
      if (delta < 0 && p <= 0.01) return;
      e.preventDefault();
      touchVelocity = clamp(delta * 0.55, -80, 80);
      window.scrollBy({ top: touchVelocity, behavior: "instant" as ScrollBehavior });
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      const apply = () => {
        if (Math.abs(touchVelocity) < 0.2) { touchVelocity = 0; return; }
        window.scrollBy({ top: touchVelocity, behavior: "instant" as ScrollBehavior });
        touchVelocity *= 0.88;
        rafTouch.current = requestAnimationFrame(apply);
      };
      rafTouch.current = requestAnimationFrame(apply);
    };

    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchmove",  onTouchMove,  { passive: false });
    section.addEventListener("touchend",   onTouchEnd,   { passive: true });

    // ── Snap to next section ──────────────────────────────────────────────────
    const snapToNext = () => {
      const start   = window.scrollY;
      const target  = section.offsetTop + section.offsetHeight;
      const dist    = target - start;
      const dur     = 700; // ms
      const t0      = performance.now();
      const easeInOutCubic = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        window.scrollTo(0, start + dist * easeInOutCubic(p));
        if (p < 1) snapRafRef.current = requestAnimationFrame(step);
      };
      snapRafRef.current = requestAnimationFrame(step);
    };

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId.current);
      cancelAnimationFrame(rafTouch.current);
      cancelAnimationFrame(snapRafRef.current);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchmove",  onTouchMove);
      section.removeEventListener("touchend",   onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Desktop: static image layout ──────────────────────────────────────────
  if (isDesktop) {
    // Feature slides: skip noBackground (intro) and last "Únete a" slide
    const featureSlides = slides.filter(s => !s.noBackground && s.line1 !== "Únete a");

    return (
      <section ref={desktopSectionRef} style={{ position: "relative", width: "100%", minHeight: "100vh", background: "#07080f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/features-bg.png"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, transform: "translateY(-60px) translateX(-80px)", pointerEvents: "none" }}
        />

        {/* Top + bottom dark fades to blend with surrounding sections */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to bottom, #07080f 0%, transparent 100%)", pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, #07080f 0%, transparent 100%)", pointerEvents: "none", zIndex: 1 }} />
        {/* Subtle center vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(7,8,15,0.45) 100%)", pointerEvents: "none", zIndex: 1 }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1100, padding: "100px 56px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem" }}>

          {/* Section chip */}
          <span style={{
            display: "inline-block",
            padding: "0.35rem 1.1rem",
            borderRadius: "999px",
            border: "1px solid rgba(167,139,250,0.35)",
            background: "rgba(167,139,250,0.10)",
            color: "#c4b5fd",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            fontFamily: "var(--font-sans), system-ui, sans-serif",
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.45s ease 0s, transform 0.45s cubic-bezier(0.16,1,0.3,1) 0s",
          }}>Funcionalidades</span>

          {/* Headline */}
          <div style={{ textAlign: "center", opacity: cardsVisible ? 1 : 0, transform: cardsVisible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.5s ease 0s, transform 0.5s cubic-bezier(0.16,1,0.3,1) 0s" }}>
            <h2 style={{
              margin: 0,
              color: "#f8fafc",
              fontFamily: "var(--font-heading), system-ui, sans-serif",
              fontSize: "clamp(2.8rem, 4vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              WebkitFontSmoothing: "antialiased",
            }}>
              Todo lo que necesita{" "}
              <span style={{ background: "linear-gradient(to right, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                tu negocio
              </span>
            </h2>
            <p style={{
              margin: "1rem 0 0",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontSize: "1.05rem",
              fontWeight: 400,
              lineHeight: 1.6,
            }}>
              En una sola plataforma. Sin complicaciones.
            </p>
          </div>

          {/* Feature grid 2×2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", width: "100%", marginTop: "0.5rem" }}>
            {featureSlides.map((slide, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(32px) saturate(180%) brightness(1.1)",
                WebkitBackdropFilter: "blur(32px) saturate(180%) brightness(1.1)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.13)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                padding: "2rem 2.2rem",
                display: "flex",
                flexDirection: "column" as const,
                gap: "0.85rem",
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.55s ease ${0.08 + i * 0.1}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.1}s`,
              }}>
                {/* Icon */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(59,130,246,0.20), rgba(167,139,250,0.20))",
                  border: "1px solid rgba(167,139,250,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a78bfa",
                  flexShrink: 0,
                }}>
                  {FEATURE_ICONS[i % FEATURE_ICONS.length]}
                </div>

                {/* Title */}
                <h3 style={{
                  margin: 0,
                  color: "#f8fafc",
                  fontFamily: "var(--font-heading), system-ui, sans-serif",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.2,
                  WebkitFontSmoothing: "antialiased",
                }}>
                  {slide.line1}{" "}
                  <span style={{ background: "linear-gradient(to right, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {slide.accent}
                  </span>
                </h3>

                {/* Description */}
                <p style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.70)",
                  fontFamily: "var(--font-sans), system-ui, sans-serif",
                  fontSize: "0.90rem",
                  fontWeight: 400,
                  lineHeight: 1.65,
                }}>
                  {slide.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div ref={sectionRef} style={{ position: "relative", width: "100%", minHeight: "100vh", background: "#07080f" }}>
      <div style={{ position: "sticky", top: 0, width: "100%", height: "calc(var(--vh, 1vh) * 100)", overflow: "clip" }}>

        {/* Canvas — always visible, starts black, reveals frames as they load */}
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

        {/* Vignettes */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none", zIndex: 2 }} />
        <div ref={bottomGradRef} style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "clamp(80px, 14vh, 140px)", background: "linear-gradient(to top, #07080f, transparent)", pointerEvents: "none", zIndex: 2, opacity: 0 }} />

        {/* Entry fade — starts opaque, dissolves as scroll begins, hides the section seam */}
        <div ref={entryFadeRef} style={{ position: "absolute", inset: 0, background: "#07080f", opacity: 1, pointerEvents: "none", zIndex: 18 }} />

        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { slideRefs.current[i].container = el; }}
            style={{
              position: "absolute",
              left: "50%",
              ...(slide.noBackground ? { top: "50%", bottom: "auto" } : { bottom: "20vh" }),
              willChange: "transform, opacity",
              backfaceVisibility: "hidden" as const,
              opacity: 0,
              pointerEvents: "none",
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: isDesktop ? 480 : "clamp(220px, 80vw, 400px)",
              width: isDesktop ? "auto" : "max-content",
              ...(slide.noBackground ? {} : {
                background: "rgba(255,255,255,0.13)",
                backdropFilter: "blur(40px) saturate(200%) brightness(1.15)",
                WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.15)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(255,255,255,0.06)",
              }),
              padding: isDesktop ? "1.6rem 2rem" : "clamp(0.8rem, 2.5vw, 1.4rem) clamp(1rem, 3vw, 1.6rem)",
              textAlign: "center",
            }}
          >
            <h2 style={{
              margin: 0,
              color: "#f8fafc",
              fontFamily: "var(--font-heading), system-ui, sans-serif",
              fontSize: slide.noBackground
                ? (isDesktop ? "3.2rem" : "clamp(2.8rem, 11vw, 6rem)")
                : (isDesktop ? "2.2rem" : "clamp(1.6rem, 6vw, 3.8rem)"),
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              WebkitFontSmoothing: "antialiased" as const,
              MozOsxFontSmoothing: "grayscale" as const,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}>
              <span style={{ display: "block", marginBottom: "0.1em" }}>{slide.line1}</span>
              <span style={{
                display: "block",
                background: "linear-gradient(to right, #3b82f6, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{slide.accent}</span>
            </h2>
            <p style={{
              margin: "clamp(0.5rem, 1.5vh, 1rem) 0 0",
              color: "rgba(255,255,255,0.85)",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontSize: isDesktop ? "0.92rem" : "clamp(0.75rem, 2.8vw, 0.95rem)",
              fontWeight: 400,
              lineHeight: 1.6,
              WebkitFontSmoothing: "antialiased" as const,
              MozOsxFontSmoothing: "grayscale" as const,
            }}>
              {slide.subtitle}
            </p>
          </div>
        ))}

        {/* Iris close */}
        <div ref={vignetteRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", zIndex: 15 }} />

        {/* Black fade */}
        <div ref={blackRef} style={{ position: "absolute", inset: 0, background: "#000", opacity: 0, pointerEvents: "none", zIndex: 16 }} />


        {/* Progress bar — solo en móvil */}
        {!isDesktop && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.07)", zIndex: 20 }}>
            <div ref={progressBarRef} style={{ height: "100%", width: "0%", background: "linear-gradient(to right, #3b82f6, #a78bfa)", transition: "none" }} />
          </div>
        )}
      </div>
    </div>
  );
}
