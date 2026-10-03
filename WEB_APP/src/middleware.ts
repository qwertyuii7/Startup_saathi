import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev_schemesense_secret_key_change_in_production_32char";
const COOKIE_NAME = "schemesense_session";

async function verifyToken(token: string) {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as {
      sub: string;
      email: string;
      onboardingCompleted?: boolean;
      onboardingStep?: number;
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static assets, api routes, icons, and next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  // NOTE: /incubators (top-level) is a public marketing page; the
  // authenticated discovery tool lives at /dashboard/incubators,
  // which is covered by the /dashboard prefix below.
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/deep-analysis") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/schemes") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/documents");

  const isOnboardingPath = pathname.startsWith("/onboarding");
  const isLoginPath = pathname.startsWith("/login");

  // 1. Unauthenticated User checks
  if (!payload) {
    if (isProtectedPath || isOnboardingPath) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      if (isProtectedPath) {
        url.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. Authenticated User with Incomplete Onboarding.
  // Any value other than `true` (false, missing on legacy tokens)
  // is treated as incomplete and routed to onboarding.
  if (payload.onboardingCompleted !== true) {
    if (isProtectedPath || isLoginPath) {
      const url = req.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. Authenticated User with Completed Onboarding
  if (payload.onboardingCompleted === true) {
    if (isOnboardingPath || isLoginPath) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/deep-analysis/:path*",
    "/onboarding/:path*",
    "/login",
    "/profile/:path*",
    "/settings/:path*",
    "/plan/:path*",
    "/schemes/:path*",
    "/alerts/:path*",
    "/documents/:path*",
  ],
};
