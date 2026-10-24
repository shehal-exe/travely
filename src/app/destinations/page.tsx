import type { Metadata } from "next";
import { DestinationsExperience } from "@/components/destinations-experience";
import { getFeaturedDestinations } from "@/lib/data";

export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; view?: string }> }) {
  const filters = await searchParams;
  const destinations = await getFeaturedDestinations();
  return <DestinationsExperience destinations={destinations} initialQuery={filters.q ?? ""} initialCategory={filters.category ?? "all"} initialView={filters.view ?? "places"} />;
}
