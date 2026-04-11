"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(state: { error: string }, formData: FormData) {
  "use server";
  const supabase = await createClient();

  const data = {
    email: (formData.get("email") as string).toString().trim(),
    password: (formData.get("password") as string).toString().trim(),
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  revalidatePath("/", "layout");
  redirect("/reservation");
}

export async function signup(state: { error: string }, formData: FormData) {
  const email = (formData.get("email") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  const fullName = (formData.get("fullName") || "").toString().trim();

  // Validación de email
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Email inválido" };
  }

  // Validación avanzada de contraseña
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

  // Validación avanzada de nombre completo
  if (!fullName || fullName.length < 3) {
    return { error: "Nombre completo inválido (mínimo 3 caracteres)" };
  }
  if (/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/.test(fullName)) {
    return { error: "El nombre completo no debe contener números ni símbolos" };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    let data;
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    if (!response.ok) {
      return { error: data.error || data.detail || "Error al crear la cuenta" };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error al crear la cuenta",
    };
  }

  revalidatePath("/", "layout");
  redirect("/login/verify");
}
