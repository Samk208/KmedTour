export default function CoordinatorIntakesLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6" aria-label="Loading patient intakes" role="status">
      <div className="h-7 w-44 rounded-lg bg-muted animate-pulse mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
              <div className="h-3 w-28 rounded bg-muted animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
