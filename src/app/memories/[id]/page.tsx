import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, Heart, IndianRupee, Lightbulb, MapPin, Star, UserRound } from "lucide-react";
import { getMemory } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { MemoryActions } from "@/components/memory-actions";
import { MemoryComments } from "@/components/memory-comments";
import { getMediaCredit } from "@/lib/media-credits";
import { getMemoryComments } from "@/lib/social-data";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MemoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ comments?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const memory = await getMemory(id);
  if (!memory) notFound();
  const author = memory.profile?.display_name ?? "TRAVELY member";
  const initials = author.split(" ").map((part) => part[0]).join("").slice(0, 2);
  const isPreview = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memory.id);
  const commentPage = Math.min(60, Math.max(1, Number.parseInt(query.comments ?? "1", 10) || 1));
  const [viewer, commentData] = await Promise.all([
    getCurrentUser(),
    !isPreview && memory.visibility === "public" ? getMemoryComments(memory.id, commentPage) : Promise.resolve(null),
  ]);

  return (
    <article>
      <section className="relative isolate overflow-hidden bg-[#0b3447] py-16 text-white lg:py-24">
        <Image src={memory.images?.[0]?.image_url ?? "/images/travel/commons/gallery/varanasi-2.jpg"} alt="" fill priority className="-z-20 object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f2c]/95 via-[#0b3447]/75 to-[#0b3447]/25" />
        <div className="section-shell max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">{memory.country} · {memory.category ?? "Travel story"}</p>
          <h1 className="mt-4 max-w-5xl font-serif text-5xl font-semibold leading-tight sm:text-7xl">{memory.title}</h1>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
            <span className="flex items-center gap-2"><MapPin size={17} />{memory.destination_name}</span>
            <span className="flex items-center gap-2"><CalendarDays size={17} />{formatDate(memory.travel_date)}</span>
            <span className="flex items-center gap-2"><Heart size={17} />{memory.likes_count ?? 0} likes</span>
          </div>
        </div>
      </section>

      <section className="section-shell -mt-7 relative z-10">
        <div className="grid overflow-hidden rounded-[1.75rem] bg-white shadow-xl ring-1 ring-slate-200 sm:grid-cols-4">
          <div className="flex items-center gap-3 p-5 sm:p-6"><Clock3 className="text-[#0d6d67]" /><div><p className="text-xs uppercase tracking-wide text-slate-400">Time spent</p><strong className="text-[#123a50]">{memory.days_spent != null ? `${memory.days_spent} days` : "Not shared"}</strong></div></div>
          <div className="flex items-center gap-3 border-t border-slate-100 p-5 sm:border-l sm:border-t-0 sm:p-6"><IndianRupee className="text-[#0d6d67]" /><div><p className="text-xs uppercase tracking-wide text-slate-400">Total expense</p><strong className="text-[#123a50]">{memory.total_expense != null ? `₹${memory.total_expense.toLocaleString("en-IN")}` : "Not shared"}</strong></div></div>
          <div className="flex items-center gap-3 border-t border-slate-100 p-5 sm:border-l sm:border-t-0 sm:p-6"><Star className="text-amber-500" fill="currentColor" /><div><p className="text-xs uppercase tracking-wide text-slate-400">Overall rating</p><strong className="text-[#123a50]">{memory.rating}/5</strong></div></div>
          <div className="flex items-center gap-3 border-t border-slate-100 p-5 sm:border-l sm:border-t-0 sm:p-6"><MapPin className="text-[#0d6d67]" /><div><p className="text-xs uppercase tracking-wide text-slate-400">Trip style</p><strong className="text-[#123a50]">{memory.trip_style ?? "Independent"}</strong></div></div>
        </div>
      </section>

      <section className="section-shell py-12 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-12">
          {memory.images?.map((image, index) => (
            <figure key={image.id} className={`overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200 ${index === 0 ? "lg:col-span-8" : "lg:col-span-4"}`}>
              <div className={`relative ${index === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}`}><Image src={image.image_url} alt={`${memory.title} — photograph ${index + 1}`} fill className="object-cover" sizes={index === 0 ? "66vw" : "34vw"} priority={index === 0} /></div>
              <figcaption className="px-5 py-4 text-sm leading-6 text-slate-600">{image.caption ?? `Photograph ${index + 1} uploaded by ${author}.`}{getMediaCredit(image.image_url) && <span className="mt-1 block text-xs">Photo by <a className="font-semibold underline" href={getMediaCredit(image.image_url)!.source} target="_blank" rel="noreferrer">{getMediaCredit(image.image_url)!.author}</a> · <a className="underline" href={getMediaCredit(image.image_url)!.licenseUrl} target="_blank" rel="noreferrer">{getMediaCredit(image.image_url)!.license}</a></span>}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 py-14 lg:grid-cols-[1fr_340px]">
          <div><p className="eyebrow">The travel blog</p><h2 className="mt-3 font-serif text-4xl font-semibold text-[#123a50]">The full story</h2><p className="mt-6 whitespace-pre-wrap text-lg leading-9 text-slate-700">{memory.description}</p><Link href={`/plan?story=${encodeURIComponent(memory.id)}`} className="mt-7 inline-flex rounded-full bg-[#0d6d67] px-6 py-3 font-bold text-white transition hover:bg-[#0a5652]">Plan a visit to {memory.destination_name}</Link>{isPreview ? <p className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Sample story for exploring TRAVELY. Likes, saves, and reports are available on published community stories.</p> : <MemoryActions memoryId={memory.id} />}</div>
          <aside className="space-y-5">
            <div className="rounded-[1.75rem] bg-[#edf6f3] p-6"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-[#123a50] font-bold text-white">{initials}</span><div><p className="text-xs font-bold uppercase tracking-wide text-[#0d6d67]">{isPreview ? "Sample story narrator" : "Uploaded by"}</p><h2 className="font-serif text-xl font-semibold text-[#123a50]">{author}</h2></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{memory.author_note ?? memory.profile?.bio ?? "A member of the TRAVELY community."}</p>{!isPreview && memory.profile?.username && <Link href={`/profile/${memory.profile.username}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0d6d67]"><UserRound size={16} /> View contributor</Link>}</div>
            <div className="rounded-[1.75rem] bg-orange-50 p-6"><Lightbulb className="text-[#e96536]" /><h2 className="mt-4 font-bold text-[#123a50]">Traveler’s practical tips</h2><p className="mt-2 leading-7 text-slate-600">{memory.travel_tips || "No tips were added to this journey."}</p></div>
          </aside>
        </div>
        {commentData && <div className="mx-auto max-w-6xl">{commentData.error ? <p role="alert" className="mt-6 rounded-2xl bg-amber-50 p-6 text-amber-900">{commentData.error}</p> : <MemoryComments memoryId={memory.id} comments={commentData.comments} count={commentData.count} page={commentPage} viewerId={viewer?.id ?? null} />}</div>}
      </section>
    </article>
  );
}
