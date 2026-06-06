import { NextRequest, NextResponse } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const response = await fetch(`${API_BASE}/reservations/${id}/revert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.jwt}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reverting reservation:", error);
    return NextResponse.json({ error: "Error al revertir la reserva" }, { status: 500 });
  }
}
