import { NextResponse, NextRequest } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

/** Proxies GET /tour — progreso de los tours guiados del usuario. */
export async function GET() {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const response = await fetch(`${API_BASE}/tour`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.jwt}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching tour state:", error);
    return NextResponse.json(
      { error: "Error fetching tour state" },
      { status: 500 }
    );
  }
}

/** Proxies PUT /tour — guarda el paso alcanzado o marca el tour completado. */
export async function PUT(request: NextRequest) {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;
    const body = await request.json();

    const response = await fetch(`${API_BASE}/tour`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.jwt}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error saving tour progress:", error);
    return NextResponse.json(
      { error: "Error saving tour progress" },
      { status: 500 }
    );
  }
}
