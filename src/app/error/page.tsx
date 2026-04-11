"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  "authentication-error": "No se pudo validar tu sesión. Intenta acceder nuevamente.",
  "subscription-required": "La suscripción del negocio no está activa. Contacta con el owner para reactivar el acceso.",
  "account-inactive": "Tu cuenta ha sido desactivada. Contacta con el administrador de tu negocio.",
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const messageKey = searchParams.get("message") ?? "";
  const message =
    ERROR_MESSAGES[messageKey] ?? "Algo ha ido mal, reintenta acceder nuevamente";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-50 px-4">
      <div className="max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 text-2xl font-bold text-red-700">Acceso no disponible</h1>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
