import { NextResponse, NextRequest } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;
    const jwt = auth.jwt;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID de la reseña" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE}/google-reviews/reviews/${id}/generate-response`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
      }
    );

    let data;
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.detail || "Error al generar respuesta" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      { error: "Error al generar respuesta IA" },
      { status: 500 }
    );
  }
}
