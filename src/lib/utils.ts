import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function isSupabaseConfigured() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!rawUrl || !key || key.length < 20 || /^your[-_]/i.test(key)) return false;

  try {
    const url = new URL(rawUrl);
    return (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname) &&
      url.hostname !== "your-project.supabase.co";
  } catch {
    return false;
  }
}
