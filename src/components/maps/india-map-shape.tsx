"use client";

import { GeoJSON } from "react-leaflet";
import type { Feature, GeoJsonObject, GeoJsonProperties, Geometry } from "geojson";
import indiaBoundary from "@/data/maps/india-adm0.json";
import indiaStates from "@/data/maps/india-adm1.json";

const outline = indiaBoundary as GeoJsonObject;
const states = indiaStates as GeoJsonObject;

const mountainStates = new Set(["IN-AR", "IN-HP", "IN-JK", "IN-SK", "IN-UK"]);
const aridStates = new Set(["IN-GJ", "IN-RJ"]);
const coastalStates = new Set(["IN-AN", "IN-AP", "IN-GA", "IN-KA", "IN-KL", "IN-LD", "IN-OR", "IN-PY", "IN-TN", "IN-WB"]);
const labelledStates = new Set(["IN-AP", "IN-AS", "IN-GJ", "IN-KA", "IN-MH", "IN-MP", "IN-OR", "IN-RJ", "IN-TN", "IN-UP", "IN-WB"]);

function stateFill(feature?: Feature<Geometry, GeoJsonProperties>) {
  const iso = feature?.properties?.shapeISO as string | undefined;
  if (iso && mountainStates.has(iso)) return "#b9d7b0";
  if (iso && aridStates.has(iso)) return "#e9d5a5";
  if (iso && coastalStates.has(iso)) return "#b9d9ca";
  return "#d8dfb8";
}

export function IndiaMapShape() {
  return (
    <>
      <GeoJSON
        data={outline}
        interactive={false}
        style={{ color: "#0b5d56", fillColor: "#f7f0df", fillOpacity: 1, opacity: 1, weight: 2.8 }}
      />
      <GeoJSON
        data={states}
        style={(feature) => ({
          className: "india-state",
          color: "#ffffff",
          fillColor: stateFill(feature),
          fillOpacity: 0.95,
          opacity: 0.9,
          weight: 1.15,
        })}
        onEachFeature={(feature, layer) => {
          const name = feature.properties?.shapeName;
          const iso = feature.properties?.shapeISO as string | undefined;
          const permanent = Boolean(iso && labelledStates.has(iso));
          if (name) layer.bindTooltip(String(name), {
            className: permanent ? "india-state-tooltip india-state-label" : "india-state-tooltip",
            direction: permanent ? "center" : "top",
            permanent,
            sticky: !permanent,
          });
        }}
      />
      <GeoJSON
        data={outline}
        interactive={false}
        style={{ className: "india-boundary", color: "#0b5d56", fillOpacity: 0, opacity: 1, weight: 2.8 }}
      />
    </>
  );
}

