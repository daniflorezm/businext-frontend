"use client";

import { ArrowRight, CalendarDays, MapPin, Sparkles, Star } from "lucide-react";
import { useAccessContext } from "@/hooks/useAccessContext";

type Props = {
  title: string;
  body: string;
  onStart: () => void;
  onSkip: () => void;
  totalSteps: number;
};

/** Se reparten por la mitad superior (0° = derecha, 270° = arriba) para no
 *  invadir el saludo que va justo debajo del emblema. */
const ORBIT = [
  { Icon: MapPin, angle: 205, delay: "0.5s" },
  { Icon: CalendarDays, angle: 270, delay: "0.62s" },
  { Icon: Star, angle: 335, delay: "0.74s" },
];

export function TourWelcome({ title, body, onStart, onSkip, totalSteps }: Props) {
  const { context } = useAccessContext();
  const firstName =
    context?.profile?.displayName?.trim().split(/\s+/)[0] ?? null;

  // La última palabra va en degradado, igual que el login remata
  // "Bienvenido de vuelta." con "de vuelta." en azul → violeta.
  const words = title.trim().split(/\s+/);
  const titleTail = words[words.length - 1];
  const titleHead = words.slice(0, -1).join(" ");

  return (
    <div className="fixed inset-0 pointer-events-auto overflow-hidden bg-background">
      {/* Mismos destellos ambientales que la pantalla de login. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {/* Centrado con left/right + mx-auto en vez de -translate-x-1/2: el
            keyframe de la deriva también fija transform y lo anularía. */}
        <div
          className="absolute top-[8%] left-0 right-0 mx-auto w-[140vw] max-w-[900px] h-[420px] animate-tour-drift"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[6%] right-[6%] w-[70vw] max-w-[420px] h-[420px] animate-tour-drift"
          style={{
            background:
              "radial-gradient(ellipse, rgba(167,139,250,0.14) 0%, transparent 70%)",
            animationDelay: "-9s",
          }}
        />
        <div
          className="absolute top-[35%] left-[4%] w-[60vw] max-w-[380px] h-[380px] animate-tour-drift"
          style={{
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)",
            animationDelay: "-16s",
          }}
        />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative mb-12 sm:mb-14 animate-tour-emblem-in">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-secondary/50 animate-tour-ring"
                style={{ animationDelay: `${i * 1.2}s` }}
              />
            ))}

            <div
              className="absolute inset-0 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
            </div>

            {/* La colocación va fuera y la animación dentro: si compartieran
                elemento, el transform del keyframe pisaría el de la órbita. */}
            {ORBIT.map(({ Icon, angle, delay }) => (
              <span
                key={angle}
                aria-hidden="true"
                className="hidden sm:block absolute top-1/2 left-1/2 w-11 h-11 -ml-5.5 -mt-5.5"
                style={{
                  transform: `rotate(${angle}deg) translateX(118px) rotate(-${angle}deg)`,
                }}
              >
                <span
                  className="flex w-full h-full rounded-full bg-surface/90 backdrop-blur-sm border border-border items-center justify-center shadow-md animate-tour-rise"
                  style={{ animationDelay: delay }}
                >
                  <Icon className="w-[18px] h-[18px] text-secondary" />
                </span>
              </span>
            ))}
          </div>
        </div>

        {firstName && (
          <p
            className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full border border-secondary/30 bg-secondary/10 text-caption font-medium text-secondary animate-tour-rise"
            style={{ animationDelay: "0.15s" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hola, {firstName}
          </p>
        )}

        <h1
          className="font-heading text-[2rem] leading-[1.15] sm:text-[3.25rem] sm:leading-[1.1] font-bold tracking-tight max-w-3xl text-foreground animate-tour-rise"
          style={{ animationDelay: "0.28s" }}
        >
          {titleHead && `${titleHead} `}
          <span
            style={{
              background:
                "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {titleTail}
          </span>
        </h1>

        <p
          className="mt-5 text-body-sm sm:text-body text-foreground-muted max-w-xl animate-tour-rise"
          style={{ animationDelay: "0.42s" }}
        >
          {body}
        </p>

        <div
          className="mt-9 sm:mt-10 w-full max-w-sm flex flex-col sm:flex-row sm:justify-center gap-3 animate-tour-rise"
          style={{ animationDelay: "0.56s" }}
        >
          <button
            type="button"
            onClick={onStart}
            autoFocus
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-primary-foreground text-body-sm font-bold shadow-lg transition-transform duration-150 ease-snappy hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            }}
          >
            Empezar el tour
            <ArrowRight className="w-4 h-4 transition-transform duration-150 ease-snappy group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="px-7 py-3.5 rounded-xl text-body-sm font-medium text-foreground-muted transition-colors duration-150 ease-snappy hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ahora no
          </button>
        </div>

        <p
          className="mt-6 text-caption text-foreground-subtle animate-tour-rise"
          style={{ animationDelay: "0.7s" }}
        >
          {totalSteps} pasos · menos de un minuto
        </p>
      </div>
    </div>
  );
}
