"use client";

import { Product } from "@/lib/product/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface ServiceCardsProps {
  services: Product[];
  selectedId: number | null;
  onSelect: (product: Product) => void;
  loading: boolean;
}

export function ServiceCards({
  services,
  selectedId,
  onSelect,
  loading,
}: ServiceCardsProps) {
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {services.filter((p) => p.type !== "producto").map((product) => {
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
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-surface-raised">
                <ImageIcon className="h-6 w-6 text-foreground-subtle" />
              </div>
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
  );
}
