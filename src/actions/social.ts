"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { commentSchema, socialIdSchema } from "@/lib/validations/social";

export type SocialActionState = { error?: string; success?: string };

export async function setFollow(profileId: string, follow: boolean): Promise<SocialActionState> {
  if (!socialIdSchema.safeParse(profileId).success) return { error: "This traveller cannot be followed." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The community database is unavailable." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sign in to follow travellers." };
  if (profileId === user.id) return { error: "You cannot follow yourself." };
  const { data: profile, error: lookupError } = await supabase.from("profiles").select("username").eq("id", profileId).maybeSingle();
  if (lookupError || !profile) return { error: "Traveller not found." };
  const { error } = follow
    ? await supabase.from("traveller_follows").upsert({ follower_id: user.id, following_id: profileId }, { onConflict: "follower_id,following_id", ignoreDuplicates: true })
    : await supabase.from("traveller_follows").delete().eq("follower_id", user.id).eq("following_id", profileId);
  if (error) return { error: "Could not update your connection. Please try again." };
  revalidatePath(`/profile/${profile.username}`);
  revalidatePath("/explore");
  return { success: follow ? "Following traveller." : "Traveller unfollowed." };
}

export async function addComment(_: SocialActionState, formData: FormData): Promise<SocialActionState> {
  const memoryId = formData.get("memoryId");
  const parsedId = socialIdSchema.safeParse(memoryId);
  const parsedBody = commentSchema.safeParse(formData.get("body"));
  if (!parsedId.success) return { error: "Comments are available on published stories only." };
  if (!parsedBody.success) return { error: parsedBody.error.issues[0]?.message ?? "Invalid comment." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The community database is unavailable." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sign in to comment." };
  const { data: memory, error: memoryError } = await supabase.from("travel_memories").select("id").eq("id", parsedId.data).eq("visibility", "public").maybeSingle();
  if (memoryError || !memory) return { error: "This story is not available for comments." };
  const { error } = await supabase.from("memory_comments").insert({ memory_id: parsedId.data, author_id: user.id, body: parsedBody.data });
  if (error) return { error: "Could not post your comment. Please try again." };
  revalidatePath(`/memories/${parsedId.data}`);
  return { success: "Comment posted." };
}

export async function deleteComment(commentId: string, memoryId: string): Promise<SocialActionState> {
  if (!socialIdSchema.safeParse(commentId).success || !socialIdSchema.safeParse(memoryId).success) return { error: "Comment not found." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The community database is unavailable." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sign in to remove your comment." };
  const { data, error } = await supabase.from("memory_comments").delete().eq("id", commentId).eq("memory_id", memoryId).eq("author_id", user.id).select("id").maybeSingle();
  if (error || !data) return { error: "Comment not found or you cannot remove it." };
  revalidatePath(`/memories/${memoryId}`);
  return { success: "Comment removed." };
}
