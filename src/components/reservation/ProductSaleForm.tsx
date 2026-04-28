"use client";

import { useState } from "react";
import { Product } from "@/lib/product/types";
import { Finances } from "@/lib/finances/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, X } from "lucide-react";

interface ProductSaleFormProps {
  productData: Product[];
  currentUserName: string;
  loading: boolean;
  onSale: (data: Omit<Finances, "id">) => Promise<void>;
}

export function ProductSaleForm({
  productData,
  currentUserName,
  loading,
  onSale,
}: ProductSaleFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const products = productData.filter((p) => p.type === "producto");

  const handleSubmit = async () => {
    if (!selectedProduct || submitting) return;
    setSubmitting(true);
    try {
      const total = selectedProduct.price * quantity;
      await onSale({
        concept: selectedProduct.name,
        amount: total,
        type: "INCOME",
        creator: currentUserName,
        reservation_id: null,
      });
      setSelectedProduct(null);
      setQuantity(1);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-subtle bg-surface p-4 space-y-3"
          >
            <Skeleton className="h-16 w-16 rounded-md mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-body-sm text-foreground-muted py-4">
        No hay productos configurados. Añade productos en la sección de configuración.
      </p>
    );
  }

  // Product selection grid
  if (!selectedProduct) {
    return (
      <div className="space-y-2">
        <p className="text-caption text-foreground-muted font-medium uppercase tracking-wider">
          Selecciona un producto
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <Card
              key={product.id}
              variant="interactive"
              onClick={() => setSelectedProduct(product)}
              className="flex flex-col items-center p-4 gap-2 text-center"
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
          ))}
        </div>
      </div>
    );
  }

  // Sale form for selected product
  const total = selectedProduct.price * quantity;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-caption text-foreground-muted font-medium uppercase tracking-wider">
          Registrar venta
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedProduct(null);
            setQuantity(1);
          }}
          className="text-foreground-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Product info (read-only) */}
      <div className="flex items-center gap-3 bg-surface-raised/60 border border-border-subtle rounded-md px-3 py-2.5">
        {selectedProduct.imageUrl ? (
          <img
            src={selectedProduct.imageUrl}
            alt={selectedProduct.name}
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-surface">
            <ImageIcon className="h-4 w-4 text-foreground-subtle" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-semibold text-foreground truncate">
            {selectedProduct.name}
          </p>
          <p className="text-caption text-foreground-muted">
            {selectedProduct.price.toLocaleString("es-ES")}€ / unidad
          </p>
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-1.5">
        <label className="text-caption text-foreground-muted">Cantidad</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => {
            const v = Math.max(1, Math.min(99, Number(e.target.value) || 1));
            setQuantity(v);
          }}
          min={1}
          max={99}
        />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between bg-surface-raised/60 border border-border-subtle rounded-md px-3 py-2.5">
        <span className="text-body-sm text-foreground-muted">Total</span>
        <span className="text-body-sm font-bold text-foreground">
          {total.toLocaleString("es-ES")}€
        </span>
      </div>

      {/* Submit */}
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={submitting}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "Registrando..." : "Registrar venta"}
      </Button>
    </div>
  );
}
