"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getInstantSignupState } from "@/lib/supabase/auth-settings";

function authErrorMessage(message: string) {
  return message === "fetch failed"
    ? "Cannot reach the account service. Check your connection and try again."
    : message;
}

export async function signIn(formData: FormData) {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/auth/login?error=Supabase+is+not+configured");
  const { error } = await supabase.auth.signInWithPassword({ email: String(formData.get("email")), password: String(formData.get("password")) });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(authErrorMessage(error.message))}`);
  redirect("/journal");
}

export async function signUp(formData: FormData) {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/auth/sign-up?error=Supabase+is+not+configured");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password"));
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (displayName.length < 2 || displayName.length > 80) {
    redirect("/auth/sign-up?error=Display+name+must+be+2-80+characters");
  }
  if (password.length < 8) {
    redirect("/auth/sign-up?error=Use+at+least+8+characters");
  }
  const signupState = await getInstantSignupState();
  if (signupState === "confirmation-required") {
    redirect("/auth/sign-up?error=Registration+is+paused+until+instant+sign-up+is+enabled");
  }
  if (signupState === "unavailable") {
    redirect("/auth/sign-up?error=Account+service+is+temporarily+unavailable");
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback`, data: { display_name: displayName } } });
  if (error) redirect(`/auth/sign-up?error=${encodeURIComponent(authErrorMessage(error.message))}`);
  if (data.session) redirect("/journal");
  redirect("/auth/login?message=Account+created%2C+but+email+confirmation+is+still+enabled+in+Supabase+settings");
}

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/auth/forgot-password?error=Supabase+is+not+configured");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get("email")), { redirectTo: `${origin}/auth/callback?next=/auth/update-password` });
  if (error) redirect(`/auth/forgot-password?error=${encodeURIComponent(authErrorMessage(error.message))}`);
  redirect("/auth/login?message=Password+reset+email+sent");
}

export async function updatePassword(formData: FormData) {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/auth/update-password?error=Supabase+is+not+configured");
  const password = String(formData.get("password"));
  if (password.length < 8) redirect("/auth/update-password?error=Use+at+least+8+characters");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/auth/update-password?error=${encodeURIComponent(authErrorMessage(error.message))}`);
  redirect("/journal");
}
