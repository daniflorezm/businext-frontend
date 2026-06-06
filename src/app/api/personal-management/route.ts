import { NextRequest, NextResponse } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";
import { InviteEmployeeInput } from "@/lib/employee/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

async function proxyToBackend(method: "GET" | "POST", body?: InviteEmployeeInput) {
  const auth = await getVerifiedServerAccessToken();
  if ("error" in auth) {
    return auth.error;
  }

  const response = await fetch(`${API_BASE}/employees/`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.jwt}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let data;
  if (response.headers.get("content-type")?.includes("application/json")) {
    data = await response.json();
  } else {
    data = { error: await response.text() };
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: data.detail || data.error || "Employee request failed" },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: response.status });
}

export async function GET() {
  try {
    return await proxyToBackend("GET");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InviteEmployeeInput;
    return await proxyToBackend("POST", body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to invite employee" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const memberUserId = searchParams.get("memberUserId");
    if (!memberUserId) {
      return NextResponse.json({ error: "memberUserId requerido" }, { status: 400 });
    }

    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const response = await fetch(`${API_BASE}/employees/${memberUserId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.jwt}`,
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
        { error: data.detail || data.error || "No se pudo actualizar el empleado" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el empleado" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const memberUserId = searchParams.get("memberUserId");
    if (!memberUserId) {
      return NextResponse.json({ error: "memberUserId requerido" }, { status: 400 });
    }

    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const response = await fetch(`${API_BASE}/employees/${memberUserId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${auth.jwt}` },
    });

    let data;
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "No se pudo eliminar el empleado" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo eliminar el empleado" },
      { status: 500 }
    );
  }
}
