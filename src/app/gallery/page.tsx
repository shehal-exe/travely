import type { Metadata } from "next";
import Image from "next/image";
import { GalleryGrid } from "@/components/gallery-grid";
import { getPublicMemories } from "@/lib/data";

export const metadata: Metadata = { title: "Community Gallery" };

export default async function GalleryPage() {
  const memories = await getPublicMemories();
  return <><section className="relative isolate overflow-hidden bg-[#0b3447] py-20 text-white lg:py-24"><Image src="/images/travel/commons/gallery/udaipur-2.jpg" alt="" fill priority className="-z-20 object-cover object-center" sizes="100vw" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f2c]/95 via-[#0b3447]/68 to-[#0b3447]/15" /><div className="section-shell"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Travel photo gallery</p><h1 className="mt-3 max-w-4xl font-serif text-5xl font-semibold sm:text-7xl">India through the community’s eyes.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">Open any photograph to see its location, caption, photographer, and the travel blog behind it.</p></div></section><section className="section-shell py-14 lg:py-20"><GalleryGrid memories={memories} /></section></>;
}
