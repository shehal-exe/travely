import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { travelCircuits } from "@/data/circuits";

export function IndiaRoutes() {
  return (
    <section id="routes" className="scroll-mt-24 overflow-hidden bg-[#eaf1ed] py-20 lg:py-28">
      <div className="section-shell">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow">Build an India route</p>
              <h2 className="section-title mt-3 font-serif font-semibold text-[#123a50]">
                Memorable circuits, <em className="font-normal text-[#c95d38]">ready to shape around you.</em>
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Explore a clear stop sequence, planning range, map, and destination guides—then make the journey your own.</p>
            </div>
            <Link href="/destinations?view=routes" className="editorial-link text-[#0d6d67]">Browse every circuit <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {travelCircuits.slice(0, 3).map((route, index) => (
            <Reveal key={route.slug} delay={index * 0.09} direction={index === 0 ? "left" : index === 2 ? "right" : "up"}>
              <article className="group relative isolate flex min-h-[470px] overflow-hidden rounded-[1.2rem] bg-[#123a50] p-7 text-white shadow-[0_20px_50px_rgba(18,58,80,.12)]">
                <Image src={route.image} alt="" fill className="-z-20 object-cover transition duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 33vw" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061f2c] via-[#0b3447]/45 to-black/5" />
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-xs font-bold backdrop-blur"><Clock3 size={14} /> {route.duration}</span>
                  <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">{route.category}</p>
                  <h3 className="mt-2 font-serif text-3xl font-semibold">{route.title}</h3>
                  <p className="mt-3 line-clamp-3 leading-7 text-slate-100">{route.summary}</p>
                  <div className="my-5 flex flex-wrap gap-x-3 gap-y-2 text-xs font-semibold text-white/80">
                    {route.stops.map((stop, stopIndex) => <span key={stop.name}>{stopIndex > 0 && <span className="mr-3 text-[#c95d38]">•</span>}{stop.name}</span>)}
                  </div>
                  <Link href={`/routes/${route.slug}`} className="inline-flex items-center gap-2 border-b border-emerald-200 pb-1 text-xs font-bold uppercase tracking-[.12em] text-emerald-200 transition group-hover:gap-3">Open the roadmap <ArrowRight size={15} /></Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
