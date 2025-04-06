import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  const sessionCookie = request.cookies.get("authjs.session-token")?.value;
  const isLoggedIn = !!sessionCookie;

  const isAuthRoute =
    nextUrl.pathname === "/signin" || nextUrl.pathname === "/signup";

  // If user is logged in and tries to access signin/signup, redirect to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is NOT logged in and tries to access any /dashboard route, redirect to signin
  if (nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Everything else is allowed
  return NextResponse.next();
}

export const config = {
  // Define which routes to run the middleware on
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth|[\\w-]+\\.\\w+).*)",
  ],
};
