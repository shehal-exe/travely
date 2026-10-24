import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, Clock3, Compass, IndianRupee, MapPin, Plane, ShieldCheck, Star } from "lucide-react";
import { TravelMap } from "@/components/maps/travel-map";
import { MemoryCard } from "@/components/memory-card";
import { getDestination } from "@/lib/data";
import { getDestinationStories } from "@/lib/social-data";
import { getCommonsFilePage, getMediaCredit } from "@/lib/media-credits";

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) notFound();
  const gallery = destination.gallery_images?.length ? destination.gallery_images : destination.cover_image_url ? [destination.cover_image_url] : [];
  const canLinkStories = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(destination.id);
  const community = await getDestinationStories(destination.id);

  return (
    <>
      <section className="relative isolate min-h-[62vh] overflow-hidden bg-slate-900 text-white">
        {destination.cover_image_url ? <Image src={destination.cover_image_url} alt={destination.name} fill loading="eager" fetchPriority="high" className="-z-20 object-cover" sizes="100vw" /> : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071f2d] via-[#082d3e]/45 to-black/10" />
        <div className="section-shell flex min-h-[62vh] items-end pb-14"><div className="max-w-4xl"><span className="rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">{destination.category?.name ?? "Destination"}</span><h1 className="mt-5 font-serif text-6xl font-semibold sm:text-8xl">{destination.name}</h1><p className="mt-4 flex items-center gap-2 text-lg text-slate-100"><MapPin size={19} /> {[destination.district, destination.region, destination.country].filter(Boolean).join(", ")}</p><Link href={`/plan?destination=${encodeURIComponent(destination.slug)}`} className="mt-7 inline-flex rounded-full bg-[#0d6d67] px-6 py-3 font-bold text-white transition hover:bg-[#095b57]">Plan a trip here</Link></div></div>
      </section>

      <section className="section-shell -mt-7 relative z-10"><div className="grid overflow-hidden rounded-[1.75rem] bg-white shadow-xl ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        <Essential icon={Clock3} label="Ideal stay" value={destination.ideal_duration ?? "2–3 days"} />
        <Essential icon={IndianRupee} label="Planning budget" value={destination.average_budget ?? "Build your estimate"} />
        <Essential icon={CalendarRange} label="Best season" value={destination.best_time_to_visit ?? "Check local climate"} />
        <Essential icon={Plane} label="Nearest air gateway" value={destination.nearest_airport ?? "Check regional connections"} />
      </div></section>

      <section className="section-shell grid gap-12 py-16 lg:grid-cols-[1fr_360px]">
        <div><p className="eyebrow">About this place</p><h2 className="mt-3 font-serif text-4xl font-semibold text-[#123a50]">Why go</h2><p className="mt-6 text-lg leading-8 text-slate-600">{destination.description}</p>{destination.history && <><h3 className="mt-10 font-serif text-3xl font-semibold text-[#123a50]">A short history</h3><p className="mt-4 text-lg leading-8 text-slate-600">{destination.history}</p></>}{destination.highlights?.length ? <div className="mt-9"><h3 className="flex items-center gap-2 font-bold text-[#123a50]"><Compass size={19} /> Signature experiences</h3><div className="mt-4 flex flex-wrap gap-2">{destination.highlights.map((item) => <span key={item} className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-[#0d6d67]">{item}</span>)}</div></div> : null}</div>
        <aside><div className="rounded-[1.75rem] bg-[#edf6f3] p-7"><ShieldCheck className="text-[#0d6d67]" /><h2 className="mt-4 font-bold text-[#123a50]">Plan responsibly</h2><p className="mt-2 text-sm leading-6 text-slate-600">{destination.safety_note}</p><p className="mt-5 border-t border-[#0d6d67]/15 pt-5 text-sm leading-6 text-slate-600"><strong className="text-[#123a50]">Getting around:</strong> {destination.getting_around}</p></div></aside>
      </section>

      {gallery.length > 0 && <section className="bg-[#eef5f2] py-16"><div className="section-shell"><p className="eyebrow">Visual walkthrough</p><h2 className="mt-3 font-serif text-4xl font-semibold text-[#123a50]">See the atmosphere</h2><p className="mt-3 max-w-2xl text-slate-600">A closer look at {destination.name}, from its landmarks to the details that make the journey memorable.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{gallery.map((image, index) => { const credit = getMediaCredit(image); const filePage = getCommonsFilePage(image); return <figure key={`${image}-${index}`} className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm"><div className="relative aspect-[4/3]"><Image src={image} alt={`${destination.name} view ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" /></div><figcaption className="px-5 py-3 text-xs text-slate-500">{destination.name} · {credit ? <>Photo by <a className="font-semibold underline" href={credit.source} target="_blank" rel="noreferrer">{credit.author}</a> · <a className="underline" href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a></> : filePage ? <a className="underline" href={filePage} target="_blank" rel="noreferrer">Photo details</a> : destination.media_credit ?? "Travel photograph"}</figcaption></figure>; })}</div>{destination.video_url && <div className="mt-8 overflow-hidden rounded-[2rem] bg-black shadow-xl"><video src={destination.video_url} controls muted playsInline preload="metadata" poster={destination.cover_image_url ?? undefined} className="aspect-video w-full object-cover" /><div className="bg-[#082d3e] px-5 py-4 text-sm text-slate-200">A short destination film · TRAVELY destination footage</div></div>}</div></section>}

      <section id="community" className="section-shell py-16"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Community experiences</p><h2 className="mt-3 font-serif text-4xl font-semibold text-[#123a50]">Stories from {destination.name}</h2><p className="mt-3 text-slate-600">First-hand journeys linked to this place by TRAVELY travellers.</p></div><Link href={canLinkStories ? `/journal/new?destination=${encodeURIComponent(destination.id)}` : "/journal/new"} className="rounded-full bg-[#0d6d67] px-5 py-3 text-sm font-bold text-white">Share your visit</Link></div>{community.error ? <p role="alert" className="mt-8 rounded-2xl bg-amber-50 p-6 text-amber-900">{community.error}</p> : community.memories.length ? <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{community.memories.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}</div> : <p className="mt-8 rounded-2xl bg-[#edf6f3] p-6 text-slate-600">No traveller stories linked to this destination yet. Be the first to share one.</p>}</section>

      {destination.latitude != null && destination.longitude != null && <section className="section-shell py-16"><div className="mb-6"><p className="eyebrow">Location</p><h2 className="mt-2 font-serif text-4xl font-semibold text-[#123a50]">Open it on the map</h2></div><TravelMap destinations={[destination]} /></section>}
    </>
  );
}

function Essential({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return <div className="flex gap-3 border-b border-slate-100 p-5 last:border-0 sm:border-b-0 sm:border-r sm:p-6 sm:last:border-r-0"><Icon className="mt-0.5 shrink-0 text-[#0d6d67]" size={20} /><div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><strong className="mt-1 block text-sm leading-5 text-[#123a50]">{value}</strong></div></div>;
}
