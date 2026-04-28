import { NextResponse, NextRequest } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

export async function GET() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;
    const jwt = auth.jwt;
    const response = await fetch(`${API_BASE}/working-hours/`, {
      method: "GET",
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
        { error: data.error || "Error fetching working hours" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching working hours:", error);
    return NextResponse.json(
      { error: "Error fetching working hours" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;
    const jwt = auth.jwt;
    const body = await request.json();
    const response = await fetch(`${API_BASE}/working-hours/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(body),
    });
    let data;
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Error updating working hours" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating working hours:", error);
    return NextResponse.json(
      { error: "Error updating working hours" },
      { status: 500 }
    );
  }
}
