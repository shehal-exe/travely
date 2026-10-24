import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { MemoryCard } from "@/components/memory-card";
import { Reveal } from "@/components/motion/reveal";
import { Input } from "@/components/ui/field";
import { getSocialFeed, type SocialFilters } from "@/lib/social-data";

export const metadata: Metadata = { title: "Community Travel Blogs" };

type Query = { feed?: string; page?: string; search?: string; rating?: string; duration?: string; sort?: string };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const mode = query.feed === "following" ? "following" : "discover";
  const page = Math.min(60, Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1));
  const filters: SocialFilters = {
    search: (query.search ?? "").trim().slice(0, 80),
    rating: query.rating === "4" || query.rating === "5" ? Number(query.rating) : 0,
    duration: query.duration === "short" || query.duration === "long" ? query.duration : "all",
    sort: query.sort === "rating" || query.sort === "budget" ? query.sort : "newest",
  };
  const feed = await getSocialFeed(mode, page, filters);
  const href = (nextMode: "discover" | "following", nextPage: number) => {
    const params = new URLSearchParams({ feed: nextMode, page: String(nextPage) });
    if (filters.search) params.set("search", filters.search);
    if (filters.rating) params.set("rating", String(filters.rating));
    if (filters.duration !== "all") params.set("duration", filters.duration);
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    return `/explore?${params}`;
  };

  return <section className="section-shell py-16 lg:py-24">
    <Reveal><div className="max-w-4xl"><p className="eyebrow">Community stories</p><h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50] sm:text-6xl">Real journeys, with the useful details kept in.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Discover public travel stories, or catch up with travellers you follow. Open a story for photographs, practical tips, and the complete journey.</p></div></Reveal>
    <Reveal delay={0.06}><nav aria-label="Story feed" className="mt-10 flex gap-3"><Link href={href("discover", 1)} aria-current={mode === "discover" ? "page" : undefined} className={`rounded-full px-6 py-3 text-sm font-bold ${mode === "discover" ? "bg-[#0d6d67] text-white" : "border border-slate-200 bg-white text-[#123a50]"}`}>Discover</Link><Link href={href("following", 1)} aria-current={mode === "following" ? "page" : undefined} className={`rounded-full px-6 py-3 text-sm font-bold ${mode === "following" ? "bg-[#0d6d67] text-white" : "border border-slate-200 bg-white text-[#123a50]"}`}>Following</Link></nav></Reveal>
    <Reveal delay={0.1}><form method="get" className="mt-6 grid gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_auto_auto_auto_auto]"><input type="hidden" name="feed" value={mode} /><div className="relative"><Search className="absolute left-4 top-3.5 text-slate-400" size={20} /><Input name="search" defaultValue={filters.search} className="pl-12" placeholder="Search destinations…" aria-label="Search story destinations" /></div><label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium"><SlidersHorizontal size={17} /><span className="sr-only">Minimum rating</span><select name="rating" defaultValue={filters.rating || "all"} className="bg-transparent outline-none"><option value="all">Any rating</option><option value="4">4+ stars</option><option value="5">5 stars</option></select></label><label className="flex min-h-12 items-center rounded-2xl border border-slate-200 px-4 text-sm font-medium"><span className="sr-only">Trip duration</span><select name="duration" defaultValue={filters.duration} className="bg-transparent outline-none"><option value="all">Any duration</option><option value="short">Up to 3 days</option><option value="long">4+ days</option></select></label><label className="flex min-h-12 items-center rounded-2xl border border-slate-200 px-4 text-sm font-medium"><span className="sr-only">Sort memories</span><select name="sort" defaultValue={filters.sort} className="bg-transparent outline-none"><option value="newest">Newest first</option><option value="rating">Highest rated</option><option value="budget">Lowest spend</option></select></label><button type="submit" className="min-h-12 rounded-full bg-[#e96536] px-5 text-sm font-bold text-white hover:bg-[#d95628]">Apply</button></form></Reveal>
    {feed.error ? <Reveal><div role="status" className="mt-8 rounded-2xl bg-amber-50 p-6 text-amber-900">{feed.error}{mode === "following" && <Link href="/auth/login" className="ml-2 font-bold underline">Log in</Link>}</div></Reveal> : feed.memories.length ? <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{feed.memories.map((memory, index) => <Reveal key={memory.id} delay={(index % 3) * 0.08}><MemoryCard memory={memory} /></Reveal>)}</div> : <Reveal><div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><h2 className="font-serif text-2xl text-[#123a50]">{mode === "following" ? "Your following feed is quiet" : "No journeys found"}</h2><p className="mt-2 text-slate-500">{mode === "following" ? "Follow travellers from their profiles to see their stories here." : "Try a broader destination, or be the first to share a journey."}</p>{mode === "following" && <Link href={href("discover", 1)} className="mt-5 inline-block font-bold text-[#0d6d67] underline">Discover stories</Link>}</div></Reveal>}
    <nav aria-label="Story pages" className="mt-8 flex gap-4 text-sm font-bold text-[#0d6d67]">{page > 1 && <Link href={href(mode, page - 1)}>← Previous stories</Link>}{feed.hasMore && <Link href={href(mode, page + 1)}>More stories →</Link>}</nav>
  </section>;
}
