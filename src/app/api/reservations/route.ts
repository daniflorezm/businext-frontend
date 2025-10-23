import { NextResponse, NextRequest } from "next/server";
import { Reservation } from "@/lib/reservation/types";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const { searchParams } = request.nextUrl;
    const offset = searchParams.get("offset") || 0;
    const limit = searchParams.get("limit") || 100;
    const response = await fetch(
      `${API_BASE}/reservations/?offset=${offset}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching reservations data:", error);
    return NextResponse.json(
      { error: "Error fetching reservations data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const body: Reservation = await request.json();
    const response = await fetch(`${API_BASE}/reservations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error creating reservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }
    const response = await fetch(`${API_BASE}/reservations/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { error: "Error deleting reservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }
    const reservation: Reservation = await request.json();
    const response = await fetch(`${API_BASE}/reservations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(reservation),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Error updating reservation" },
      { status: 500 }
    );
  }
}
