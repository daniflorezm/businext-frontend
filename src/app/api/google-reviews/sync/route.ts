import { NextResponse } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function POST() {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;
    const jwt = auth.jwt;
    const response = await fetch(`${API_BASE}/google-reviews/sync`, {
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
        { error: data.error || data.detail || "Error al sincronizar reseñas" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error syncing reviews:", error);
    return NextResponse.json(
      { error: "Error al sincronizar reseñas" },
      { status: 500 }
    );
  }
}
