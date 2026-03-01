export default function ContactLoading() {
  return (
    <div className="container mx-auto max-w-[1240px] px-4 py-12">
      <div className="h-10 w-64 bg-muted rounded animate-pulse mb-2" />
      <div className="h-5 w-96 bg-muted rounded animate-pulse mb-10" />
      <div className="grid md:grid-cols-2 gap-10 max-w-4xl">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
          <div className="h-11 w-32 bg-muted rounded animate-pulse mt-6" />
        </div>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
