import { getSupabaseServer } from "@/lib/supabase/server";
import { signMemoryImages } from "@/lib/data";
import type { MemoryComment, Profile, TravelMemory } from "@/types/database";

const pageSize = 12;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SocialFeed = { memories: TravelMemory[]; hasMore: boolean; error?: string };
export type SocialFilters = { search: string; rating: number; duration: "all" | "short" | "long"; sort: "newest" | "rating" | "budget" };

export async function getSocialFeed(mode: "discover" | "following", page: number, filters: SocialFilters): Promise<SocialFeed> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { memories: [], hasMore: false, error: "Connect the database to explore community stories." };
  const offset = (page - 1) * pageSize;
  const selection = "*, profile:profiles(*), images:memory_images(*)";
  let ids: string[] | null = null;

  if (mode === "following") {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { memories: [], hasMore: false, error: "Sign in to see stories from travellers you follow." };
    const { data, error } = await supabase.rpc("following_memory_ids", { p_limit: pageSize + 1, p_offset: offset, p_search: filters.search, p_min_rating: filters.rating, p_duration: filters.duration, p_sort: filters.sort });
    if (error) return { memories: [], hasMore: false, error: "The following feed is unavailable. Apply the social-network migration." };
    ids = ((data ?? []) as { memory_id: string }[]).map((row) => row.memory_id);
    if (!ids.length) return { memories: [], hasMore: false };
  }

  let query = supabase.from("travel_memories").select(selection).eq("visibility", "public");
  if (ids) query = query.in("id", ids.slice(0, pageSize));
  else {
    const term = filters.search.trim().slice(0, 80).replace(/[%_]/g, "");
    if (term) query = query.ilike("destination_name", `%${term}%`);
    if (filters.rating) query = query.gte("rating", filters.rating);
    if (filters.duration === "short") query = query.lte("days_spent", 3);
    if (filters.duration === "long") query = query.gte("days_spent", 4);
    if (filters.sort === "rating") query = query.order("rating", { ascending: false });
    if (filters.sort === "budget") query = query.order("total_expense", { ascending: true, nullsFirst: false });
    query = query.order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + pageSize);
  }
  const { data, error } = await query;
  if (error) return { memories: [], hasMore: false, error: "Stories could not be loaded. Please try again." };
  const rows = (data ?? []) as TravelMemory[];
  const ordered = ids ? ids.slice(0, pageSize).flatMap((id) => rows.find((row) => row.id === id) ?? []) : rows.slice(0, pageSize);
  return { memories: await signMemoryImages(supabase, ordered), hasMore: ids ? ids.length > pageSize : rows.length > pageSize };
}

export async function getProfileSocial(profileId: string, viewerId: string | null) {
  const supabase = await getSupabaseServer();
  if (!supabase || !uuidPattern.test(profileId)) return { followers: 0, following: 0, isFollowing: false, error: undefined as string | undefined };
  const [followers, following, relation] = await Promise.all([
    supabase.from("traveller_follows").select("follower_id", { count: "exact", head: true }).eq("following_id", profileId),
    supabase.from("traveller_follows").select("following_id", { count: "exact", head: true }).eq("follower_id", profileId),
    viewerId && viewerId !== profileId ? supabase.from("traveller_follows").select("follower_id").eq("follower_id", viewerId).eq("following_id", profileId).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  return {
    followers: followers.count ?? 0,
    following: following.count ?? 0,
    isFollowing: Boolean(relation.data),
    error: followers.error || following.error || relation.error ? "Connections are unavailable until the social-network migration is applied." : undefined,
  };
}

export async function getProfileConnections(profileId: string, kind: "followers" | "following", page: number): Promise<{ profiles: Profile[]; hasMore: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  if (!supabase || !uuidPattern.test(profileId)) return { profiles: [], hasMore: false };
  const ownColumn = kind === "followers" ? "following_id" : "follower_id";
  const otherColumn = kind === "followers" ? "follower_id" : "following_id";
  const { data, error } = await supabase.from("traveller_follows").select(`${otherColumn}, created_at`).eq(ownColumn, profileId).order("created_at", { ascending: false }).range((page - 1) * 20, page * 20);
  if (error) return { profiles: [], hasMore: false, error: "Connections could not be loaded." };
  const rows = (data ?? []) as unknown as Record<string, string>[];
  const ids = rows.slice(0, 20).map((row) => row[otherColumn]);
  if (!ids.length) return { profiles: [], hasMore: false };
  const { data: profiles, error: profileError } = await supabase.from("profiles").select("*").in("id", ids);
  if (profileError) return { profiles: [], hasMore: false, error: "Traveller profiles could not be loaded." };
  const byId = new Map(((profiles ?? []) as Profile[]).map((item) => [item.id, item]));
  return { profiles: ids.flatMap((id) => byId.get(id) ?? []), hasMore: rows.length > 20 };
}

export async function getMemoryComments(memoryId: string, page: number): Promise<{ comments: MemoryComment[]; count: number; error?: string }> {
  const supabase = await getSupabaseServer();
  if (!supabase || !uuidPattern.test(memoryId)) return { comments: [], count: 0 };
  const { data, count, error } = await supabase.from("memory_comments")
    .select("*, author:profiles(*)", { count: "exact" })
    .eq("memory_id", memoryId)
    .order("created_at", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);
  if (error) return { comments: [], count: 0, error: "Comments could not be loaded. Apply the social-network migration." };
  return { comments: (data ?? []) as MemoryComment[], count: count ?? 0 };
}

export async function getDestinationStories(destinationId: string): Promise<{ memories: TravelMemory[]; error?: string }> {
  const supabase = await getSupabaseServer();
  if (!supabase || !uuidPattern.test(destinationId)) return { memories: [] };
  const { data, error } = await supabase.from("travel_memories")
    .select("*, profile:profiles(*), images:memory_images(*)")
    .eq("destination_id", destinationId).eq("visibility", "public")
    .order("created_at", { ascending: false }).limit(6);
  if (error) return { memories: [], error: "Traveller stories are temporarily unavailable." };
  return { memories: await signMemoryImages(supabase, (data ?? []) as TravelMemory[]) };
}
