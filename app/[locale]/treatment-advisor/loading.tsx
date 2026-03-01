export default function TreatmentAdvisorLoading() {
  return (
    <div className="flex flex-col h-screen bg-[#0a0f1c] text-white">
      <div className="flex-none border-b border-white/5 py-4 px-4">
        <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-24 bg-white/10 rounded mt-2 animate-pulse" />
      </div>
      <div className="flex-1 flex flex-col p-4 max-w-3xl mx-auto w-full">
        <div className="flex-1 space-y-4">
          <div className="h-16 w-3/4 bg-white/10 rounded-2xl animate-pulse self-start" />
          <div className="h-12 w-full max-w-xl bg-white/10 rounded-2xl animate-pulse" />
        </div>
        <div className="h-14 w-full bg-white/10 rounded-xl animate-pulse mt-4" />
      </div>
    </div>
  )
}
