import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { message } = await request.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
  }

  // Obtener email del usuario autenticado desde Supabase
  let userEmail = "(no autenticado)";
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email || "(no autenticado)";
  } catch {
    userEmail = "(no autenticado)";
  }

  // Configura el transporter de nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_BUSINEXT_USER,
      pass: process.env.GMAIL_BUSINEXT_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_BUSINEXT_USER,
      to: "greenfourtech@gmail.com",
      subject: "Consulta/Queja desde Businext",
      text: `Email del usuario: ${userEmail}\n\nMensaje:\n${message}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo enviar el email" },
      { status: 500 }
    );
  }
}
