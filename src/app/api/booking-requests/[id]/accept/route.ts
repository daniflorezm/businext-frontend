import { NextResponse } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getVerifiedServerAccessToken();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const response = await fetch(`${API_BASE}/booking-requests/${id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.jwt}` },
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
