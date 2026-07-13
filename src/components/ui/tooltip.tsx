"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";

interface HelpTooltipProps {
  content: ReactNode;
  side?: Side;
  className?: string;
}

const PANEL_POSITION: Record<Side, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ARROW_POSITION: Record<Side, string> = {
  top: "top-full left-1/2 -translate-x-1/2 -mt-1",
  bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
  left: "left-full top-1/2 -translate-y-1/2 -ml-1",
  right: "right-full top-1/2 -translate-y-1/2 -mr-1",
};

export function HelpTooltip({ content, side = "bottom", className }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? panelId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-full text-foreground-subtle transition-colors duration-150 ease-snappy hover:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Más información</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="tooltip"
          className={cn(
            "absolute z-50 w-64 max-w-[80vw] rounded-md border border-border bg-surface-raised p-3 text-body-sm text-foreground shadow-lg",
            PANEL_POSITION[side]
          )}
        >
          {content}
          <span
            aria-hidden="true"
            className={cn(
              "absolute h-2 w-2 rotate-45 border border-border bg-surface-raised",
              ARROW_POSITION[side]
            )}
          />
        </div>
      )}
    </span>
  );
}
