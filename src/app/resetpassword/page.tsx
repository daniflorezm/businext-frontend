"use client";
import { resetPassword } from "@/app/resetpassword/actions";
import { useActionState } from "react";

export default function ResetPasswordPage() {
  const [resetPasswordState, resetPasswordAction] = useActionState(
    resetPassword,
    { error: "" }
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        action={resetPasswordAction}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Recuperar contraseña
        </h2>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 font-medium">
            Nueva contraseña
          </label>
          <input
            type="password"
            name="password"
            id="password"
            minLength={6}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Ingresa tu nueva contraseña"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-2 font-medium">
            Confirmar contraseña
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            minLength={6}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Confirma tu nueva contraseña"
          />
        </div>
        {resetPasswordState.error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {resetPasswordState.error}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
}
