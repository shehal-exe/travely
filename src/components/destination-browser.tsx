"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarRange, IndianRupee, MapPinned, Search, SlidersHorizontal } from "lucide-react";
import { DestinationCard } from "@/components/destination-card";
import { TravelMap } from "@/components/maps/travel-map";
import { Input } from "@/components/ui/field";
import { travelCircuits } from "@/data/circuits";
import type { Destination } from "@/types/database";

type View = "places" | "map" | "routes";

export function DestinationBrowser({ destinations, initialQuery = "", initialCategory = "all", initialView = "places" }: { destinations: Destination[]; initialQuery?: string; initialCategory?: string; initialView?: string }) {
  const [view, setView] = useState<View>(initialView === "map" || initialView === "routes" ? initialView : "places");
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [region, setRegion] = useState("all");
  const [budget, setBudget] = useState("all");
  const [duration, setDuration] = useState("all");
  const [visibleCount, setVisibleCount] = useState(36);
  const categories = useMemo(() => [...new Set(destinations.map((item) => item.category?.name).filter((value): value is string => Boolean(value)))].sort(), [destinations]);
  const regions = useMemo(() => [...new Set(destinations.map((item) => item.region).filter((value): value is string => Boolean(value)))].sort(), [destinations]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return destinations.filter((item) => {
      const matchesQuery = !normalized || [item.name, item.region, item.district, item.country, item.description, item.history, item.category?.name, item.average_budget, item.best_time_to_visit, item.nearest_airport, ...(item.highlights ?? [])].some((value) => value?.toLowerCase().includes(normalized));
      const matchesCategory = category === "all" || item.category?.name.toLowerCase() === category.toLowerCase();
      const matchesRegion = region === "all" || item.region === region;
      const dailyStart = Number(item.average_budget?.match(/₹([\d,]+)/)?.[1].replaceAll(",", "") ?? 0);
      const matchesBudget = budget === "all" || (budget === "value" ? dailyStart > 0 && dailyStart < 3000 : budget === "mid" ? dailyStart >= 3000 && dailyStart < 4000 : dailyStart >= 4000);
      const minimumDays = Number(item.ideal_duration?.match(/\d+/)?.[0] ?? 0);
      const matchesDuration = duration === "all" || minimumDays === 0 || (duration === "short" ? minimumDays <= 2 : duration === "medium" ? minimumDays === 3 : minimumDays >= 4);
      return matchesQuery && matchesCategory && matchesRegion && matchesBudget && matchesDuration;
    });
  }, [budget, category, destinations, duration, query, region]);

  const tabs = [
    { id: "places" as const, label: "All places" },
    { id: "map" as const, label: "Explore the map" },
    { id: "routes" as const, label: "Ready-made circuits" },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#eef2ed] p-1.5 sm:max-w-2xl" aria-label="Destination views">
        {tabs.map((tab) => <button key={tab.id} type="button" aria-pressed={view === tab.id} onClick={() => setView(tab.id)} className={`min-h-11 rounded-xl px-2 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${view === tab.id ? "bg-white text-[#0d6d67] shadow-sm" : "text-slate-600 hover:text-[#123a50]"}`}>{tab.label}</button>)}
      </div>

      {view !== "routes" && <div className="mt-6 max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-4 top-3.5 text-slate-400" size={20} /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-12" placeholder="Search a place, state or interest…" aria-label="Search destinations" /></div>
          <details className="group relative rounded-xl border border-slate-200 bg-white sm:min-w-36"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-center gap-2 px-4 text-sm font-semibold text-[#123a50] marker:hidden"><SlidersHorizontal size={17} /> Filters{category !== "all" && <span className="rounded-full bg-[#e8f5f0] px-2 py-0.5 text-xs text-[#0d6d67]">1</span>}</summary><div className="absolute right-0 top-full z-30 mt-2 w-[min(90vw,440px)] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"><div className="grid gap-3 sm:grid-cols-2">
          <label className="relative"><span className="sr-only">Filter by state or union territory</span><MapPinned className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={20} /><select value={region} onChange={(event) => setRegion(event.target.value)} className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-[#0d6d67] focus:ring-2 focus:ring-[#0d6d67]/15"><option value="all">All states & territories</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="relative"><span className="sr-only">Filter by daily budget</span><IndianRupee className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={20} /><select value={budget} onChange={(event) => setBudget(event.target.value)} className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-[#0d6d67] focus:ring-2 focus:ring-[#0d6d67]/15"><option value="all">Any daily budget</option><option value="value">Starts below ₹3,000</option><option value="mid">Starts ₹3,000–₹3,999</option><option value="premium">Starts ₹4,000+</option></select></label>
          <label className="relative"><span className="sr-only">Filter by ideal trip length</span><CalendarRange className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={20} /><select value={duration} onChange={(event) => setDuration(event.target.value)} className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-[#0d6d67] focus:ring-2 focus:ring-[#0d6d67]/15"><option value="all">Any trip length</option><option value="short">1–2 day escapes</option><option value="medium">3-day trips</option><option value="long">4+ day journeys</option></select></label>
          </div><div className="mt-4 flex max-h-44 flex-wrap gap-2 overflow-y-auto" aria-label="Filter destinations by category">{["all", ...categories].map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${category.toLowerCase() === item.toLowerCase() ? "bg-[#0d6d67] text-white" : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-[#0d6d67]"}`}>{item === "all" ? "All categories" : item}</button>)}</div></div></details>
        </div>
      </div>}

      {view === "places" && <>
        <div className="mt-10 flex items-end justify-between gap-4"><div><p className="eyebrow">Browse the collection</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">India, place by place</h2></div><p className="text-sm text-slate-500">{filtered.length} results</p></div>
        {filtered.length ? <><div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.slice(0, visibleCount).map((item) => <DestinationCard key={item.id} destination={item} />)}</div>{visibleCount < filtered.length && <div className="mt-10 text-center"><p className="mb-4 text-sm text-slate-500">Showing {visibleCount} of {filtered.length} places</p><button type="button" onClick={() => setVisibleCount((count) => count + 36)} className="rounded-full bg-[#0d6d67] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#095b57]">Load 36 more destinations</button></div>}</> : <EmptyResults onClear={() => { setQuery(""); setCategory("all"); setRegion("all"); setBudget("all"); setDuration("all"); }} />}
      </>}

      {view === "map" && <div id="travel-map" className="mt-8 scroll-mt-28"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Interactive India map</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">{filtered.length} visible pins</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Zoom and select a marker to open the destination. The same search and category filters control the pins.</p></div><TravelMap destinations={filtered} /></div>}

      {view === "routes" && <section className="mt-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Ready-made route ideas</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Build from a real circuit</h2></div><p className="max-w-xl text-sm leading-6 text-slate-500">Follow each stop at your own pace. Budgets are planning ranges, not package prices.</p></div><div className="mt-7 grid gap-6 lg:grid-cols-2">{travelCircuits.map((route) => <article key={route.slug} className="group relative isolate min-h-[360px] overflow-hidden rounded-[2rem] bg-[#123a50] text-white shadow-lg"><Image src={route.image} alt="" fill className="-z-20 object-cover transition duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 50vw" /><div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061f2c] via-[#0b3447]/55 to-transparent" /><div className="flex min-h-[360px] flex-col justify-end p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{route.category} · {route.duration}</p><h3 className="mt-2 font-serif text-4xl font-semibold">{route.title}</h3><p className="mt-3 max-w-xl leading-7 text-slate-100">{route.summary}</p><div className="mt-5 flex flex-wrap gap-2">{route.stops.map((stop) => <span key={stop.name} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">{stop.name}</span>)}</div><Link href={`/routes/${route.slug}`} className="mt-6 inline-flex items-center gap-2 font-bold text-orange-300">Open full roadmap <ArrowRight size={18} /></Link></div></article>)}</div></section>}
    </>
  );
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h2 className="font-serif text-2xl text-[#123a50]">No destinations found</h2><p className="mt-2 text-slate-500">Try another place, state, or category.</p><button type="button" onClick={onClear} className="mt-5 rounded-full bg-[#0d6d67] px-5 py-2.5 text-sm font-bold text-white">Clear filters</button></div>;
}
