import React from "react";

interface SkeletonLoaderProps {
  rows?: number;
}

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
