"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { imageRules, memorySchema, type MemoryInput } from "@/lib/validations/memory";

export type ActionState = { error?: string; success?: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function parseMemory(formData: FormData) {
  return memorySchema.safeParse({
    title: formData.get("title"),
    destinationName: formData.get("destinationName"),
    locationVisited: formData.get("locationVisited"),
    country: formData.get("country"),
    travelDate: formData.get("travelDate"),
    description: formData.get("description"),
    travelTips: formData.get("travelTips") || undefined,
    rating: formData.get("rating"),
    category: formData.get("category") || undefined,
    totalExpense: formData.get("totalExpense") || undefined,
    daysSpent: formData.get("daysSpent") || undefined,
    tripStyle: formData.get("tripStyle") || undefined,
    authorNote: formData.get("authorNote") || undefined,
    visibility: formData.get("visibility"),
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
  });
}

function memoryFields(value: MemoryInput) {
  return {
    title: value.title,
    destination_name: value.destinationName,
    location_visited: value.locationVisited,
    country: value.country,
    travel_date: value.travelDate,
    description: value.description,
    travel_tips: value.travelTips || null,
    rating: value.rating,
    category: value.category || null,
    total_expense: value.totalExpense ?? null,
    days_spent: value.daysSpent ?? null,
    trip_style: value.tripStyle || null,
    author_note: value.authorNote || null,
    visibility: value.visibility,
    latitude: value.latitude ?? null,
    longitude: value.longitude ?? null,
  };
}

function revalidateMemoryPages(id: string) {
  revalidatePath("/journal");
  revalidatePath("/explore");
  revalidatePath("/gallery");
  revalidatePath("/saved");
  revalidatePath(`/memories/${id}`);
}

export async function createMemory(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The database is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) return { error: "Could not verify your session. Please try signing in again." };
  if (!user) return { error: "Please sign in to share a journey." };

  const parsed = parseMemory(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid form." };

  const files = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0 || files.length > imageRules.maxFiles) return { error: "Add between 1 and 8 images." };
  if (files.some((file) => file.size > imageRules.maxBytes || !imageRules.accepted.includes(file.type))) {
    return { error: "Each image must be JPG, PNG, WebP, or AVIF and no larger than 8 MB." };
  }

  const { data: memory, error } = await supabase
    .from("travel_memories")
    .insert({ user_id: user.id, ...memoryFields(parsed.data) })
    .select("id")
    .single();
  if (error || !memory) return { error: error?.message ?? "Could not save the memory." };

  const uploadedPaths: string[] = [];
  for (const [position, file] of files.entries()) {
    const path = `${user.id}/${memory.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const uploaded = await supabase.storage.from("memory-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploaded.error) {
      if (uploadedPaths.length) await supabase.storage.from("memory-images").remove(uploadedPaths);
      await supabase.from("travel_memories").delete().eq("id", memory.id).eq("user_id", user.id);
      return { error: `Image upload failed: ${uploaded.error.message}. Please retry.` };
    }
    uploadedPaths.push(path);
    const { error: imageError } = await supabase
      .from("memory_images")
      .insert({ memory_id: memory.id, storage_path: path, position });
    if (imageError) {
      await supabase.storage.from("memory-images").remove(uploadedPaths);
      await supabase.from("travel_memories").delete().eq("id", memory.id).eq("user_id", user.id);
      return { error: `Image details could not be saved: ${imageError.message}. Please retry.` };
    }
  }
  revalidateMemoryPages(memory.id);
  redirect(`/memories/${memory.id}`);
}

export async function deleteMemory(memoryId: string): Promise<ActionState> {
  if (!uuidPattern.test(memoryId)) return { error: "This preview story cannot be deleted." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The database is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Please sign in again." };
  const { data: owned, error: ownerError } = await supabase
    .from("travel_memories").select("id").eq("id", memoryId).eq("user_id", user.id).maybeSingle();
  if (ownerError) return { error: ownerError.message };
  if (!owned) return { error: "Memory not found or you do not own it." };
  const { data: images, error: imagesError } = await supabase
    .from("memory_images").select("storage_path").eq("memory_id", memoryId);
  if (imagesError) return { error: imagesError.message };

  const { data: deleted, error } = await supabase
    .from("travel_memories").delete().eq("id", memoryId).eq("user_id", user.id).select("id").maybeSingle();
  if (error) return { error: error.message };
  if (!deleted) return { error: "The memory was not deleted. Please refresh and retry." };
  revalidateMemoryPages(memoryId);

  const paths = images?.map((item) => item.storage_path).filter(Boolean) ?? [];
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from("memory-images").remove(paths);
    if (storageError) return { error: "The memory was deleted, but some photographs could not be cleaned up." };
  }
  redirect("/journal");
}

export async function toggleRelation(table: "memory_likes" | "saved_memories", memoryId: string): Promise<ActionState> {
  if (!uuidPattern.test(memoryId)) return { error: "Actions are available on published community stories, not previews." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The database is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sign in first." };
  const { data, error: lookupError } = await supabase.from(table)
    .select("memory_id").eq("user_id", user.id).eq("memory_id", memoryId).maybeSingle();
  if (lookupError) return { error: lookupError.message };
  const query = data
    ? supabase.from(table).delete().eq("user_id", user.id).eq("memory_id", memoryId)
    : supabase.from(table).insert({ user_id: user.id, memory_id: memoryId });
  const { error } = await query;
  if (error) return { error: error.message };
  revalidatePath(`/memories/${memoryId}`);
  revalidatePath("/saved");
  return { success: "Updated." };
}

export async function updateMemory(memoryId: string, formData: FormData): Promise<ActionState> {
  if (!uuidPattern.test(memoryId)) return { error: "This preview story cannot be edited." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The database is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Please sign in again." };
  const parsed = parseMemory(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid form." };
  const { data, error } = await supabase.from("travel_memories")
    .update(memoryFields(parsed.data)).eq("id", memoryId).eq("user_id", user.id)
    .select("id").maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Memory not found or you do not own it." };
  revalidateMemoryPages(memoryId);
  redirect(`/memories/${memoryId}`);
}

export async function reportMemory(memoryId: string, reason: string): Promise<ActionState> {
  if (!uuidPattern.test(memoryId)) return { error: "Preview stories cannot be reported." };
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "The database is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sign in to report content." };
  const trimmed = reason.trim();
  if (trimmed.length < 10 || trimmed.length > 1000) return { error: "Please provide 10–1000 characters." };
  const { error } = await supabase.from("content_reports")
    .insert({ reporter_id: user.id, memory_id: memoryId, reason: trimmed });
  if (error?.code === "23505") return { error: "You have already reported this story." };
  return error ? { error: error.message } : { success: "Report submitted." };
}
