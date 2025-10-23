import { NextResponse, NextRequest } from "next/server";
import { Finances } from "@/lib/finances/types";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const response = await fetch(`${API_BASE}/finances/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching finances data:", error);
    return NextResponse.json(
      { error: "Error fetching finances data" },
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
    const body: Finances = await request.json();
    const response = await fetch(`${API_BASE}/finances/`, {
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
    console.error("Error creating finance:", error);
    return NextResponse.json(
      { error: "Error creating finance" },
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
    const response = await fetch(`${API_BASE}/finances/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting finance:", error);
    return NextResponse.json(
      { error: "Error deleting finance" },
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
    const finance: Finances = await request.json();
    const response = await fetch(`${API_BASE}/finances/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(finance),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating finance:", error);
    return NextResponse.json(
      { error: "Error updating finance" },
      { status: 500 }
    );
  }
}
