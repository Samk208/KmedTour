/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript strict checking enabled for production safety
  typescript: {
    // Only ignore in development if needed, never in production
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // Image optimization configuration
  images: {
    // Enable optimization for production, can disable in dev for speed
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'supabase.kmedtour.com',
      },
    ],
  },
  
  // ESLint strict checking for code quality
  eslint: {
    // Only ignore in development if needed, never in production
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Experimental features (optional)
  experimental: {
    // Enable if using server actions extensively
    // serverActions: true,
  },
  
  // Environment variables validation (optional but recommended)
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

export default nextConfig
