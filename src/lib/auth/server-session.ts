import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type TokenResult =
  | { jwt: string }
  | { error: NextResponse<{ error: string }> };

export async function getVerifiedServerAccessToken(): Promise<TokenResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  const jwt = sessionData?.session?.access_token;

  if (sessionError || !jwt) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { jwt };
}