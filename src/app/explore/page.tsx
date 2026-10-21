import type { Metadata } from "next";
import { ExploreBrowser } from "@/components/explore-browser";
import { getPublicMemories } from "@/lib/data";

export const metadata: Metadata = { title: "Community Travel Blogs" };

export default async function ExplorePage() {
  const memories = await getPublicMemories();
  return (
    <section className="section-shell py-16 lg:py-24">
      <div className="max-w-4xl"><p className="eyebrow">Blogs = travel stories</p><h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50] sm:text-6xl">Real journeys, with the useful details kept in.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Every card gives you the days, total spend, overall rating, travel style, and a quick introduction to its author. Open a story for photographs, captions, practical tips, and the complete blog.</p></div>
      <div className="mt-10"><ExploreBrowser memories={memories} /></div>
    </section>
  );
}
