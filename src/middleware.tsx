import { NextResponse, NextRequest } from "next/server";
import { createRouteMatcher } from "./lib/route-matcher";
import { CURRENT_URL_HEADER, ORIGIN_HEADER, SESSION_COOKIE_NAME } from "./constants";
import { isDonationEnabled, NODE_ENV } from "./constants/env";

const isAdminRoute = createRouteMatcher([
  "/admin",
  "/admin/:path*",
  "/api/admin/:path*",
]);

const isDonationRoute = createRouteMatcher([
  "/donate",
  "/donate/:path*",
  "/api/donate",
]);

const isAuthRoute = createRouteMatcher(["/sign-in"]);

export default async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const { pathname } = request.nextUrl;

  // x-forwarded-* can be comma-separated lists; take the first value.
  const hostHeader =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (NODE_ENV === "production" ? "https" : "http");
  const fullUrl = `${proto}://${hostHeader}${pathname}${request.nextUrl.search}`;
  const origin = `${proto}://${hostHeader}`;
  headers.set(ORIGIN_HEADER, origin);
  headers.set(CURRENT_URL_HEADER, fullUrl);

  if (isDonationRoute(request) && !isDonationEnabled()) {
    return NextResponse.rewrite(new URL("/not-found", request.url), {
      request: { headers },
    });
  }

  const isAdminPage = isAdminRoute(request);
  const isAuthPage = isAuthRoute(request);

  // routes outside admin/auth guards need no session handling.
  if (!isAdminPage && !isAuthPage) {
    return NextResponse.next({ request: { headers } });
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME);

  // Admin requires a session cookie.
  if (isAdminPage && !token) {
    return NextResponse.rewrite(new URL("/not-found", request.url), {
      request: { headers },
    });
  }

  // Validate the session server-side only when one exists — this skips the
  // internal round-trip for anonymous visits (e.g. the public sign-in page).
  if (token) {
    try {
      const res = await fetch(new URL("/api/auth/verify", request.url).href, {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });
      if (!res.ok) throw new Error("verify failed");

      // Already authenticated.
      if (isAuthPage) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch {
      if (isAdminPage) {
        return NextResponse.rewrite(new URL("/not-found", request.url), {
          request: { headers },
        });
      }
    }
  }

  return NextResponse.next({ request: { headers } });
}

// Match only necessary routes (skip static assets, _next, and public files)
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
