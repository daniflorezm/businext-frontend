"use client";

import { useActionState } from "react";
import { completeEmployeeOnboarding } from "@/app/employee/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployeeOnboardingPage() {
  const [state, action] = useActionState(completeEmployeeOnboarding, {
    error: "",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardContent className="p-8">
          <form action={action} className="flex flex-col gap-6">
            <h1 className="font-heading text-h2 font-bold text-foreground text-center mb-2">
              Completa tu acceso
            </h1>
            <p className="text-center text-foreground-muted text-body-sm mb-2">
              Define tu contraseña para terminar el onboarding como empleado.
            </p>

            <div className="flex flex-col gap-1.5">
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
                minLength={6}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-label font-semibold text-foreground-muted"
              >
                Repetir contraseña
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={6}
                required
              />
            </div>

            {state.error && (
              <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-caption text-danger">
                {state.error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Finalizar onboarding
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
