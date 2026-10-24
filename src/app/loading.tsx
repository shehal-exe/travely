export default function Loading() {
  return (
    <div className="min-h-[65vh] bg-[#f4f8f6]" role="status" aria-live="polite" aria-label="Loading page">
      <div className="section-shell py-14 lg:py-20">
        <div className="overflow-hidden rounded-[2rem] bg-[#123a50] p-8 text-white sm:p-12">
          <div className="h-3 w-32 animate-pulse rounded-full bg-emerald-200/60" />
          <div className="mt-6 h-12 max-w-xl animate-pulse rounded-2xl bg-white/20" />
          <div className="mt-4 h-5 max-w-md animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-[1.75rem] border border-[#dbe6e2] bg-white" />)}
        </div>
        <p className="mt-6 text-center text-sm font-semibold text-[#0d6d67]">Opening your next TRAVELY view…</p>
      </div>
    </div>
  );
}
