"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

export async function resetPassword(
  state: { error: string },
  formData: FormData
) {
  const supabase = await createClient();

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

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
