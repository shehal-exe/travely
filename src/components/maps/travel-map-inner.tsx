"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import { MapInteractionControls } from "@/components/maps/map-interaction-controls";
import type { Destination } from "@/types/database";

const indiaCenter: [number, number] = [22.8, 79.4];
const indiaBounds: L.LatLngBoundsExpression = [[5.5, 67], [38.5, 99.5]];
const icon = L.divIcon({ className: "travely-marker", html: '<span aria-hidden="true"></span>', iconSize: [28, 28], iconAnchor: [14, 14] });

function MapController({ destinations, expanded }: { destinations: Destination[]; expanded: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(timer);
  }, [expanded, map]);

  useEffect(() => {
    const points = destinations.flatMap((item) => item.latitude != null && item.longitude != null ? [[item.latitude, item.longitude] as [number, number]] : []);
    if (!points.length) {
      map.setView(indiaCenter, 4);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 9);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [44, 44], maxZoom: 8 });
  }, [destinations, map]);

  return null;
}

export default function TravelMapInner({ destinations, expanded }: { destinations: Destination[]; expanded: boolean }) {
  const points = destinations.flatMap((item) => item.latitude != null && item.longitude != null ? [[item.latitude, item.longitude] as [number, number]] : []);
  return (
    <div className={`w-full transition-[height] duration-500 ${expanded ? "h-[72vh] min-h-[560px]" : "h-[460px]"}`}>
      <MapContainer center={indiaCenter} zoom={4} minZoom={3} maxZoom={18} maxBounds={indiaBounds} maxBoundsViscosity={0.75} scrollWheelZoom touchZoom doubleClickZoom dragging keyboard keyboardPanDelta={120} boxZoom zoomControl={false} zoomSnap={0.25} zoomDelta={0.5} wheelDebounceTime={25} wheelPxPerZoomLevel={120} bounceAtZoomLimits={false} className="h-full w-full" aria-label="Interactive map of India destinations">
        <TileLayer attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController destinations={destinations} expanded={expanded} />
        <MapInteractionControls points={points} fallback={indiaCenter} label="Interactive map of India destinations" />
        {destinations.map((destination) => (
          <Marker key={destination.id} position={[destination.latitude!, destination.longitude!]} icon={icon}>
            <Popup>
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">{destination.category?.name ?? "Destination"}</span>
              <strong className="mt-1 block text-base">{destination.name}</strong>
              <span>{[destination.region, destination.country].filter(Boolean).join(", ")}</span><br />
              <Link href={`/destinations/${destination.slug}`} className="mt-2 inline-block font-semibold text-teal-700">View destination →</Link><br />
              <Link href={`/destinations/${destination.slug}#community`} className="mt-1 inline-block text-sm font-semibold text-teal-700">Traveller stories →</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
