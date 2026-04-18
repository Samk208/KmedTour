/**
 * Application initialization
 * 
 * This module runs on app startup to validate configuration,
 * initialize services, and catch configuration errors early.
 */

import { validateEnvironment } from '@/lib/utils/validate-env'

// Validate environment variables on app startup
// This will throw an error in production if any required vars are missing
validateEnvironment()

export const initialized = true
