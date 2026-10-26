"use client";

import dynamic from "next/dynamic";
import { Route } from "lucide-react";
import type { CircuitStop } from "@/data/circuits";

const RouteMapInner = dynamic(() => import("./route-map-inner"), { ssr: false, loading: () => <div className="h-[520px] animate-pulse rounded-[2rem] bg-slate-200" /> });

export function RouteMap({ stops }: { stops: CircuitStop[] }) {
  return <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-2 shadow-xl"><div className="pointer-events-none absolute left-5 top-5 z-[500] rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0d6d67]"><Route size={15} /> India satellite circuit map</p><p className="mt-1 text-sm text-slate-600">{stops.length} connected stops</p><p className="pointer-events-auto mt-1 text-[10px] font-semibold text-slate-500"><a className="underline decoration-slate-300 underline-offset-2" href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank" rel="noreferrer">Imagery © Esri and providers</a><span aria-hidden="true"> · </span><a className="underline decoration-slate-300 underline-offset-2" href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">India boundary</a></p></div><RouteMapInner stops={stops} /></div>;
}
