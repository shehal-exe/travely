import { updatePassword } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const configured = isSupabaseConfigured();
  return <AuthShell title="Choose a new password" subtitle="Use at least eight characters and avoid reusing a password from another service." alternate="">{configured ? <form action={updatePassword} className="grid gap-5"><div><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" required minLength={8} /></div>{query.error && <p className="text-sm text-red-700">{query.error}</p>}<Button type="submit">Update password</Button></form> : <AuthUnavailable />}</AuthShell>;
}
