import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { TravelMemory } from "@/types/database";

export function MemoryCard({ memory }: { memory: TravelMemory }) {
  const image = [...(memory.images ?? [])].sort((a, b) => a.position - b.position)[0]?.image_url;
  const author = memory.profile?.display_name ?? "Traveler";
  const initials = author.split(" ").map((part) => part[0]).join("").slice(0, 2);
  const isPreview = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memory.id);

  return (
    <Link href={`/memories/${memory.id}`} className="media-card group flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-[#dfe6e1] bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e9eee9]">
        {image && <Image src={image} alt={memory.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />}
        {isPreview && <span className="absolute left-4 top-4 rounded-full bg-[#faf8f3]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#123a50]">Sample story</span>}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><h3 className="font-serif text-2xl font-semibold text-[#123a50]">{memory.title}</h3><ArrowUpRight size={19} className="mt-1 shrink-0 text-[#0d6d67] transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} /> {memory.destination_name} <span aria-hidden>·</span> {formatDate(memory.travel_date)}</p>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{memory.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-4 text-xs font-semibold text-[#123a50]"><span>{memory.days_spent != null ? `${memory.days_spent} days` : "Days not shared"}</span><span className="text-slate-300" aria-hidden>·</span><span>{memory.total_expense != null ? `₹${memory.total_expense.toLocaleString("en-IN")} spent` : "Cost not shared"}</span><span className="text-slate-300" aria-hidden>·</span><span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-500" fill="currentColor" /> {memory.rating}/5</span></div>
        <div className="mt-auto flex items-center gap-3 pt-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#123a50] text-xs font-bold text-white">{initials}</span><div className="min-w-0"><strong className="block text-sm text-[#123a50]">{author}</strong><p className="line-clamp-1 text-xs text-slate-500">{memory.author_note ?? memory.profile?.bio ?? "TRAVELY community contributor"}</p></div></div>
      </div>
    </Link>
  );
}
