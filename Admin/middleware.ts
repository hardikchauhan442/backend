import { appConfig } from "@/config/app.config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = localStorage.getItem(appConfig.auth.tokenKey);

  // Check if the route is public
  const isPublicRoute = appConfig.publicRoutes.includes(pathname);

  // Check if the route is private
  const isPrivateRoute = appConfig.privateRoutes.includes(pathname);

  // Allow public routes
  if (isPublicRoute) {
    // If user is authenticated and trying to access login page, redirect to dashboard
    if (token && pathname === appConfig.routes.unauthenticatedEntryPath) {
      return NextResponse.redirect(
        new URL(appConfig.routes.authenticatedEntryPath, request.url)
      );
    }
    return NextResponse.next();
  }

  // Handle private routes
  if (isPrivateRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL(
        appConfig.routes.unauthenticatedEntryPath,
        request.url
      );
      // Save the attempted URL for redirect after login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // TODO: Add role-based access control here if needed
    // You can decode the JWT token to get user role and check permissions

    return NextResponse.next();
  }

  // Handle root path
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(
        new URL(appConfig.routes.authenticatedEntryPath, request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(appConfig.routes.unauthenticatedEntryPath, request.url)
      );
    }
  }

  // For any other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
