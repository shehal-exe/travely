import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/utils";

export async function getSupabaseServer() {
  if (!isSupabaseConfigured()) return null;
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies; proxy.ts refreshes sessions.
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
