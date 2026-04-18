import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./lib/i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const handleI18nRouting = createMiddleware(routing);

// Static files that must bypass i18n routing entirely
const STATIC_FILE_REGEX = /^\/(?:sw\.js|manifest\.webmanifest|robots\.txt|sitemap\.xml|favicon\.ico|.*\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|otf|mp4|pdf))$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass i18n and auth middleware for static assets and PWA files
  if (STATIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // 1. Run next-intl middleware first to handle routing and language resolution
  const response = handleI18nRouting(request);

  // 2. Run supabase session update middleware
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
