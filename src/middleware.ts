
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

  if (!firebaseToken) {
    // Only redirect if not already on login page to avoid redirect loops
    if (path !== '/login') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectUrl', path);
      return NextResponse.redirect(url);
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
