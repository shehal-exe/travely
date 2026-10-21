import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarRange, IndianRupee, MapPinned, Route, TrainFront } from "lucide-react";
import { RouteHero } from "@/components/route-hero";
import { RouteMap } from "@/components/maps/route-map";
import { getCircuit, travelCircuits } from "@/data/circuits";

export function generateStaticParams() { return travelCircuits.map((route) => ({ slug: route.slug })); }

export default async function CircuitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const circuit = getCircuit(slug);
  if (!circuit) notFound();

  return <>
    <RouteHero images={circuit.slides}><div className="section-shell flex min-h-[68vh] items-end pb-16"><div className="max-w-5xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">{circuit.category} · {circuit.region}</p><h1 className="mt-4 font-serif text-6xl font-semibold leading-[1.02] sm:text-8xl">{circuit.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">{circuit.summary}</p><Link href={`/plan?circuit=${encodeURIComponent(circuit.slug)}`} className="mt-7 inline-flex rounded-full bg-[#e96536] px-6 py-3 font-bold text-white transition hover:bg-[#d9562b]">Make this route my trip <ArrowRight size={18} className="ml-2" /></Link></div></div></RouteHero>
    <section className="section-shell -mt-7 relative z-10"><div className="grid overflow-hidden rounded-[1.75rem] bg-white shadow-xl ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-4"><Fact icon={CalendarRange} label="Suggested time" value={circuit.duration} /><Fact icon={MapPinned} label="Route distance" value={circuit.distance} /><Fact icon={IndianRupee} label="Planning range" value={circuit.budget} /><Fact icon={TrainFront} label="Travel mode" value={circuit.transport} /></div></section>
    <section className="section-shell py-16"><div className="grid gap-12 lg:grid-cols-[1fr_340px]"><div><p className="eyebrow">Day-by-day foundation</p><h2 className="mt-3 font-serif text-4xl font-semibold text-[#123a50]">Follow the circuit, then make it yours</h2><div className="mt-9 space-y-4">{circuit.stops.map((stop, index) => <article key={`${stop.name}-${index}`} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:grid-cols-[56px_1fr_auto] sm:items-center"><span className="grid size-12 place-items-center rounded-full bg-[#0d6d67] font-serif text-xl font-semibold text-white">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl font-semibold text-[#123a50]">{stop.name}</h3><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#d9562b]">{stop.stay}</span></div><p className="mt-1 leading-6 text-slate-600">{stop.note}</p></div><Link href={`/destinations/${stop.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#0d6d67]">Open <ArrowRight size={16} /></Link></article>)}</div></div><aside className="h-fit rounded-[1.75rem] bg-[#edf6f3] p-7"><Route className="text-[#0d6d67]" /><h2 className="mt-4 font-bold text-[#123a50]">Before you book</h2><dl className="mt-5 space-y-5 text-sm"><div><dt className="font-bold text-[#123a50]">Best season</dt><dd className="mt-1 leading-6 text-slate-600">{circuit.bestTime}</dd></div><div><dt className="font-bold text-[#123a50]">Route logic</dt><dd className="mt-1 leading-6 text-slate-600">{circuit.transport}</dd></div></dl><p className="mt-4 text-xs leading-5 text-slate-500">Budget ranges are planning estimates. Check live fares, permits, closures, and state advisories.</p></aside></div><div className="mt-14"><p className="eyebrow">Interactive roadmap</p><h2 className="mt-3 mb-6 font-serif text-4xl font-semibold text-[#123a50]">Every stop on one map</h2><RouteMap stops={circuit.stops} /></div></section>
  </>;
}

function Fact({ icon: Icon, label, value }: { icon: typeof Route; label: string; value: string }) { return <div className="flex gap-3 border-b border-slate-100 p-5 last:border-0 sm:border-b-0 sm:border-r sm:p-6 sm:last:border-r-0"><Icon className="mt-0.5 shrink-0 text-[#0d6d67]" size={20} /><div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><strong className="mt-1 block text-sm leading-5 text-[#123a50]">{value}</strong></div></div>; }
