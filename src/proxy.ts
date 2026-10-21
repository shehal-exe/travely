import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/utils";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, cacheHeaders) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(cacheHeaders ?? {}).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm|woff2?|ico)$).*)"],
};
