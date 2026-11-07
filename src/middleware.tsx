import { NextResponse, NextRequest } from "next/server";
import { maintenanceNotice } from "./config/maintenance";
import { createRouteMatcher } from "./lib/router-matcher";
import axios from "axios";
import { CURRENT_URL_HEADER, ORIGIN_HEADER } from "./constants";
import {
  isDonationEnabled,
  NODE_ENV,
  POLAR_ACCESS_TOKEN,
  POLAR_DONATION_PRODUCT_ID,
  POLAR_DONATION_SUBSCRIPTION_PRODUCT_ID,
} from "./constants/env";

const isAdminRoute = createRouteMatcher(["/admin.*", "/api/admin.*"]);

export default async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const { pathname } = request.nextUrl;
  const hostHeader =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (NODE_ENV === "production" ? "https" : "http");
  const fullUrl = `${proto}://${hostHeader}${pathname}${request.nextUrl.search}`;
  const origin = `${proto}://${hostHeader}`;
  headers.set(ORIGIN_HEADER, origin);
  headers.set(CURRENT_URL_HEADER, fullUrl);

  // Maintenance mode check (redirects all non-static requests)
  const staticMediaRegex =
    /\.(png|jpg|jpeg|gif|svg|webp|mp4|webm|ogg|mov|avi|wmv)$/i;
  if (
    maintenanceNotice.enabled &&
    !pathname.startsWith("/api") &&
    !staticMediaRegex.test(pathname)
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url), {
      request: { headers },
    });
  }

  // WhatsApp Redirect Handling
  if (pathname.startsWith("/wa")) {
    const message = pathname.split("/wa/").at(-1);
    return NextResponse.redirect(
      `https://api.whatsapp.com/send?phone=8801322122109&text=${message}`,
    );
  }

  if (!isDonationEnabled()) {
    return NextResponse.rewrite(new URL("/not-found", request.url), {
      request: { headers },
    });
  }

  // Admin Protection
  if (isAdminRoute(request)) {
    const token = request.cookies.get("_auth_data");

    if (!token)
      return NextResponse.rewrite(new URL("/not-found", request.url), {
        request: { headers },
      });

    try {
      const _ = await axios.post(
        new URL("/api/auth/verify", request.url).href,
        {},
        {
          headers: {
            cookie: request.headers.get("cookie"),
          },
        },
      );
    } catch (error) {
      return NextResponse.rewrite(new URL("/not-found", request.url), {
        request: { headers },
      });
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
