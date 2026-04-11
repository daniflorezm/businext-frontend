import { NextResponse } from "next/server";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

/**
 * Proxies GET /auth/me to the backend.
 *
 * The backend is the single source of truth for the access context:
 * role, account type, member status, subscription state, and UI capabilities.
 *
 * Status codes are forwarded transparently so the caller can react:
 * - 200: authenticated user with full context
 * - 401: missing/invalid/expired token
 * - 403: valid token but onboarding not complete or subscription inactive
 */
export async function GET() {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;
    const jwt = auth.jwt;

    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching access context:", error);
    return NextResponse.json(
      { error: "Failed to fetch access context" },
      { status: 500 }
    );
  }
}
