export default function HospitalSlugLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 py-12">
        <div className="h-12 w-3/4 max-w-2xl bg-muted rounded-lg animate-pulse mb-4" />
        <div className="h-5 w-full max-w-xl bg-muted rounded animate-pulse mb-10" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded-2xl animate-pulse" />
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="h-80 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
