"use client";

import { login, signup } from "@/app/login/actions";
import { useRef } from "react";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
  const router = useRouter();

  const handleSubmitAction = async (formData: FormData) => {
    if (formLoading) return;
    setFormLoading(true);
    try {
      if (mode === "login") {
        await loginAction(formData);
      } else {
        await signupAction(formData);
      }
    } finally {
      setFormLoading(false);
    }
  };

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
    } catch {
      setRecoveryState({ error: "Error de red. Intenta de nuevo." });
    } finally {
      setRecoveryLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card variant="elevated" className="w-full max-w-md">
        <CardContent className="p-8 sm:p-10 flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <Button variant="secondary" onClick={() => router.push("/")}>
              Volver al dashboard
            </Button>
          </div>
          <h1 className="font-heading text-h2 font-bold text-foreground text-center mb-2">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <form className="flex flex-col gap-4" action={handleSubmitAction}>
            {showRecovery && (
              <div className="flex flex-col gap-3 mb-2 p-4 rounded-lg border border-border-subtle bg-surface-raised">
                <h2 className="font-heading text-h4 font-semibold text-foreground">
                  Recuperar contraseña
                </h2>
                {recoveryState.error && (
                  <div className="text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2 text-caption font-medium text-center">
                    {recoveryState.error}
                  </div>
                )}
                {recoveryState.success && (
                  <div className="text-success bg-success/10 border border-success/30 rounded-md px-3 py-2 text-caption font-medium text-center">
                    {recoveryState.success}
                  </div>
                )}
                <Input
                  ref={recoveryEmailRef}
                  type="email"
                  placeholder="Tu correo electrónico"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleRecovery}
                  loading={recoveryLoading}
                >
                  Enviar correo de recuperación
                </Button>
                <button
                  type="button"
                  className="text-primary underline text-caption mt-2"
                  onClick={() => setShowRecovery(false)}
                >
                  Cerrar
                </button>
              </div>
            )}
            {mode === "login" && loginState?.error && (
              <div className="text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2 text-caption font-medium text-center">
                {loginState.error}
              </div>
            )}
            {mode === "signup" && signupState?.error && (
              <div className="text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2 text-caption font-medium text-center">
                {signupState.error}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-label font-semibold text-foreground-muted"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1 relative">
              <label
                htmlFor="password"
                className="text-label font-semibold text-foreground-muted"
              >
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {mode === "login" && !showRecovery && (
                <button
                  type="button"
                  className="text-primary underline text-caption mt-2 text-right"
                  onClick={() => setShowRecovery(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            {mode === "signup" && (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="fullName"
                  className="text-label font-semibold text-foreground-muted"
                >
                  Nombre completo
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={formLoading}
                className="w-full sm:w-auto"
              >
                {formLoading
                  ? mode === "login"
                    ? "Iniciando..."
                    : "Creando..."
                  : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </Button>
            </div>
          </form>
          <div className="text-center mt-2">
            {mode === "login" ? (
              <button
                type="button"
                className="text-primary hover:underline text-body-sm font-medium transition-colors duration-150 ease-snappy"
                onClick={() => setMode("signup")}
              >
                ¿No tienes cuenta? Regístrate
              </button>
            ) : (
              <button
                type="button"
                className="text-primary hover:underline text-body-sm font-medium transition-colors duration-150 ease-snappy"
                onClick={() => setMode("login")}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
