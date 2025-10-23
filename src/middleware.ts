import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
export const config = {
  matcher: [
    // Excluye rutas públicas, estáticos, login, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|login|auth|error|resetpassword|payment|paymentredirection|actions|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
