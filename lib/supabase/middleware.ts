/**
 * Lightweight Supabase session handler for Next.js Middleware
 *
 * This deliberately avoids importing @supabase/supabase-js to prevent
 * @supabase/realtime-js (and its Node-only dependencies like process.versions)
 * from being bundled into the Edge/middleware function.
 *
 * On Netlify, this is critical — the full supabase-js SDK inflates the
 * ___netlify-server-handler function past the upload size limit.
 *
 * For the MVP, we do a lightweight cookie-based auth check.
 * When Supabase is fully wired up, switch to @supabase/ssr which is Edge-compatible.
 */

import { NextResponse, type NextRequest } from "next/server";

// Consistent storage key for all environments
export const SUPABASE_AUTH_COOKIE = "kmedtour-auth-token";

export async function updateSession(
  request: NextRequest,
  existingResponse?: NextResponse,
) {
  const response =
    existingResponse ||
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

  // Lightweight auth check: look for the auth cookie
  // This avoids importing the full @supabase/supabase-js SDK
  const authCookie = request.cookies.get(SUPABASE_AUTH_COOKIE)?.value;
  const hasSession = !!authCookie;

  // Protected routes: /coordinator/*
  if (request.nextUrl.pathname.startsWith("/coordinator")) {
    if (request.nextUrl.pathname === "/coordinator/login") {
      if (hasSession) {
        return NextResponse.redirect(new URL("/coordinator", request.url));
      }
      return response;
    }

    if (!hasSession) {
      return NextResponse.redirect(new URL("/coordinator/login", request.url));
    }
  }

  return response;
}
