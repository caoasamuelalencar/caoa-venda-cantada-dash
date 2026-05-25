import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("caoa-auth")?.value;
  const isPublicPage = publicPaths.some((path) => pathname === path || pathname.startsWith(path));

  if (!authCookie && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authCookie && isPublicPage) {
    return NextResponse.redirect(new URL("/relatorios", request.url));
  }

  return NextResponse.next();
}
