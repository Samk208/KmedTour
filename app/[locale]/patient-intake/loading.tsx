export default function PatientIntakeLoading() {
  return (
    <div className="container mx-auto max-w-[1240px] px-4 py-12">
      <div className="h-10 w-72 bg-muted rounded animate-pulse mb-2" />
      <div className="h-5 w-96 bg-muted rounded animate-pulse mb-10" />
      <div className="max-w-2xl space-y-6">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-24 bg-muted rounded-lg animate-pulse" />
        <div className="flex gap-4 justify-end mt-8">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
