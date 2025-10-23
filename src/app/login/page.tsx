"use client";

import { login, signup } from "@/app/login/actions";
import { useRef } from "react";
import { useActionState, useState } from "react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const [loginState, loginAction] = useActionState(login, { error: "" });
  const [signupState, signupAction] = useActionState(signup, { error: "" });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryState, setRecoveryState] = useState<{
    error?: string;
    success?: string;
  }>({});
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const recoveryEmailRef = useRef<HTMLInputElement>(null);

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryState({});
    const email = recoveryEmailRef.current?.value.trim();
    if (!email) {
      setRecoveryState({ error: "Ingresa tu email" });
      setRecoveryLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        setRecoveryState({ error: data.error });
      } else {
        setRecoveryState({
          success:
            "¡Correo de recuperación enviado! Revisa tu bandeja de entrada.",
        });
      }
    } catch (err) {
      setRecoveryState({ error: "Error de red. Intenta de nuevo." });
    } finally {
      setRecoveryLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-50">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl border border-blue-100 p-8 sm:p-10 flex flex-col gap-6">
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={() => redirect("/")}
            className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 tracking-wide ring-2 ring-blue-200 hover:ring-blue-400 focus:outline-none focus:ring-4 flex items-center justify-center gap-2"
          >
            Volver al dashboard
          </button>
        </div>
        <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-2 tracking-tight">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <form
          className="flex flex-col gap-4"
          action={async (formData) => {
            setFormLoading(true);
            if (mode === "login") {
              await loginAction(formData);
            } else {
              await signupAction(formData);
            }
            setFormLoading(false);
          }}
        >
          {showRecovery && (
            <div className="flex flex-col gap-3 mb-2 p-4 rounded-xl border border-blue-200 bg-blue-50">
              <h2 className="text-blue-700 font-bold text-lg">
                Recuperar contraseña
              </h2>
              {recoveryState.error && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm font-medium text-center">
                  {recoveryState.error}
                </div>
              )}
              {recoveryState.success && (
                <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium text-center">
                  {recoveryState.success}
                </div>
              )}
              <input
                ref={recoveryEmailRef}
                type="email"
                placeholder="Tu correo electrónico"
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder:text-blue-400"
              />
              <button
                type="button"
                className="bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                onClick={handleRecovery}
                disabled={recoveryLoading}
              >
                {recoveryLoading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                )}
                Enviar correo de recuperación
              </button>
              <button
                type="button"
                className="text-blue-600 underline text-sm mt-2"
                onClick={() => setShowRecovery(false)}
              >
                Cerrar
              </button>
            </div>
          )}
          {mode === "login" && loginState?.error && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm font-medium text-center">
              {loginState.error}
            </div>
          )}
          {mode === "signup" && signupState?.error && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm font-medium text-center">
              {signupState.error}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-blue-700 font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder:text-blue-400 transition-all"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="text-blue-700 font-semibold">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder:text-blue-400 transition-all pr-12"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {mode === "login" && !showRecovery && (
              <button
                type="button"
                className="text-blue-600 underline text-xs mt-2 text-right"
                onClick={() => setShowRecovery(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
          {mode === "signup" && (
            <>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="fullName"
                  className="text-blue-700 font-semibold"
                >
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder:text-blue-400 transition-all"
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                />
              </div>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 tracking-wide ring-2 ring-blue-200 hover:ring-blue-400 focus:outline-none focus:ring-4 flex items-center justify-center gap-2"
              disabled={formLoading}
            >
              {formLoading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              )}
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          {mode === "login" ? (
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm font-medium"
              onClick={() => setMode("signup")}
            >
              ¿No tienes cuenta? Regístrate
            </button>
          ) : (
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm font-medium"
              onClick={() => setMode("login")}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
