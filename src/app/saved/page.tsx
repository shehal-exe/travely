import Link from "next/link";
import { MemoryCard } from "@/components/memory-card";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser, getSupabaseServer } from "@/lib/supabase/server";
import type { TravelMemory } from "@/types/database";
import { signMemoryImages } from "@/lib/data";

export default async function SavedPage() {
  const user = await getCurrentUser();
  const supabase = await getSupabaseServer();
  if (!user || !supabase) return <section className="section-shell py-24 text-center"><h1 className="font-serif text-5xl text-[#123a50]">Sign in to see saved stories.</h1><Link href="/auth/login" className={buttonClasses({ className: "mt-7" })}>Log in</Link></section>;
  const { data } = await supabase.from("saved_memories").select("memory:travel_memories(*, profile:profiles(*), images:memory_images(*))").eq("user_id", user.id);
  const memories = await signMemoryImages(supabase, (data ?? []).map((row) => row.memory).filter(Boolean) as unknown as TravelMemory[]);
  return <section className="section-shell py-16"><p className="eyebrow">Collection</p><h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50]">Saved travel stories</h1>{memories.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{memories.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}</div> : <p className="mt-8 rounded-2xl bg-white p-10 text-center text-slate-500 ring-1 ring-slate-200">You have not saved any public stories yet.</p>}</section>;
}
