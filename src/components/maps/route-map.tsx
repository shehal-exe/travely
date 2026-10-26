"use client";

import dynamic from "next/dynamic";
import { Route } from "lucide-react";
import type { CircuitStop } from "@/data/circuits";

const RouteMapInner = dynamic(() => import("./route-map-inner"), { ssr: false, loading: () => <div className="h-[520px] animate-pulse rounded-[2rem] bg-slate-200" /> });

export function RouteMap({ stops }: { stops: CircuitStop[] }) {
  return <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-2 shadow-xl"><div className="pointer-events-none absolute left-5 top-5 z-[500] rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0d6d67]"><Route size={15} /> India circuit map</p><p className="mt-1 text-sm text-slate-600">{stops.length} connected stops</p><a className="pointer-events-auto mt-1 inline-block text-[10px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2" href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">India outline · geoBoundaries</a></div><RouteMapInner stops={stops} /></div>;
}
