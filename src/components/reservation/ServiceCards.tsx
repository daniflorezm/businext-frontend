"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/product/types";
import { Reservation } from "@/lib/reservation/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImageIcon, Search, TrendingUp } from "lucide-react";
import { ProductPlaceholder } from "@/components/common/ProductPlaceholder";

interface ServiceCardsProps {
  services: Product[];
  selectedId: number | null;
  onSelect: (product: Product) => void;
  loading: boolean;
  /** All reservations — used to compute most-used services */
  reservations?: Reservation[];
}

const MAX_FREQUENT = 4;

export function ServiceCards({
  services,
  selectedId,
  onSelect,
  loading,
  reservations = [],
}: ServiceCardsProps) {
  const [search, setSearch] = useState("");

  const serviceList = useMemo(
    () => services.filter((p) => p.type !== "producto"),
    [services]
  );

  // Compute frequency from completed reservations in the last 30 days
  const frequentServices = useMemo(() => {
    if (serviceList.length <= MAX_FREQUENT || reservations.length === 0)
      return [];

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const counts = new Map<string, number>();

    for (const r of reservations) {
      if (r.status !== "COMPLETED") continue;
      const ts = new Date(r.reservationStartDate).getTime();
      if (ts < cutoff) continue;
      counts.set(r.service, (counts.get(r.service) ?? 0) + 1);
    }

    if (counts.size === 0) return [];

    return serviceList
      .filter((s) => (counts.get(s.name) ?? 0) > 0)
      .sort((a, b) => (counts.get(b.name) ?? 0) - (counts.get(a.name) ?? 0))
      .slice(0, MAX_FREQUENT);
  }, [serviceList, reservations]);

  // Filter by search
  const filteredServices = useMemo(() => {
    if (!search.trim()) return serviceList;
    const q = search.toLowerCase();
    return serviceList.filter((s) => s.name.toLowerCase().includes(q));
  }, [serviceList, search]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-subtle bg-surface p-4 space-y-3"
          >
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Frequent services (only when enough services exist) */}
      {frequentServices.length > 0 && !search.trim() && (
        <div className="space-y-2">
          <p className="text-caption text-foreground-muted font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Más solicitados
          </p>
          <div className="flex flex-wrap gap-2">
            {frequentServices.map((product) => {
              const isSelected = selectedId === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelect(product)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md border text-body-sm font-medium transition-all duration-150",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent shadow-glow-accent"
                      : "border-border-subtle bg-surface-raised/40 text-foreground hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-6 w-6 rounded object-cover"
                    />
                  ) : (
                    <ProductPlaceholder
                      type={product.type}
                      className="h-6 w-6 rounded"
                    />
                  )}
                  <span>{product.name}</span>
                  <span className="text-caption text-foreground-muted">
                    {product.price.toLocaleString("es-ES")}€
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search (only when enough services) */}
      {serviceList.length > 6 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar servicio..."
            className="pl-9"
          />
        </div>
      )}

      {/* Full service grid */}
      {filteredServices.length === 0 ? (
        <p className="text-body-sm text-foreground-muted py-4">
          No se encontraron servicios{search.trim() ? ` para "${search}"` : ""}.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredServices.map((product) => {
            const isSelected = selectedId === product.id;
            return (
              <Card
                key={product.id}
                variant="interactive"
                onClick={() => onSelect(product)}
                className={cn(
                  "flex flex-col items-center p-4 gap-2 text-center",
                  isSelected && "border-accent shadow-glow-accent"
                )}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <ProductPlaceholder
                    type={product.type}
                    className="h-16 w-16 rounded-md"
                  />
                )}
                <span className="text-body-sm font-semibold text-foreground truncate w-full">
                  {product.name}
                </span>
                <span className="text-caption text-foreground-muted">
                  {product.price.toLocaleString("es-ES")}€
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
