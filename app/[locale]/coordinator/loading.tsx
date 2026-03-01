export default function CoordinatorLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-label="Loading coordinator dashboard" role="status">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-56 rounded-lg bg-muted animate-pulse mb-2" />
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-8 w-12 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Tab filters skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>

      {/* Journey rows skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
