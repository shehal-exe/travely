"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

export type ProfileActionState = { error?: string; success?: string };

export async function updateProfile(_: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "Supabase is not configured." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) return { error: "Username must use 3–30 letters, numbers, dashes, or underscores." };
  if (displayName.length < 2 || displayName.length > 80) return { error: "Display name must be 2–80 characters." };
  if (bio.length > 500 || location.length > 120) return { error: "Biography or location is too long." };
  const { data, error } = await supabase.from("profiles")
    .update({ username, display_name: displayName, bio: bio || null, location: location || null })
    .eq("id", user.id).select("id").maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Profile not found. Please sign out and sign in again." };
  revalidatePath("/settings");
  revalidatePath(`/profile/${username}`);
  return { success: "Profile updated." };
}
