"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await getSupabaseServer();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  const { data } = await supabase.from("user_roles")
    .select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Administrator access required.");
  return supabase;
}

export async function setUserAdmin(userId: string, makeAdmin: boolean): Promise<{ error?: string }> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) || typeof makeAdmin !== "boolean") {
    return { error: "Invalid account or role." };
  }
  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("admin_set_user_role", { p_user_id: userId, p_make_admin: makeAdmin });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return {};
}

export async function updateReportStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
      !["open", "reviewing", "resolved", "dismissed"].includes(status)) {
    redirect("/admin?tab=reports&error=Invalid+report+update");
  }
  const { error } = await supabase.from("content_reports")
    .update({ status }).eq("id", id).select("id").single();
  if (error) redirect(`/admin?tab=reports&error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  redirect("/admin?tab=reports&message=Report+updated");
}

function adminError(message: string): never {
  redirect(`/admin?tab=destinations&error=${encodeURIComponent(message)}`);
}

export async function createDestination(formData: FormData) {
  const supabase = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const country = String(formData.get("country") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : null;

  if (name.length < 2 || name.length > 120 || country.length < 2 || country.length > 80) {
    adminError("Name and country must be 2–120 characters.");
  }
  if (!/^[a-z0-9-]+$/.test(slug)) adminError("Slug must use lowercase letters, numbers, and dashes.");
  if (description.length < 20) adminError("Add a description of at least 20 characters.");
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) adminError("Latitude must be between -90 and 90.");
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) adminError("Longitude must be between -180 and 180.");
  if (coverImageUrl) {
    let coverUrl: URL;
    try {
      coverUrl = new URL(coverImageUrl);
    } catch {
      adminError("Enter a valid cover image URL.");
    }
    if (!["http:", "https:"].includes(coverUrl.protocol)) adminError("Use an HTTP or HTTPS cover image URL.");
  }

  const { error } = await supabase.from("destinations").insert({
    name, slug, country, region, description,
    cover_image_url: coverImageUrl || null,
    latitude, longitude,
  });
  if (error?.code === "23505") adminError("A destination with that slug already exists.");
  if (error) adminError(error.message);
  revalidatePath("/admin");
  revalidatePath("/destinations");
  redirect("/admin?tab=destinations&message=Destination+added");
}

export async function deleteDestination(id: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();
  const { data: destination, error: lookupError } = await supabase.from("destinations")
    .select("id, is_sample").eq("id", id).maybeSingle();
  if (lookupError) return { error: lookupError.message };
  if (!destination) return { error: "Destination not found." };
  if (destination.is_sample) return { error: "Built-in destinations cannot be deleted from the catalogue." };
  const { data: deleted, error } = await supabase.from("destinations")
    .delete().eq("id", id).eq("is_sample", false).select("id").maybeSingle();
  if (error) return { error: error.message };
  if (!deleted) return { error: "Destination was not deleted. Refresh and retry." };
  revalidatePath("/admin");
  revalidatePath("/destinations");
  return {};
}
