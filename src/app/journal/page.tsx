import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Camera, Images, MapPin, Plus, Route, Settings2, ShieldCheck, Sparkles } from "lucide-react";
import { MemoryCard } from "@/components/memory-card";
import { MemoryManageActions } from "@/components/memory-manage-actions";
import { buttonClasses } from "@/components/ui/button";
import { signMemoryImages } from "@/lib/data";
import { getCurrentUser, getSupabaseServer } from "@/lib/supabase/server";
import type { Profile, TravelMemory } from "@/types/database";

export default async function JournalPage() {
  const user = await getCurrentUser();
  const supabase = await getSupabaseServer();
  if (!user || !supabase) return <section className="section-shell py-24 text-center"><p className="eyebrow">Your private travel space</p><h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50]">Your journey starts here.</h1><p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">Keep private memories, manage public stories, and revisit every place that inspired you.</p><Link href="/auth/login" className={buttonClasses({ className: "mt-7" })}>Log in to your portal</Link></section>;

  const [memoriesResult, profileResult, savesResult, roleResult] = await Promise.all([
    supabase.from("travel_memories").select("*, images:memory_images!memory_images_memory_id_fkey(*)").eq("user_id", user.id).order("travel_date", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("saved_memories").select("user_id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
  ]);
  const profile = profileResult.data as Profile | null;
  const memories = await signMemoryImages(supabase, (memoriesResult.data as TravelMemory[] | null) ?? []);
  const photos = memories.reduce((sum, item) => sum + (item.images?.length ?? 0), 0);
  const placeCount = new Set(memories.map((item) => item.destination_name.trim().toLowerCase())).size;
  const firstName = (profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Traveler").split(" ")[0];
  const latest = memories[0];
  const stats = [
    { Icon: Camera, label: "My stories", value: memories.length },
    { Icon: MapPin, label: "Places visited", value: placeCount },
    { Icon: Images, label: "Photos added", value: photos },
    { Icon: Bookmark, label: "Stories saved", value: savesResult.count ?? 0 },
  ];

  return <section className="section-shell pb-20 pt-10 lg:pt-14">
    <div className="relative min-h-80 overflow-hidden rounded-[2rem] bg-[#0b3644] text-white">
      <Image src="/images/travel/ladakh-1.jpg" alt="Ladakh mountains" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#073440]/95 via-[#073440]/75 to-[#073440]/20" aria-hidden />
      <div className="relative flex min-h-80 flex-col justify-center px-7 py-12 sm:px-10 lg:px-14"><span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c3f8ea]"><Sparkles size={15} /> Your travel space</span><h1 className="mt-5 max-w-2xl font-serif text-4xl font-semibold sm:text-5xl lg:text-6xl">Welcome back, {firstName}.</h1><p className="mt-4 max-w-xl text-lg leading-7 text-white/85">Your stories, saved inspiration, and next adventure live here.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/plan" className={buttonClasses()}><Route size={18} /> Plan a trip</Link><Link href="/journal/new" className={buttonClasses({ variant: "secondary" })}><Plus size={18} /> Share a journey</Link></div></div>
    </div>

    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(({ Icon, label, value }) => <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><span className="grid size-11 place-items-center rounded-2xl bg-[#e9f5f0] text-[#0d6d67]"><Icon size={22} /></span><p className="mt-4 text-3xl font-bold text-[#123a50]">{value}</p><p className="mt-1 text-sm text-slate-600">{label}</p></div>)}</div>

    <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.75fr)]"><div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">YOUR COLLECTION</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">My journeys</h2></div><Link href="/saved" className="inline-flex items-center gap-2 text-sm font-bold text-[#0d6d67]">View saved stories <ArrowRight size={16} /></Link></div>
      {memoriesResult.error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">Could not load your stories: {memoriesResult.error.message}</p>}
      {memories.length ? <div className="mt-6 grid gap-6 md:grid-cols-2">{memories.map((memory) => <div key={memory.id}><MemoryCard memory={memory} /><MemoryManageActions id={memory.id} /></div>)}</div> : !memoriesResult.error && <div className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-dashed border-teal-300 bg-[#f1f8f5] p-8 sm:p-10"><div className="relative max-w-md"><span className="grid size-12 place-items-center rounded-2xl bg-white text-[#0d6d67] shadow-sm"><Camera size={25} /></span><h3 className="mt-5 font-serif text-3xl font-semibold text-[#123a50]">Your first story is waiting.</h3><p className="mt-3 leading-7 text-slate-600">Add photos, the places you visited, your budget, and useful tips. You can keep a memory private or share it with the community.</p><Link href="/journal/new" className={buttonClasses({ className: "mt-6" })}>Create my first story <ArrowRight size={17} /></Link></div><div className="absolute -bottom-14 -right-14 size-52 rounded-full border-[25px] border-white/60" aria-hidden /></div>}
    </div><aside className="space-y-5"><div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="eyebrow">QUICK ACCESS</p><h2 className="mt-2 font-serif text-2xl font-semibold text-[#123a50]">Where to next?</h2><div className="mt-5 space-y-2">{[
      { href: "/journal/new", Icon: Plus, label: "Write a new story", note: "Photos, details & memories" },
      { href: "/plan", Icon: Route, label: "My trip plans", note: "Itinerary, budget & packing" },
      { href: "/saved", Icon: Bookmark, label: "Saved inspiration", note: "Stories for later" },
      { href: "/settings", Icon: Settings2, label: "Edit my profile", note: "Name, bio & location" },
      ...(roleResult.data ? [{ href: "/admin", Icon: ShieldCheck, label: "Admin control room", note: "Manage TRAVELY" }] : []),
    ].map(({ href, Icon, label, note }) => <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#f1f8f5]"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f4ef] text-[#0d6d67]"><Icon size={20} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#123a50]">{label}</strong><span className="text-xs text-slate-500">{note}</span></span><ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0d6d67]" /></Link>)}</div></div><div className="rounded-[1.75rem] bg-[#0b3644] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#aff2e2]">TRAVEL SNAPSHOT</p><h2 className="mt-3 font-serif text-2xl font-semibold">{latest ? "Your latest journey" : "A world of stories"}</h2><p className="mt-2 text-sm leading-6 text-white/75">{latest ? `${latest.destination_name} · ${latest.country}` : "Follow fellow travelers and discover a place worth remembering."}</p><Link href={latest ? `/memories/${latest.id}` : "/explore"} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#aff2e2]">{latest ? "Revisit story" : "Explore travel blogs"} <ArrowRight size={16} /></Link></div></aside></div>
  </section>;
}
