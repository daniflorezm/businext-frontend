import { NextResponse, NextRequest } from "next/server";
import { Configuration } from "@/lib/configuration/types";
import { mapConfigurationToApi } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const response = await fetch(`${API_BASE}/configuration/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching configuration data:", error);
    return NextResponse.json(
      { error: "Error fetching configuration data" },
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
    const body: Configuration = await request.json();
    const mappedBody = mapConfigurationToApi(body);
    const response = await fetch(`${API_BASE}/configuration/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(mappedBody),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating configuration:", error);
    return NextResponse.json(
      { error: "Error creating configuration" },
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
    const response = await fetch(`${API_BASE}/configuration/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting configuration:", error);
    return NextResponse.json(
      { error: "Error deleting configuration" },
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
    const configuration: Configuration = await request.json();
    const response = await fetch(`${API_BASE}/configuration/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(configuration),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { error: "Error updating configuration" },
      { status: 500 }
    );
  }
}
