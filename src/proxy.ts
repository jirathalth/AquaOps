import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isDevelopmentAuthBypass } from "@/config/auth-bypass";

export function proxy(request: NextRequest) {
  if (isDevelopmentAuthBypass() || getSessionCookie(request)) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/dashboard/:path*", "/customers/:path*", "/sales/:path*", "/delivery/:path*", "/accounting/:path*", "/inventory/:path*", "/reports/:path*", "/admin/:path*", "/dev/:path*", "/forbidden"] };
