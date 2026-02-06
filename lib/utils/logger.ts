/**
 * Centralized logging utility for KmedTour
 * 
 * Provides structured logging with context, severity levels, and production-safe output.
 * Integrates with external monitoring services when configured.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  path?: string
  method?: string
  ip?: string
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean
  
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * Format and output log entry
   */
  private log(level: LogLevel, message: string, context?: LogContext, metadata?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      metadata,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      }
    }

    // In production, send to external monitoring (e.g., Sentry, DataDog, CloudWatch)
    if (this.isProduction) {
      this.sendToMonitoring(entry)
    }

    // Console output (structured in production, pretty in development)
    if (this.isDevelopment) {
      this.consoleLog(level, message, context, metadata, error)
    } else {
      // Structured JSON for production log aggregation
      console.log(JSON.stringify(entry))
    }
  }

  /**
   * Pretty console output for development
   */
  private consoleLog(level: LogLevel, message: string, context?: LogContext, metadata?: Record<string, any>, error?: Error) {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      fatal: '💀',
    }

    const prefix = `${emoji[level]} [${level.toUpperCase()}]`
    
    console.log(`${prefix} ${message}`)
    
    if (context) {
      console.log('  Context:', context)
    }
    
    if (metadata) {
      console.log('  Metadata:', metadata)
    }
    
    if (error) {
      console.error('  Error:', error)
    }
  }

  /**
   * Send to external monitoring service
   */
  private sendToMonitoring(entry: LogEntry) {
    // TODO: Integrate with Sentry, DataDog, etc.
    // Example for Sentry:
    // if (entry.level === 'error' || entry.level === 'fatal') {
    //   Sentry.captureException(entry.error, {
    //     level: entry.level,
    //     contexts: { custom: entry.context },
    //     extra: entry.metadata,
    //   })
    // }
  }

  /**
   * Debug level - verbose information for troubleshooting
   */
  debug(message: string, context?: LogContext, metadata?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log('debug', message, context, metadata)
    }
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, context?: LogContext, metadata?: Record<string, any>) {
    this.log('info', message, context, metadata)
  }

  /**
   * Warn level - warning messages that don't stop execution
   */
  warn(message: string, context?: LogContext, metadata?: Record<string, any>) {
    this.log('warn', message, context, metadata)
  }

  /**
   * Error level - error conditions that need attention
   */
  error(message: string, context?: LogContext, metadata?: Record<string, any>, error?: Error) {
    this.log('error', message, context, metadata, error)
  }

  /**
   * Fatal level - severe errors that may cause system failure
   */
  fatal(message: string, context?: LogContext, metadata?: Record<string, any>, error?: Error) {
    this.log('fatal', message, context, metadata, error)
  }

  /**
   * API-specific logging helper
   */
  api(config: {
    method: string
    path: string
    status: number
    duration?: number
    userId?: string
    error?: Error
  }) {
    const level: LogLevel = config.status >= 500 ? 'error' : config.status >= 400 ? 'warn' : 'info'
    
    const message = `${config.method} ${config.path} - ${config.status}`
    
    const context: LogContext = {
      method: config.method,
      path: config.path,
      userId: config.userId,
    }
    
    const metadata = {
      status: config.status,
      duration: config.duration,
    }
    
    this.log(level, message, context, metadata, config.error)
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience exports
export default logger
