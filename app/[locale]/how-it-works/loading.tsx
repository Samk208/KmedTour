export default function HowItWorksLoading() {
  return (
    <div className="container mx-auto max-w-[1240px] px-4 py-12">
      <div className="h-12 w-96 bg-muted rounded-lg animate-pulse mb-4" />
      <div className="h-5 w-full max-w-2xl bg-muted rounded animate-pulse mb-16" />
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-14 w-14 bg-muted rounded-xl animate-pulse" />
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
