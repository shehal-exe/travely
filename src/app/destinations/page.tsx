import type { Metadata } from "next";
import Image from "next/image";
import { DestinationBrowser } from "@/components/destination-browser";
import { Reveal } from "@/components/motion/reveal";
import { getFeaturedDestinations } from "@/lib/data";

export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; view?: string }> }) {
  const filters = await searchParams;
  const destinations = await getFeaturedDestinations();
  return (
    <>
      <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-[#0b3447] py-24 text-white lg:min-h-[580px] lg:py-28">
        <Image src="/images/travel/commons/destination/jaipur.jpg" alt="" fill priority className="-z-20 object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f2c]/95 via-[#0b3447]/72 to-[#0b3447]/20" />
        <div className="section-shell"><Reveal y={18}><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Explore India</p><h1 className="mt-3 font-serif text-5xl font-semibold sm:text-6xl">Where to next?</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">Find a place that feels right, explore the map, or follow a ready-made route.</p></Reveal></div>
      </section>
      <section className="section-shell py-8 lg:py-10"><Reveal y={28} amount={0.08}><DestinationBrowser destinations={destinations} initialQuery={filters.q ?? ""} initialCategory={filters.category ?? "all"} initialView={filters.view ?? "places"} /></Reveal></section>
    </>
  );
}
