"use client";

import { cn } from "@/lib/utils";

interface ProductPlaceholderProps {
  type?: string;
  className?: string;
}

/**
 * Inline SVG placeholder for products/services without an image.
 * Uses the package/box icon for all types.
 */
export function ProductPlaceholder({
  className,
}: ProductPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-accent/10",
        className
      )}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 opacity-60"
      >
        <rect
          x="16"
          y="28"
          width="48"
          height="36"
          rx="3"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
        />
        <path
          d="M16 28L24 16H56L64 28"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line
          x1="40"
          y1="16"
          x2="40"
          y2="64"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M32 28V20M48 28V20"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
