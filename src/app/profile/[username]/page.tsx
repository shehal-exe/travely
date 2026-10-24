import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { FollowButton } from "@/components/follow-button";
import { MemoryCard } from "@/components/memory-card";
import { demoMemories, profiles as demoProfiles } from "@/data/demo";
import { signMemoryImages } from "@/lib/data";
import { getProfileSocial } from "@/lib/social-data";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Profile, TravelMemory } from "@/types/database";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const demoProfile = Object.values(demoProfiles).find((item) => item.username === username);
  const supabase = await getSupabaseServer();
  let profile: Profile | null = demoProfile ?? null;
  let isLive = false;
  let memories: TravelMemory[] = demoProfile ? demoMemories.filter((item) => item.user_id === demoProfile.id) : [];
  let viewerId: string | null = null;
  if (supabase) {
    const [{ data }, { data: auth }] = await Promise.all([
      supabase.from("profiles").select("*").eq("username", username).maybeSingle(),
      supabase.auth.getUser(),
    ]);
    viewerId = auth.user?.id ?? null;
    if (data) {
      profile = data as Profile;
      isLive = true;
      const { data: rows } = await supabase.from("travel_memories").select("*, images:memory_images!memory_images_memory_id_fkey(*)").eq("user_id", profile.id).eq("visibility", "public").order("travel_date", { ascending: false }).limit(30);
      memories = await signMemoryImages(supabase, (rows as TravelMemory[] | null) ?? []);
    }
  }
  if (!profile) notFound();
  const social = isLive ? await getProfileSocial(profile.id, viewerId) : null;
  return <section className="section-shell py-16">
    <div className="rounded-[2rem] bg-[#0b3447] p-8 text-white sm:p-12">
      <div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-sm uppercase tracking-[.2em] text-emerald-200">Traveler profile</p><h1 className="mt-3 font-serif text-5xl">{profile.display_name}</h1><p className="mt-2 text-slate-300">@{profile.username}</p></div>{isLive && viewerId !== profile.id && (viewerId ? <FollowButton key={profile.id} profileId={profile.id} initialFollowing={social?.isFollowing ?? false} /> : <Link href="/auth/login" className="rounded-full bg-[#e96536] px-5 py-3 text-sm font-bold text-white">Sign in to follow</Link>)}</div>
      {profile.location && <p className="mt-5 flex items-center gap-2"><MapPin size={17} />{profile.location}</p>}{profile.bio && <p className="mt-5 max-w-2xl leading-7 text-slate-200">{profile.bio}</p>}
      {social && <div className="mt-7 flex flex-wrap gap-6 border-t border-white/15 pt-6 text-sm"><Link href={`/profile/${username}/connections?view=followers`} className="hover:text-emerald-200"><strong className="mr-1 text-lg">{social.followers}</strong> followers</Link><Link href={`/profile/${username}/connections?view=following`} className="hover:text-emerald-200"><strong className="mr-1 text-lg">{social.following}</strong> following</Link></div>}
      {social?.error && <p role="status" className="mt-4 text-sm text-amber-200">{social.error}</p>}
    </div>
    <h2 className="mt-12 font-serif text-3xl text-[#123a50]">Public journeys</h2>{memories.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{memories.map((memory) => <MemoryCard key={memory.id} memory={{ ...memory, profile }} />)}</div> : <p className="mt-6 text-slate-500">No public memories yet.</p>}
  </section>;
}
