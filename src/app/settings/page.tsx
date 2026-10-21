import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser, getSupabaseServer } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const supabase = await getSupabaseServer();
  if (!user || !supabase) return <section className="section-shell py-24 text-center"><h1 className="font-serif text-5xl text-[#123a50]">Sign in to edit your profile.</h1><Link href="/auth/login" className={buttonClasses({ className: "mt-7" })}>Log in</Link></section>;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return <section className="section-shell py-16"><div className="mx-auto max-w-2xl"><p className="eyebrow">Account</p><h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50]">Profile settings</h1><div className="mt-9"><ProfileForm profile={data as Profile} /></div></div></section>;
}
