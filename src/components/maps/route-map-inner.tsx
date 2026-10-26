"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import Link from "next/link";
import { INDIA_BOUNDS, INDIA_CENTER, INDIA_MIN_ZOOM } from "@/components/maps/india-map-config";
import { IndiaMapShape } from "@/components/maps/india-map-shape";
import { MapInteractionControls } from "@/components/maps/map-interaction-controls";
import type { CircuitStop } from "@/data/circuits";

const icon = L.divIcon({ className: "travely-marker", html: '<span aria-hidden="true"></span>', iconSize: [28, 28], iconAnchor: [14, 14] });

function FitRoute({ stops }: { stops: CircuitStop[] }) {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(INDIA_BOUNDS, { padding: [34, 34], animate: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [map, stops]);
  return null;
}

export default function RouteMapInner({ stops }: { stops: CircuitStop[] }) {
  const points = stops.map((stop) => [stop.latitude, stop.longitude] as [number, number]);
  return <div className="w-full" style={{ height: "520px" }}><MapContainer center={points[0] ?? INDIA_CENTER} zoom={5} minZoom={INDIA_MIN_ZOOM} maxZoom={18} maxBounds={INDIA_BOUNDS} maxBoundsViscosity={1} scrollWheelZoom touchZoom doubleClickZoom dragging keyboard keyboardPanDelta={120} boxZoom zoomControl={false} attributionControl={false} zoomSnap={0.25} zoomDelta={0.5} wheelDebounceTime={25} wheelPxPerZoomLevel={120} bounceAtZoomLimits={false} className="india-vector-map h-full w-full" style={{ height: "100%", width: "100%" }} aria-label="Interactive India route map"><IndiaMapShape /><FitRoute stops={stops} /><MapInteractionControls points={points} fallback={INDIA_CENTER} resetBounds={INDIA_BOUNDS} singleZoom={7} label="Interactive India route map" /><Polyline positions={points} pathOptions={{ color: "#f26335", weight: 5, opacity: 0.9, dashArray: "10 8" }} />{stops.map((stop, index) => <Marker key={`${stop.name}-${index}`} position={[stop.latitude, stop.longitude]} icon={icon}><Popup><span className="text-xs font-bold uppercase tracking-wide text-teal-700">Stop {index + 1} · {stop.stay}</span><strong className="mt-1 block text-base">{stop.name}</strong><span>{stop.note}</span><br /><Link href={`/destinations/${stop.slug}`} className="mt-2 inline-block font-semibold text-teal-700">Open destination →</Link></Popup></Marker>)}</MapContainer></div>;
}
