import { NextRequest, NextResponse } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;

export async function GET() {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const response = await fetch(`${API_BASE}/locations/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.jwt}`,
      },
    });

    const data = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Error fetching locations" },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching locations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const response = await fetch(`${API_BASE}/locations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.jwt}`,
      },
      body: JSON.stringify(body),
    });

    const data = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Error creating location" },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating location" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const response = await fetch(`${API_BASE}/locations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.jwt}`,
      },
      body: JSON.stringify(body),
    });

    const data = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Error updating location" },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating location" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const response = await fetch(`${API_BASE}/locations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.jwt}`,
      },
    });

    const data = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Error deleting location" },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error deleting location" },
      { status: 500 },
    );
  }
}
