"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

export async function completeEmployeeOnboarding(
  state: { error: string },
  formData: FormData
) {
  const password = (formData.get("password") || "").toString().trim();
  const confirmPassword = (formData.get("confirmPassword") || "")
    .toString()
    .trim();

  if (!password || password.length < 6) {
    return { error: "Contraseña inválida (mínimo 6 caracteres)" };
  }

  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return {
      error: "La contraseña debe contener mayúsculas, minúsculas y números",
    };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const auth = await getVerifiedServerAccessToken();
  if ("error" in auth) {
    return { error: "No se encontró una sesión válida para completar el onboarding" };
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const response = await fetch(`${apiBase}/employees/onboarding/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.jwt}`,
    },
    body: JSON.stringify({ password }),
  });

  let data;
  if (response.headers.get("content-type")?.includes("application/json")) {
    data = await response.json();
  } else {
    data = { error: await response.text() };
  }

  if (!response.ok) {
    return {
      error:
        data.detail ||
        data.error ||
        "No se pudo completar el onboarding",
    };
  }

  revalidatePath("/", "layout");
  redirect("/reservation");
}
