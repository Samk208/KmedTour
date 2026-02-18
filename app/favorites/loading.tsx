export default function FavoritesLoading() {
  return (
    <div className="container mx-auto max-w-[1240px] px-4 py-12">
      <div className="h-10 w-48 bg-muted rounded animate-pulse mb-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <div className="h-20 w-20 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
