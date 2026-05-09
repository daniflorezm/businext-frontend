"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentRedirectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";

  const [status, setStatus] = useState<"loading" | "error" | "no-session">(
    sessionId ? "loading" : "no-session"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al verificar la sesión de pago");
        return r.json();
      })
      .then((data) => {
        if (data.status === "complete") {
          router.replace("/reservation");
        } else {
          setErrorMsg("El pago no pudo ser procesado correctamente.");
          setStatus("error");
        }
      })
      .catch((e) => {
        setErrorMsg(
          e instanceof Error
            ? e.message
            : "Hubo un error al verificar el pago."
        );
        setStatus("error");
      });
  }, [sessionId, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="h-8 w-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-foreground-muted">
          Verificando tu pago...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-4 p-4 bg-danger/10 text-danger rounded-lg text-center font-semibold shadow-sm border border-danger/30">
        {status === "no-session"
          ? "No se recibió el identificador de sesión. Intenta de nuevo."
          : errorMsg}
      </div>
      <Link
        href="/"
        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow-md hover:bg-primary-hover transition-colors duration-150"
      >
        Volver al dashboard
      </Link>
    </div>
  );
}
