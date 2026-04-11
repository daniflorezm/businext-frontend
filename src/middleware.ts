import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { publicRoutes } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

/**
 * Fetches the access context from the backend using the provided JWT.
 * Returns null on any auth/network error so the middleware can fall back gracefully.
 */
async function fetchAccessContext(jwt: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Allow free access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Refresh the Supabase session cookie
  const { response, user, session, error } = await updateSession(request);

  try {
    // Not authenticated — redirect to login
    if (error || !user) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Fetch access context from the backend — single source of truth
    const jwt = session?.access_token;
    if (!jwt) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const access = await fetchAccessContext(jwt);

    if (!access) {
      // Backend unreachable or token invalid — pass through and let pages handle it
      return response;
    }

    // Member onboarding redirect
    if (access.accountType === "member") {
      if (access.memberStatus === "inactive") {
        if (pathname !== "/error") {
          url.pathname = "/error";
          url.searchParams.set("message", "account-inactive");
          return NextResponse.redirect(url);
        }
        return response;
      }

      if (access.memberStatus !== "active" && pathname !== "/employee/onboarding") {
        url.pathname = "/employee/onboarding";
        return NextResponse.redirect(url);
      }

      if (!access.capabilities.canAccessApp) {
        url.pathname = "/error";
        url.searchParams.set("message", "subscription-required");
        return NextResponse.redirect(url);
      }

      if (access.memberStatus === "active" && pathname === "/employee/onboarding") {
        url.pathname = "/reservation";
        return NextResponse.redirect(url);
      }

      if (pathname === "/payment" || pathname === "/paymentredirection") {
        url.pathname = "/reservation";
        return NextResponse.redirect(url);
      }

      return response;
    }

    // Owner subscription check — redirect to payment if no active subscription
    if (!access.capabilities.canAccessApp && pathname !== "/payment") {
      if (pathname === "/paymentredirection") {
        return response;
      }
      url.pathname = "/payment";
      url.searchParams.set("reason", "no-subscription");
      return NextResponse.redirect(url);
    }

    if (access.capabilities.canAccessApp && (pathname === "/payment" || pathname === "/paymentredirection")) {
      url.pathname = "/reservation";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    console.error("Middleware error:", err);
    url.pathname = "/error";
    url.searchParams.set("message", "authentication-error");
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
