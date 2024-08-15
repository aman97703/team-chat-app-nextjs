// middleware.js
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const isVisitingAuthPage =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signin") ||
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/auth");

  const isVisitingDashboardPage = req.nextUrl.pathname.startsWith("/server");

  // If the user is authenticated and trying to access the sign-in page, redirect them
  if (token && isVisitingAuthPage) {
    return NextResponse.rewrite(new URL('/', req.url))
  }

  // If the user is not authenticated and trying to access a protected page, redirect to login
  if (!token && isVisitingDashboardPage) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/signin", "/dashboard/:path*"], // Add other protected routes here
};
