import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-7xl font-bold text-gray-200 dark:text-gray-800">
        404
      </h1>
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Page Not Found
      </h2>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let us help you find what you need.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-[var(--kmed-blue)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          Go Home
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Contact Us
        </Link>
        <Link
          href="/treatment-advisor"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Treatment Advisor
        </Link>
      </div>
    </div>
  )
}
