"use client";

import { useState, useEffect } from "react";
import { Search, Star, SlidersHorizontal } from "lucide-react";

type ReviewFiltersProps = {
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
  sortOrder: string;
  setSortOrder: (sort: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
};

const RATING_OPTIONS = [
  { value: null, label: "Todas" },
  { value: 5, label: "5" },
  { value: 4, label: "4" },
  { value: 3, label: "3" },
  { value: 2, label: "2" },
  { value: 1, label: "1" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguas" },
  { value: "highest", label: "Mayor calificación" },
  { value: "lowest", label: "Menor calificación" },
];

export function ReviewFilters({
  ratingFilter,
  setRatingFilter,
  sortOrder,
  setSortOrder,
  searchQuery,
  setSearchQuery,
  setPage,
}: ReviewFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, setSearchQuery, setPage]);

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md rounded-2xl border border-border-subtle shadow-sm p-4 space-y-3">
      {/* Top row: search + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Buscar en reseñas..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-body-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-foreground-subtle" />
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
            className="bg-surface border border-border-subtle rounded-xl px-3.5 py-2.5 text-body-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom row: rating pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-caption text-foreground-subtle font-medium mr-1">Estrellas:</span>
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.value ?? "all"}
            onClick={() => {
              setRatingFilter(opt.value);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-caption font-medium rounded-full transition-all duration-200 ${
              ratingFilter === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface-raised text-foreground-muted hover:text-foreground hover:bg-surface-raised/80"
            }`}
          >
            {opt.value ? (
              <>
                {opt.value}
                <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
              </>
            ) : (
              opt.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
