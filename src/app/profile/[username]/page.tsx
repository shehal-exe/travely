import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { MemoryCard } from "@/components/memory-card";
import { demoMemories, profiles as demoProfiles } from "@/data/demo";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Profile, TravelMemory } from "@/types/database";
import { signMemoryImages } from "@/lib/data";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const demoProfile = Object.values(demoProfiles).find((item) => item.username === username);
  const supabase = await getSupabaseServer();
  let profile: Profile | null = demoProfile ?? null;
  let memories: TravelMemory[] = demoProfile ? demoMemories.filter((item) => item.user_id === demoProfile.id) : [];
  if (supabase) {
    const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
    if (data) {
      profile = data as Profile;
      const { data: rows } = await supabase.from("travel_memories").select("*, images:memory_images(*)").eq("user_id", profile.id).eq("visibility", "public").order("travel_date", { ascending: false });
      memories = await signMemoryImages(supabase, (rows as TravelMemory[] | null) ?? []);
    }
  }
  if (!profile) notFound();
  return <section className="section-shell py-16"><div className="rounded-[2rem] bg-[#0b3447] p-8 text-white sm:p-12"><p className="text-sm uppercase tracking-[.2em] text-emerald-200">Traveler profile</p><h1 className="mt-3 font-serif text-5xl">{profile.display_name}</h1><p className="mt-2 text-slate-300">@{profile.username}</p>{profile.location && <p className="mt-5 flex items-center gap-2"><MapPin size={17} />{profile.location}</p>}{profile.bio && <p className="mt-5 max-w-2xl leading-7 text-slate-200">{profile.bio}</p>}</div><h2 className="mt-12 font-serif text-3xl text-[#123a50]">Public journeys</h2>{memories.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{memories.map((memory) => <MemoryCard key={memory.id} memory={{ ...memory, profile }} />)}</div> : <p className="mt-6 text-slate-500">No public memories yet.</p>}</section>;
}
