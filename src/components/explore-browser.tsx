"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/field";
import { MemoryCard } from "@/components/memory-card";
import type { TravelMemory } from "@/types/database";

export function ExploreBrowser({ memories }: { memories: TravelMemory[] }) {
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("all");
  const [duration, setDuration] = useState("all");
  const [sort, setSort] = useState("newest");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return memories
      .filter((item) => !normalized || [item.title, item.destination_name, item.country, item.category].some((value) => value?.toLowerCase().includes(normalized)))
      .filter((item) => rating === "all" || item.rating >= Number(rating))
      .filter((item) => duration === "all" || (duration === "short" ? (item.days_spent ?? 99) <= 3 : (item.days_spent ?? 0) >= 4))
      .sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "budget" ? (a.total_expense ?? Number.MAX_SAFE_INTEGER) - (b.total_expense ?? Number.MAX_SAFE_INTEGER) : +new Date(b.created_at) - +new Date(a.created_at));
  }, [duration, memories, query, rating, sort]);
  return (
    <>
      <div className="grid gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative"><Search className="absolute left-4 top-3.5 text-slate-400" size={20} /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-12" placeholder="Search destinations, countries, or stories…" aria-label="Search travel memories" /></div>
        <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium"><SlidersHorizontal size={17} /><span className="sr-only">Minimum rating</span><select value={rating} onChange={(event) => setRating(event.target.value)} className="bg-transparent outline-none"><option value="all">Any rating</option><option value="4">4+ stars</option><option value="5">5 stars</option></select></label>
        <label className="flex min-h-12 items-center rounded-2xl border border-slate-200 px-4 text-sm font-medium"><span className="sr-only">Trip duration</span><select value={duration} onChange={(event) => setDuration(event.target.value)} className="bg-transparent outline-none"><option value="all">Any duration</option><option value="short">Up to 3 days</option><option value="long">4+ days</option></select></label>
        <label className="flex min-h-12 items-center rounded-2xl border border-slate-200 px-4 text-sm font-medium"><span className="sr-only">Sort memories</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent outline-none"><option value="newest">Newest first</option><option value="rating">Highest rated</option><option value="budget">Lowest spend</option></select></label>
      </div>
      <p className="mt-7 text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? "story" : "stories"}</p>
      {filtered.length ? <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}</div> : <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><h2 className="font-serif text-2xl text-[#123a50]">No journeys found</h2><p className="mt-2 text-slate-500">Try a broader destination or a different rating.</p></div>}
    </>
  );
}
