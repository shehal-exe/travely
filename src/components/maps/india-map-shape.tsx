"use client";

import { GeoJSON } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import indiaBoundary from "@/data/maps/india-adm0.json";

const outline = indiaBoundary as GeoJsonObject;

export function IndiaMapShape() {
  return (
    <GeoJSON
      data={outline}
      interactive={false}
      style={{
        className: "india-boundary",
        color: "#0b5d56",
        fillColor: "#f7f0df",
        fillOpacity: 1,
        opacity: 1,
        weight: 2.5,
      }}
    />
  );
}

