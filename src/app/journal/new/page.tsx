import Link from "next/link";
import { MemoryForm } from "@/components/memory-form";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { getSelectableDestinations } from "@/lib/data";

export default async function NewMemoryPage({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const user = await getCurrentUser();
  if (!isSupabaseConfigured() || !user) return <section className="section-shell py-24 text-center"><p className="eyebrow">Private workspace</p><h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50]">Sign in to share a journey.</h1><p className="mx-auto mt-5 max-w-xl text-slate-600">A configured Supabase project and authenticated account are required to upload photographs and save memories.</p><Link href="/auth/login" className={buttonClasses({ className: "mt-7" })}>Log in</Link></section>;
  const [destinations, query] = await Promise.all([getSelectableDestinations(), searchParams]);
  const selectedDestinationId = destinations.find((item) => item.id === query.destination)?.id;
  return <section className="section-shell py-14 lg:py-20"><div className="mx-auto max-w-4xl"><p className="eyebrow">New memory</p><h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50]">Tell the story, not just the place.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">Add the details another traveler would miss—and the moments you never want to forget.</p><div className="mt-10"><MemoryForm destinations={destinations} selectedDestinationId={selectedDestinationId} /></div></div></section>;
}
