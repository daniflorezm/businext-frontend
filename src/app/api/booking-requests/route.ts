import { NextResponse, NextRequest } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;

export async function GET(request: NextRequest) {
  const auth = await getVerifiedServerAccessToken();
  if ("error" in auth) return auth.error;

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const url = `${API_BASE}/booking-requests/${status ? `?status=${status}` : ""}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${auth.jwt}` },
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
