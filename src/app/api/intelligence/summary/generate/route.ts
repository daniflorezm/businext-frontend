import { NextResponse } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

export async function POST() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;
    const jwt = auth.jwt;
    const response = await fetch(`${API_BASE}/intelligence/summary/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
    });
    let data;
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || data.error || "Error al generar el resumen" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error generating intelligence summary:", error);
    return NextResponse.json(
      { error: "Error al generar el resumen" },
      { status: 500 }
    );
  }
}
