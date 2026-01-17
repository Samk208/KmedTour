export default function ClinicsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="mt-2 h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and filters skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-12 bg-card border border-border rounded-lg animate-pulse" />
          
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-9 w-24 bg-card border border-border rounded-full animate-pulse"
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-40 bg-card border border-border rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Clinic cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-muted animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="h-10 bg-primary/20 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
