export default function AboutLoading() {
  return (
    <div className="container mx-auto max-w-[1240px] px-4 py-12 animate-in fade-in duration-300">
      <div className="h-12 w-3/4 max-w-xl bg-muted rounded-lg animate-pulse mb-8" />
      <div className="space-y-4 max-w-3xl">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: i === 3 ? '60%' : '100%' }} />
        ))}
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
