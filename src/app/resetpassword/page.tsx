"use client";
import { resetPassword } from "@/app/resetpassword/actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [resetPasswordState, resetPasswordAction] = useActionState(
    resetPassword,
    { error: "" }
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardContent className="p-8">
          <form action={resetPasswordAction} className="flex flex-col gap-6">
            <h2 className="font-heading text-h2 font-bold text-foreground text-center mb-2">
              Recuperar contraseña
            </h2>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-label font-semibold text-foreground-muted"
              >
                Nueva contraseña
              </label>
              <Input
                type="password"
                name="password"
                id="password"
                minLength={6}
                required
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-label font-semibold text-foreground-muted"
              >
                Confirmar contraseña
              </label>
              <Input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                minLength={6}
                required
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
            {resetPasswordState.error && (
              <div className="text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2 text-caption text-center">
                {resetPasswordState.error}
              </div>
            )}
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Actualizar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
