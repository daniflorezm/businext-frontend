"use client";

import { useActionState } from "react";
import { completeEmployeeOnboarding } from "@/app/employee/onboarding/actions";

export default function EmployeeOnboardingPage() {
  const [state, action] = useActionState(completeEmployeeOnboarding, {
    error: "",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-50 px-4">
      <form
        action={action}
        className="w-full max-w-md rounded-3xl border border-blue-100 bg-white/90 p-8 shadow-2xl"
      >
        <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-2">
          Completa tu acceso
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Define tu contraseña para terminar el onboarding como empleado.
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="password" className="font-semibold text-blue-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="confirmPassword" className="font-semibold text-blue-700">
            Repetir contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={6}
            required
            className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {state.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition hover:from-blue-600 hover:to-cyan-600"
        >
          Finalizar onboarding
        </button>
      </form>
    </div>
  );
}
