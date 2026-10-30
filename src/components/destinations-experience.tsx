"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { DestinationBrowser, type DestinationView } from "@/components/destination-browser";
import { Reveal } from "@/components/motion/reveal";
import type { Destination } from "@/types/database";

const heroByView: Record<DestinationView, { image: string; eyebrow: string; title: string; description: string; position: string }> = {
  places: {
    image: "/images/travel/jaipur-3.jpg",
    eyebrow: "Explore India",
    title: "Where to next?",
    description: "Find a place that feels right, from storied cities to quiet mountain valleys.",
    position: "object-center",
  },
  map: {
    image: "/images/travel/kerala-2.jpg",
    eyebrow: "See the whole journey",
    title: "Explore India on the map",
    description: "Zoom across regions, filter what interests you, and open every destination from its pin.",
    position: "object-center",
  },
  routes: {
    image: "/images/travel/ladakh-2.jpg",
    eyebrow: "Follow a proven path",
    title: "Travel routes, ready to explore",
    description: "Start with a real multi-stop circuit, then shape the pace and budget around your journey.",
    position: "object-center",
  },
};

function normalizeView(value: string): DestinationView {
  return value === "map" || value === "routes" ? value : "places";
}

function destinationUrl(view: DestinationView) {
  return view === "places" ? "/destinations" : `/destinations?view=${view}`;
}

export function DestinationsExperience({ destinations, initialQuery, initialCategory, initialView }: { destinations: Destination[]; initialQuery: string; initialCategory: string; initialView: string }) {
  const [view, setView] = useState<DestinationView>(() => normalizeView(initialView));
  const hero = heroByView[view];

  const selectView = useCallback((nextView: DestinationView) => {
    setView(nextView);
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", destinationUrl(nextView));
    }
  }, []);

  useEffect(() => {
    const onDestinationView = (event: Event) => {
      const nextView = (event as CustomEvent<{ view?: string }>).detail?.view;
      selectView(normalizeView(nextView ?? "places"));
    };
    const onPopState = () => {
      setView(normalizeView(new URLSearchParams(window.location.search).get("view") ?? "places"));
    };
    window.addEventListener("travely:destination-view", onDestinationView);
    window.addEventListener("popstate", onPopState);

    const warmUp = window.setTimeout(() => {
      void import("@/components/maps/travel-map-inner");
      Object.values(heroByView).forEach(({ image }) => {
        const preload = new window.Image();
        preload.src = image;
      });
    }, 250);

    return () => {
      window.clearTimeout(warmUp);
      window.removeEventListener("travely:destination-view", onDestinationView);
      window.removeEventListener("popstate", onPopState);
    };
  }, [selectView]);

  return (
    <>
      <section className="relative isolate flex min-h-[400px] items-center overflow-hidden border-b border-white/10 bg-[#0b3447] py-16 text-white lg:min-h-[420px] lg:py-20">
        <Image key={hero.image} src={hero.image} alt="" fill priority className={`-z-20 object-cover ${hero.position}`} sizes="100vw" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f2c]/95 via-[#0b3447]/72 to-[#0b3447]/18" />
        <div className="section-shell">
          <Reveal key={view} y={14}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{hero.eyebrow}</p>
            <h1 className="section-title mt-3 max-w-4xl font-serif font-semibold">{hero.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">{hero.description}</p>
          </Reveal>
        </div>
      </section>
      <section className="section-shell py-10 lg:py-12">
        <Reveal y={24} amount={0.08}>
          <DestinationBrowser destinations={destinations} initialQuery={initialQuery} initialCategory={initialCategory} view={view} onViewChange={selectView} />
        </Reveal>
      </section>
    </>
  );
}
