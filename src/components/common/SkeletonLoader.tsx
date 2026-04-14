import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  rows?: number;
}

// ─── generic full-page skeleton (kept for backward compatibility) ────────────
export default function SkeletonLoader({ rows = 4 }: SkeletonLoaderProps) {
  return (
    <div className="w-full flex flex-col gap-4 py-8 px-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg bg-surface border border-border-subtle p-4"
        >
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ─── section card skeleton ───────────────────────────────────────────────────
export function SectionSkeleton() {
  return (
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-surface rounded-lg border border-border-subtle">
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-3/4 rounded-md" />
      </div>
    </div>
  );
}

// ─── products grid skeleton ──────────────────────────────────────────────────
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-surface rounded-lg border border-border-subtle">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border-subtle overflow-hidden">
            <Skeleton className="w-full h-28" />
            <div className="p-3 flex flex-col gap-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── team list skeleton ──────────────────────────────────────────────────────
export function TeamListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-surface rounded-lg border border-border-subtle">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-md" />
        ))}
        <Skeleton className="md:col-span-2 h-12 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-subtle p-4 flex justify-between items-center gap-4"
          >
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
