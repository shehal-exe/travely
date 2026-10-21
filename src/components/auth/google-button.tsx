"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleButton() {
  if (process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED !== "true") return null;
  return <Button type="button" variant="outline" className="w-full" onClick={async () => {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } });
  }}>Continue with Google</Button>;
}
