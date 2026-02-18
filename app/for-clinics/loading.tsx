export default function ForClinicsLoading() {
  return (
    <div className="container mx-auto max-w-[1240px] px-4 py-12">
      <div className="h-12 w-80 bg-muted rounded-lg animate-pulse mb-4" />
      <div className="h-5 w-full max-w-2xl bg-muted rounded animate-pulse mb-12" />
      <div className="space-y-6 max-w-3xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
