"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTour } from "@/components/common/TourProvider";
import { TourWelcome } from "@/components/common/TourWelcome";
import { TourPlacement } from "@/lib/tour/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PADDING = 8;
const CARD_WIDTH = 340;
const GAP = 14;

type Rect = { top: number; left: number; width: number; height: number };

/**
 * Espera a que el elemento del paso exista y sigue su posición. Reintenta
 * porque el paso puede llegar antes de que Next termine de navegar o de que
 * la sección de configuración se monte.
 */
function useTargetRect(target: string | undefined, stepIndex: number) {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }

    let frame = 0;
    let attempts = 0;
    let scrolled = false;

    const measure = () => {
      // El menú lateral se renderiza dos veces (aside de escritorio + drawer
      // de móvil) y el oculto sigue en el DOM con tamaño 0.
      const el = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`)
      ).find((node) => node.getBoundingClientRect().width > 0);

      if (!el) {
        if (attempts++ < 120) frame = requestAnimationFrame(measure);
        else setRect(null);
        return;
      }

      if (!scrolled) {
        scrolled = true;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }

      const r = el.getBoundingClientRect();
      // Solo re-renderizamos cuando la posición cambia de verdad: actualizar
      // en cada frame repintaría el overlay a 60fps sin motivo.
      setRect((prev) =>
        prev &&
        prev.top === r.top &&
        prev.left === r.left &&
        prev.width === r.width &&
        prev.height === r.height
          ? prev
          : { top: r.top, left: r.left, width: r.width, height: r.height }
      );
      frame = requestAnimationFrame(measure);
    };

    measure();
    return () => cancelAnimationFrame(frame);
  }, [target, stepIndex]);

  return rect;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

/** Coloca el globo junto al elemento sin salirse de la ventana. */
function cardPosition(rect: Rect | null, placement: TourPlacement = "bottom") {
  if (typeof window === "undefined" || !rect) return null;
  const { innerWidth: vw, innerHeight: vh } = window;

  let top: number;
  let left: number;

  switch (placement) {
    case "right":
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + GAP;
      break;
    case "left":
      top = rect.top + rect.height / 2;
      left = rect.left - CARD_WIDTH - GAP;
      break;
    case "top":
      top = rect.top - GAP;
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
      break;
    default:
      top = rect.top + rect.height + GAP;
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
  }

  if (left + CARD_WIDTH > vw - 12) {
    left = placement === "right" ? rect.left - CARD_WIDTH - GAP : vw - CARD_WIDTH - 12;
  }
  left = Math.max(12, left);

  const verticalAnchor = placement === "left" || placement === "right";
  return {
    top: Math.min(Math.max(12, top), vh - 12),
    left,
    transform: verticalAnchor
      ? "translateY(-50%)"
      : placement === "top"
      ? "translateY(-100%)"
      : undefined,
  };
}

export function TourOverlay() {
  const { active, currentStep, stepIndex, totalSteps, displayStep, next, prev, skip } =
    useTour();
  const [mounted, setMounted] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => setMounted(true), []);

  const rect = useTargetRect(currentStep?.target, stepIndex);

  // Si el recuadro viene de otro elemento se desliza; si aparece de cero se
  // funde ya colocado. Se decide una vez por paso: si dependiera del rect
  // actual cambiaría a mitad de la animación de entrada y la cortaría.
  const [travelling, setTravelling] = useState(false);
  const hadTarget = useRef(false);
  useEffect(() => {
    setTravelling(hadTarget.current);
    hadTarget.current = Boolean(currentStep?.target);
  }, [stepIndex, currentStep?.target]);

  useEffect(() => {
    if (!active) return;
    // En la bienvenida no interceptamos teclas: tiene sus propios botones y
    // el Enter del botón enfocado ya avanza.
    if (currentStep?.hero) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, currentStep?.hero, next, prev, skip]);

  if (!mounted || !active || !currentStep) return null;

  if (currentStep.hero) {
    return createPortal(
      <div className="fixed inset-0 z-[100]">
        <TourWelcome
          title={currentStep.title}
          body={currentStep.body}
          totalSteps={totalSteps}
          onStart={next}
          onSkip={skip}
        />
      </div>,
      document.body
    );
  }

  const isLast = displayStep === totalSteps;
  const isFirst = displayStep === 1;
  const pos = cardPosition(rect, currentStep.placement);
  const floating = isDesktop && pos !== null;

  const geometry = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {geometry ? (
        <div key="tour-spotlight">
          <div
            className={cn(
              "absolute rounded-lg pointer-events-none",
              travelling
                ? "transition-all duration-500 ease-fluid"
                : "animate-tour-spotlight-in"
            )}
            style={{
              ...geometry,
              boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.8)",
              outline: "2px solid var(--color-primary)",
              outlineOffset: "-1px",
            }}
          />
          <div
            aria-hidden="true"
            className={cn(
              "absolute rounded-lg pointer-events-none ring-2 ring-secondary animate-tour-pulse",
              travelling && "transition-all duration-500 ease-fluid"
            )}
            style={geometry}
          />
        </div>
      ) : (
        <div
          key="tour-veil"
          className="absolute inset-0 bg-background/80 pointer-events-auto"
        />
      )}

      {/* Durante el tour solo se avanza con los botones del globo. */}
      <div className="absolute inset-0 pointer-events-auto" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className={cn(
          "fixed pointer-events-auto rounded-xl border border-border bg-surface shadow-lg",
          "transition-[top,left] duration-300 ease-out",
          !floating && "inset-x-3 bottom-3"
        )}
        style={
          floating && pos
            ? { top: pos.top, left: pos.left, transform: pos.transform }
            : undefined
        }
      >
        <div className={cn("p-5", floating && "w-[340px]")}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2
              id="tour-title"
              className="font-heading text-h4 font-bold text-foreground"
            >
              {currentStep.title}
            </h2>
            <button
              type="button"
              onClick={skip}
              aria-label="Cerrar tutorial"
              className="rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-body-sm text-foreground-muted">{currentStep.body}</p>

          <div className="flex items-center gap-1.5 mt-4 mb-4" aria-hidden="true">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === displayStep - 1
                    ? "w-5 bg-primary"
                    : i < displayStep - 1
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-foreground-subtle tabular-nums">
              {displayStep} de {totalSteps}
            </span>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <Button variant="ghost" onClick={prev} aria-label="Paso anterior">
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </Button>
              )}
              <Button variant="primary" onClick={next}>
                {isLast ? "Finalizar" : "Siguiente"}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {!isLast && (
            <button
              type="button"
              onClick={skip}
              className="mt-3 w-full text-caption text-foreground-subtle transition-colors hover:text-foreground-muted"
            >
              Saltar tutorial
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
