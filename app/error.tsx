'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl" aria-hidden="true">
        &#9888;&#65039;
      </div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Something went wrong
      </h1>
      <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
        An unexpected error occurred. Please try again, or contact our support
        team if the problem persists.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--kmed-blue)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Go Home
        </a>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-gray-400">Error ID: {error.digest}</p>
      )}
    </div>
  )
}
