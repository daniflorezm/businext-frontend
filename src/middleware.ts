import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { publicRoutes, authOnlyRoutes } from "@/lib/utils";
import { checkSubscription } from "@/app/actions/checkSubscription";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Permitir acceso libre a rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Actualiza sesión
  const response = await updateSession(request);

  try {
    // Obtener usuario de la sesión
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Si hay error o no hay usuario, redirigir a login
    if (error || !user) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname); // Guardar la ruta original
      return NextResponse.redirect(url);
    }

    // Si es una ruta que solo requiere autenticación (payment, paymentredirection),
    // permitir acceso sin verificar suscripción
    if (authOnlyRoutes.includes(pathname)) {
      return response;
    }

    // Para rutas protegidas, verificar suscripción activa
    const hasSubscription = await checkSubscription(user.id);

    if (!hasSubscription) {
      // Evitar loop de redirección
      if (pathname !== "/payment") {
        url.pathname = "/payment";
        url.searchParams.set("reason", "no-subscription");
        return NextResponse.redirect(url);
      }
    }

    return response;
  } catch (err) {
    console.error("Error en middleware:", err);
    // En caso de error, redirigir a página de error
    url.pathname = "/error";
    url.searchParams.set("message", "authentication-error");
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api (rutas API)
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico
     * - archivos de imágenes (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
