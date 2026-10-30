import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { categoryGuides } from "@/data/category-guides";
import { getFeaturedDestinations } from "@/lib/data";

export const metadata: Metadata = { title: "Travel Categories" };

export default async function CategoriesPage() {
  const destinations = await getFeaturedDestinations();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#0b3447] py-16 text-white sm:py-20">
        <Image src="/images/travel/goa-1.jpg" alt="" fill priority className="-z-20 object-cover opacity-35" sizes="100vw" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f2c] via-[#0b3447]/70 to-transparent" />
        <div className="section-shell">
          <Reveal y={18}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Explore by interest</p>
            <h1 className="section-title mt-3 max-w-3xl font-serif font-semibold">Go where curiosity takes you.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-200">A coastline, a mountain road, a memorable meal—start with what moves you.</p>
          </Reveal>
        </div>
      </section>
      <section className="section-shell py-16 lg:py-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryGuides.map((guide, index) => {
            const count = destinations.filter((item) => item.category?.name === guide.name).length;
            return (
              <Reveal key={guide.name} delay={(index % 3) * 0.08} direction={index % 2 === 0 ? "left" : "right"}>
              <Link href={`/destinations?category=${encodeURIComponent(guide.slug)}`} className="group relative isolate flex min-h-[340px] overflow-hidden rounded-[1.15rem] bg-[#123a50] p-7 text-white">
                <Image src={guide.image} alt="" fill className="-z-20 object-cover transition duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061f2c]/90 via-[#0b3447]/15 to-transparent" />
                <div className="mt-auto w-full">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/75">{count} places</p>
                  <div className="mt-2 flex items-end justify-between gap-3"><h2 className="font-serif text-3xl font-semibold">{guide.name}</h2><ArrowUpRight size={21} className="shrink-0 transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-100">{guide.description}</p>
                </div>
              </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
