"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccessContext } from "@/hooks/useAccessContext";
import { TOUR_STEPS, tourKeyForRole } from "@/lib/tour/steps";
import { TourKey, TourStep } from "@/lib/tour/types";

type TourContextValue = {
  active: boolean;
  stepIndex: number;
  totalSteps: number;
  currentStep: TourStep | null;
  needsSidebar: boolean;
  activeSection: string | null;
  next: () => void;
  prev: () => void;
  skip: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

const INERT: TourContextValue = {
  active: false,
  stepIndex: 0,
  totalSteps: 0,
  currentStep: null,
  needsSidebar: false,
  activeSection: null,
  next: () => {},
  prev: () => {},
  skip: () => {},
};

export function useTour() {
  return useContext(TourContext) ?? INERT;
}

/** Los targets que viven dentro del menú lateral (drawer en móvil). */
const SIDEBAR_TARGETS = /^nav-/;

async function persist(tourKey: TourKey, step: number, done: boolean) {
  try {
    await fetch("/api/tour", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourKey, step, done }),
    });
  } catch {
    // El progreso del tour no es crítico: si falla, el usuario sigue navegando.
  }
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { context } = useAccessContext();
  const router = useRouter();
  const pathname = usePathname();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const autoStarted = useRef(false);

  const tourKey: TourKey = tourKeyForRole(context?.role);
  const steps = TOUR_STEPS[tourKey];
  const currentStep = active ? steps[stepIndex] ?? null : null;

  useEffect(() => {
    if (autoStarted.current || !context) return;
    if (!context.capabilities?.canAccessApp) return;

    autoStarted.current = true;
    const entry = context.tourState?.[tourKey];
    if (entry?.done) return;

    setStepIndex(entry?.step ?? 0);
    setActive(true);
  }, [context, tourKey]);

  useEffect(() => {
    if (!active || !currentStep?.route) return;
    if (pathname !== currentStep.route) router.push(currentStep.route);
  }, [active, currentStep, pathname, router]);

  const next = useCallback(() => {
    // Los efectos van fuera del updater de estado: en StrictMode React
    // invoca los updaters dos veces y duplicaría las llamadas al servidor.
    const target = stepIndex + 1;
    if (target >= steps.length) {
      setActive(false);
      void persist(tourKey, steps.length - 1, true);
      return;
    }
    setStepIndex(target);
    void persist(tourKey, target, false);
  }, [stepIndex, steps.length, tourKey]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => {
    // Saltar cuenta como completado: no queremos volver a interrumpirle.
    setActive(false);
    void persist(tourKey, stepIndex, true);
  }, [tourKey, stepIndex]);

  const value = useMemo<TourContextValue>(
    () => ({
      active,
      stepIndex,
      totalSteps: steps.length,
      currentStep,
      needsSidebar: Boolean(
        currentStep?.target && SIDEBAR_TARGETS.test(currentStep.target)
      ),
      activeSection: currentStep?.section ?? null,
      next,
      prev,
      skip,
    }),
    [active, stepIndex, steps.length, currentStep, next, prev, skip]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
