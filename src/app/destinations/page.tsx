import type { Metadata } from "next";
import { DestinationBrowser } from "@/components/destination-browser";
import { getFeaturedDestinations } from "@/lib/data";

export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; view?: string }> }) {
  const filters = await searchParams;
  const destinations = await getFeaturedDestinations();
  return (
    <>
      <section className="bg-[#0b3447] py-14 text-white lg:py-16"><div className="section-shell"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Explore India</p><h1 className="mt-3 font-serif text-5xl font-semibold sm:text-6xl">Where to next?</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">Find a place that feels right, explore the map, or follow a ready-made route.</p></div></section>
      <section className="section-shell py-8 lg:py-10"><DestinationBrowser destinations={destinations} initialQuery={filters.q ?? ""} initialCategory={filters.category ?? "all"} initialView={filters.view ?? "places"} /></section>
    </>
  );
}
