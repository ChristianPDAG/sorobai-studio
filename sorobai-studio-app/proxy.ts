import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

// Rutas públicas (no requieren wallet)
const publicRoutes = [
  '/',
  '/hub',
  '/terms',
  '/privacy',
  '/auth',
];

// Rutas que requieren wallet conectada
const protectedRoutes = [
  '/dashboard',
  '/studio',
  '/bounties',
  '/settings',
  '/profile',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return await updateSession(request);
  }

  // Verificar si la ruta requiere wallet
  const requiresWallet = protectedRoutes.some(route => pathname.startsWith(route));

  if (requiresWallet) {
    // En producción, aquí verificarías la sesión de Supabase
    // Por ahora, permitimos el acceso (el componente manejará el estado)
    return await updateSession(request);
  }

  // Handle Supabase session for all other routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
