"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GoogleMapsUrlFormProps = {
  onSubmit: (url: string) => Promise<unknown>;
  submitting: boolean;
  error: string | null;
};

export function GoogleMapsUrlForm({
  onSubmit,
  submitting,
  error,
}: GoogleMapsUrlFormProps) {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!url.trim()) {
      setLocalError("Por favor ingresa una URL");
      return;
    }

    if (!url.includes("google.com/maps") && !url.includes("maps.google.com") && !url.includes("goo.gl/maps")) {
      setLocalError("La URL debe ser de Google Maps");
      return;
    }

    await onSubmit(url.trim());
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-h3 font-heading font-bold text-foreground">
            Conecta tu negocio
          </h2>
          <p className="text-body-sm text-foreground-muted">
            Ingresa la URL de tu negocio en Google Maps para ver tus reseñas y
            estadísticas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="google-maps-url"
              className="text-body-sm font-medium text-foreground"
            >
              URL de Google Maps
            </label>
            <Input
              id="google-maps-url"
              type="url"
              placeholder="https://www.google.com/maps/place/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setLocalError(null);
              }}
              state={displayError ? "error" : "default"}
              disabled={submitting}
            />
            {displayError && (
              <p className="text-caption text-danger">{displayError}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={submitting}
            disabled={submitting || !url.trim()}
          >
            Vincular negocio
          </Button>
        </form>

        <div className="text-center">
          <p className="text-caption text-foreground-subtle">
            Copia la URL completa de la página de tu negocio en Google Maps.
            <br />
            Ejemplo: https://www.google.com/maps/place/Mi+Negocio/...
          </p>
        </div>
      </div>
    </div>
  );
}
