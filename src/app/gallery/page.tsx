import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery-grid";
import { getPublicMemories } from "@/lib/data";

export const metadata: Metadata = { title: "Community Gallery" };

export default async function GalleryPage() {
  const memories = await getPublicMemories();
  return <><section className="bg-[#0b3447] py-20 text-white"><div className="section-shell"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Travel photo gallery</p><h1 className="mt-3 max-w-4xl font-serif text-5xl font-semibold sm:text-7xl">India through the community’s eyes.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Open any photograph to see its location, caption, photographer, and the travel blog behind it.</p></div></section><section className="section-shell py-14 lg:py-20"><GalleryGrid memories={memories} /></section></>;
}
