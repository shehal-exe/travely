"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { planSchema } from "@/lib/trip-planning";

type TripActionResult = { id?: string; error?: string; success?: string };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveTrip(input: unknown): Promise<TripActionResult> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The database is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sign in again to save your trip." };
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the trip details." };
  const { id, ...fields } = parsed.data;
  if (id) {
    const { data, error } = await supabase.from("trip_plans").update(fields)
      .eq("id", id).eq("user_id", user.id).select("id").maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: "Trip not found or you do not own it." };
    revalidatePath("/plan");
    revalidatePath("/journal");
    return { id, success: "Trip saved." };
  }
  const { data, error } = await supabase.from("trip_plans")
    .insert({ ...fields, user_id: user.id }).select("id").single();
  if (error || !data) return { error: error?.message ?? "Could not create your trip." };
  revalidatePath("/plan");
  revalidatePath("/journal");
  return { id: data.id, success: "Trip created." };
}

export async function deleteTrip(id: string): Promise<TripActionResult> {
  if (!uuidPattern.test(id)) return { error: "Invalid trip." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The database is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sign in again to manage your trip." };
  const { data, error } = await supabase.from("trip_plans").delete()
    .eq("id", id).eq("user_id", user.id).select("id").maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Trip not found or you do not own it." };
  revalidatePath("/plan");
  revalidatePath("/journal");
  return { success: "Trip deleted." };
}
