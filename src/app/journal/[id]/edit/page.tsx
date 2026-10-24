import { notFound, redirect } from "next/navigation";
import { EditMemoryForm } from "@/components/edit-memory-form";
import { getCurrentUser, getSupabaseServer } from "@/lib/supabase/server";
import type { TravelMemory } from "@/types/database";
import { getSelectableDestinations } from "@/lib/data";

export default async function EditMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); const supabase = await getSupabaseServer();
  if (!user || !supabase) redirect("/auth/login");
  const { id } = await params;
  const { data } = await supabase.from("travel_memories").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data) notFound();
  const destinations = await getSelectableDestinations();
  return <section className="section-shell py-16"><div className="mx-auto max-w-4xl"><p className="eyebrow">Edit memory</p><h1 className="mt-3 font-serif text-5xl text-[#123a50]">Refine your travel story.</h1><div className="mt-9"><EditMemoryForm memory={data as TravelMemory} destinations={destinations} /></div></div></section>;
}
