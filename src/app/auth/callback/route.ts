import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/auth/login?error=Missing+or+expired+account+link", request.url));
  const supabase = await getSupabaseServer();
  const { error } = await supabase?.auth.exchangeCodeForSession(code) ?? { error: new Error("Account service unavailable") };
  if (error) return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url));
  const requested = url.searchParams.get("next");
  const next = requested === "/auth/update-password" ? requested : "/journal";
  return NextResponse.redirect(new URL(next, request.url));
}
