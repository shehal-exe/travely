import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, MapPin } from "lucide-react";
import type { Destination } from "@/types/database";

export function DestinationCard({ destination, priority = false }: { destination: Destination; priority?: boolean }) {
  return (
    <article className="media-card group h-full overflow-hidden rounded-[1.15rem] border border-[#dfe6e1] bg-white">
      <Link href={`/destinations/${destination.slug}`} aria-label={`Explore destination: ${destination.name}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e9eee9]">
          {destination.cover_image_url ? <Image src={destination.cover_image_url} alt={destination.name} fill loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="absolute inset-0 grid place-items-center text-[#0d6d67]"><Compass size={34} /></div>}
          <span className="absolute left-4 top-4 rounded-full bg-[#faf8f3]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#123a50]">{destination.category?.name ?? "Destination"}</span>
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><h3 className="font-serif text-2xl font-semibold text-[#123a50]">{destination.name}</h3><ArrowUpRight size={19} className="mt-1 shrink-0 text-[#0d6d67] transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} /> {[destination.region, destination.country].filter(Boolean).join(", ")}</p>
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{destination.description}</p>
          <p className="mt-auto pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[#c95d38]">{destination.ideal_duration ?? "Travel guide"}</p>
        </div>
      </Link>
    </article>
  );
}
