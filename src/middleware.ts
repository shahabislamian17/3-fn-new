
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isDashboardRoute = path.startsWith('/dashboard');

  // If it's not a dashboard route, let it pass
  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  // Check for firebase_id_token cookie
  const firebaseToken = req.cookies.get("firebase_id_token")?.value;
  
  // Debug logging (can be removed in production)
  const isDev = process.env.NODE_ENV !== "production";
  if (!firebaseToken && isDev) {
    console.log("🔒 Middleware: No firebase_id_token cookie found");
    console.log("🔒 Available cookies:", req.cookies.getAll().map(c => c.name));
  }

  if (!firebaseToken) {
    // Only redirect if not already on login page to avoid redirect loops
    if (path !== '/login' && !path.startsWith('/login')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectUrl', path);
      // Use 307 to preserve POST data if any, but for GET requests it's fine
      return NextResponse.redirect(url, 307);
    }
  }

  // Basic verification of cookie presence is enough for middleware.
  // The actual verification of the token will happen in the backend service
  // on each API call. This prevents server-only packages from being
  // bundled with the client.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
