import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { validateProductionEnv } from "./lib/config/env-validation.mjs";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const envValidation = validateProductionEnv(process.env);
if (!envValidation.ok) {
  throw new Error(
    `Missing required production environment variables: ${envValidation.missing.join(", ")}`,
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript strict checking enabled for production safety
  typescript: {
    // Never ignore build errors — catch issues early in all environments
    ignoreBuildErrors: false,
  },

  // Security headers (production best practice)
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
      {
        source: "/:locale/clinics/:slug",
        destination: "/:locale/hospitals/:slug",
        permanent: true,
      },
      // Legacy thin treatment pages — the rich sidecar-driven /procedures
      // route is canonical (matches sitemap.ts and page metadata).
      {
        source: "/:locale/content/treatments",
        destination: "/:locale/procedures",
        permanent: true,
      },
      {
        source: "/:locale/content/treatments/:slug",
        destination: "/:locale/procedures/:slug",
        permanent: true,
      },
    ];
  },

  // Image optimization configuration
  // Using unoptimized mode so images are served as static CDN assets.
  // This avoids tracing 194 MB of PNGs into the Netlify server function bundle.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase.kmedtour.com",
      },
    ],
  },

  // ESLint strict checking for code quality
  eslint: {
    // Never ignore lint errors — enforce quality in all environments
    ignoreDuringBuilds: false,
  },

  // Exclude heavy directories from server function bundles (Netlify/serverless).
  // public/images is safe to exclude because images.unoptimized=true above means
  // images are served as static CDN assets, not through the server optimizer.
  outputFileTracingExcludes: {
    '*': [
      'public/images/**',
      'agents/**',
      'content/**',
      'Content Hub Data/**',
      'scripts/**',
      'supabase/**',
      'tests/**',
      '.github/**',
      '.next/cache/**',
    ],
  },

  // Environment variables validation (optional but recommended)
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://kmedtour.com",
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
});
