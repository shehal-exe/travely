"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

export function MapInteractionControls({ points, fallback, singleZoom = 9, label = "Interactive travel map" }: { points: [number, number][]; fallback: [number, number]; singleZoom?: number; label?: string }) {
  const map = useMap();

  useEffect(() => {
    const mapContainer = map.getContainer();
    mapContainer.setAttribute("aria-label", label);
    const updateZoomState = () => { mapContainer.dataset.zoom = map.getZoom().toFixed(2); };
    const resetView = () => {
      if (!points.length) map.flyTo(fallback, 4, { duration: 0.6 });
      else if (points.length === 1) map.flyTo(points[0], singleZoom, { duration: 0.6 });
      else map.flyToBounds(L.latLngBounds(points), { padding: [55, 55], maxZoom: 8, duration: 0.6 });
    };
    const createButton = (container: HTMLElement, labelText: string, symbol: string, action: () => void) => {
      const button = L.DomUtil.create("button", "", container) as HTMLButtonElement;
      button.type = "button";
      button.setAttribute("aria-label", labelText);
      button.title = labelText;
      const icon = L.DomUtil.create("span", "", button);
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = symbol;
      L.DomEvent.on(button, "click", (event) => {
        L.DomEvent.preventDefault(event);
        L.DomEvent.stopPropagation(event);
        action();
      });
    };

    const control = new L.Control({ position: "bottomright" });
    control.onAdd = () => {
      const container = L.DomUtil.create("div", "travely-map-controls leaflet-bar");
      createButton(container, "Zoom in", "+", () => map.setZoom(map.getZoom() + 1));
      createButton(container, "Zoom out", "−", () => map.setZoom(map.getZoom() - 1));
      createButton(container, "Reset map view", "↺", resetView);
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      return container;
    };
    control.addTo(map);
    updateZoomState();
    map.on("zoomend", updateZoomState);

    return () => {
      map.off("zoomend", updateZoomState);
      control.remove();
    };
  }, [fallback, label, map, points, singleZoom]);

  return (
    <div className="travely-map-hint pointer-events-none leaflet-control" aria-hidden="true">
      <span className="hidden sm:inline">Drag to move · scroll or pinch to zoom · double-click to zoom in</span>
      <span className="sm:hidden">Drag to move · pinch to zoom</span>
    </div>
  );
}
