/**
 * Environment variable validation utility
 * 
 * Validates that all required environment variables are present at app startup.
 * Prevents runtime failures due to missing configuration.
 */

export interface EnvValidationConfig {
  required: string[]
  optional?: string[]
}

const DEFAULT_CONFIG: EnvValidationConfig = {
  required: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY',
    'GEMINI_API_KEY',
  ],
  optional: [
    'NEXT_PUBLIC_SENTRY_DSN',
    'SENTRY_AUTH_TOKEN',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'SLACK_WEBHOOK_URL',
  ],
}

/**
 * Validate environment variables at startup
 * 
 * @throws Error if any required variables are missing
 * @returns void if all validations pass
 */
export function validateEnvironment(config: EnvValidationConfig = DEFAULT_CONFIG): void {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  config.required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  // Check optional variables (warn if missing)
  config.optional?.forEach(key => {
    if (!process.env[key]) {
      warnings.push(key)
    }
  })

  // Report errors
  if (missing.length > 0) {
    const message = `❌ Missing required environment variables:\n${missing.map(k => `   - ${k}`).join('\n')}`
    console.error(message)
    
    // In production, fail hard. In development, warn only.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message)
    }
  }

  // Report warnings
  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(
      `⚠️  Missing optional environment variables (monitoring may be limited):\n${warnings.map(k => `   - ${k}`).join('\n')}`
    )
  }

  // Success
  if (missing.length === 0) {
    console.log('✅ Environment validation passed')
  }
}

/**
 * Get a required environment variable with type safety
 */
export function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Get an optional environment variable with fallback
 */
export function getEnvOptional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}
