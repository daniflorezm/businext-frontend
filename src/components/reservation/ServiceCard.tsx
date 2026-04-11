"use client";

import { Product } from "@/lib/product/types";
import { Clock, Tag } from "lucide-react";

interface ServiceCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

export function ServiceCard({ product, isSelected, onSelect }: ServiceCardProps) {
  const typeLabel = product.type === "service" ? "Servicio" : "Producto";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group relative w-full text-left p-5 rounded-2xl border transition-all duration-300
        ${isSelected 
          ? "border-primary bg-primary/10 glow-primary" 
          : "border-border bg-card hover:border-primary/50 hover:bg-secondary"
        }
      `}
    >
      {/* Selection indicator */}
      <div className={`
        absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all duration-300
        flex items-center justify-center
        ${isSelected 
          ? "border-primary bg-primary" 
          : "border-muted-foreground"
        }
      `}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Product image or placeholder */}
      <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-secondary">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product info */}
      <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-1">
        {product.name}
      </h3>

      <div className="flex items-center justify-between gap-2">
        <span className={`
          text-xs px-2.5 py-1 rounded-full font-medium
          ${product.type === "service" 
            ? "bg-accent/20 text-accent" 
            : "bg-primary/20 text-primary"
          }
        `}>
          {typeLabel}
        </span>

        <span className="text-xl font-bold text-primary">
          ${product.price?.toLocaleString("es-CO") ?? 0}
        </span>
      </div>
    </button>
  );
}
