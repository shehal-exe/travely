"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, Check, Compass, Download, IndianRupee, ListChecks, MapPinned, Plus, Route, Save, Search, Sparkles, Trash2, X } from "lucide-react";
import { saveTrip, deleteTrip } from "@/actions/trips";
import { RouteMap } from "@/components/maps/route-map";
import { daysInTrip, defaultPacking, haversineKm, suggestStopOrder, type ExpenseBreakdown, type PlaceOption, type PlanInput, type TripPlan, type TripStop } from "@/lib/trip-planning";
import { buttonClasses } from "@/components/ui/button";

const emptyExpenses: ExpenseBreakdown = { transport: 0, stay: 0, food: 0, activities: 0 };
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const field = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#123a50] outline-none transition focus:border-[#0d6d67] focus:ring-2 focus:ring-[#0d6d67]/15";

function makeStop(place: PlaceOption, day: number): TripStop {
  return { id: crypto.randomUUID(), slug: place.slug || null, name: place.name, region: place.region,
    latitude: place.latitude, longitude: place.longitude, day, note: "", budget: null };
}

function nextDate(iso: string, offset: number) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function newTrip(starter: PlaceOption[], starterTitle: string | null, today: string): PlanInput {
  const start = nextDate(today, 7);
  return { title: starterTitle ?? "My India journey", start_date: start, end_date: nextDate(start, Math.max(3, starter.length + 1)),
    budget_total: null, notes: "", stops: starter.map((place, index) => makeStop(place, index + 1)),
    packing: [], expenses: { ...emptyExpenses } };
}

export function TripPlanner({ trips, selected, places, starter, starterTitle, databaseError, today }: {
  trips: TripPlan[]; selected: TripPlan | null; places: PlaceOption[]; starter: PlaceOption[];
  starterTitle: string | null; databaseError: string | null; today: string;
}) {
  const router = useRouter();
  const [trip, setTrip] = useState<PlanInput>(() => selected ? {
    id: selected.id, title: selected.title, start_date: selected.start_date, end_date: selected.end_date,
    budget_total: selected.budget_total, notes: selected.notes, stops: selected.stops ?? [],
    packing: selected.packing ?? [], expenses: selected.expenses ?? { ...emptyExpenses },
  } : newTrip(starter, starterTitle, today));
  const [search, setSearch] = useState("");
  const [newPacking, setNewPacking] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(databaseError);
  const [isPending, startTransition] = useTransition();
  const dayCount = daysInTrip(trip.start_date, trip.end_date);
  const subtotal = Object.values(trip.expenses).reduce((sum, amount) => sum + amount, 0);
  const stopBudget = trip.stops.reduce((sum, stop) => sum + (stop.budget ?? 0), 0);
  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 2) return [];
    return places.filter((place) => `${place.name} ${place.region ?? ""}`.toLowerCase().includes(term)).slice(0, 8);
  }, [places, search]);
  const mapStops = trip.stops.filter((stop): stop is TripStop & { latitude: number; longitude: number } => stop.latitude != null && stop.longitude != null);

  function patch(changes: Partial<PlanInput>) { setTrip((current) => ({ ...current, ...changes })); setMessage(null); }
  function patchStop(id: string, changes: Partial<TripStop>) { patch({ stops: trip.stops.map((stop) => stop.id === id ? { ...stop, ...changes } : stop) }); }
  function addPlace(place: PlaceOption) {
    patch({ stops: [...trip.stops, makeStop(place, Math.min(dayCount, trip.stops.length + 1))] });
    setSearch("");
  }
  function moveStop(index: number, direction: -1 | 1) {
    const next = [...trip.stops];
    const swap = index + direction;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    patch({ stops: next });
  }
  function distributeDays(stops = trip.stops) {
    if (!stops.length) return;
    patch({ stops: stops.map((stop, index) => ({ ...stop, day: Math.min(dayCount, 1 + Math.floor(index * dayCount / stops.length)) })) });
    setMessage("Stops spread across your trip days. Review travel time and opening hours before booking.");
  }
  function optimize() {
    const ordered = suggestStopOrder(trip.stops);
    distributeDays(ordered);
    setMessage("Suggested a shorter straight-line order. This is not a road route or live travel-time estimate; review it before booking.");
  }
  function save() {
    setError(null); setMessage(null);
    startTransition(async () => {
      const result = await saveTrip(trip);
      if (result.error) { setError(result.error); return; }
      setMessage(result.success ?? "Saved.");
      if (!trip.id && result.id) router.push(`/plan?trip=${result.id}`);
      else router.refresh();
    });
  }
  function removeTrip() {
    if (!trip.id || !window.confirm(`Permanently delete “${trip.title}”?`)) return;
    startTransition(async () => {
      const result = await deleteTrip(trip.id!);
      if (result.error) { setError(result.error); return; }
      router.push("/plan");
    });
  }
  function download() {
    const lines = [trip.title, `${trip.start_date} to ${trip.end_date}`, "", "ITINERARY",
      ...trip.stops.map((stop) => `Day ${stop.day}: ${stop.name}${stop.region ? `, ${stop.region}` : ""}${stop.note ? ` — ${stop.note}` : ""}`),
      "", `Planned budget: ${trip.budget_total == null ? "Not set" : money(trip.budget_total)}`,
      `Expense breakdown: transport ${money(trip.expenses.transport)}, stay ${money(trip.expenses.stay)}, food ${money(trip.expenses.food)}, activities ${money(trip.expenses.activities)}`,
      "", "PACKING", ...trip.packing.map((item) => `${item.done ? "[x]" : "[ ]"} ${item.label}`), "", "NOTES", trip.notes,
      "", "Planning copy only. Confirm fares, permits, weather, opening hours and routes with official providers before travel."];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${trip.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) || "travely-trip"}.txt`;
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="min-h-screen bg-[#fbf8f2] pb-20">
    <section className="relative isolate overflow-hidden bg-[#0b3447] py-20 text-white"><Image src="/images/travel/commons/gallery/leh-ladakh-3.jpg" alt="" fill priority className="-z-20 object-cover object-center" sizes="100vw" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f2c]/95 via-[#0b3447]/70 to-[#0b3447]/15" /><div className="section-shell relative"><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-200">One journey, one workspace</p><h1 className="mt-3 font-serif text-5xl font-semibold sm:text-7xl">Plan a trip that feels like yours.</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-100">Collect places, shape each day, and keep the useful details in one private plan.</p></div></section>
    <div className="section-shell grid gap-8 pt-9 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between px-2 py-2"><h2 className="font-serif text-2xl font-semibold text-[#123a50]">My trips</h2><Link href="/plan" className="grid size-9 place-items-center rounded-full bg-[#e96536] text-white" title="New trip" aria-label="New trip"><Plus size={18} /></Link></div><div className="mt-2 space-y-1">{trips.map((item) => <Link key={item.id} href={`/plan?trip=${item.id}`} className={`block rounded-xl px-3 py-3 text-sm transition ${item.id === trip.id ? "bg-[#e8f5f0] font-bold text-[#0d6d67]" : "text-slate-600 hover:bg-slate-50"}`}><span className="block truncate">{item.title}</span><span className="mt-1 block text-xs font-normal text-slate-400">{item.start_date} · {item.stops?.length ?? 0} stops</span></Link>)}{!trips.length && <p className="px-3 py-4 text-sm leading-6 text-slate-500">Your first saved trip will appear here.</p>}</div><Link href="/destinations" className="mt-4 flex items-center gap-2 border-t border-slate-100 px-3 pt-4 text-sm font-semibold text-[#0d6d67]"><Compass size={16} /> Explore destinations</Link></aside>

      <main className="space-y-7">
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"><div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><label htmlFor="trip-title" className="text-xs font-bold uppercase tracking-[.16em] text-[#0d6d67]">Trip name</label><input id="trip-title" value={trip.title} onChange={(event) => patch({ title: event.target.value })} className="mt-2 w-full border-0 border-b border-slate-200 bg-transparent pb-2 font-serif text-3xl font-semibold text-[#123a50] outline-none focus:border-[#0d6d67] sm:text-4xl" maxLength={120} /></div><div className="flex flex-wrap gap-2"><button onClick={download} type="button" className={buttonClasses({ variant: "outline" })}><Download size={17} /> Download summary</button><button onClick={save} disabled={isPending} type="button" className={buttonClasses()}><Save size={17} /> {isPending ? "Saving…" : "Save trip"}</button></div></div><div className="grid gap-4 border-t border-slate-100 p-6 sm:grid-cols-3 sm:p-8"><label className="text-sm font-semibold text-slate-600">Start date<input type="date" value={trip.start_date} onChange={(event) => patch({ start_date: event.target.value })} className={`${field} mt-2`} /></label><label className="text-sm font-semibold text-slate-600">End date<input type="date" value={trip.end_date} onChange={(event) => patch({ end_date: event.target.value })} className={`${field} mt-2`} /></label><label className="text-sm font-semibold text-slate-600">Total budget (₹)<input type="number" min={0} value={trip.budget_total ?? ""} onChange={(event) => patch({ budget_total: event.target.value === "" ? null : Math.max(0, Number(event.target.value)) })} className={`${field} mt-2`} placeholder="Optional" /></label></div></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-5 py-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="rounded-xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">{message}</p>}

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">01 · Build the route</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Your stops</h2><p className="mt-2 text-sm text-slate-500">{trip.stops.length} stops over {dayCount} days · drag-free editing on touchpad or phone</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => distributeDays()} disabled={!trip.stops.length} className={buttonClasses({ variant: "outline" })}><CalendarDays size={16} /> Spread across days</button><button type="button" onClick={optimize} disabled={mapStops.length < 3} className={buttonClasses({ variant: "outline" })}><Route size={16} /> Suggest shorter order</button></div></div>
          <div className="relative mt-6"><Search size={18} className="absolute left-4 top-3.5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Add a destination — search India" aria-label="Search destinations to add to your trip" className={`${field} pl-11`} />{matches.length > 0 && <div className="absolute top-full z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{matches.map((place) => <button type="button" key={place.slug} onClick={() => addPlace(place)} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm hover:bg-teal-50"><span><strong className="text-[#123a50]">{place.name}</strong><span className="ml-2 text-slate-500">{place.region}</span></span><Plus size={16} className="text-[#0d6d67]" /></button>)}</div>}</div>
          <div className="mt-6 space-y-3">{trip.stops.map((stop, index) => <article key={stop.id} className="rounded-2xl border border-slate-200 bg-[#fbfcfa] p-4"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0d6d67] text-sm font-bold text-white">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-serif text-xl font-semibold text-[#123a50]">{stop.name}</h3><p className="text-xs text-slate-500">{stop.region ?? "India"}{index > 0 && haversineKm(trip.stops[index - 1], stop) != null ? ` · ${haversineKm(trip.stops[index - 1], stop)} km straight-line from previous stop` : ""}</p></div><div className="flex gap-1"><button type="button" onClick={() => moveStop(index, -1)} disabled={index === 0} aria-label={`Move ${stop.name} up`} className="rounded-lg p-2 text-slate-500 hover:bg-white disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" onClick={() => moveStop(index, 1)} disabled={index === trip.stops.length - 1} aria-label={`Move ${stop.name} down`} className="rounded-lg p-2 text-slate-500 hover:bg-white disabled:opacity-30"><ArrowDown size={16} /></button><button type="button" onClick={() => patch({ stops: trip.stops.filter((item) => item.id !== stop.id) })} aria-label={`Remove ${stop.name}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><X size={16} /></button></div></div><div className="mt-3 grid gap-2 sm:grid-cols-[110px_150px_1fr]"><label className="text-xs font-semibold text-slate-500">Day<select value={Math.min(stop.day, dayCount)} onChange={(event) => patchStop(stop.id, { day: Number(event.target.value) })} className={`${field} mt-1`}>{Array.from({ length: dayCount }, (_, day) => <option key={day} value={day + 1}>Day {day + 1}</option>)}</select></label><label className="text-xs font-semibold text-slate-500">Stop budget (₹)<input type="number" min={0} value={stop.budget ?? ""} onChange={(event) => patchStop(stop.id, { budget: event.target.value === "" ? null : Math.max(0, Number(event.target.value)) })} className={`${field} mt-1`} placeholder="Optional" /></label><label className="text-xs font-semibold text-slate-500">What would you like to do?<input value={stop.note} onChange={(event) => patchStop(stop.id, { note: event.target.value })} className={`${field} mt-1`} maxLength={500} placeholder="Sights, food, or your own notes" /></label></div></div></div></article>)}{!trip.stops.length && <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center"><MapPinned className="mx-auto text-[#0d6d67]" /><p className="mt-3 text-slate-600">Search above to add your first stop, or start from a <Link href="/destinations?view=routes" className="font-bold text-[#0d6d67] underline">ready-made circuit</Link>.</p></div>}</div>
          {mapStops.length > 0 && <div className="mt-7"><h3 className="mb-3 flex items-center gap-2 font-bold text-[#123a50]"><MapPinned size={18} /> Your route on the map</h3><RouteMap stops={mapStops.map((stop) => ({ name: stop.name, slug: stop.slug ?? "", latitude: stop.latitude, longitude: stop.longitude, stay: `Day ${stop.day}`, note: stop.note || "Planned stop" }))} /><p className="mt-3 text-xs text-slate-500">The line connects stops geographically; it is not a drivable road route. Check transport and road conditions separately.</p></div>}
        </section>

        <div className="grid gap-7 xl:grid-cols-2"><section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="eyebrow">02 · Keep costs clear</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Budget breakdown</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{(["transport", "stay", "food", "activities"] as const).map((name) => <label key={name} className="text-sm font-semibold capitalize text-slate-600">{name}<div className="relative mt-1"><IndianRupee size={16} className="absolute left-3 top-3.5 text-slate-400" /><input type="number" min={0} value={trip.expenses[name] || ""} onChange={(event) => patch({ expenses: { ...trip.expenses, [name]: Math.max(0, Number(event.target.value)) } })} className={`${field} pl-9`} placeholder="0" /></div></label>)}</div><div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#edf6f3] p-4 text-sm"><div><span className="text-slate-500">Category estimate</span><strong className="block text-lg text-[#123a50]">{money(subtotal)}</strong></div><div><span className="text-slate-500">Stop estimates</span><strong className="block text-lg text-[#123a50]">{money(stopBudget)}</strong></div></div>{trip.budget_total != null && <p className="mt-3 text-sm text-slate-600">{subtotal <= trip.budget_total ? `${money(trip.budget_total - subtotal)} left within your target` : `${money(subtotal - trip.budget_total)} above your target`} based on category estimates.</p>}<p className="mt-3 text-xs leading-5 text-slate-500">These are your planning figures, not live fares. Stop and category estimates are separate views; do not add them together.</p></section>
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="eyebrow">03 · Travel ready</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Packing list</h2><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => patch({ packing: [...trip.packing, ...defaultPacking(trip.stops.map((stop) => places.find((place) => place.slug === stop.slug)?.category ?? null)).filter((item) => !trip.packing.some((old) => old.label === item.label))] })} className={buttonClasses({ variant: "outline", size: "sm" })}><Sparkles size={15} /> Suggest essentials</button></div><div className="mt-4 space-y-2">{trip.packing.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"><label className="flex min-w-0 flex-1 items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={item.done} onChange={(event) => patch({ packing: trip.packing.map((entry) => entry.id === item.id ? { ...entry, done: event.target.checked } : entry) })} className="accent-[#0d6d67]" /><span className={item.done ? "text-slate-400 line-through" : ""}>{item.label}</span></label><button type="button" onClick={() => patch({ packing: trip.packing.filter((entry) => entry.id !== item.id) })} aria-label={`Remove ${item.label}`} className="p-1 text-slate-400 hover:text-red-600"><X size={15} /></button></div>)}{!trip.packing.length && <p className="text-sm text-slate-500">Add your own items or ask for a few sensible suggestions.</p>}</div><form onSubmit={(event) => { event.preventDefault(); if (newPacking.trim().length > 1) { patch({ packing: [...trip.packing, { id: crypto.randomUUID(), label: newPacking.trim(), done: false }] }); setNewPacking(""); } }} className="mt-4 flex gap-2"><input value={newPacking} onChange={(event) => setNewPacking(event.target.value)} className={field} placeholder="Add an item" aria-label="New packing item" maxLength={100} /><button type="submit" className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#0d6d67] text-white" aria-label="Add packing item"><Plus size={19} /></button></form></section></div>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="eyebrow">04 · Check before you go</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Travel information & events</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Travel conditions can change after a plan is saved. Check the latest forecast, permits, local opening hours and transport with official providers before booking and again before departure.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><a href="https://mausam.imd.gov.in/" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-[#0d6d67] hover:border-teal-400">India Meteorological Department <ArrowRight size={15} className="ml-2 inline" /></a><a href="https://www.incredibleindia.gov.in/en/festivals-and-events" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-[#0d6d67] hover:border-teal-400">Official festivals & events <ArrowRight size={15} className="ml-2 inline" /></a><a href="https://www.incredibleindia.gov.in/" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-[#0d6d67] hover:border-teal-400">Official destination guidance <ArrowRight size={15} className="ml-2 inline" /></a></div><p className="mt-4 text-xs text-slate-500">These links open current external information. TRAVELY does not yet ingest or verify it automatically.</p></section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><label htmlFor="trip-notes" className="flex items-center gap-2 font-serif text-2xl font-semibold text-[#123a50]"><ListChecks size={22} className="text-[#0d6d67]" /> Trip notes</label><textarea id="trip-notes" value={trip.notes} onChange={(event) => patch({ notes: event.target.value })} className={`${field} mt-4 min-h-28`} maxLength={3000} placeholder="Bookings to make, local contacts, or things to remember" /><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm text-slate-500"><Check size={16} className="text-[#0d6d67]" /> This plan is private to your account.</p><div className="flex gap-2">{trip.id && <button type="button" onClick={removeTrip} disabled={isPending} className={buttonClasses({ variant: "danger" })}><Trash2 size={16} /> Delete</button>}<button type="button" onClick={save} disabled={isPending} className={buttonClasses()}><Save size={17} /> Save trip</button></div></div></section>
      </main>
    </div>
  </div>;
}
