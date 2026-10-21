import Link from "next/link";
import { signIn } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const query = await searchParams;
  const configured = isSupabaseConfigured();
  return <AuthShell title="Return to your journal" subtitle="Sign in to manage private memories, favorites, and your travel map." alternate={<>New here? <Link href="/auth/sign-up" className="font-bold text-[#0d6d67]">Create an account</Link></>}>
    {configured ? <form action={signIn} className="grid gap-5"><div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div><div className="flex justify-between"><Label htmlFor="password">Password</Label><Link href="/auth/forgot-password" className="text-sm font-semibold text-[#0d6d67]">Forgot password?</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} /></div>{query.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{query.error}</p>}{query.message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{query.message}</p>}<Button className="w-full" type="submit">Log in</Button><div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />OR<span className="h-px flex-1 bg-slate-200" /></div><GoogleButton /></form> : <AuthUnavailable />}
  </AuthShell>;
}
