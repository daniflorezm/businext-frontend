import React from "react";

interface SkeletonLoaderProps {
  rows?: number;
}

// ─── generic full-page skeleton (kept for backward compatibility) ────────────
export default function SkeletonLoader({ rows = 4 }: SkeletonLoaderProps) {
  return (
    <div className="w-full flex flex-col gap-4 py-8 px-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 bg-white rounded-xl shadow p-4 border border-gray-100"
        >
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ─── section card skeleton ───────────────────────────────────────────────────
export function SectionSkeleton() {
  return (
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-white/90 rounded-2xl shadow-lg border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-10 bg-gray-100 rounded-lg w-full" />
        <div className="h-10 bg-gray-100 rounded-lg w-3/4" />
      </div>
    </div>
  );
}

// ─── products grid skeleton ──────────────────────────────────────────────────
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-white/90 rounded-2xl shadow-lg border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="w-full h-28 bg-gray-200" />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
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
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-white/90 rounded-2xl shadow-lg border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
        <div className="md:col-span-2 h-12 bg-gray-200 rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 p-4 flex justify-between items-center gap-4"
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-100 rounded-lg" />
              <div className="h-8 w-20 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
