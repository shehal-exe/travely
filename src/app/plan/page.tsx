import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { TripPlanner } from "@/components/trip-planner";
import { getFeaturedDestinations, getMemory } from "@/lib/data";
import { getCurrentUser, getSupabaseServer } from "@/lib/supabase/server";
import { getCircuit } from "@/data/circuits";
import type { PlaceOption, TripPlan } from "@/lib/trip-planning";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Plan a Trip" };

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ trip?: string; destination?: string; circuit?: string; story?: string }> }) {
  const query = await searchParams;
  const [user, supabase, catalogue] = await Promise.all([getCurrentUser(), getSupabaseServer(), getFeaturedDestinations()]);
  if (!user || !supabase) return <section className="section-shell py-24 text-center"><Compass className="mx-auto text-[#0d6d67]" size={42} /><h1 className="mt-5 font-serif text-5xl text-[#123a50]">Plan your next journey.</h1><p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">Sign in to save a private itinerary, budget and packing list across your devices.</p><Link href={`/auth/login?next=${encodeURIComponent(`/plan${query.destination ? `?destination=${query.destination}` : ""}`)}`} className={buttonClasses({ className: "mt-7" })}>Log in to plan</Link></section>;

  const places: PlaceOption[] = catalogue.map((destination) => ({
    slug: destination.slug,
    name: destination.name,
    region: destination.region,
    latitude: destination.latitude,
    longitude: destination.longitude,
    image: destination.cover_image_url,
    category: destination.category?.name ?? null,
  }));
  const { data: rows, error } = await supabase.from("trip_plans").select("*")
    .eq("user_id", user.id).order("updated_at", { ascending: false }).limit(30);
  const trips = (rows ?? []) as TripPlan[];
  const selected = trips.find((trip) => trip.id === query.trip) ?? null;
  let starter: PlaceOption[] = [];
  let starterTitle: string | null = null;
  if (query.circuit) {
    const circuit = getCircuit(query.circuit);
    if (circuit) {
      starter = circuit.stops.map((stop) => places.find((place) => place.slug === stop.slug) ?? {
        slug: stop.slug, name: stop.name, region: circuit.region,
        latitude: stop.latitude, longitude: stop.longitude, image: null, category: circuit.category,
      });
      starterTitle = circuit.title;
    }
  } else if (query.destination) {
    const place = places.find((item) => item.slug === query.destination);
    if (place) { starter = [place]; starterTitle = `${place.name} journey`; }
  } else if (query.story) {
    const story = await getMemory(query.story);
    if (story && (story.visibility === "public" || story.user_id === user.id)) {
      const place = places.find((item) => item.name.toLowerCase() === story.destination_name.toLowerCase());
      starter = [place ?? {
        slug: "", name: story.destination_name, region: null, latitude: story.latitude,
        longitude: story.longitude, image: story.images?.[0]?.image_url ?? null, category: story.category,
      }];
      starterTitle = `Inspired by ${story.destination_name}`;
    }
  }

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return <TripPlanner key={selected?.id ?? `new-${query.destination ?? query.circuit ?? query.story ?? "blank"}`} trips={trips} selected={selected} places={places} starter={starter} starterTitle={starterTitle} databaseError={error?.message ?? null} today={today} />;
}
