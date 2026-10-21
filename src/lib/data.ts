import { demoDestinations, demoMemories } from "@/data/demo";
import { openDestinations } from "@/data/open-destinations";
import { getSupabaseServer } from "@/lib/supabase/server";
import { addWikipediaGallery } from "@/lib/wikipedia-gallery";
import type { Destination, TravelMemory } from "@/types/database";

function enrichDestination(live: Destination): Destination {
  const curated = demoDestinations.find((item) => item.slug === live.slug);
  if (!curated || !live.is_sample) return live;
  return {
    ...curated,
    ...live,
    // The seed rows provide durable IDs and provenance; the curated catalogue
    // supplies richer local photography, video, history, and planning details.
    cover_image_url: curated.cover_image_url,
    gallery_images: curated.gallery_images,
    video_url: curated.video_url,
    history: curated.history,
    average_budget: curated.average_budget,
    ideal_duration: curated.ideal_duration,
    nearest_airport: curated.nearest_airport,
    getting_around: curated.getting_around,
    safety_note: curated.safety_note,
    media_credit: curated.media_credit,
    best_time_to_visit: live.best_time_to_visit ?? curated.best_time_to_visit,
    highlights: live.highlights?.length ? live.highlights : curated.highlights,
  };
}

export async function signMemoryImages(supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServer>>>, memories: TravelMemory[]) {
  return Promise.all(memories.map(async (memory) => ({
    ...memory,
    images: await Promise.all((memory.images ?? []).map(async (image) => {
      if (!image.storage_path) return image;
      const { data } = await supabase.storage.from("memory-images").createSignedUrl(image.storage_path, 3600);
      return { ...image, image_url: data?.signedUrl ?? "" };
    })),
  })));
}

export async function getFeaturedDestinations(): Promise<Destination[]> {
  const supabase = await getSupabaseServer();
  const curatedNames = new Set(demoDestinations.map((item) => item.name.toLowerCase()));
  const openOnly = openDestinations.filter((item) => !curatedNames.has(item.name.toLowerCase()));
  if (!supabase) return [...demoDestinations, ...openOnly];
  const { data } = await supabase
    .from("destinations")
    .select("*, category:destination_categories(*)")
    .order("name")
    .limit(100);
  const live = ((data as Destination[] | null) ?? []).map(enrichDestination);
  const liveSlugs = new Set(live.map((item) => item.slug));
  const liveNames = new Set(live.map((item) => item.name.toLowerCase()));
  return [
    ...live,
    ...demoDestinations.filter((item) => !liveSlugs.has(item.slug) && !liveNames.has(item.name.toLowerCase())),
    ...openOnly.filter((item) => !liveNames.has(item.name.toLowerCase())),
  ];
}

export async function getPublicMemories(): Promise<TravelMemory[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return demoMemories;
  const { data } = await supabase
    .from("travel_memories")
    .select("*, profile:profiles(*), images:memory_images(*), likes:memory_likes(count)")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(24);
  const rows = (data ?? []) as (TravelMemory & { likes?: { count: number }[] })[];
  const live = await signMemoryImages(supabase, rows.map((row) => ({
    ...row,
    likes_count: row.likes?.[0]?.count ?? 0,
  })));
  const liveIds = new Set(live.map((item) => item.id));
  return [...live, ...demoMemories.filter((item) => !liveIds.has(item.id))];
}

export async function getDestination(slug: string): Promise<Destination | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) {
    const destination = demoDestinations.find((item) => item.slug === slug) ?? openDestinations.find((item) => item.slug === slug) ?? null;
    return destination ? addWikipediaGallery(destination) : null;
  }
  const { data } = await supabase
    .from("destinations")
    .select("*, category:destination_categories(*)")
    .eq("slug", slug)
    .maybeSingle();
  const destination = data ? enrichDestination(data as Destination) : demoDestinations.find((item) => item.slug === slug) ?? openDestinations.find((item) => item.slug === slug) ?? null;
  return destination ? addWikipediaGallery(destination) : null;
}

export async function getMemory(id: string): Promise<TravelMemory | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return demoMemories.find((item) => item.id === id) ?? null;
  const { data } = await supabase
    .from("travel_memories")
    .select("*, profile:profiles(*), images:memory_images(*), likes:memory_likes(count)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return demoMemories.find((item) => item.id === id) ?? null;
  const row = data as TravelMemory & { likes?: { count: number }[] };
  return (await signMemoryImages(supabase, [{ ...row, likes_count: row.likes?.[0]?.count ?? 0 }]))[0];
}
