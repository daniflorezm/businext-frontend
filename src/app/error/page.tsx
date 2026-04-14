"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  "authentication-error":
    "No se pudo validar tu sesión. Intenta acceder nuevamente.",
  "subscription-required":
    "La suscripción del negocio no está activa. Contacta con el owner para reactivar el acceso.",
  "account-inactive":
    "Tu cuenta ha sido desactivada. Contacta con el administrador de tu negocio.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const messageKey = searchParams.get("message") ?? "";
  const message =
    ERROR_MESSAGES[messageKey] ??
    "Algo ha ido mal, reintenta acceder nuevamente";

  return (
    <Card variant="elevated" className="max-w-xl border-danger/30">
      <CardContent className="p-8 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="w-10 h-10 text-danger" />
        <h1 className="font-heading text-h3 font-bold text-danger">
          Acceso no disponible
        </h1>
        <p className="text-body-sm text-foreground-muted">{message}</p>
        <Link href="/login">
          <Button variant="primary" className="mt-2">
            Volver al inicio
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense
        fallback={
          <Card variant="elevated" className="max-w-xl">
            <CardContent className="p-8 text-center">
              <p className="text-foreground-muted">Cargando...</p>
            </CardContent>
          </Card>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  );
}
