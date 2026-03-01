export default function PatientDashboardLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6" aria-label="Loading patient dashboard" role="status">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 rounded-lg bg-muted animate-pulse mb-2" />
        <div className="h-4 w-48 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Status cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-7 w-16 rounded bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Quotes section skeleton */}
      <div className="mb-8">
        <div className="h-6 w-32 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Bookings section skeleton */}
      <div>
        <div className="h-6 w-32 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {[1].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-3 w-28 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
