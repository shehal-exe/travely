import { requestPasswordReset } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();
  return <AuthShell title="Reset your password" subtitle="We will send a secure password-reset link to your verified email." alternate={<Link href="/auth/login" className="font-bold text-[#0d6d67]">Return to login</Link>}>{configured ? <form action={requestPasswordReset} className="grid gap-5"><div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div><Button type="submit">Send reset link</Button></form> : <AuthUnavailable />}</AuthShell>;
}
