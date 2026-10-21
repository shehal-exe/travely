import { isSupabaseConfigured } from "@/lib/utils";

export type InstantSignupState = "ready" | "confirmation-required" | "unavailable";

export async function getInstantSignupState(): Promise<InstantSignupState> {
  if (!isSupabaseConfigured()) return "unavailable";
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return "unavailable";
    const settings = await response.json() as { mailer_autoconfirm?: boolean };
    return settings.mailer_autoconfirm === true ? "ready" : "confirmation-required";
  } catch {
    return "unavailable";
  }
}
