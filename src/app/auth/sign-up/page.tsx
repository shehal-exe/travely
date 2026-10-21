import Link from "next/link";
import { signUp } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { getInstantSignupState } from "@/lib/supabase/auth-settings";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const configured = isSupabaseConfigured();
  const signupState = configured ? await getInstantSignupState() : "unavailable";

  return (
    <AuthShell
      title="Begin your travel journal"
      subtitle="Create a secure account for public stories and memories kept just for you."
      alternate={<>Already a member? <Link href="/auth/login" className="font-bold text-[#0d6d67]">Log in</Link></>}
    >
      {!configured ? <AuthUnavailable /> : signupState !== "ready" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
          <h2 className="text-lg font-bold">New accounts are temporarily paused</h2>
          <p className="mt-2">{signupState === "confirmation-required"
            ? "The account service still requires email confirmation. The site owner must turn off Confirm email in Supabase Auth settings before instant sign-up can start. Reload this page after that change."
            : "The account service cannot be reached right now. Please try again later."}</p>
          {query.error && <p className="mt-3">{query.error}</p>}
        </div>
      ) : (
        <form action={signUp} className="grid gap-5">
          <div><Label htmlFor="displayName">Display name</Label><Input id="displayName" name="displayName" required minLength={2} maxLength={80} autoComplete="name" /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" /></div>
          {query.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{query.error}</p>}
          <Button className="w-full" type="submit">Create account</Button>
          <GoogleButton />
        </form>
      )}
    </AuthShell>
  );
}
