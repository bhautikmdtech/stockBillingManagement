// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware runs in the Edge runtime
export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Check for session cookie to determine login status
  // This avoids using mongoose in Edge runtime
  const sessionCookie = request.cookies.get("authjs.session-token")?.value;

  const isLoggedIn = !!sessionCookie;

  // Define public routes that don't require authentication
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/signin" ||
    nextUrl.pathname === "/signup" ||
    nextUrl.pathname.startsWith("/api/");

  // Define routes that should be accessible only to logged-out users
  const isAuthRoute =
    nextUrl.pathname === "/signin" || nextUrl.pathname === "/signup";

  // If the user is trying to access auth routes while logged in, redirect to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If the user is not logged in and trying to access a protected route, redirect to login
  if (!isPublicRoute && !isLoggedIn) {
    // Store the original URL they were trying to visit
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

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
