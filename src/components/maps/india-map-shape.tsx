"use client";

import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection, GeoJsonObject, MultiPolygon, Polygon, Position } from "geojson";
import indiaBoundary from "@/data/maps/india-adm0.json";
import indiaStates from "@/data/maps/india-adm1.json";

const outlineCollection = indiaBoundary as FeatureCollection<MultiPolygon>;
const outline = outlineCollection as GeoJsonObject;
const states = indiaStates as GeoJsonObject;

const labelledStates = new Set(["IN-AP", "IN-AS", "IN-GJ", "IN-KA", "IN-MH", "IN-MP", "IN-OR", "IN-RJ", "IN-TN", "IN-UP", "IN-WB"]);

const maskEdge: Position[] = [[40, -10], [125, -10], [125, 55], [40, 55], [40, -10]];
const indiaHoles = outlineCollection.features[0].geometry.coordinates.map((polygon) => [...polygon[0]].reverse());
const indiaMask: Feature<Polygon> = {
  type: "Feature",
  properties: {},
  geometry: { type: "Polygon", coordinates: [maskEdge, ...indiaHoles] },
};

export function IndiaMapShape() {
  return (
    <>
      <GeoJSON
        data={indiaMask}
        interactive={false}
        style={{ className: "india-satellite-mask", color: "transparent", fillColor: "#0d3a4a", fillOpacity: 1, fillRule: "evenodd", opacity: 0, weight: 0 }}
      />
      <GeoJSON
        data={states}
        style={() => ({
          className: "india-state",
          color: "#f7f3e8",
          fillColor: "#ffffff",
          fillOpacity: 0.02,
          opacity: 0.78,
          weight: 1,
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
        style={{ className: "india-boundary", color: "#fff7e3", fillOpacity: 0, opacity: 1, weight: 2.8 }}
      />
    </>
  );
}

