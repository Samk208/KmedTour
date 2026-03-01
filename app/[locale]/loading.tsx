export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}
