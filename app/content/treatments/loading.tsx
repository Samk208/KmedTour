export default function TreatmentsLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
        <div className="mb-12">
          <div className="h-12 w-96 rounded-lg animate-pulse mb-4" style={{ backgroundColor: 'var(--border-grey)' }} />
          <div className="h-6 w-full max-w-3xl rounded animate-pulse" style={{ backgroundColor: 'var(--border-grey)' }} />
        </div>

        <div className="mb-12">
          <div className="h-14 w-full rounded-xl animate-pulse mb-6" style={{ backgroundColor: 'var(--border-grey)' }} />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-24 rounded-full animate-pulse" style={{ backgroundColor: 'var(--border-grey)' }} />
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-white border" style={{ borderColor: 'var(--border-grey)' }}>
              <div className="h-48 animate-pulse" style={{ backgroundColor: 'var(--border-grey)' }} />
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--border-grey)' }} />
                <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--border-grey)' }} />
                <div className="h-4 w-5/6 rounded animate-pulse" style={{ backgroundColor: 'var(--border-grey)' }} />
                <div className="h-10 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--border-grey)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
