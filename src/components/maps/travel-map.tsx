"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Layers3, Maximize2, Minimize2 } from "lucide-react";
import type { Destination } from "@/types/database";

const MapInner = dynamic(() => import("./travel-map-inner"), { ssr: false, loading: () => <div className="h-[460px] animate-pulse rounded-[2rem] bg-slate-200" /> });

export function TravelMap({ destinations }: { destinations: Destination[] }) {
  const [expanded, setExpanded] = useState(false);
  const mappable = destinations.filter((item) => item.latitude != null && item.longitude != null);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60">
      <div className="pointer-events-none absolute left-5 top-5 z-[500] max-w-[calc(100%-7rem)] rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0d6d67]"><Layers3 size={15} /> India-only destination map</p>
        <p className="mt-1 text-sm text-slate-600">{mappable.length} mapped {mappable.length === 1 ? "place" : "places"}</p>
        <a className="pointer-events-auto mt-1 inline-block text-[10px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2" href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">India outline · geoBoundaries</a>
      </div>
      <button type="button" onClick={() => setExpanded((value) => !value)} className="absolute right-5 top-5 z-[500] grid size-11 place-items-center rounded-xl border border-white/60 bg-white/95 text-[#123a50] shadow-lg transition hover:bg-[#0d6d67] hover:text-white" aria-label={expanded ? "Collapse map" : "Expand map"} title={expanded ? "Collapse map" : "Expand map"}>
        {expanded ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
      </button>
      <MapInner destinations={mappable} expanded={expanded} />
    </div>
  );
}
