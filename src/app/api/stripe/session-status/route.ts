import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/types";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const res = NextResponse.json({ status: session.status });

    // Clear the access context cache so middleware refetches after subscription change
    if (session.status === "complete") {
      res.cookies.set("x-access-context", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
    }

    return res;
  } catch (e) {
    console.error("Stripe session retrieve error:", e);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
