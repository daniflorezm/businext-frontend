"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 196;
const FRAME_PATH = (n: number) =>
  `/frames2/frame${String(n).padStart(4, "0")}.jpg`;

const PX_PER_FRAME = 14;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOut   = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

export function BusinextSection() {
  const [loaded, setLoaded] = useState(false);
  const [loadPct, setLoadPct] = useState(0);

  const sectionRef       = useRef<HTMLDivElement>(null);
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const framesRef        = useRef<HTMLImageElement[]>([]);
  const currentFrame     = useRef(0);
  const targetFrame      = useRef(0);
  const rafId            = useRef<number>(0);
  const progressBarRef   = useRef<HTMLDivElement>(null);
  const vignetteCloseRef = useRef<HTMLDivElement>(null);
  const blackRef         = useRef<HTMLDivElement>(null);
  const fadeInRef        = useRef<HTMLDivElement>(null);
  const touchStartY      = useRef(0);
  const rafTouch         = useRef<number>(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d")!;

    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVH();
    window.addEventListener("resize", setVH, { passive: true });

    section.style.height = `${window.innerHeight + FRAME_COUNT * PX_PER_FRAME}px`;

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
          // Pre-scale canvas so first visible frame is already zoomed in
          canvas.style.transform = "scale(1.55) translateZ(0)";
          canvas.style.transformOrigin = "center center";
          canvas.style.willChange = "transform";
          setLoaded(true);
          // If already scrolled into section, release overlay immediately
          if (fadeInRef.current) {
            const rect = section.getBoundingClientRect();
            const p = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1);
            if (p > 0) {
              fadeInRef.current.style.transition = "opacity 0.6s ease";
              fadeInRef.current.style.opacity = "0";
            }
          }
        }
      };
      images.push(img);
    }

    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(section);

    // ── Iris close + black fade out ────────────────────────────────────────────
    const FINALE_START = 0.88;
    const FINALE_END   = 0.97;

    const animateFinale = (progress: number) => {
      const vc = vignetteCloseRef.current;
      const bl = blackRef.current;
      if (!vc || !bl) return;

      if (progress >= FINALE_START - 0.02) {
        const tV = (progress - (FINALE_START - 0.02)) / (FINALE_END - FINALE_START + 0.02);
        const eV = easeInOut(clamp(tV, 0, 1));
        const r  = Math.max(0, 80 - eV * 86);
        vc.style.background = `radial-gradient(circle ${r}% at 50% 65%, transparent 40%, rgba(0,0,0,${0.35 + eV * 0.65}) 100%)`;
        vc.style.opacity    = String(Math.min(tV * 4, 1));
      } else {
        vc.style.opacity = "0";
      }

      if (progress >= 0.93) {
        const tB = easeInOut(clamp((progress - 0.93) / 0.04, 0, 1));
        bl.style.opacity = String(tB * tB);
      } else {
        bl.style.opacity = "0";
      }
    };

    // ── Progressive zoom-out tied to scroll ───────────────────────────────────
    // Subtle: starts at 1.55x and eases linearly to 1x over 30% of scroll
    const ZOOM_END = 0.30;
    const animateOpeningZoom = (progress: number) => {
      const cv = canvasRef.current;
      if (!cv) return;
      if (progress >= ZOOM_END) {
        cv.style.transform = "scale(1) translateZ(0)";
        return;
      }
      // Gentle ease-out so zoom feels directly tied to finger/wheel movement
      const t     = Math.pow(progress / ZOOM_END, 0.6);
      const scale = lerp(1.55, 1, t);
      cv.style.transform = `scale(${scale}) translateZ(0)`;
    };

    // ── Fade-in overlay: quick dissolve at the very start ─────────────────────
    const animateFadeIn = (progress: number) => {
      const fi = fadeInRef.current;
      if (!fi) return;
      if (progress <= 0) { fi.style.opacity = "1"; return; }
      const FADE_END = 0.06;
      if (progress >= FADE_END) { fi.style.opacity = "0"; return; }
      const t = easeOutExpo(progress / FADE_END);
      fi.style.opacity = String(1 - t);
    };

    // ── RAF loop ───────────────────────────────────────────────────────────────
    const tick = () => {
      if (!visible) { rafId.current = requestAnimationFrame(tick); return; }

      const diff       = targetFrame.current - currentFrame.current;
      const isMobile   = "ontouchstart" in window;
      const lerpFactor = isMobile ? 0.18 : 0.12;

      if (Math.abs(diff) > 0.05) {
        currentFrame.current += diff * lerpFactor;
        const idx = clamp(Math.round(currentFrame.current), 0, FRAME_COUNT - 1);
        if (framesRef.current[idx]) ctx.drawImage(framesRef.current[idx], 0, 0);
      }

      const progress = currentFrame.current / FRAME_COUNT;

      if (progressBarRef.current)
        progressBarRef.current.style.width = `${progress * 100}%`;

      animateOpeningZoom(progress);
      animateFadeIn(progress);
      animateFinale(progress);

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    // ── Scroll ─────────────────────────────────────────────────────────────────
    const onScroll = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const progress = clamp(
        -rect.top / (rect.height - window.innerHeight),
        0,
        1
      );
      targetFrame.current = progress * (FRAME_COUNT - 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Touch with inertia ─────────────────────────────────────────────────────
    let touchVelocity = 0;
    const isInSection = () => {
      const p = currentFrame.current / FRAME_COUNT;
      return p >= 0 && p <= 1;
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      cancelAnimationFrame(rafTouch.current);
      touchVelocity = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isInSection()) return;
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
      const applyInertia = () => {
        if (Math.abs(touchVelocity) < 0.5) { touchVelocity = 0; return; }
        window.scrollBy({ top: touchVelocity, behavior: "instant" as ScrollBehavior });
        touchVelocity *= 0.74;
        rafTouch.current = requestAnimationFrame(applyInertia);
      };
      rafTouch.current = requestAnimationFrame(applyInertia);
    };

    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchmove",  onTouchMove,  { passive: false });
    section.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      cancelAnimationFrame(rafTouch.current);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", setVH);
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchmove",  onTouchMove);
      section.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{ position: "relative", width: "100%", minHeight: "100vh", background: "#000" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          height: "calc(var(--vh, 1vh) * 100)",
          overflow: "clip",
        } as React.CSSProperties}
      >
        {/* Loading overlay */}
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
              zIndex: 30,
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "2px solid #3b82f6",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ color: "#b0bec5", fontSize: 13 }}>
              Cargando... {loadPct}%
            </span>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        />

        {/* Radial vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Bottom vignette */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 140,
            background: "linear-gradient(to top, #07080f, transparent)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />


        {/* Iris close */}
        <div
          ref={vignetteCloseRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 15,
          }}
        />

        {/* Black fade out (end of section) */}
        <div
          ref={blackRef}
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 16,
          }}
        />

        {/* ── Cinematic fade-in from black (matches section 1 exit) ── */}
        <div
          ref={fadeInRef}
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            opacity: 1,
            pointerEvents: "none",
            zIndex: 17,
            willChange: "opacity",
          }}
        />

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(255,255,255,0.08)",
            zIndex: 20,
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: "100%",
              width: "0%",
              background: "linear-gradient(to right, #3b82f6, #a78bfa)",
              transition: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
