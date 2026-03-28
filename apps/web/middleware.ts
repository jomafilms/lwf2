import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/dashboard", "/plans", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (needsAuth) {
    const sessionCookie = getSessionCookie(req);
    if (!sessionCookie) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
